from django import forms
from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from django.contrib.gis.forms.widgets import OSMWidget
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from tinymce.widgets import TinyMCE



from step.models import Step, Travel, Media, Comments


class StepForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(StepForm, self).__init__(*args, **kwargs)
        self.fields['positional_step'].help_text = _('A positional step is a step without description and media. It just help to draw the travel on the map')
        # HACK : pourquoi on doit passer ce champs à faux à la main alors qu'il est en null=true dans le model ?
        self.fields["name"].required = False
    class Meta:
        widgets = {
            "description": TinyMCE()
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

    @admin.display(description="Media")
    def media_preview(self, obj):
        if obj.first_media:
            return mark_safe(
                f'<img src="{obj.first_media.media_file.url}" style="object-fit:contain" width="150" />'
            )



class TravelAdmin(admin.ModelAdmin):
    pass

class CommentAdmin(admin.ModelAdmin):
    pass


admin.site.register(Step, StepAdmin)
admin.site.register(Travel, TravelAdmin)
admin.site.register(Comments, TravelAdmin)

