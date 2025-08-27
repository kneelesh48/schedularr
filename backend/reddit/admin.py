from django.contrib import admin
from .models import RedditAccount, ScheduledPost, SubmittedPost


class RedditAccountAdmin(admin.ModelAdmin):
    list_display = ("reddit_username", "user", "reddit_account_status")
    list_filter = ("reddit_account_status",)

class ScheduledPostAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "reddit_account", "subreddit", "title", "status", "next_run")

class SubmittedPostAdmin(admin.ModelAdmin):
    list_display = ("reddit_post_id", "scheduled_post", "reddit_url", "submitted_at")

# Register your models here.
admin.site.register(RedditAccount, RedditAccountAdmin)
admin.site.register(ScheduledPost, ScheduledPostAdmin)
admin.site.register(SubmittedPost, SubmittedPostAdmin)
