from django.contrib.auth import authenticate
from rest_framework import serializers, viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_gis import serializers as gis_serializers
from django.db.models import Prefetch, Q

from step.models import Step, Travel, Media, Comments
from api.permissions import TravelStepOwner, TravelOwner

# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comments
        fields = "__all__"


class MediaSerializer(serializers.ModelSerializer):
    caption = serializers.CharField(source="legend", allow_null=True, required=False)
    src = serializers.SerializerMethodField()
    thumb = serializers.SerializerMethodField()
    media_type = serializers.ReadOnlyField()

    class Meta:
        model = Media
        fields = ('id', 'src', "thumb", "caption", "media_type")

    def _absolute_url(self, url):
        if not url:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def get_src(self, obj):
        return self._absolute_url(obj.file_url)

    def get_thumb(self, obj):
        return self._absolute_url(obj.file_url)


class MediaUploadSerializer(serializers.ModelSerializer):
    """Used to create a new Media record (file upload)."""
    class Meta:
        model = Media
        fields = ('id', 'legend', 'image_file', 'video_file', 'step')


class TravelSerializerNoStep(serializers.ModelSerializer):
    class Meta:
        model = Travel
        fields = ["name", "id", "uuid", "description"]


class StepSerializer(gis_serializers.GeoFeatureModelSerializer):
    medias = MediaSerializer(many=True)
    first_image = MediaSerializer()
    travel = TravelSerializerNoStep()
    comments = CommentSerializer(many=True)

    class Meta:
        model = Step
        fields = (
            'travel', 'positional_step', 'comments', 'id', 'name', 'location',
            'description', 'date', 'medias', 'first_image', 'day_of_travel',
            'country', 'state', 'published'
        )
        geo_field = "location"


class StepWriteSerializer(gis_serializers.GeoFeatureModelSerializer):
    """Minimal serializer used for step creation / update."""
    class Meta:
        model = Step
        fields = ('id', 'name', 'location', 'description', 'date', 'travel', 'positional_step', 'published')
        geo_field = "location"


class TravelSerializer(serializers.ModelSerializer):
    steps = StepSerializer(many=True)
    main_photo = serializers.SerializerMethodField()
    owners = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Travel
        fields = "__all__"

    def get_main_photo(self, obj):
        request = self.context.get("request")
        if obj.main_photo and hasattr(obj.main_photo, 'url'):
            return request.build_absolute_uri(obj.main_photo.url) if request else obj.main_photo.url
        return None


class TravelWriteSerializer(serializers.ModelSerializer):
    """Used for creating / updating a travel (multipart form)."""
    class Meta:
        model = Travel
        fields = ('id', 'uuid', 'name', 'description', 'start_date', 'end_date', 'main_photo', 'is_public')


# ---------------------------------------------------------------------------
# Auth views
# ---------------------------------------------------------------------------

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        if not username or not password:
            return Response({'error': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {'id': user.id, 'username': user.username, 'email': user.email},
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'id': request.user.id, 'username': request.user.username, 'email': request.user.email})


# ---------------------------------------------------------------------------
# ViewSets
# ---------------------------------------------------------------------------

class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects.all().prefetch_related("medias").order_by('date')
    filterset_fields = ['name', 'travel']
    page_size = 300
    max_page_size = 500

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return StepWriteSerializer
        return StepSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        # The add_media action is a multipart upload against an existing Step
        # and does not include a travel id in the request body. We rely on
        # the explicit ownership check inside `add_media` (below), so only
        # require authentication here and skip the view-level TravelStepOwner
        # has_permission check which expects a travel id in the payload.
        if self.action == 'add_media':
            return [IsAuthenticated()]
        return [IsAuthenticated(), TravelStepOwner()]


    @action(detail=True, methods=['post'], url_path='medias', url_name='medias')
    def add_media(self, request, pk=None):
        step = self.get_object()
        if not step.travel.owners.filter(id=request.user.id).exists():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        data = {'legend': request.data.get('legend', '') or '', 'step': step.id}
        if 'image_file' in request.FILES:
            data['image_file'] = request.FILES['image_file']
        if 'video_file' in request.FILES:
            data['video_file'] = request.FILES['video_file']
        serializer = MediaUploadSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "list":
            if self.request.user and self.request.user.is_authenticated:
                return qs
            return qs.filter(published=True)
        return qs

class TravelViewSet(viewsets.ModelViewSet):
    # Do not prefetch steps at class level; get_queryset will decide when
    # and how to prefetch (published-only for anonymous users).
    queryset = Travel.objects.all()
    lookup_field = "uuid"

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return TravelWriteSerializer
        return TravelSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        else :
            return [IsAuthenticated(), TravelOwner()]

    def get_queryset(self):
        queryset = super().get_queryset()

        # For list view: only show public travels. Also prefetch steps
        # according to authentication (anonymous -> only published steps).
        if self.action == 'list':
            return queryset.filter(is_public=True)


        # For retrieve view: prefetch steps, but for anonymous users only
        # include published steps.
        if self.action == 'retrieve':
            # Anonymous users: only published steps.
            if not (self.request.user and self.request.user.is_authenticated):
                return queryset.prefetch_related(Prefetch('steps', queryset=Step.objects.filter(published=True)))

            # Authenticated users: include unpublished steps only for travels
            # they own (otherwise only published steps).
            steps_qs = Step.objects.filter(Q(published=True) | Q(travel__owners__id=self.request.user.id))
            return queryset.prefetch_related(Prefetch('steps', queryset=steps_qs))

        return queryset

    def perform_create(self, serializer):
        travel = serializer.save()
        travel.owners.add(self.request.user)

    @action(detail=False, methods=['get'], url_path='mine')
    def mine(self, request):
        queryset = Travel.objects.filter(owners__id=request.user.id).prefetch_related("steps")
        serializer = TravelSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class CommentiewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Comments.objects.all()
    serializer_class = CommentSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            return Response(serializer(request.data).data, status=status.HTTP_201_CREATED)
        return Response({'Bad Request': "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST)
