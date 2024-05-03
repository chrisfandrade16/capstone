import json
from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase
from shop.models import Service, ShopService, Vehicle, Shop, QuoteRequest, Quote
from shop.serializers import ServiceSerializer, ShopSerializer, ShopServiceSerializer, QuoteSerializer, QuoteRequestSerializer
from django.contrib.auth.models import User
from datetime import datetime, timedelta


class ServiceTestCase(APITestCase):
    url = '/api/service'

    def setUp(self):
        self.s1 = Service.objects.create(name='engine inspection', description='Some random inspection')
        self.s2 = Service.objects.create(name='wiper wash', description='A nice wash')

    def test_get_all_services(self):
        url = reverse('service-list')
        response = self.client.get(url, format='json')
        service_count = Service.objects.count()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), service_count)
    
    def test_create_service(self):
        url = reverse('service-list')
        response = self.client.post(url, format='json', data={
            'name': 'a better engine inspection',
            'description': 'just better'
        })
        service_count = Service.objects.count()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), service_count)

    def test_update_service(self):
        new_service = Service.objects.create(name='inspection', description='A random inspection')
        url = reverse('service-list')
        url = url + f'{new_service.id}'
        data = {
            'name': 'best engine inspection',
            'description': 'best description ever'
        }
        response = self.client.patch(url, data=data, content_type='application/json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_service(self):
        url = reverse('service-list')
        url = url + f'{self.s2.id}'
        response = self.client.delete(url, content_type='application/json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class ShopServiceTestCase(APITestCase):
    url = '/api/shop_service'

    def setUp(self):
        self.user = User.objects.create(username='testuser', password='testpassword')
        self.service = Service.objects.create(name='fuel refill', description='A random service')
        self.s1 = ShopService.objects.create(
            service=self.service, price=20.00, est_time=timedelta(minutes=10))
        self.shop = Shop.objects.create(
            name='new shop', address='Some address', email='shop@shop.com', phone='123-456-7890', description='Some description', owner=self.user, hours='Open')

    def test_get_all_shop_services(self):
        url = reverse('shop_services', kwargs={'shop': self.shop.id})
        response = self.client.get(url, format='json')
        shopservice_count = ShopService.objects.count()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), shopservice_count)

    def test_create_shop_service(self):
        url = reverse('shop_services', kwargs={'shop': self.shop.id})
        data = {

            'service': str(self.service.id),
            'price': 10.00,
            'est_time': 30,
        }
        response = self.client.post(url, format='json', data=data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_shop_service(self):
        url = reverse('shop_services', kwargs={'shop': self.shop.id})
        data = {
            'service': str(self.service.id),
            'price': 15.00,
            'est_time': 20
        }
        data = json.dumps(data)
        response = self.client.put(url, data=data, content_type='application/json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_shop_service(self):
        url = reverse('shop_services', kwargs={'shop':self.shop.id})
        response = self.client.delete(url, data=json.dumps({'service':str(self.s1.id)}), content_type='application/json', follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ShopTestCase(APITestCase):
    def setUp(self):
        user_data = {
            'username': 'Kat',
            'email': 'kathryn@example.com',
            'password': 'pass4kat',
            'first_name': 'Kathryn',
            'last_name': 'Callahan',
        }
        self.user = User.objects.create(**user_data)
        self.user.set_password(user_data['password'])

        self.shop = Shop.objects.create(
            name='RISD Fab Lab',
            email='fablab@example.com',
            phone='345-677-2345',
            address='15 west street',
            description='Shop description.',
            hours='Mon-Fri: 9AM - 10AM',
            owner = self.user
        )
        self.shop.employees.add(self.user)
        self.service1 = Service.objects.create(
            name='Basic Service',
            description='Desc',
        )
        self.service2 = Service.objects.create(
            name='Basic Service2',
            description='Desc',
        )

        self.shopservice1 = ShopService.objects.create(
            service=self.service1,
            price=75.00,
            est_time=timedelta(minutes=10),
        )
        self.shopservice2 = ShopService.objects.create(
            service=self.service2,
            price=75.00,
            est_time=timedelta(minutes=10),
        )

        self.shop.services.add(self.shopservice1)
        self.shop.services.add(self.shopservice2)
        self.shop.save()

        self.vehicle = Vehicle.objects.create(
            make='Honda',
            model='Accord',
            year=2005,
            owner=self.user
        )
        self.data =  {
            'name': 'Test Shop Name',
            'email': 'testshop@example.com',
            'phone': '456-789-0123',
            'address': '2 elm street',
            'description': 'Shop description 2.',
            'owner': self.user.id,
            'services': [self.shopservice1.id, self.shopservice2.id],
            'hours': 'Mon-Fri: 10AM - 11AM'
        }
        self.qr = QuoteRequest.objects.create(
            vehicle=self.vehicle,
            description='Dreary description of service needed.',
            customer=self.user
        )
        self.quote = Quote.objects.create(
            quote_request=self.qr,
            shop=self.shop,
            book_time=timezone.now(),
        )
        self.quote.services.add(self.shopservice1, self.shopservice2)

    def test_create_shop_unsuccessful(self):
        url = reverse('shops')
        response = self.client.post(url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert 'failure' in response.json()

    def test_create_shop_successful(self):
        url = reverse('shops')
        new_owner = User.objects.create(username='Random', password='guido4tw')
        data = self.data.copy()
        data['owner'] = new_owner.id
        response = self.client.post(url,data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Shop.objects.count(), 2)
    
    def test_get_shops(self):
        url = reverse('shops')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()['shops']), Shop.objects.count())


    def test_update_shop(self):
        new_owner = User.objects.create(username='Random2', password='guido4tw')
        data = {'owner': new_owner.id}
        url = reverse('shop', kwargs={'pk':self.shop.id})
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Shop.objects.count(), 1)
        self.assertEqual(Shop.objects.first().owner, new_owner)
    

    def test_delete_shop(self):
        url = reverse('shop', kwargs={'pk':self.shop.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Shop.objects.count(), 0)