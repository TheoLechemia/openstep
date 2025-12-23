import random

from django.shortcuts import render
from .models import Step, Travel
from django_weasyprint.views import WeasyTemplateResponse
from weasyprint import HTML
from django.http import HttpResponse
from django.views import View
from django.shortcuts import get_object_or_404
from django.conf import settings
from staticmap import StaticMap, CircleMarker, Line

# Create your views here.


class StepPdfDescMixin:

    def get_map(self, step):
        travel_line_coords = [
            (s.location.x, s.location.y)
            for s in step.travel.steps.exclude(location__isnull=True)
        ]

        m = StaticMap(
            width=370,
            height=793,
            url_template="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
        )

        m.add_line(Line(travel_line_coords, "#615A5AA4", 3))

        center = (step.location.x, step.location.y)
        m.add_marker(CircleMarker(center, "white", 25))
        m.add_marker(CircleMarker(center, "#E8B4B8", 18))

        image = m.render(zoom=7, center=center)

        media_name = f"map_travel_{step.travel.id}_step_{step.id}.png"
        path = settings.MEDIA_ROOT / media_name
        image.save(path)

        return settings.MEDIA_URL + media_name

    def get_context_data(self, id):
        step = get_object_or_404(Step, id=id)
        context = {"step": step}
        context["map_url"] = self.get_map(step)
        return context


class StepPdfMediaMixin:
    def build_step_medias(self, step):
        medias = list(step.medias.all()[1:7])
        media_with_cols = []

        for i in range(0, len(medias), 2):
            if medias[i].orientation == "portrait" or (
                i + 1 < len(medias) and medias[i + 1].orientation == "portrait"
            ):
                first, second = 6, 6
            else:
                first = random.choice([6, 7])
                second = 12 - first

            media_with_cols.append(
                {
                    "media": medias[i],
                    "col_size": first,
                }
            )

            if i + 1 < len(medias):
                media_with_cols.append(
                    {
                        "media": medias[i + 1],
                        "col_size": second,
                    }
                )

        return media_with_cols

    def get_context_data(self, id):
        step = get_object_or_404(Step, id=id)
        context = {"step": step}
        context["media_with_cols"] = self.build_step_medias(step)
        context["has_custom_layout"] = hasattr(step, "book_layout")
        return context


class StepDescView(View, StepPdfDescMixin):
    model = Step
    template_name = "step_pdf_description.html"

    def get(self, request, id, *args, **kwargs):
        context = self.get_context_data(id)
        context["step_page"] = True
        return render(request, self.template_name, context)


class StepMediaView(View, StepPdfMediaMixin):
    model = Step
    template_name = "step_pdf_medias.html"

    def get(self, request, id, *args, **kwargs):
        context = self.get_context_data(id)
        context["step_page"] = True
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


class TravelExportPDFView(View, StepPdfDescMixin, StepPdfMediaMixin):
    template_name = "travel_pdf.html"

    def build_step_context(self, step):
        return {
            "step": step,
            # "map_url": None,
            "map_url": self.get_map(step),
            "media_with_cols": self.build_step_medias(step),
            "has_custom_layout": hasattr(step, "book_layout"),
            "custom_layout_html": (
                step.book_layout.html if hasattr(step, "book_layout") else None
            ),
        }

    def get(self, request, id):
        steps = (
            Step.objects.filter(travel_id=id)
            .filter(positional_step=False)
            .prefetch_related("medias", "travel__steps")
            .order_by("date")
        )

        travel = Travel.objects.get(id=id)

        steps_context = [self.build_step_context(step) for step in steps]

        # return render(
        #     request, self.template_name, {"steps": steps_context, "travel": travel}
        # )

        return WeasyTemplateResponse(
            request,
            self.template_name,
            {"steps": steps_context, "travel": travel},
            filename="travel.pdf",
        )
