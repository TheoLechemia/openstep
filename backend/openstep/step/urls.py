from django.urls import path

from . import views


urlpatterns = [
    path("step_description/<int:id>", views.StepDescView.as_view(), name="step_desc"),
    path("step_medias/<int:id>", views.StepMediaView.as_view(), name="step_medias"),
    path(
        "step_export_desc/<int:id>",
        views.StepExportDescPDFView.as_view(),
        name="step_pdf",
    ),
    path(
        "step_export_media/<int:id>",
        views.StepExportMediaPDFView.as_view(),
        name="step_pdf",
    ),
    path(
        "export_travel/<int:id>",
        views.TravelExportPDFView.as_view(),
        name="travel_pdf",
    ),
]
