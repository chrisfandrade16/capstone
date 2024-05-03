from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt import authentication
from . import models as m
from django.contrib.auth import get_user_model
from . import serializers as s
from drf_yasg.utils import swagger_auto_schema
from rest_framework import mixins, generics, filters
from rest_framework import viewsets
from drf_yasg import openapi
from django.utils.decorators import method_decorator
from accounts.serializers import EmployeeSerializer
import requests
import math

User = get_user_model()


@method_decorator(name="list", decorator=swagger_auto_schema(tags=['Makes']))
@method_decorator(name="retrieve", decorator=swagger_auto_schema(tags=['Makes']))
class MakesView(
        mixins.ListModelMixin,
        mixins.RetrieveModelMixin,
        viewsets.GenericViewSet):
    queryset = m.Make.objects.all()
    serializer_class = s.MakeSerializer


@method_decorator(name="list", decorator=swagger_auto_schema(tags=['Services']))
@method_decorator(name="create", decorator=swagger_auto_schema(tags=['Services']))
@method_decorator(name="retrieve", decorator=swagger_auto_schema(tags=['Services']))
@method_decorator(name="update", decorator=swagger_auto_schema(tags=['Services']))
@method_decorator(name="partial_update", decorator=swagger_auto_schema(tags=['Services']))
@method_decorator(name="destroy", decorator=swagger_auto_schema(tags=['Services']))
class ServiceView(mixins.CreateModelMixin,
                  mixins.ListModelMixin,
                  mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.DestroyModelMixin,
                  viewsets.GenericViewSet):

    queryset = m.Service.objects.all()
    serializer_class = s.ServiceSerializer


class ShopServiceView(APIView):
    """
    Returns a list of all services provided by a shop
    """
    @swagger_auto_schema(tags=['Shop'])
    def get(self, request, shop):
        services = m.Shop.objects.get(id=shop).services.all()
        data = s.ShopServiceDetailSerializer(services, many=True).data
        return Response({'services': data})

    @swagger_auto_schema(
        operation_description="Create a new service for a given shop",
        request_body=s.ShopServiceSerializer,
        tags=['Shop'],
    )
    def post(self, request, shop):
        shop = m.Shop.objects.get(id=shop)
        service_serializer = s.ShopServiceSerializer(data=request.data)
        if service_serializer.is_valid():
            serv = service_serializer.save()
            shop.services.add(serv)
            return Response({"success": service_serializer.data})
        else:
            return Response({"failure": service_serializer.errors})

    @swagger_auto_schema(operation_description="Update a given shop service", request_body=s.ShopServiceSerializer, tags=['Shop'])
    def put(self, request, shop):
        try:
            pk = request.data.get('id')
            service = m.ShopService.objects.get(pk=pk)
        except m.ShopService.DoesNotExist:
            return Response({"failure": "The shop service does not exist"})

        service_serializer = s.ShopServiceSerializer(
            instance=service, data=request.data, partial=True)
        if service_serializer.is_valid():
            service_serializer.save()
            return Response({"success": service_serializer.data})
        return Response({"failure": service_serializer.errors})

    @swagger_auto_schema(tags=['Shop'], request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={'service_id': openapi.Schema(type=openapi.TYPE_STRING, description='int')}))
    def delete(self, request, shop):
        try:
            pk = request.data.get('id')
            service = m.ShopService.objects.get(id=pk)
            service.delete()
            return Response({"success": "Service'{}' deleted successfully".format(pk)})
        except m.ShopService.DoesNotExist:
            return Response({"failure": "The service does not exist"})


class AffiliatedShopView(APIView):
    """
    Returns the first (should be the only) shop affiliated with a user (owner/employee)
    """
    @swagger_auto_schema(tags=['Quote'])
    def get(self, request, pk):
        try:
            user = User.objects.get(id=pk)
            if user.role == "shopowner":
                return Response({"shop": s.ShopSerializer(m.Shop.objects.get(owner=user.profile)).data})
            elif user.role == "employee":
                return Response({"shop": s.ShopSerializer(m.Shop.objects.filter(employees=user.profile)[0]).data})
        except m.Shop.DoesNotExist:
            return Response({"failure": "No affiliated shop found"})
        return Response({"failure": "No affiliated shop found"})


class QuoteServiceView(APIView):
    """
    Returns a list of all modifiable services in a quote
    """
    @swagger_auto_schema(tags=['Quote'])
    def get(self, request, pk):
        services = m.Quote.objects.get(id=pk).services.all()
        data = s.QuoteServiceSerializer(services, many=True).data
        return Response({'services': data})

    @swagger_auto_schema(
        operation_description="Create a new service for a quote",
        request_body=s.QuoteServiceSerializer,
        tags=['Quote'],
    )
    def post(self, request, pk):
        quote = m.Quote.objects.get(id=pk)
        service_serializer = s.QuoteServiceSerializer(data=request.data)
        if service_serializer.is_valid():
            serv = service_serializer.save()
            quote.services.add(serv)

            services = m.Quote.objects.get(id=pk).services.all()
            data = s.QuoteServiceSerializer(services, many=True).data
            return Response({"success": f"Quote service {serv.pk} created successfully", "services": data})
        else:
            return Response({"failure": service_serializer.errors})

    @swagger_auto_schema(operation_description="Update a given quote service", request_body=s.ShopServiceSerializer, tags=['Quote'])
    def put(self, request, pk):
        try:
            serviceId = request.query_params.get('id')
            service = m.QuoteService.objects.get(pk=serviceId)
        except m.QuoteService.DoesNotExist:
            return Response({"failure": "The quote service does not exist"})

        service_serializer = s.QuoteServiceSerializer(
            instance=service, data=request.data, partial=True)
        if service_serializer.is_valid():
            service_serializer.save()

            services = m.Quote.objects.get(id=pk).services.all()
            data = s.QuoteServiceSerializer(services, many=True).data
            return Response({"success": f"Service '{service.pk}' updated successfully", "services": data})
        return Response({"failure": service_serializer.errors})

    @swagger_auto_schema(tags=['Quote'], request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={'service_id': openapi.Schema(type=openapi.TYPE_STRING, description='int')}))
    def delete(self, request, pk):
        try:
            # get quoteservice pk instead of quote pk
            serviceId = request.query_params['id']
            service = m.QuoteService.objects.get(id=serviceId)
            service.delete()

            services = m.Quote.objects.get(id=pk).services.all()
            data = s.QuoteServiceSerializer(services, many=True).data
            return Response({"success": f"Service'{serviceId}' deleted successfully", "services": data})
        except m.ShopService.DoesNotExist:
            return Response({"failure": "The service does not exist"})


@method_decorator(name="get", decorator=swagger_auto_schema(tags=['Shop']))
class ShopSearchView(generics.ListAPIView):
    search_fields = ['name', '=email']
    filter_backends = (filters.SearchFilter,)
    queryset = m.Shop.objects.all()
    serializer_class = s.ShopSerializer

    def list(self, request):
        # Note the use of `get_queryset()` instead of `self.queryset`
        queryset = self.get_queryset()
        serializer = s.ShopSerializer(queryset, many=True)
        return Response({"success": {"shops": serializer.data}}, status=status.HTTP_200_OK)
    
class ShopDistSearchView(generics.ListAPIView):
    queryset = m.Shop.objects.all()
    serializer_class = s.ShopSerializer

    def _getDistance(self, latitude1, longitude1, latitude2, longitude2):
        lat1 = latitude1 * math.pi / 180
        lat2 = latitude2 * math.pi / 180
        deltaLat = (latitude2 - latitude1) * math.pi / 180
        deltaLon = (longitude2 - longitude1) * math.pi / 180

        a = math.sin(deltaLat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(deltaLon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(float(1) - a))
        dist = 6371 * c
        return dist

    def get(self, request):
        addr = request.GET.get('addr')
        radius = float(request.GET.get('dist'))
        services = request.GET.get('services')

        if addr:
            if not radius:
                radius = 10
            result = requests.get(f"https://nominatim.openstreetmap.org/search?q={addr}&limit=1&format=jsonv2").json()
            
            if len(result) > 0:
                latitude = float(result[0]['lat'])
                longitude = float(result[0]['lon'])
                print(latitude, longitude)

                shops = m.Shop.objects.all()
                in_distance = []
                distances = []
                for shop in shops:
                    dist = self._getDistance(latitude, longitude, float(shop.latitude), float(shop.longitude))
                    if dist <= radius:
                        in_distance.append(shop)
                        distances.append(dist)
                serializer = s.ShopSerializer(in_distance, many=True)

                return Response({"shops": serializer.data, "distances": distances})
            return Response({'error': 'Invalid address'}, status=status.HTTP_417_EXPECTATION_FAILED)
        return Response({'error': 'missing address'}, status=status.HTTP_406_NOT_ACCEPTABLE)


@method_decorator(name="get", decorator=swagger_auto_schema(tags=['Customer']))
class VehicleSearchView(generics.ListAPIView):
    search_fields = ['vin', 'plate_number',
                     'model__name', 'make__name', 'year']
    filter_backends = (filters.SearchFilter,)
    queryset = m.Vehicle.objects.all()
    serializer_class = s.VehicleDetailSerializer


@method_decorator(name="get", decorator=swagger_auto_schema(tags=['Customer']))
class OwnerVehicleSearchView(generics.ListAPIView):
    search_fields = ['owner__user__first_name',
                     'owner__user__last_name', 'owner__user__email', 'owner__phone']
    filter_backends = (filters.SearchFilter,)
    queryset = m.Vehicle.objects.all()
    serializer_class = s.VehicleDetailSerializer


@method_decorator(
    name="get",
    decorator=swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "shop",
                openapi.IN_QUERY,
                description="Shop name or ID",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                "quote_request",
                openapi.IN_QUERY,
                description="Quote Request ID",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                "services",
                openapi.IN_QUERY,
                description="List of service IDs",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                "status",
                openapi.IN_QUERY,
                description="One of (cancelled, pending, booked)",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                "priority",
                openapi.IN_QUERY,
                description="One of (low, medium, high)",
                type=openapi.TYPE_STRING,
            ),
        ],
        tags=['Quote']
    ),)
class ListQuotesView(generics.ListAPIView):
    authentication_classes = [authentication.JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    search_fields = ['shop', 'quote_request',
                     'services', 'priority', 'status', 'archived']
    serializer_class = s.QuoteDetailSerializer
    def get_queryset(self):
        queryset = m.Quote.objects.all()
        params = {k: self.request.query_params.get(
            k, None) for k in self.search_fields}
        if params['shop'] is not None:
            if params['shop'].isnumeric():
                queryset = queryset.filter(shop=params['shop'])
            else:
                queryset = queryset.filter(
                    shop__name__startswith=params['shop'])
                print(queryset)
        if params['quote_request'] is not None:
            queryset = queryset.filter(quote_request=params['quote_request'])
        if params['services'] is not None:
            queryset = queryset.filter(
                services__in=params['services'].split(','))
        if params['priority'] is not None:
            queryset = queryset.filter(priority=params['priority'])
        if params['status'] is not None:
            queryset = queryset.filter(status=params['status'])
        if params['archived'] is not None:
            queryset = queryset.filter(
                archived=params['archived'].lower() == "true")

        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        context['showQuoteRequest'] = True
        return context


@method_decorator(
    name="get",
    decorator=swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "customer",
                openapi.IN_QUERY,
                description="Customer ID",
                type=openapi.TYPE_STRING,
            ),
        ],
        tags=['Quote']
    ),)
class ListQuoteRequestsView(generics.ListAPIView):
    serializer_class = s.QuoteRequestDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['showQuotes'] = True
        return context

    def get_queryset(self):
        queryset = m.QuoteRequest.objects.all()
        customer = self.request.query_params.get('customer', self.request.user)
        if customer is not None:
            queryset = queryset.filter(customer=customer)
        # if self.request.user is not None:
        #     queryset = queryset.filter(customer=self.request.user)
        return queryset