from django.contrib import admin

# Register your models here.
from .models import Customer, Employee, ShopOwner, Profile
from django.contrib.auth import get_user_model

User = get_user_model()


admin.site.register(Profile)
admin.site.register(Employee)
admin.site.register(Customer)
admin.site.register(ShopOwner)
admin.site.register(User)