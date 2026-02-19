from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, UserMeUpdateSerializer
from .permissions import IsAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_permissions(self):
        if self.action == "me":
            return [IsAuthenticated()]
        return [permission() for permission in self.permission_classes]

    def get_serializer_class(self):
        if self.action == "me" and self.request.method in ["PATCH", "PUT"]:
            return UserMeUpdateSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        if request.method == "PATCH":
            serializer = UserMeUpdateSerializer(
                request.user,
                data=request.data,
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
        response_serializer = UserSerializer(request.user)
        return Response(response_serializer.data)
