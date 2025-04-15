import praw
from celery import shared_task
from django.utils import timezone
from django.conf import settings
from croniter import croniter
from datetime import datetime
from .models import ScheduledPost, RedditAccount

@shared_task(bind=True, max_retries=3, default_retry_delay=60) # Retry 3 times on failure
def submit_reddit_post(self, post_id):
    """
    Celery task to submit a specific scheduled post to Reddit.
    """
    try:
        post = ScheduledPost.objects.select_related('user__reddit_account').get(id=post_id)
        reddit_account = post.user.reddit_account
    except ScheduledPost.DoesNotExist:
        print(f"ScheduledPost with id {post_id} not found. Task aborted.")
        return
    except RedditAccount.DoesNotExist:
        print(f"RedditAccount for user {post.user.username} not found. Cannot submit post {post_id}.")
        post.status = 'error'
        post.last_submission_error = "Reddit account not linked or credentials missing."
        post.save(update_fields=['status', 'last_submission_error', 'updated_at'])
        return

    # Check if post is still active before submitting
    if post.status != 'active':
        print(f"Post {post_id} is not active (status: {post.status}). Skipping submission.")
        return

    try:
        # Initialize PRAW with stored refresh token
        reddit = praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            refresh_token=reddit_account.refresh_token,
            user_agent=settings.REDDIT_USER_AGENT,
        )
        # Check if refresh token is still valid by getting user info
        # PRAW automatically refreshes the access token if needed
        reddit.user.me()

        # Submit the post
        subreddit = reddit.subreddit(post.subreddit)
        submission = subreddit.submit(title=post.title, selftext=post.body)
        print(f"Successfully submitted post {post_id} to r/{post.subreddit}. Submission ID: {submission.id}")

        # Update post status and store submission ID
        post.reddit_post_id = submission.id
        post.last_submission_error = None # Clear any previous error

        # Calculate next run time based on cron schedule
        now = timezone.now()
        cron = croniter(post.cron_schedule, now)
        next_run = cron.get_next(datetime)

        # Check if next run is after the end date (if specified)
        if post.end_date and next_run > post.end_date:
            post.status = 'completed'
            post.next_run_time = None
            print(f"Post {post_id} reached end date. Status set to completed.")
        else:
            post.status = 'active' # Ensure it's active if it was successful
            post.next_run_time = next_run
            print(f"Post {post_id} scheduled for next run at: {next_run}")

        post.save()

    except praw.exceptions.RedditAPIException as e:
        # Handle specific Reddit API errors (e.g., rate limits, invalid subreddit)
        print(f"Reddit API error submitting post {post_id}: {e}")
        post.status = 'error'
        post.last_submission_error = f"Reddit API Error: {e}"
        post.save(update_fields=['status', 'last_submission_error', 'updated_at'])
        # Optionally retry based on error type (e.g., rate limit)
        # self.retry(exc=e)
    except Exception as e:
        # Catch other potential errors (network issues, praw issues, etc.)
        print(f"General error submitting post {post_id}: {e}")
        post.status = 'error'
        post.last_submission_error = f"Error: {e}"
        post.save(update_fields=['status', 'last_submission_error', 'updated_at'])
        # Retry for generic errors
        self.retry(exc=e)


@shared_task
def schedule_due_posts():
    """
    Periodic task run by Celery Beat to find and queue due posts.
    """
    now = timezone.now()
    print(f"Running schedule_due_posts at {now}")
    # Find active posts whose next_run_time is in the past or is null (for initial run)
    due_posts = ScheduledPost.objects.filter(
        status='active',
        next_run_time__lte=now
    ) | ScheduledPost.objects.filter(
        status='active',
        next_run_time__isnull=True # Also schedule posts that haven't run yet
    )

    count = 0
    for post in due_posts:
        print(f"Queueing post {post.id} for submission.")
        # Queue the submission task
        submit_reddit_post.delay(post.id)
        count += 1

    print(f"Finished schedule_due_posts. Queued {count} posts.")