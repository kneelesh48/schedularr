import praw
import uuid
from django.shortcuts import redirect, render
from django.http import HttpResponse, HttpRequest, HttpResponseForbidden
from django.conf import settings
from django.urls import reverse
from django.contrib.auth.decorators import login_required # Added login_required
from rest_framework import viewsets, permissions
from .models import ScheduledPost, RedditAccount # Added RedditAccount model
from .serializers import ScheduledPostSerializer

# Helper function to get PRAW instance
def get_reddit_instance(refresh_token=None): # Allow passing refresh token
    # If refresh token is provided, initialize PRAW for authenticated user actions
    if refresh_token:
        return praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            refresh_token=refresh_token, # Use the provided token
            user_agent=settings.REDDIT_USER_AGENT,
        )
    # Otherwise, initialize for authorization flow (no specific user yet)
    else:
        return praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            redirect_uri=settings.REDDIT_REDIRECT_URI,
            user_agent=settings.REDDIT_USER_AGENT,
        )

@login_required # Ensure user is logged into Django first
def reddit_login(request: HttpRequest):
    """
    Redirects the user to Reddit for authorization.
    Requires the user to be logged into the Django application.
    """
    reddit = get_reddit_instance() # Get instance for auth URL generation
    # Generate a unique state value for CSRF protection
    state = str(uuid.uuid4())
    request.session['reddit_auth_state'] = state

    # Define the scopes (permissions) needed
    # 'identity' to get username, 'submit' to create posts
    scopes = ['identity', 'submit', 'read'] # Added 'read' for potentially checking user details

    auth_url = reddit.auth.url(scopes=scopes, state=state, duration='permanent')
    return redirect(auth_url)

# No login_required here, as the user is coming back from Reddit
def reddit_callback(request: HttpRequest):
    """
    Handles the callback from Reddit after authorization.
    Exchanges the code for tokens and stores the refresh token
    associated with the logged-in Django user.
    """
    # Ensure a Django user is actually logged in during this callback phase
    if not request.user.is_authenticated:
        return HttpResponseForbidden("User not logged in. Please log in to the application first.")

    received_state = request.GET.get('state')
    expected_state = request.session.pop('reddit_auth_state', None)
    code = request.GET.get('code')
    error = request.GET.get('error')

    if error:
        # Handle the case where the user denied access or an error occurred
        # TODO: Redirect to a frontend page showing the error
        return HttpResponse(f"Reddit authentication failed: {error}", status=403)

    if not received_state or received_state != expected_state:
        # Handle potential CSRF attack
        # TODO: Redirect to a frontend page showing the error
        return HttpResponse("Invalid state parameter. Authentication failed.", status=403)

    if not code:
        # TODO: Redirect to a frontend page showing the error
        return HttpResponse("Missing authorization code. Authentication failed.", status=400)

    # Get PRAW instance for auth code exchange (doesn't need refresh token yet)
    reddit = get_reddit_instance()
    try:
        # Exchange the authorization code for a refresh token
        refresh_token = reddit.auth.authorize(code)

        # Use the obtained refresh token to get an authenticated PRAW instance
        authenticated_reddit = get_reddit_instance(refresh_token=refresh_token)
        reddit_user = authenticated_reddit.user.me()
        reddit_username = reddit_user.name

        # Store the refresh token and Reddit username securely in the database
        # linked to the logged-in Django user.
        RedditAccount.objects.update_or_create(
            user=request.user,
            defaults={
                'reddit_username': reddit_username,
                'refresh_token': refresh_token,
            }
        )

        # Clear any temporary session data if needed (we didn't store much here)
        # request.session.pop('reddit_refresh_token', None) # No longer needed
        # request.session.pop('reddit_username', None) # No longer needed

        # TODO: Redirect to the main frontend application dashboard
        print(f"Successfully linked Reddit account '{reddit_username}' to Django user '{request.user.username}'")
        # For now, redirect to our placeholder Django dashboard
        return redirect(reverse('dashboard'))

    except Exception as e:
        # Log the exception e
        print(f"Error during Reddit authorization callback for user {request.user.username}: {e}")
        # TODO: Redirect to a frontend page showing a generic error
        return HttpResponse("An error occurred during Reddit authentication.", status=500)

@login_required # Also protect the dashboard
def dashboard(request: HttpRequest):
    """
    Placeholder dashboard view. Shows user info and link status.
    """
    try:
        reddit_account = request.user.reddit_account
        reddit_username = reddit_account.reddit_username
        is_linked = True
    except RedditAccount.DoesNotExist:
        reddit_username = "Not Linked"
        is_linked = False

    django_username = request.user.username

    if is_linked:
        message = f"Welcome, {django_username}! Your Reddit account ({reddit_username}) is linked."
    else:
        login_url = reverse('reddit_login')
        message = f'Welcome, {django_username}! <a href="{login_url}">Link your Reddit Account</a>'

    # TODO: Replace this with a proper template render or redirect to frontend
    return HttpResponse(message)


# --- API Views ---

class ScheduledPostViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows scheduled posts to be viewed or edited.
    """
    serializer_class = ScheduledPostSerializer
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users

    def get_queryset(self):
        """
        This view should return a list of all the scheduled posts
        for the currently authenticated user.
        """
        user = self.request.user
        return ScheduledPost.objects.filter(user=user)

    def perform_create(self, serializer):
        """
        Associate the post with the logged-in user upon creation.
        """
        # TODO: Calculate initial next_run_time based on cron_schedule
        serializer.save(user=self.request.user)

    # TODO: Add perform_update to recalculate next_run_time if schedule changes
