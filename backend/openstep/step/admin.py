from typing import Any, Mapping
from django import forms
from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from django.core.files.base import File
from django.db.models.base import Model
from django.forms.utils import ErrorList
from django.utils.safestring import mark_safe
from tinymce.widgets import TinyMCE



from step.models import Step, Travel, Media


class StepForm(forms.ModelForm):
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


class StepAdmin(GISModelAdmin):
    form = StepForm
    inlines = [MediaInline]
    list_display = ("name", "description", "media_preview",)

    @admin.display(description="Media")
    def media_preview(self, obj):
        if obj.first_media:
            return mark_safe(
                f'<img src="{obj.first_media.media_file.url}" style="object-fit:contain" width="150" />'
            )



class TravelAdmin(admin.ModelAdmin):
    pass


admin.site.register(Step, StepAdmin)
admin.site.register(Travel, TravelAdmin)

