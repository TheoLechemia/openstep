from datetime import datetime
from typing import Any, Iterable
from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.timezone import now

from django_resized import ResizedImageField

from geopy.geocoders import Nominatim

# Create your models here.

class Travel(models.Model):
    name = models.CharField(max_length=200)
    description =  models.CharField()
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    main_photo = ResizedImageField(
        verbose_name=_("File"),
        size=[1500, 1200],
        quality=85,
        force_format="JPEG"
    )

    def __str__(self) -> str:
        return self.name


class Step(models.Model):
    name = models.CharField()
    date = models.DateField()
    location = models.PointField(srid=4326, verbose_name=_("Location"))
    country = models.CharField(null=True, blank=True)
    state = models.CharField(null=True, blank=True)
    description = models.CharField(blank=True, null=True)
    travel = models.ForeignKey(
        Travel, 
        on_delete=models.CASCADE, 
        related_name="steps",
    )

    @property
    def day_of_travel(self)->int:
        """Return the day nunmber of travel of this step"""
        delta = self.date - self.travel.start_date
        return delta.days

    def save(self, *args, **kwargs):
        nominatim = Nominatim(user_agent="openstep")
        response = nominatim.reverse((self.location.y, self.location.x))
        if response:
            if "address" in response.raw:
                self.country = response.raw["address"].get("country", None)
                self.state = response.raw["address"].get("state", None)

        super().save(*args, *kwargs)


    class Meta:
        ordering = ["date"]

    def __str__(self) -> str:
        return self.name
    
    @property
    def first_media(self):
        return self.medias.first()
    

class Media(models.Model):
    legend = models.CharField(blank=True, null=True)
    media_file = ResizedImageField(
        # upload_to="static",
        verbose_name=_("File"),
        size=[1500, 1200],
        quality=85,
        force_format="JPEG"
    )

    step = models.ForeignKey(
        Step, 
        on_delete=models.CASCADE, 
        related_name="medias",
    )


class Comments(models.Model):
    message = models.TextField()
    date = models.DateTimeField(auto_now=True, blank=True)
    step = models.ForeignKey(
        Step, 
        on_delete=models.CASCADE, 
        related_name="comments",
    )