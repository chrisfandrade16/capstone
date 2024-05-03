from django.test import TestCase
from rest_framework.test import APITestCase, force_authenticate

from django.urls import reverse
from rest_framework import status
from accounts.models import Profile, ShopOwner
from django.contrib.auth import get_user_model

from accounts.serializers import UserSerializer, ProfileDetailSerializer, CustomerSerializer, EmployeeSerializer, ShopOwnerSerializer
from datetime import datetime, timedelta
from djoser.views import UserViewSet

User = get_user_model()


class AccountsTestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='existing_user', first_name='Jane',
                                              last_name='Doe', email='sayyara.development@gmail.com', password="somePassword")
        self.profile1 = Profile.objects.create(
            user=self.user1, phone='111-222-3333')

    # test for new account registration
    def test_account_register(self):
        url = reverse("account-register")
        old_user_count = User.objects.count()
        response = self.client.post(url, format='json', data={
            'username': 'NewTestUser',
            'email': 'sayyara.development@gmail.com',
            'password': "validPassword",
            'first_name': "John",
            'last_name': "Doe",
            'role': 'c',
            'phone': '111-222-5555'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), old_user_count + 1)
        self.assertTrue(User.objects.filter(username='newtestuser').exists())
        self.assertEqual(Profile.objects.get(
            user__username='newtestuser').phone, '111-222-5555')

    # test for duplicate account registration, expect original account unmodified
    def test_account_duplicate_register(self):
        url = reverse("account_register")
        old_user_count = User.objects.count()
        response = self.client.post(url, format='json', data={
            'username': 'existing_user',
            'email': 'sayyara.development@gmail.com',
            'password': "validPassword",
            'first_name': "John",
            'last_name': "Doe",
            'role': 'c',
            'phone': '555-123-4567'
        })
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(User.objects.count(), old_user_count)
        # failed registration should not overwrite original phone number
        self.assertEqual(Profile.objects.get(
            user__username='existing_user').phone, '111-222-3333')

    # test for registration with invalid password format (< 8 chars)
    def test_account_register_password_fail(self):
        url = reverse("account_register")
        old_user_count = User.objects.count()
        response = self.client.post(url, format='json', data={
            'username': 'NewTestUser',
            'email': 'sayyara.development@gmail.com',
            'password': "short",
            'first_name': "John",
            'last_name': "Doe",
            'role': 'c',
            'phone': '111-222-5555'
        })
        self.assertEqual(response.status_code, status.HTTP_406_NOT_ACCEPTABLE)
        self.assertEqual(User.objects.count(), old_user_count)
        self.assertFalse(User.objects.filter(username='newtestuser').exists())

    # test for logging into existing account
    def test_account_login(self):
        url = reverse('jwt-create')
        response = self.client.post(url, format='json', data={
            'username': 'existing_user',
            'password': "somePassword",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        self.assertTrue('refresh' in response.data)

    # test for logging into existing account with wrong password
    def test_account_login_wrong_pass(self):
        url = reverse('jwt-create')
        response = self.client.post(url, format='json', data={
            'username': 'existing_user',
            'password': "wrongPass",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # test for logging into non-existent account
    def test_account_login_bad_user(self):
        url = reverse('jwt-create')
        response = self.client.post(url, format='json', data={
            'username': 'bad_user',
            'password': "somePassword",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # test for unauthorized editting of password without credentials
    def test_account_edit_password_unauthorized(self):
        url = "/api/auth/users/set_password/"
        response = self.client.post(url, format='json', data={
            "new_password": "newPassword",
            "current_password": "somePassword"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileTestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='existing_owner', first_name='Jane',
                                              last_name='Doe', email='sayyara.development@gmail.com', password="somePassword")
        self.profile1 = ShopOwner.objects.create(
            user=self.user1, phone='111-222-3333')

        url = reverse('jwt-create')
        response = self.client.post(url, format='json', data={
            'username': 'existing_owner',
            'password': "somePassword",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        self.accessToken = response.data['access']

    # test for editting authenticated account
    def test_profile_update(self):
        url = f"/api/account/{self.user1.pk}"
        response = self.client.put(url, format='json', data={
            "last_name": "Dow",
            "phone": "123-456-7890",
        },  **{'HTTP_AUTHORIZATION': f'Token {self.accessToken}'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.get(pk=self.user1.pk).last_name, 'Dow')
        self.assertEqual(Profile.objects.get(
            user=self.user1).phone, '123-456-7890')

    # test for editting account without authentication
    def test_profile_update_unauthorized(self):
        url = f"/api/account/{self.user1.pk}"
        response = self.client.put(url, format='json', data={
            "last_name": "Failure",
            "phone": "555-555-5555",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotEqual(User.objects.get(
            pk=self.user1.pk).last_name, 'Failure')
        self.assertNotEqual(Profile.objects.get(
            user=self.user1).phone, '555-555-5555')
