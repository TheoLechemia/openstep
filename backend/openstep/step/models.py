from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.

class Travel(models.Model):
    name = models.CharField(max_length=200)
    description =  models.CharField()
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    main_photo = models.FileField(upload_to="static", verbose_name=_("File"))

    def __str__(self) -> str:
        return self.name


class Step(models.Model):
    name = models.CharField()
    date = models.DateField()
    location = models.PointField(srid=4326, verbose_name=_("Location"))
    description = models.CharField(blank=True, null=True)
    travel = models.ForeignKey(
        Travel, 
        on_delete=models.CASCADE, 
    )

    def __str__(self) -> str:
        return self.name
    
    @property
    def first_media(self):
        return self.medias.first()
    

class Media(models.Model):
    legend = models.CharField()
    media_file = models.FileField(upload_to="static", verbose_name=_("File"))

    step = models.ForeignKey(
        Step, 
        on_delete=models.CASCADE, 
        related_name="medias",
    )
