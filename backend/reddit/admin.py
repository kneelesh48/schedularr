from django.contrib import admin
from .models import RedditAccount, ScheduledPost, SubmittedPost


class RedditAccountAdmin(admin.ModelAdmin):
    list_display = ("reddit_username", "user", "reddit_account_status")
    list_filter = ("reddit_account_status",)


class ScheduledPostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "reddit_account",
        "subreddit",
        "title",
        "status",
        "last_run_started",
        "next_run",
    )


class SubmittedPostAdmin(admin.ModelAdmin):
    list_display = (
        "reddit_post_id",
        "reddit_account",
        "reddit_username",
        "reddit_url",
        "title",
        "submitted_at",
    )


# Register your models here.
admin.site.register(RedditAccount, RedditAccountAdmin)
admin.site.register(ScheduledPost, ScheduledPostAdmin)
admin.site.register(SubmittedPost, SubmittedPostAdmin)
