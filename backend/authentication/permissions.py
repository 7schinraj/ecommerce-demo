from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUser(BasePermission):
    """
    Allows access only to authenticated users with the 'admin' role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )

class IsAdminOrReadOnly(BasePermission):
    """
    Allows read access to anyone, but write access only to authenticated admins.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )
