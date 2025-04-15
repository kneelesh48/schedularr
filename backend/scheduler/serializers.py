from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import RedditAccount, ScheduledPost

User = get_user_model()

class RedditAccountSerializer(serializers.ModelSerializer):
    """
    Serializer for the RedditAccount model.
    Note: We generally wouldn't expose refresh_token via API.
          This might be used internally or for admin purposes.
    """
    # Display username instead of user ID
    user = serializers.StringRelatedField()

    class Meta:
        model = RedditAccount
        # Exclude refresh_token for security unless specifically needed
        fields = ['user', 'reddit_username', 'created_at', 'updated_at']
        read_only_fields = ['user', 'reddit_username', 'created_at', 'updated_at']


class ScheduledPostSerializer(serializers.ModelSerializer):
    """
    Serializer for the ScheduledPost model.
    """
    # Make user read-only, it will be set based on the request user
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    # Optionally display username for read operations
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ScheduledPost
        fields = [
            'id',
            'user',
            'username', # Added for convenience
            'subreddit',
            'title',
            'body',
            'cron_schedule',
            'next_run_time',
            'end_date',
            'status',
            'reddit_post_id',
            'last_submission_error',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'username',
            'next_run_time', # Usually calculated by the backend
            'reddit_post_id',
            'last_submission_error',
            'created_at',
            'updated_at',
        ]

    def validate_cron_schedule(self, value):
        """
        TODO: Add validation to ensure the cron_schedule string is valid.
        Could use a library like 'croniter' or 'python-crontab'.
        """
        # Example (requires installing 'croniter'):
        # from croniter import croniter
        # if not croniter.is_valid(value):
        #     raise serializers.ValidationError("Invalid cron schedule format.")
        return value