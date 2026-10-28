from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_superuser))


class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser or request.user.role in ['ADMIN', 'MANAGER']:
            return True
        # Allow read-only for technicians
        if request.method in permissions.SAFE_METHODS:
            return True
        return False


class CanUpdateWorkOrder(permissions.BasePermission):
    """
    Admins & Managers have full access.
    Technicians can update progress, tasks, status, and notes on work orders.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser or request.user.role in ['ADMIN', 'MANAGER']:
            return True
        # Technicians can view and update work orders
        if request.method in permissions.SAFE_METHODS or request.method in ['PATCH', 'PUT']:
            return True
        return False
