import uuid
from datetime import datetime, time
from typing import Any, Iterable
from django.contrib.gis.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.conf import settings
from django.db.models import DateTimeField, Q
from django.utils.translation import gettext_lazy as _
from django.utils.timezone import now

from django_resized import ResizedImageField




def validate_video_size(value):
    if value.size > settings.MAX_VIDEO_SIZE:
        raise ValidationError(
            _("Fichier vidéo trop volumineux ( > %(limit)d Mo ).")
            % {"limit": settings.MAX_VIDEO_SIZE // (1024 * 1024)}
        )

from geopy.geocoders import Nominatim

# Create your models here.

class TravelManager(models.Manager):
    def get_authorized(self, request):
        if request.user.is_superuser:
            return super().get_queryset()
        return self.all().prefetch_related("owners").filter(owners__id=request.user.id)



class Travel(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    is_public = models.BooleanField(default=True, verbose_name=_("Public"))
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
    owners = models.ManyToManyField(User)

    objects = TravelManager()

    # def filter_query_
    def __str__(self) -> str:
        return self.name


#HACK to have
class DateTimeWithoutTZField(DateTimeField):
    def db_type(self, connection):
        return 'timestamp'

class Step(models.Model):
    name = models.CharField(null=True)
    date = DateTimeWithoutTZField()
    positional_step = models.BooleanField(null=False, default=False, verbose_name=_("Positional step"))
    published = models.BooleanField(null=False, default=True, verbose_name=_("Publier ?"))
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
        delta = self.date - datetime.combine(self.travel.start_date, time())
        return delta.days

    def save(self, *args, **kwargs):
        nominatim = Nominatim(user_agent="openstep")
        response = nominatim.reverse((self.location.y, self.location.x))
        if response:
            if "address" in response.raw:
                self.country = response.raw["address"].get("country", None)
                self.state = response.raw["address"].get("state", None)

        super().save(*args, **kwargs)


    class Meta:
        ordering = ["date"]

    def __str__(self) -> str:
        return self.name or ''

    @property
    def first_image(self):
        # On privilégie une image comme vignette ; un step composé uniquement de vidéos n'a pas de vignette.
        return self.medias.exclude(image_file="").first()


class Media(models.Model):
    legend = models.CharField(blank=True, null=True)
    image_file = ResizedImageField(
        # upload_to="static",
        verbose_name=_("Image"),
        size=[1500, 1200],
        quality=85,
        force_format="JPEG",
        blank=True,
        null=True,
    )
    video_file = models.FileField(
        verbose_name=_("Video"),
        upload_to="videos",
        blank=True,
        null=True,
        validators=[
            FileExtensionValidator(allowed_extensions=["mp4"]),
            validate_video_size,
        ],
    )

    step = models.ForeignKey(
        Step,
        on_delete=models.CASCADE,
        related_name="medias",
    )

    @property
    def media_type(self):
        return "video" if self.video_file else "image"

    @property
    def file_url(self):
        """URL du fichier renseigné (image ou vidéo)."""
        file = self.video_file if self.video_file else self.image_file
        return file.url if file else None

    def clean(self):
        # Un seul des deux fichiers doit être renseigné.
        has_image = bool(self.image_file)
        has_video = bool(self.video_file)
        if has_image == has_video:
            raise ValidationError(
                _("Un média doit représenter soit une image soit une vidéo, pas les deux ni aucun.")
            )

    class Meta:
        ordering = ["id"]
        constraints = [
            models.CheckConstraint(
                check=(
                    (Q(image_file="") | Q(image_file__isnull=True))
                    ^ (Q(video_file="") | Q(video_file__isnull=True))
                ),
                name="media_exactly_one_file",
            )
        ]


class Comments(models.Model):
    message = models.TextField()
    date = models.DateTimeField(auto_now=True, blank=True)
    _from = models.CharField(null=True)
    step = models.ForeignKey(
        Step,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    def __str__(self) -> str:
        return self.message