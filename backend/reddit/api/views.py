import os

from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from drf_spectacular.utils import extend_schema

from google import genai
from google.genai import types

from ..utils import calculate_next_run
from ..models import RedditAccount, ScheduledPost, SubmittedPost
from .serializers import (
    ScheduledPostSerializer,
    RedditAccountSerializer,
    SubmittedPostSerializer,
    TextToCronRequestSerializer,
    TextToCronResponseSerializer,
)

User = get_user_model()


class RedditAccountListView(generics.ListAPIView):
    serializer_class = RedditAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.reddit_accounts.all()


class UserRedditStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reddit_accounts = request.user.reddit_accounts.all()
        is_linked = reddit_accounts.exists()

        return Response(
            {
                "user_id": request.user.id,
                "username": request.user.username,
                "is_reddit_linked": is_linked,
                "reddit_accounts": RedditAccountSerializer(
                    reddit_accounts, many=True
                ).data,
                "reddit_account_count": reddit_accounts.count(),
            }
        )


class UnlinkRedditAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        reddit_account_id = request.data.get("reddit_account_id")
        if not reddit_account_id:
            return Response(
                {"error": "reddit_account_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reddit_account = request.user.reddit_accounts.get(id=reddit_account_id)
            reddit_username = reddit_account.reddit_username
            reddit_account.delete()

            return Response(
                {"message": f"Successfully unlinked Reddit account {reddit_username}"}
            )
        except RedditAccount.DoesNotExist:
            return Response(
                {"error": "Reddit account not found or doesn't belong to this user"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception:
            return Response(
                {"error": "Failed to unlink Reddit account"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RedditLoginUrlView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reddit_login_path = reverse("reddit_login")
        reddit_login_url = (
            f"{request.build_absolute_uri(reddit_login_path)}?user_id={request.user.id}"
        )

        return Response({"login_url": reddit_login_url})


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reddit_accounts = request.user.reddit_accounts.all()
        is_linked = reddit_accounts.exists()

        return Response(
            {
                "user": {"username": request.user.username, "is_authenticated": True},
                "reddit_accounts": {
                    "is_linked": is_linked,
                    "accounts": [
                        {
                            "id": account.id,
                            "reddit_username": account.reddit_username,
                            "reddit_account_status": account.reddit_account_status,
                            "created_at": account.created_at.isoformat(),
                        }
                        for account in reddit_accounts
                    ],
                    "count": reddit_accounts.count(),
                },
                "links": {"reddit_login": reverse("reddit_login")},
            }
        )


class ScheduledPostListView(generics.ListCreateAPIView):
    serializer_class = ScheduledPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ScheduledPost.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if not self.request.user.reddit_accounts.exists():
            raise ValidationError(
                "You must link at least one Reddit account before creating scheduled posts."
            )

        cron_schedule = serializer.validated_data.get("cron_schedule")
        user_timezone = serializer.validated_data.get("user_timezone", "UTC")
        next_run = None
        if cron_schedule:
            next_run = calculate_next_run(cron_schedule, user_timezone)
            if next_run is None:
                raise ValidationError(
                    f"Failed to calculate next run time for cron schedule: {cron_schedule}"
                )

        serializer.save(user=self.request.user, next_run=next_run)


class ScheduledPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ScheduledPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ScheduledPost.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        original_cron_schedule = instance.cron_schedule
        original_user_timezone = instance.user_timezone

        new_cron_schedule = serializer.validated_data.get(
            "cron_schedule", original_cron_schedule
        )
        new_user_timezone = serializer.validated_data.get(
            "user_timezone", original_user_timezone
        )

        next_run = instance.next_run

        if (
            new_cron_schedule != original_cron_schedule
            or new_user_timezone != original_user_timezone
        ):
            if new_cron_schedule:
                next_run = calculate_next_run(new_cron_schedule, new_user_timezone)
                if next_run is None:
                    raise ValidationError(
                        f"Failed to calculate next run time for cron schedule: {new_cron_schedule}"
                    )
            else:
                next_run = None

        serializer.save(next_run=next_run)


class SubmittedPostListView(generics.ListAPIView):
    serializer_class = SubmittedPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SubmittedPost.objects.filter(
            scheduled_post__user=self.request.user
        ).select_related("scheduled_post")


class SubmittedPostDetailView(generics.RetrieveAPIView):
    serializer_class = SubmittedPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SubmittedPost.objects.filter(
            scheduled_post__user=self.request.user
        ).select_related("scheduled_post")


class ScheduledPostSubmittedPostsView(generics.ListAPIView):
    serializer_class = SubmittedPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        scheduled_post_id = self.kwargs["scheduled_post_id"]
        return SubmittedPost.objects.filter(
            scheduled_post=scheduled_post_id, scheduled_post__user=self.request.user
        ).select_related("scheduled_post")


class TextToCronView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=TextToCronRequestSerializer,
        responses={200: TextToCronResponseSerializer},
        description="Convert natural language schedule description to cron expression",
        tags=["utils"],
    )
    def post(self, request):
        serializer = TextToCronRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        schedule_text = serializer.validated_data["schedule_text"]

        try:
            client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

            prompt = f"""Convert the following cron schedule description into a standard cron expression (minute hour day month weekday format).
            
Cron schedule description: "{schedule_text}"

Requirements:
- Return ONLY the cron expression, no explanation
- Use standard 5-field cron format (minute hour day month weekday)
- Use * for any field
- Use 0-6 for weekday (0=Sunday, 1=Monday, etc.)
- Return INVALID if it can't be converted to a proper cron schedule
- Examples:
  - "Every Monday at 9 AM" -> "0 9 * * 1"
  - "Daily at 3 PM" -> "0 15 * * *"
  - "Every weekday at 8:30 AM" -> "30 8 * * 1-5"
  - "invalid text" -> "INVALID"

Return only the cron expression:"""

            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=types.Content(
                    role="user", parts=[types.Part.from_text(text=prompt)]
                ),
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(
                        thinking_budget=0,
                    ),
                ),
            )

            cron_schedule = response.candidates[0].content.parts[0].text.strip()

            # validation
            cron_parts = cron_schedule.split()
            if len(cron_parts) != 5:
                raise ValueError("Invalid cron format returned")

            next_run = calculate_next_run(cron_schedule, "UTC")
            if next_run is None:
                raise ValueError("Invalid cron schedule generated")

            return Response(
                {"cron_schedule": cron_schedule, "schedule_text": schedule_text}
            )
        except ValueError:
            return Response(
                {"error": "Could not determine a valid schedule. Please try rephrasing your request."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
