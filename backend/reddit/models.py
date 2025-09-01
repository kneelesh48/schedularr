from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class RedditAccount(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("suspended", "Suspended"),
        ("shadow_banned", "Shadow Banned"),
        ("banned", "Banned"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reddit_accounts",
    )
    reddit_username = models.CharField(max_length=100)
    refresh_token = models.CharField(max_length=255)
    reddit_account_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
        db_index=True,
        help_text="The status of the Reddit account (e.g., active, suspended).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["user", "reddit_username"]

    def __str__(self):
        return f"{self.reddit_username}"


class ScheduledPost(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("paused", "Paused"),
        ("completed", "Completed"),
        ("error", "Error"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="scheduled_posts",
    )
    reddit_account = models.ForeignKey(
        "RedditAccount",
        on_delete=models.CASCADE,
        related_name="scheduled_posts",
        help_text="Which Reddit account to use for posting",
    )

    subreddit = models.CharField(max_length=100)
    title = models.CharField(max_length=300)
    selftext = models.TextField()

    cron_schedule = models.CharField(max_length=100, null=True, blank=True)
    user_timezone = models.CharField(
        max_length=50,
        default="UTC",
        help_text="User's timezone for interpreting cron schedule",
    )
    next_run = models.DateTimeField(null=True, blank=True, db_index=True)
    end_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="active", db_index=True
    )
    last_submission_error = models.TextField(null=True, blank=True)

    last_run_started = models.DateTimeField(null=True, blank=True)
    last_run_finished = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title}"

    def clean(self):
        if self.reddit_account and self.reddit_account.user != self.user:
            raise ValidationError("Reddit account must belong to the same user")

    class Meta:
        ordering = ["-created_at"]


class SubmittedPost(models.Model):
    reddit_account = models.ForeignKey(
        "RedditAccount",
        on_delete=models.SET_NULL,
        null=True,
        related_name="submission_history",
        help_text="The specific Reddit account used for this submission.",
    )
    scheduled_post = models.ForeignKey(
        "ScheduledPost",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_posts",
        help_text="The scheduled post this submission came from",
    )

    subreddit = models.CharField(default="", max_length=100, help_text="Subreddit at time of submission")
    title = models.CharField(default="", max_length=300, help_text="Title at time of submission")
    selftext = models.TextField(default="", help_text="Selftext at time of submission")

    reddit_post_id = models.CharField(max_length=20, unique=True, db_index=True)
    reddit_url = models.URLField(null=True, blank=True, help_text="Full Reddit URL of the post")

    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    removed_at = models.DateTimeField(null=True, blank=True, help_text="When the post was removed")
    removed_by = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Who removed the post (moderator, admin, etc.)",
    )

    class Meta:
        ordering = ["-submitted_at"]
        indexes = [
            models.Index(fields=["reddit_post_id"]),
            models.Index(fields=["submitted_at"]),
        ]

    def __str__(self):
        return f"r/{self.subreddit}: '{self.title}' (ID: {self.reddit_post_id})"

    def save(self, *args, **kwargs):
        if self.reddit_post_id and not self.reddit_url:
            self.reddit_url = f"https://reddit.com/r/{self.subreddit}/comments/{self.reddit_post_id}/"
        super().save(*args, **kwargs)
