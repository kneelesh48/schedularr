from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password


User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password", "password_confirm")

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError("Passwords don't match.")
        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class UserDetailsSerializer(serializers.ModelSerializer):
    is_reddit_linked = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("pk", "username", "first_name", "last_name", "email", "is_reddit_linked")
        read_only_fields = ("pk", "username", "email")

    def get_is_reddit_linked(self, obj):
        return obj.reddit_accounts.exists()
