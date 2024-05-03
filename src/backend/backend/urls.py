"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import include
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from accounts import views as accounts_views

schema_view = get_schema_view(
    openapi.Info(
        title="Sayyara API",
        default_version='v1',
        description="API Explorer for Sayyara",
        terms_of_service="https://localhost/",
        contact=openapi.Contact(email="example@example.com"),
        license=openapi.License(name="Closed License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^swagger/$', schema_view.with_ui('swagger',
            cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc',
            cache_timeout=0), name='schema-redoc'),
]

urlpatterns += [
    # Admin endpoint
    path('admin/', admin.site.urls),
    path('auth/register/', accounts_views.RegisterView.as_view(),
         name="account-register"),
    path('auth/validate_reset/',
         accounts_views.PasswordResetValidation.as_view({'post': 'validate_reset_password'})),
    path('account/<pk>', accounts_views.SingleProfileView.as_view()),
    path('employees/<id>', accounts_views.EmployeesView.as_view(),
         name="get-employees"),
    path('', include('shop.urls')),

    path('silk/', include('silk.urls', namespace='silk')),

    # Auth endpoints
    # Auth usage example https://djoser.readthedocs.io/en/latest/sample_usage.html
    re_path(r'^auth/', include('djoser.urls')),
    re_path(r'^auth/', include('djoser.urls.jwt')),
    # re_path(r'^auth/', include('djoser.urls.authtoken')),

]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Prepend /api to all routes
urlpatterns = [re_path(r'^api/', include(urlpatterns))]
