from django.urls import path

from . import views


urlpatterns = [
    path("step_preview/<int:id>", views.StepPreviewView.as_view(), name="step_preview"),
    path(
        "export_travel/<int:id>",
        views.TravelExportPDFView.as_view(),
        name="travel_pdf",
    ),
]
