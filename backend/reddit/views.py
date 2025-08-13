import uuid

import praw
from django.conf import settings
from django.http import HttpRequest, JsonResponse
from django.shortcuts import redirect
from django.contrib.auth import get_user_model

from .models import RedditAccount

User = get_user_model()


def get_reddit_instance(refresh_token=None):
    if refresh_token:
        return praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            refresh_token=refresh_token,
            user_agent=settings.REDDIT_USER_AGENT,
        )
    else:
        return praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            redirect_uri=settings.REDDIT_REDIRECT_URI,
            user_agent=settings.REDDIT_USER_AGENT,
        )


def reddit_login(request: HttpRequest):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "User ID required to link Reddit account"}, status=400)

    try:
        User.objects.get(id=user_id)

        reddit = get_reddit_instance()
        state = str(uuid.uuid4())
        request.session["reddit_auth_state"] = state
        request.session["reddit_auth_user_id"] = user_id

        scopes = ["identity", "submit", "read"]

        auth_url = reddit.auth.url(scopes=scopes, state=state, duration="permanent")
        return redirect(auth_url)
    except User.DoesNotExist:
        return JsonResponse({"error": "Invalid user"}, status=400)
    except Exception:
        return JsonResponse({"error": "Failed to initiate Reddit authentication"}, status=500)


def reddit_callback(request: HttpRequest):
    user_id = request.session.get("reddit_auth_user_id")
    if not user_id:
        error_url = f"{settings.FRONTEND_URL}/auth/error?message=Authentication session expired. Please try linking your Reddit account again."
        return redirect(error_url)

    expected_state = request.session.pop("reddit_auth_state", None)
    received_state = request.GET.get("state")
    code = request.GET.get("code")
    error = request.GET.get("error")

    if error:
        error_url = f"{settings.FRONTEND_URL}/auth/error?message=Reddit authentication failed: {error}"
        return redirect(error_url)

    if not received_state or received_state != expected_state:
        error_url = f"{settings.FRONTEND_URL}/auth/error?message=Invalid state parameter. Authentication failed."
        return redirect(error_url)

    if not code:
        error_url = f"{settings.FRONTEND_URL}/auth/error?message=Missing authorization code. Authentication failed."
        return redirect(error_url)

    try:
        user = User.objects.get(id=user_id)

        reddit = get_reddit_instance()
        refresh_token = reddit.auth.authorize(code)

        authenticated_reddit = get_reddit_instance(refresh_token=refresh_token)
        reddit_user = authenticated_reddit.user.me()
        reddit_username = reddit_user.name

        RedditAccount.objects.update_or_create(
            user=user,
            reddit_username=reddit_username,
            defaults={"refresh_token": refresh_token},
        )

        request.session.pop("reddit_auth_user_id", None)
        return redirect(f"{settings.FRONTEND_URL}/dashboard")

    except Exception:
        error_url = f"{settings.FRONTEND_URL}/auth/error?message=An error occurred during Reddit authentication"
        return redirect(error_url)
