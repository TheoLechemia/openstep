import json
import os
import shutil
import tempfile
from datetime import date, datetime

from django.test import TestCase, override_settings
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile

from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from django.contrib.auth.models import User

from step.models import Travel, Step
from django.contrib.gis.geos import Point


TEST_MEDIA_ROOT = tempfile.mkdtemp(prefix="test_media_")

# Minimal 1x1 GIF image bytes for upload tests
GIF_BYTES = (
    b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff\x21'
    b'\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00'
    b'\x00\x02\x02D\x01\x00;'
)


@override_settings(MEDIA_ROOT=TEST_MEDIA_ROOT)
class TravelStepAPITest(TestCase):
    """Integration tests for travel and step creation endpoints.

    - Verifies authentication is required for POST operations.
    - Verifies a created travel is owned by the creator.
    - Verifies an owner can create a step linked to their travel.
    """

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='tests-user', password='pass1234')
        self.user_without_travel = User.objects.create_user(
            username='user-without-travel', password='pass1234'
        )
        self.img = SimpleUploadedFile('cover.gif', GIF_BYTES, content_type='image/gif')

        self.travel = Travel.objects.create(
            name='T', description='d', start_date=date(2024, 1, 1), main_photo=self.img
        )
        self.token = Token.objects.create(user=self.user)
        self.auth_header = {'HTTP_AUTHORIZATION': f'Token {self.token.key}'}

    def tearDown(self):
        # cleanup temporary media files
        media_root = getattr(settings, 'MEDIA_ROOT', None)
        if media_root and os.path.exists(media_root):
            shutil.rmtree(media_root)

    def test_create_travel_requires_auth(self):
        img = SimpleUploadedFile('cover.gif', GIF_BYTES, content_type='image/gif')
        data = {
            'name': 'Test Trip',
            'description': 'A test trip',
            'start_date': '2024-01-01',
            'is_public': 'true',
            'main_photo': img,
        }
        # without credentials should be unauthorized
        resp = self.client.post('/api/travels/', data)
        self.assertIn(resp.status_code, (401, 403))

    def test_create_travel_and_owner_assigned(self):
        img = SimpleUploadedFile('cover.gif', GIF_BYTES, content_type='image/gif')
        data = {
            'name': 'My Trip',
            'description': 'Owned trip',
            'start_date': '2024-02-01',
            'is_public': 'true',
            'main_photo': img,
        }
        # authenticate
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        resp = self.client.post('/api/travels/', data, format='multipart')
        self.assertEqual(resp.status_code, 201, msg=resp.data)
        # response should contain uuid or id to fetch record
        uuid = resp.data.get('uuid') or resp.data.get('id')
        self.assertIsNotNone(uuid)
        # fetch travel from DB and assert owner
        if 'uuid' in resp.data:
            travel = Travel.objects.get(uuid=resp.data['uuid'])
        else:
            travel = Travel.objects.get(id=resp.data['id'])
        self.assertTrue(travel.owners.filter(id=self.user.id).exists())

    def test_create_step_requires_auth(self):
        # create travel owned by user

        self.travel.owners.add(self.user)

        feature = {
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [2.0, 48.0]},
            'properties': {
                'name': 'Step 1',
                'date': '2024-01-02T12:00:00',
                'description': 'desc',
                'travel': self.travel.id,
                'positional_step': False,
            },
        }
        resp = self.client.post('/api/steps/', json.dumps(feature), content_type='application/json')
        self.assertIn(resp.status_code, (401, 403))

    def test_owner_can_create_step(self):
        self.travel.owners.add(self.user)
        feature = {
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [2.0, 48.0]},
            'properties': {
                'name': 'Step Owner',
                'date': '2024-01-03T12:00:00',
                'description': 'desc',
                'travel': self.travel.id,
                'positional_step': False,
            },
        }
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        resp = self.client.post('/api/steps/', json.dumps(feature), content_type='application/json')
        self.assertEqual(resp.status_code, 201, msg=resp.data)
        # step exists and attached to travel
        self.assertTrue(Step.objects.filter(travel=self.travel).exists())

    def test_cannot_create_step_on_unowned_travel(self):
        # use travel from setUp and ensure it's owned by self.user
        self.travel.owners.add(self.user)

        # another user tries to create a step on that travel
        other_token = Token.objects.create(user=self.user_without_travel)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {other_token.key}')

        feature = {
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [2.0, 48.0]},
            'properties': {
                'name': 'Intruder Step',
                'date': '2024-01-04T12:00:00',
                'description': 'desc',
                'travel': self.travel.id,
                'positional_step': False,
            },
        }
        resp = self.client.post('/api/steps/', json.dumps(feature), content_type='application/json')
        self.assertIn(resp.status_code, (401, 403))

    def test_cannot_modify_unowned_travel(self):
        # use travel from setUp and ensure it's owned by self.user
        self.travel.owners.add(self.user)

        # another user attempts to patch the travel
        other_token = Token.objects.create(user=self.user_without_travel)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {other_token.key}')
        patch_data = {'name': 'Hacked name'}
        url = f'/api/travels/{self.travel.uuid}/'
        resp = self.client.patch(url, patch_data, format='json')
        # We expect permission denied (403). Previously a filtered queryset
        # returned 404; we now prefer 403.
        self.assertIn(resp.status_code, (401, 403))

    def test_cannot_add_media_on_unowned_step(self):
        # ensure travel and its step are owned by self.user
        self.travel.owners.add(self.user)
        step = Step.objects.create(
            name='StepMedia', date=datetime(2024, 1, 1, 12, 0), location=Point(2.0, 48.0), travel=self.travel
        )

        other_token = Token.objects.create(user=self.user_without_travel)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {other_token.key}')

        img = SimpleUploadedFile('media.gif', GIF_BYTES, content_type='image/gif')
        resp = self.client.post(f'/api/steps/{step.id}/medias/', {'image_file': img}, format='multipart')
        self.assertEqual(resp.status_code, 403)

    def test_anonymous_can_retrieve_public_travel(self):
        # ensure travel is public
        self.travel.is_public = True
        self.travel.save()

        # clear credentials to simulate anonymous request
        self.client.credentials()  # remove any auth header
        url = f'/api/travels/{self.travel.uuid}/'
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200, msg=resp.data)
