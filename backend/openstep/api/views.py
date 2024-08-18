from django.http import HttpResponse

from rest_framework import routers, serializers, viewsets
from rest_framework_gis import serializers as gis_serializers


from step.models import Step, Travel, Media

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ('id', 'legend','media_file',)

class StepSerializer(gis_serializers.GeoFeatureModelSerializer):
    medias = MediaSerializer(many=True)
    first_media = MediaSerializer()
    class Meta:
        model = Step
        fields = ('id', 'name', 'location', 'description', 'date', 'medias', 'first_media')
        geo_field = "location"

class TravelSerializer(serializers.ModelSerializer):
    steps = StepSerializer(many=True)
    class Meta:
        model = Travel
        fields = "__all__"

class StepViewSet(viewsets.ModelViewSet):
    serializer_class = StepSerializer
    queryset = Step.objects.all().prefetch_related("medias").order_by('date')
    filterset_fields = ['name', 'travel']

    
class TravelViewSet(viewsets.ModelViewSet):
    queryset = Travel.objects.all().prefetch_related("steps")
    serializer_class = TravelSerializer