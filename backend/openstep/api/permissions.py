from rest_framework import permissions
from step.models import Travel


class TravelOwner(permissions.BasePermission):
    """Object-level permission: only travel owners can edit/delete a travel.

    Intended for use on `TravelViewSet` as an object permission.
    """

    message = 'Only travel owners can modify this travel.'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # If object is a Travel, check owners directly
        if isinstance(obj, Travel):
            return request.user.id in obj.owners.values_list('id', flat=True)
        # Otherwise, try to resolve travel via attribute (e.g. Step)
        travel = getattr(obj, 'travel', None)
        if travel is not None:
            return request.user.id in travel.owners.values_list('id', flat=True)
        # Media objects: traverse media -> step -> travel
        step = getattr(obj, 'step', None)
        if step is not None:
            travel = getattr(step, 'travel', None)
            if travel is not None:
                return request.user.id in travel.owners.values_list('id', flat=True)
        return False


class TravelStepOwner(permissions.BasePermission):
    """View-level permission for Step creation: only owners of the referenced
    travel may create steps for it.

    Intended for use on the `StepViewSet` as a view permission.
    """

    message = 'Can only create/edit steps of your own travels.'

    def has_permission(self, request, view):
        # Allow safe methods for everyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # For POST creating a Step, the request payload should include the travel id.
        # The frontend posts GeoJSON features with travel id nested in properties.
        if request.method == 'POST':
            data = request.data or {}
            travel_id = None
            if isinstance(data, dict):
                travel_id = data.get('travel') or (data.get('properties') or {}).get('travel')
            if not travel_id:
                return False
            try:
                return Travel.objects.filter(id=travel_id, owners__id=request.user.id).exists()
            except Exception:
                return False

        # For other write operations (update/delete) rely on object-level check.
        return True

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        travel = getattr(obj, 'travel', None)
        if travel is not None:
            return request.user.id in travel.owners.values_list('id', flat=True)
        return False