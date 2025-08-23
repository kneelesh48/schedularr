import datetime

from django.contrib.auth import get_user_model
from rest_framework import serializers
from croniter import croniter, CroniterError

from ..models import RedditAccount, ScheduledPost, SubmittedPost


User = get_user_model()


class RedditAccountSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = RedditAccount
        fields = [
            "id",
            "user",
            "reddit_username",
            "reddit_account_status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "reddit_username",
            "reddit_account_status",
            "created_at",
            "updated_at",
        ]


class ScheduledPostSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    reddit_account = serializers.PrimaryKeyRelatedField(
        queryset=RedditAccount.objects.none()  # Will be set in view
    )
    reddit_account_username = serializers.CharField(
        source="reddit_account.reddit_username", read_only=True
    )

    class Meta:
        model = ScheduledPost
        fields = [
            "id",
            "user",
            "username",  # Added for convenience
            "reddit_account",
            "reddit_account_username",  # Added for convenience
            "subreddit",
            "title",
            "selftext",
            "cron_schedule",
            "end_date",
            "next_run",
            "status",
            "last_submission_error",
            "last_run_started",
            "last_run_finished",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "username",
            "reddit_account_username",
            "next_run",
            "last_submission_error",
            "created_at",
            "updated_at",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            self.fields['reddit_account'].queryset = RedditAccount.objects.filter(user=request.user)

    def validate_cron_schedule(self, value):
        # If the value is empty or None, it's considered valid (e.g., one-time post)
        if not value:
            return value

        # Check if the non-empty cron string is valid
        if not croniter.is_valid(value):
            raise serializers.ValidationError(f"Invalid cron schedule format: '{value}'")

        # Optional: Check if it can generate at least one future date
        # This prevents theoretically valid but practically useless schedules
        # like '* * 31 2 *' (Feb 31st)
        try:
            # Using a fixed date avoids issues with tests running near month/year ends
            base_dt = datetime.datetime(2025, 1, 1, 0, 0)
            iter = croniter(value, base_dt)
            iter.get_next(datetime.datetime)
        except CroniterError as e:
            raise serializers.ValidationError(f"Cron schedule '{value}' is valid but cannot generate a future date: {e}")
        except ValueError as e:
            raise serializers.ValidationError(f"Error validating cron schedule '{value}': {e}")
        return value


class SubmittedPostSerializer(serializers.ModelSerializer):
    scheduled_post_title = serializers.CharField(source="scheduled_post.title", read_only=True)
    subreddit = serializers.CharField(source="scheduled_post.subreddit", read_only=True)

    class Meta:
        model = SubmittedPost
        fields = [
            "id",
            "scheduled_post",
            "scheduled_post_title",
            "subreddit", 
            "reddit_post_id",
            "reddit_url",
            "submitted_at",
            "removed_at",
            "removed_by",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "scheduled_post",
            "scheduled_post_title",
            "subreddit",
            "reddit_post_id",
            "reddit_url",
            "submitted_at",
            "removed_at",
            "removed_by",
            "updated_at",
        ]
