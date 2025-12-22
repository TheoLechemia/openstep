import random

from django.shortcuts import render
from .models import Step
from django_weasyprint.views import WeasyTemplateResponse
from weasyprint import HTML
from django.http import HttpResponse
from django.views import View
from django.shortcuts import get_object_or_404
from django.conf import settings
from staticmap import StaticMap, CircleMarker, Line

# Create your views here.


class StepPdfDescMixin:
    def get_context_data(self, id):
        step = get_object_or_404(Step, id=id)
        context = {"step": step}
        m = StaticMap(
            width=1200,
            height=300,
            url_template="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
        )
        coordinates = [step.location.x, step.location.y]
        marker = CircleMarker(coordinates, "#E8B4B8", 12)
        marker_outline = CircleMarker(coordinates, "white", 18)

        m.add_marker(marker_outline)
        m.add_marker(marker)

        image = m.render(zoom=12)
        media_name = f"map_travel_{step.travel.id}_step_{step.id}.png"
        path = settings.MEDIA_ROOT / media_name
        image.save(path)
        context["map_url"] = settings.MEDIA_URL + media_name

        return context


class StepPdfMediaMixin:
    def get_context_data(self, id):
        step = get_object_or_404(Step, id=id)
        context = {"step": step}
        # Récupérer les médias (sauf le premier qui est l'image principale)
        medias = list(context["step"].medias.all()[1:7])  # Max 6 images

        # Générer les tailles de colonnes par paires
        media_with_cols = []

        for i in range(0, len(medias), 2):
            first_col_size = None
            # si une des deux paire est en portrait on met la paire à 6/6
            if medias[i].orientation == "portrait" or (
                i + 1 < len(medias) and medias[i + 1].orientation == "portrait"
            ):
                first_col_size = 6
                second_col_size = 6
            else:
                # Taille aléatoire pour la première colonne (6 et 7)
                first_col_size = random.choice([5, 6])
                second_col_size = 11 - first_col_size
            # if i == len(medias) - 1 and i % 2 == 0:
            #     first_col_size = 12
            #     second_col_size = 0

            # Ajouter le premier média avec sa taille
            media_with_cols.append({"media": medias[i], "col_size": first_col_size})

            # Ajouter le second média si il existe
            if i + 1 < len(medias):

                media_with_cols.append(
                    {"media": medias[i + 1], "col_size": second_col_size}
                )

        context["media_with_cols"] = media_with_cols
        context["has_custom_layout"] = False
        if hasattr(step, "book_layout"):
            context["has_custom_layout"] = True

        return context


class StepDescView(View, StepPdfDescMixin):
    model = Step
    template_name = "step_pdf_description.html"

    def get(self, request, id, *args, **kwargs):
        context = self.get_context_data(id)
        return render(request, self.template_name, context)


class StepMediaView(View, StepPdfMediaMixin):
    model = Step
    template_name = "step_pdf_medias.html"

    def get(self, request, id, *args, **kwargs):
        context = self.get_context_data(id)
        if context["has_custom_layout"]:
            response = HttpResponse(
                context["step"].book_layout.html, content_type="text/html"
            )
            return response
        return render(request, self.template_name, context)


## export pdf view


class StepExportDescPDFView(View, StepPdfDescMixin):
    template_name = "step_pdf_description.html"

    def get(self, request, id, *args, **kwargs):
        return WeasyTemplateResponse(
            request, self.template_name, self.get_context_data(id)
        )


class StepExportMediaPDFView(View, StepPdfMediaMixin):
    template_name = "step_pdf_medias.html"

    def get(self, request, id, *args, **kwargs):
        context = self.get_context_data(id)
        if context["has_custom_layout"]:

            pdf = HTML(
                string=context["step"].book_layout.html,
            ).write_pdf()

            response = HttpResponse(pdf, content_type="application/pdf")
            response["Content-Disposition"] = 'inline; filename="layout.pdf"'
            return response
        return WeasyTemplateResponse(request, self.template_name, context)
