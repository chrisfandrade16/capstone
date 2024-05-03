from django.db import models
from django.core.validators import RegexValidator
from django.contrib.postgres.fields import ArrayField
from datetime import datetime
import uuid
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from .agenda import EmployeeReservation, WorkBayReservation
from accounts.models import Customer, ShopOwner, Employee

User = get_user_model()


class Service(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f'{self.name}'


class ShopService(models.Model):
    service = models.ForeignKey(Service, on_delete=models.PROTECT)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    est_time = models.DurationField(default=0)
    canned = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.service.name} - ${self.price} - {self.est_time}'


class Shop(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(max_length=500, blank=True)
    # description
    description = models.TextField(max_length=500, blank=True)
    # services provided

    # contact
    email = models.EmailField(max_length=75, unique=True)
    phone = models.CharField(max_length=15, null=True, validators=[
                             RegexValidator(r'^\d{3}-\d{3}-\d{4}$')])
    services = models.ManyToManyField(ShopService, blank=True)
    owner = models.ForeignKey(
        ShopOwner, related_name='owner', on_delete=models.CASCADE)
    # keep it simple for now, can make it a time field later
    hours = models.CharField(max_length=255, null=True)
    # TODO: fix the employees field for a shop
    employees = models.ManyToManyField(
        Employee, related_name='employees', blank=True)
    latitude = models.DecimalField(
        max_digits=20, decimal_places=11, blank=True, null=True)
    longitude = models.DecimalField(
        max_digits=20, decimal_places=11, blank=True, null=True)

    latitude = models.DecimalField(
        max_digits=19, decimal_places=16, blank=True, null=True)
    longitude = models.DecimalField(
        max_digits=19, decimal_places=16, blank=True, null=True)

    def __str__(self):
        return self.name


class vehicleModel(models.Model):
    TYPES = {
        ('motorcycle', 'Motorcycle'),
        ('car', 'Car'),
        ('truck', 'Truck'),
        ('bus', 'Bus'),
        ('trailer', 'Trailer'),
    }
    name = models.CharField(max_length=255)
    vehicle_type = models.CharField(choices=TYPES, max_length=25)
    years = ArrayField(models.IntegerField())

    def __str__(self):
        return f'{self.name}'


class Make(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    models = models.ManyToManyField(vehicleModel, related_name='maker')

    def __str__(self):
        return f'{self.name}'


class Vehicle(models.Model):
    make = models.ForeignKey(Make, on_delete=models.CASCADE)
    model = models.ForeignKey(vehicleModel, on_delete=models.CASCADE)
    year = models.IntegerField()

    vin = models.CharField(max_length=17, blank=True)
    plate_number = models.CharField(max_length=10, blank=True)
    owner = models.ForeignKey(Customer, on_delete=models.CASCADE)

    def __str__(self):
        return f'({self.year}) {self.make.name} {self.model.name}'


class PartPreference(models.TextChoices):
    ANY = 'any', 'No preference',
    NEW = 'new', 'New',
    USED = 'used', 'Used',
    OEM = 'oem', 'Original Equipment Manufacturer (OEM)',
    AFTERMARKET = 'aftermarket', 'Aftermarket',


class Conversation(models.Model):
    subject = models.CharField(default='Conversation', max_length=200)
    participants = models.ManyToManyField(
        User, related_name="conversations", blank=True)
    ignored_by = models.ManyToManyField(
        User, related_name="ignored_conversations", blank=True)
    email_notify = models.ManyToManyField(User, blank=True)


def default_conversation():
    conv = Conversation()
    conv.save()
    return conv.pk


class Notification(models.Model):
    TYPES = {
        ('message', 'message'),
        ('quote', 'quote'),
        ('appointment', 'appointment'),
    }

    created = models.DateTimeField(default=datetime.now)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications")
    notice_type = models.CharField(max_length=20, choices=TYPES)
    detail = models.TextField(max_length=256, blank=True, null=True)


class ChatNotification(Notification):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    quote = models.ForeignKey('Quote', on_delete=models.CASCADE, blank=True, null=True)


class QuoteNotification(Notification):
    quote = models.ForeignKey('Quote', on_delete=models.CASCADE)


class LastRead(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    conversation = models.ForeignKey(
        Conversation,  on_delete=models.CASCADE, related_name="last_read")
    last_read_at = models.DateTimeField(default=datetime.now)


class Message(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    created_at = models.DateTimeField(default=datetime.now)
    editted_at = models.DateTimeField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    message = models.TextField(max_length=1024)
    conversation = models.ForeignKey(
        Conversation, null=True, blank=True, on_delete=models.CASCADE, related_name='messages')

    class Meta:
        ordering = ['created_at']


class MessageEdits(models.Model):
    created_at = models.DateTimeField(default=datetime.now)
    message = models.TextField(max_length=1024)
    parent = models.ForeignKey(
        Message, on_delete=models.CASCADE, related_name="edits")

    class Meta:
        ordering = ['created_at']


class QuoteRequest(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    part_preference = models.TextField(
        choices=PartPreference.choices, max_length=50, default='any')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    description = models.TextField(max_length=500, blank=True)
    shop = models.ForeignKey(
        Shop, on_delete=models.CASCADE, blank=True, null=True)
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, blank=True, null=True)
    created_at = models.DateTimeField(default=datetime.now)
    availability = models.TextField(max_length=500, blank=True)

    def __str__(self):
        return f'{self.description} {self.vehicle}'


class ImageQuote(models.Model):
    quote = models.ForeignKey(
        QuoteRequest, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to='quote_images/')
    created_at = models.DateTimeField(default=datetime.now)
    uploader = models.ForeignKey(
        User, on_delete=models.CASCADE, blank=True, null=True)


class Quote(models.Model):
    PRIORITIES = {
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High')
    }
    BOOKING_STATUS = {
        ('pending', 'Pending'),
        ('canceled', 'Canceled'),
        ('booked', 'Booked')
    }
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE)
    quote_request = models.ForeignKey(QuoteRequest, on_delete=models.CASCADE)
    status = models.CharField(choices=BOOKING_STATUS,
                              max_length=20, default='pending')
    priority = models.CharField(
        choices=PRIORITIES, max_length=20, default='medium')
    buid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    # message
    message = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(default=datetime.now)
    
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    archived = models.BooleanField(default=False)
    new = models.BooleanField(default=True)

    comments = models.OneToOneField(
        Conversation, null=True, on_delete=models.CASCADE, default=default_conversation)

    def __str__(self):
        return self.quote_request.customer.user.username + "'s booking with " + self.shop.name


# can be created based on shop service, but all fields overridable
class QuoteService(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=500, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    est_time = models.DurationField(default=0)
    comment = models.CharField(max_length=1024, null=True, blank=True)
    quote = models.ForeignKey(
        Quote, on_delete=models.CASCADE, related_name="services")

    def __str__(self):
        return f'{self.name} - ${self.price} - {self.est_time}'


class Appointment(models.Model):
    # Can choose to send a confirmation email
    # customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    # shop = models.ForeignKey(Shop, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    quote = models.ForeignKey(
        Quote, related_name='appointment', on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(max_length=500, blank=True)
    time_estimate = models.DurationField()
    price_estimate = models.DecimalField(max_digits=10, decimal_places=2)
    message = models.TextField(max_length=500, blank=True)
    reservation = models.ForeignKey(
        EmployeeReservation, on_delete=models.PROTECT)

    @property
    def customer(self):
        return self.quote.quote_request.customer

    @property
    def employee(self):
        return self.reservation.employee

    @property
    def shop(self):
        return self.quote.shop

    def __str__(self):
        return self.quote.shop.name + ' appointment with ' + self.customer.user.username


class Part(models.Model):
    class Type(models.TextChoices):
        NEW = 'new', 'New',
        USED = 'used', 'Used',
        OEM = 'oem', 'Original Equipment Manufacturer (OEM)',
        AFTERMARKET = 'aftermarket', 'Aftermarket',

    name = models.CharField(max_length=50)
    type = models.CharField(choices=Type.choices, max_length=20)
    price = models.DecimalField(max_digits=7, decimal_places=2)


class WorkOrder(models.Model):
    WORK_ORDER_STATUS = {
        ('pending', 'Pending'),
        ('complete', 'Complete'),
        ('cancelled', 'Cancelled')
    }
    appointment = models.ForeignKey(Appointment,  on_delete=models.PROTECT)
    services = models.ManyToManyField(ShopService)

    status = models.CharField(
        choices=WORK_ORDER_STATUS, max_length=20, default='pending')

    work_description = models.TextField(max_length=500, blank=True)
    note = models.TextField(max_length=500, blank=True)

    def __str__(self):
        return self.appointment.shop.name + ' with ' + self.appointment.customer.username
