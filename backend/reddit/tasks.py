import datetime as dt

import praw
from prawcore.exceptions import (
    OAuthException,
    Forbidden,
    NotFound,
    BadRequest,
    Redirect,
)
from celery import shared_task
from django.conf import settings

from .utils import calculate_next_run
from .models import RedditAccount, ScheduledPost, SubmittedPost

NON_RETRYABLE_ERRORS = (
    OAuthException,
    Forbidden,
    NotFound,
    BadRequest,
    Redirect,
    praw.exceptions.InvalidURL,
    praw.exceptions.RedditAPIException,
)


@shared_task(ignore_result=True)
def schedule_due_posts():
    now = dt.datetime.now(dt.timezone.utc)
    try:
        due_posts = ScheduledPost.objects.filter(
            status__in=["active", "pending_retry"], next_run__lte=now
        ) | ScheduledPost.objects.filter(status="active", next_run__isnull=True)

        due_posts = due_posts.distinct()

        for post in due_posts:
            post.status = "queued"
            post.save(update_fields=["status", "updated_at"])
            submit_reddit_post.delay(post.id)
    except Exception as e:
        print(f"{e.__class__.__name__} {e}")


@shared_task(
    bind=True,
    max_retries=2,
    default_retry_delay=60,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=2 * 60,
    retry_jitter=True,
    ignore_result=True,
)
def submit_reddit_post(self, post_id):
    try:
        post = ScheduledPost.objects.get(id=post_id)

        if not post.reddit_account:
            raise ValueError(f"RedditAccount missing for user {post.user.username}.")

        if post.status not in ["active", "pending_retry", "queued"]:
            return

        reddit = praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            refresh_token=post.reddit_account.refresh_token,
            user_agent=settings.REDDIT_USER_AGENT,
        )
        reddit.user.me().name

        post.last_run_started = dt.datetime.now(dt.timezone.utc)
        submission = reddit.subreddit(post.subreddit).submit(
            title=post.title, selftext=post.selftext
        )
        post.last_run_finished = dt.datetime.now(dt.timezone.utc)

        post.last_submission_error = None

        SubmittedPost.objects.create(
            scheduled_post=post,
            reddit_account=post.reddit_account,
            reddit_username=post.reddit_account.reddit_username,
            subreddit=post.subreddit,
            title=post.title,
            selftext=post.selftext,
            reddit_post_id=submission.id,
            reddit_url=f"https://www.reddit.com{submission.permalink}",
        )
        # update_reddit_account_status.delay(post.reddit_account.id)

        if post.cron_schedule:
            next_run = calculate_next_run(post.cron_schedule, post.user_timezone)
            if next_run is None:
                post.status = "error"
                post.last_submission_error = "Failed to calculate next run time."
                post.next_run = None
                post.save()
                return

        if not post.cron_schedule:
            post.status = "completed"
            post.next_run = None
        elif post.end_date and next_run and next_run > post.end_date:
            post.status = "completed"
            post.next_run = None
        elif next_run:
            post.status = "active"
            post.next_run = next_run
        else:
            post.status = "error"
            post.last_submission_error = "Failed to calculate next run time."
            post.next_run = None

        post.save()

    except ScheduledPost.DoesNotExist:
        return
    except Exception as e:
        if not post:
            return

        # Handle specific error messages
        if isinstance(e, OAuthException):
            error_msg = f"Reddit Authentication Error: {e}. Please re-link account."
        elif isinstance(
            e, (Forbidden, NotFound, BadRequest, Redirect, praw.exceptions.InvalidURL)
        ):
            error_msg = f"Reddit API Error ({type(e).__name__}): {e}"
        elif isinstance(e, praw.exceptions.RedditAPIException):
            error_msg = f"Reddit API Error: {e}"
        else:
            error_msg = f"Error: {e}"

        # Determine if we should retry
        if isinstance(e, NON_RETRYABLE_ERRORS):
            post.status = "error"
            post.last_submission_error = error_msg
            post.save(update_fields=["status", "last_submission_error", "updated_at"])
        else:
            post.status = "pending_retry"
            post.last_submission_error = f"{error_msg} (will retry)"
            post.save(update_fields=["status", "last_submission_error", "updated_at"])
            raise self.retry(exc=e)


@shared_task(
    bind=True,
    max_retries=2,
    default_retry_delay=5 * 60,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=15 * 60,
    retry_jitter=True,
    ignore_result=True,
)
def update_reddit_account_status(self, reddit_account_id):
    try:
        reddit_account = RedditAccount.objects.get(id=reddit_account_id)
        reddit = praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            refresh_token=reddit_account.refresh_token,
            user_agent=settings.REDDIT_USER_AGENT,
        )

        try:
            # Any simple API call to check if the account is valid
            reddit.user.me()
            reddit_account.reddit_account_status = "active"
        except praw.exceptions.PrawcoreException as e:
            # More specific error handling can be added here
            if "403" in str(e):
                reddit_account.reddit_account_status = "suspended"
            elif "404" in str(e):
                reddit_account.reddit_account_status = "banned"
            else:
                # A generic error might indicate a shadow ban or other issue
                reddit_account.reddit_account_status = "shadow_banned"
        finally:
            reddit_account.save(update_fields=["reddit_account_status", "updated_at"])

    except RedditAccount.DoesNotExist:
        return
    except Exception as e:
        raise self.retry(exc=e)
