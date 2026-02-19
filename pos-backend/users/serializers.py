from rest_framework import serializers
from .models import User

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'password']

    def create(self, validated_data):
        role = validated_data['role']
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            role=role,
            is_staff=(role == "admin"),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_superuser']


class UserMeUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = User
        fields = ['password']

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
