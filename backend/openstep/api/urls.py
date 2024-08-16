from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'steps', views.StepViewSet)
router.register(r'travels', views.TravelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]