from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from django.utils.safestring import mark_safe


from step.models import Step, Travel, Media

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

