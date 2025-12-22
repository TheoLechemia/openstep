from datetime import datetime, time
from typing import Any, Iterable
from django.contrib.gis.db import models
from django.contrib.auth.models import User
from django.db.models import DateTimeField
from django.utils.translation import gettext_lazy as _
from django.utils.timezone import now
from PIL import Image


from django_resized import ResizedImageField

from geopy.geocoders import Nominatim

# Create your models here.


class TravelManager(models.Manager):
    def get_authorized(self, request):
        if request.user.is_superuser:
            return super().get_queryset()
        return self.all().prefetch_related("owners").filter(owners__id=request.user.id)


class Travel(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField()
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    main_photo = ResizedImageField(
        verbose_name=_("File"), size=[1500, 1200], quality=85, force_format="JPEG"
    )
    owners = models.ManyToManyField(User)

    objects = TravelManager()

    # def filter_query_
    def __str__(self) -> str:
        return self.name


# HACK to have
class DateTimeWithoutTZField(DateTimeField):
    def db_type(self, connection):
        return "timestamp"


class Step(models.Model):
    name = models.CharField(null=True)
    date = DateTimeWithoutTZField()
    positional_step = models.BooleanField(
        null=False, default=False, verbose_name=_("Positional step")
    )
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
    def day_of_travel(self) -> int:
        """Return the day nunmber of travel of this step"""
        delta = self.date - datetime.combine(self.travel.start_date, time())
        return delta.days

    @property
    def previous_id_step(self):
        previous_step = (
            Step.objects.filter(travel=self.travel, date__lt=self.date)
            .order_by("-date")
            .only("id")
            .first()
        )
        return previous_step.id if previous_step else None

    @property
    def next_id_step(self):
        next_step = (
            Step.objects.filter(travel=self.travel, date__gt=self.date)
            .order_by("date")
            .only("id")
            .first()
        )
        return next_step.id if next_step else None

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
        return self.name or ""

    @property
    def first_media(self):
        return self.medias.first()


class BookLayout(models.Model):
    html = models.TextField(blank=True)
    step = models.OneToOneField(
        Step,
        on_delete=models.CASCADE,
        related_name="book_layout",
    )


class Media(models.Model):
    legend = models.CharField(blank=True, null=True)
    media_file = ResizedImageField(
        # upload_to="static",
        verbose_name=_("File"),
        size=[1500, 1200],
        quality=85,
        force_format="JPEG",
    )

    @property
    def orientation(self):
        if self.media_file:
            with Image.open(self.media_file.path) as img:
                width, height = img.size
                if height > width:
                    return "portrait"
                else:
                    return "landscape"

    step = models.ForeignKey(
        Step,
        on_delete=models.CASCADE,
        related_name="medias",
    )

    class Meta:
        ordering = ["id"]


class Comments(models.Model):
    message = models.TextField()
    date = models.DateTimeField(auto_now=True, blank=True)
    step = models.ForeignKey(
        Step,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    def __str__(self) -> str:
        return self.message
