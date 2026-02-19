from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or request.user.role == 'admin'

class IsCashier(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or request.user.role == 'cashier'


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated
        return request.user.is_superuser or request.user.role == "admin"
