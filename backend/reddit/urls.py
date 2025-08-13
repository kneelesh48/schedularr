from django.urls import path
from .views import reddit_login, reddit_callback

urlpatterns = [
    path("login/", reddit_login, name="reddit_login"),
    path("callback/", reddit_callback, name="reddit_callback"),
]
