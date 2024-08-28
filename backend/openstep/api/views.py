from django.http import HttpResponse

from rest_framework import routers, serializers, viewsets
from rest_framework_gis import serializers as gis_serializers


from step.models import Step, Travel, Media, Comments

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comments
        fields = "__all__"

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ('id', 'legend','media_file',)

class TravelSerializerNoStep(serializers.ModelSerializer):
    class Meta:
        model = Travel
        fields = ["name", "id", "description"]

class StepSerializer(gis_serializers.GeoFeatureModelSerializer):
    medias = MediaSerializer(many=True)
    first_media = MediaSerializer()
    travel = TravelSerializerNoStep()
    comments = CommentSerializer(many=True)

    class Meta:
        model = Step
        fields = (
            'travel', 'comments', 'id', 'name', 'location', 'description', 'date', 'medias', 'first_media', 'day_of_travel', "country", "state")
        geo_field = "location"



class TravelSerializer(serializers.ModelSerializer):
    steps = StepSerializer(many=True)
    class Meta:
        model = Travel
        fields = "__all__"

# StepSerializer._declared_fields["travel"] = TravelSerializer(context={"exclude_fields": ["steps"]})

class StepViewSet(viewsets.ModelViewSet):
    serializer_class = StepSerializer
    queryset = Step.objects.all().prefetch_related("medias").order_by('date')
    filterset_fields = ['name', 'travel']
    page_size = 300
    max_page_size = 500



    
class TravelViewSet(viewsets.ModelViewSet):
    queryset = Travel.objects.all().prefetch_related("steps")
    serializer_class = TravelSerializer

from rest_framework.response import Response
from rest_framework import status

class CommentiewSet(viewsets.ModelViewSet):
    permission_classes = []
    queryset = Comments.objects.all()
    serializer_class = CommentSerializer



    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)

        serializer.error_messages

        if serializer.is_valid():
            return Response(serializer(request.data).data, status=status.HTTP_201_CREATED)
        
        return Response({'Bad Request': "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST)
