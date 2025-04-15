from django.db import models
from django.conf import settings # To link to the User model

class RedditAccount(models.Model):
    """
    Stores Reddit API credentials associated with a Django user.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='reddit_account'
    )
    reddit_username = models.CharField(max_length=100, unique=True)
    # Store refresh token securely. Consider encryption for production.
    refresh_token = models.CharField(max_length=255) # Adjust length as needed
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Reddit Account ({self.reddit_username})"

class ScheduledPost(models.Model):
    """
    Represents a post scheduled by a user.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'), # For one-time posts or after end_date
        ('error', 'Error'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='scheduled_posts'
    )
    subreddit = models.CharField(max_length=100)
    title = models.CharField(max_length=300) # Reddit title limit
    body = models.TextField()
    # Store the schedule as a cron string
    cron_schedule = models.CharField(max_length=100)
    # Next time the post should be submitted according to the schedule
    next_run_time = models.DateTimeField(null=True, blank=True, db_index=True)
    # Optional end date for recurring schedules
    end_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='active',
        db_index=True
    )
    # Optional field to store the Reddit post ID after submission
    reddit_post_id = models.CharField(max_length=20, null=True, blank=True)
    last_submission_error = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"'{self.title}' for r/{self.subreddit} by {self.user.username} ({self.status})"

    class Meta:
        ordering = ['-created_at'] # Default ordering
