from django.urls import path

from . import views

urlpatterns = [
    path('user/accounts/', views.RedditAccountListView.as_view(), name='api_reddit_accounts_list'),
    path('user/status/', views.UserRedditStatusView.as_view(), name='api_user_reddit_status'),
    path('user/unlink/', views.UnlinkRedditAccountView.as_view(), name='api_unlink_reddit_account'),
    path('user/reddit-login-url/', views.RedditLoginUrlView.as_view(), name='api_reddit_login_url'),
    path('dashboard/', views.DashboardView.as_view(), name='api_dashboard'),

    # Posts endpoints
    path('posts/', views.ScheduledPostListView.as_view(), name='api_posts_list_create'),
    path('posts/<int:pk>/', views.ScheduledPostDetailView.as_view(), name='api_posts_detail'),
    path('posts/<int:scheduled_post_id>/submissions/', views.ScheduledPostSubmittedPostsView.as_view(), name='api_scheduled_post_submitted_posts'),

    # Submitted posts endpoints
    path('submissions/', views.SubmittedPostListView.as_view(), name='api_submitted_posts_list'),
    path('submissions/<int:pk>/', views.SubmittedPostDetailView.as_view(), name='api_submitted_posts_detail'),
]
