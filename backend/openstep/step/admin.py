from django import forms
from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from django.contrib.gis.forms.widgets import OSMWidget
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from tinymce.widgets import TinyMCE



from step.models import Step, Travel, Media, Comments


class TravelAdmin(admin.ModelAdmin):
    list_display = ("name", "uuid", "is_public", "start_date", "end_date")
    list_editable = ("is_public",)
    readonly_fields = ("uuid",)

    def get_queryset(self, request):
        return Travel.objects.get_authorized(request)


class StepForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(StepForm, self).__init__(*args, **kwargs)
        # HACK : pourquoi on doit passer ce champs à faux à la main alors qu'il est en null=true dans le model ?
        self.fields["name"].required = False

    class Meta:
        widgets = {
            "description": TinyMCE()
        }
        help_texts = {
            "positional_step": _('A positional step is a step without description and media. It just help to draw the travel on the map')
        }

    



class MediaInline(admin.TabularInline):
    model = Media
    extra = 0
    fields = ("legend", "media_file", "media_preview")
    readonly_fields = ("media_preview",)

    @admin.display(description="Preview")
    def media_preview(self, obj):
        return mark_safe(
            f'<img src="{obj.media_file.url}" style="object-fit:contain" width="150" />'
        )


class CustomGeoWidget(OSMWidget):
    template_name = 'customgis.html'

class StepAdmin(GISModelAdmin):
    gis_widget = CustomGeoWidget
    form = StepForm
    inlines = [MediaInline]
    list_display = ("name", "description", "media_preview",)
    fields = ("travel", "positional_step", "name", "date", "location", "description")

    def get_queryset(self, request):
        travels = Travel.objects.get_authorized(request)
        return Step.objects.prefetch_related("travel").filter(travel__id__in=travels)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "travel":
            kwargs["queryset"] = Travel.objects.get_authorized(request)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)     
       

    @admin.display(description="Media")
    def media_preview(self, obj):
        if obj.first_media:
            return mark_safe(
                f'<img src="{obj.first_media.media_file.url}" style="object-fit:contain" width="150" />'
            )



class CommentAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        travels = Travel.objects.get_authorized(request)
        return Comments.objects.prefetch_related("step").filter(step__travel__id__in=travels)

admin.site.register(Step, StepAdmin)
admin.site.register(Travel, TravelAdmin)
admin.site.register(Comments, CommentAdmin)

