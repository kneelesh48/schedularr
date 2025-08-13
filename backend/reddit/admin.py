from django.contrib import admin
from .models import RedditAccount, ScheduledPost, SubmittedPost

# Register your models here.
admin.site.register(RedditAccount)
admin.site.register(ScheduledPost)
admin.site.register(SubmittedPost)
