from django.db import models
# from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
import uuid


class RoleChoice(models.TextChoices):
    EMPLOYEE = 'employee', 'Employee'
    CUSTOMER = 'customer', 'Customer'
    OWNER = 'shopowner', 'Owner'


class Profile(models.Model):
    user = models.OneToOneField(
        'User', unique=True, related_name='profile', on_delete=models.CASCADE, primary_key=True)

    created_at = models.DateTimeField(auto_now_add=True)
    # kyc
    phone = models.CharField(max_length=15, null=True, validators=[
                             RegexValidator(r'^\d{3}-\d{3}-\d{4}$')])
    address = models.TextField(max_length=200, null=True, blank=False)
    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name}'


class Employee(Profile):
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=False, default=0)
    # department = models.Foreignoey('shop.Department', on_delete=models.CASCADE)

class Customer(Profile):
    payment_id = models.CharField(max_length=255, blank=True, null=True)

class ShopOwner(Profile):
    earnings = models.DecimalField(max_digits=10, decimal_places=2, null=False, default=0)

class User(AbstractUser):
    # uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id = models.AutoField(primary_key=True, null=False)
    role = models.CharField(choices=RoleChoice.choices ,default=RoleChoice.CUSTOMER, max_length=15)