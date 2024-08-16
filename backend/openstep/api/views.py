from django.http import HttpResponse

from rest_framework import routers, serializers, viewsets
from rest_framework_gis import serializers as gis_serializers


from step.models import Step, Travel, Media

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ('id', 'legend','media_file',)

class StepSerializerMixin(gis_serializers.GeoFeatureModelSerializer):
    class Meta:
        model = Step
        fields = ('id', 'name', 'location', 'description', 'date')
        geo_field = "location"


class StepDetailSerializer(StepSerializerMixin):
    first_media = MediaSerializer()
    class Meta(StepSerializerMixin.Meta):
        fields = StepSerializerMixin.Meta.fields + ("first_media",)

class StepListSerializer(StepSerializerMixin):
    medias = MediaSerializer(many=True)
    class Meta(StepSerializerMixin.Meta):
        fields = StepSerializerMixin.Meta.fields + ("medias",)

class TravelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Travel
        fields = "__all__"

class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects.all().prefetch_related("medias").order_by('date')
    filterset_fields = ['name', 'travel']


    def get_serializer_class(self):
        if self.action == "list":
            return StepListSerializer
        return StepDetailSerializer
    
class TravelViewSet(viewsets.ModelViewSet):
    queryset = Travel.objects.all()
    serializer_class = TravelSerializer