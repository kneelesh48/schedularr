from django.urls import path, include # Added include
from rest_framework.routers import DefaultRouter # Added router
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'posts', views.ScheduledPostViewSet, basename='scheduledpost')

# Define URL patterns for the scheduler app
# The API URLs are now determined automatically by the router.
# We also include the login/callback URLs.
urlpatterns = [
    path('login/', views.reddit_login, name='reddit_login'),
    path('callback/', views.reddit_callback, name='reddit_callback'),
    path('dashboard/', views.dashboard, name='dashboard'), # Placeholder dashboard
    path('api/', include(router.urls)), # Include the DRF router URLs under 'api/'
]