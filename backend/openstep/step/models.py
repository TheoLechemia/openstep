from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _


# Create your models here.

class Travel(models.Model):
    name = models.CharField(max_length=200)
    description =  models.CharField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    main_photo = models.CharField()


class Media(models.Model):
    name = models.CharField()
    path = models.CharField()

class Step(models.Model):
    name = models.CharField()
    location = models.PointField(srid=4326, verbose_name=_("Location"))
    descriptions = models.CharField()
    medias = models.ForeignKey(Media, on_delete=models.CASCADE)