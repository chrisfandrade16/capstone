from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views as v
from . import viewsets as vs

router = DefaultRouter()
router.register(r'service',  v.ServiceView, basename="service")
router.register(r'makes', v.MakesView, basename="makes")
# router.register(r'availability  ', vs.AvailabilityViewSet, basename="availability")
# router.register(r'users', views.UserViewSet,basename="user")

shop_generic =  vs.ShopViewSet.as_view({'post':'create'})
shop_specific = vs.ShopViewSet.as_view({'get':'retrieve', 'put':'update', 'delete':'destroy'})

vehicle_generic = vs.VehicleViewSet.as_view({'post':'create'})
vehicle_specific = vs.VehicleViewSet.as_view({'get':'retrieve', 'put':'update', 'delete':'destroy'})

quote_generic = vs.QuoteViewSet.as_view({'post':'create'})
quote_specific = vs.QuoteViewSet.as_view({'get':'retrieve', 'put':'update', 'delete':'destroy', 'post': 'respond'})

quote_request_generic = vs.QuoteRequestViewSet.as_view({'post':'create'})
quote_request_specific = vs.QuoteRequestViewSet.as_view({'get':'retrieve', 'put':'update', 'delete':'destroy'})

appointment_generic = vs.AppointmentViewSet.as_view({'post':'create', 'get':'list'})
appointment_specific = vs.AppointmentViewSet.as_view({'get':'retrieve', 'put':'update', 'delete':'destroy'})

quote_request_image = vs.quoteRequestImageViewSet.as_view(
    {'post': 'create', 'delete': 'destroy'})

workorder_generic = vs.WorkOrderViewSet.as_view({'post':'create', 'get':'list'})
workorder_specific = vs.WorkOrderViewSet.as_view({'get':'retrieve', 'put':'update', 'delete':'destroy'})

messages = vs.MessageViewSet.as_view(
    {'put': 'update', 'delete': 'destroy', 'get': 'get_conversation', 'post': 'create'})

notifications = vs.NotificationViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'})

employee_availability_specific = vs.EmployeeAvailabilityViewSet.as_view(
    {'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})
employee_availability = vs.EmployeeAvailabilityViewSet.as_view(
    {'post': 'create', 'get': 'list'})

employee_reservation_specific = vs.EmployeeReservationViewSet.as_view(
    {'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})

employee_reservation = vs.EmployeeReservationViewSet.as_view(
    {'post': 'create'})

urlpatterns = [
    path('', include(router.urls)),
    path('shop', shop_generic, name='create_shop'),
    path('affiliated/<int:pk>', v.AffiliatedShopView.as_view(),
         name='affiliated_shop'),
    path('shop/<int:pk>', shop_specific, name='shop'),
    path('shops/search', v.ShopDistSearchView.as_view(), name='shop_dist_search'),
    path('shops', v.ShopSearchView.as_view(), name='search_shops'),
    path('shop/<int:shop>/services', v.ShopServiceView.as_view(), name='shop_services'),
    path('vehicle', vehicle_generic, name='vehicle'),
    path('vehicles/<int:pk>', vehicle_specific, name='vehicle'),
    path('vehicles/', v.VehicleSearchView.as_view(), name='vehicle_search'),
    path('vehicles/owners', v.OwnerVehicleSearchView.as_view(), name='vehicle_search'),
    path('quotes', v.ListQuotesView.as_view(), name='list_quotes'),
    path('quote/requests/', v.ListQuoteRequestsView.as_view(), name='list_quote_requests'),
    path('quote/request/', quote_request_generic, name='quote_request'),
    path('quote/request/<int:pk>/image',
         quote_request_image, name='quote_image'),
    path('quote/request/<int:pk>', quote_request_specific, name='quote_request'),
    path('quote', quote_generic, name='quote'),
    path('quote/<int:pk>', quote_specific, name='quote'),
    path('quote/<int:pk>/view', vs.QuoteViewSet.as_view({'get': 'view'}), name='quote'),
    path('quote/<int:pk>/service', v.QuoteServiceView.as_view(), name='quote_svc'),
    path('appointments/', appointment_generic, name='appointment'),
    path('appointments/<int:pk>', appointment_specific, name='appointment'),
    path('workorder/', workorder_generic, name='workorder'),
    path('workorder/<int:pk>', workorder_specific, name='workorder'),
    path('msgs/<int:pk>', messages, name='messaging'),
    path('msgs/<int:pk>/notify', vs.MessageViewSet.as_view(
        {'get': 'email_notify'}), name='messaging notification'),
    path('msgs/<int:pk>/read', vs.MessageViewSet.as_view(
        {'get': 'read'}), name='messaging read'),
    path('notifications/<int:pk>', notifications, name='messaging'),
    path('employee/<int:employee>/availability/<int:pk>', employee_availability_specific, name='employee_availability'),
    path('employee/<int:employee>/availability', employee_availability, name='employee_availability'),
    path('employee/<int:employee>/reservation/<uuid:pk>', employee_reservation_specific, name='employee_reservation'),
    path('employee/<int:employee>/reservation', employee_reservation, name='employee_reservation'),
    path('employee/<int:employee>/reservations', vs.EmployeeReservationViewSet.as_view({'get':'list'}), name='employee_reservation'),
    path('availability/<int:employee>', vs.AvailabilityViewSet.as_view({'get':'list'}), name='availability'),
    path('shop/availability/<int:owner>', vs.ShopAvailabilityViewSet.as_view({'get':'list'}), name='shop_availability'),
    path('reserved/<int:employee>', vs.ReservationSpanViewSet.as_view({'get':'list'}), name='availability'),
]
