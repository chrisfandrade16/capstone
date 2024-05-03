from rest_framework import serializers
from . import models as m
from . import agenda as a
from django.contrib.auth import get_user_model
from accounts.models import Customer, Employee
import datetime
import pytz
from django.shortcuts import get_object_or_404

User = get_user_model()

# tz_choices = list(map(lambda x:(x,x), ['US/Eastern', 'US/Central', 'US/Mountain', 'US/Pacific']))
local_tz = pytz.timezone('US/Eastern')
    
def d_to_dt(dt, tz='Canada/Eastern'):
    # tz = pytz.timezone(tz) if isinstance(tz, str) else tz
    print(f'd_to_dt: {dt} {tz}, {type(dt)} {type(tz)}')
    return datetime.datetime.combine(dt, datetime.time.min, tzinfo=pytz.timezone(tz))

def utc_to_local(utc_dt, tz):
    local_dt = utc_dt.replace(tzinfo=pytz.utc).astimezone(local_tz)
    return local_tz.normalize(local_dt) # .normalize might be unnecessary

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'role')


class CustomerSerializer(serializers.ModelSerializer):
    # user = UserSerializer(read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.CharField(source='user.email')
    id = serializers.IntegerField(source='user.id')
    class Meta:
        model = Customer
        fields = ('id','first_name', 'last_name', 'email', 'phone', 'address')


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.Service
        fields = ('id', 'name', 'description')


class ShopServiceDetailSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='service.name')
    description = serializers.CharField(source='service.description')

    class Meta:
        model = m.ShopService
        fields = ('id', 'name', 'description', 'price', 'est_time', 'canned')


class QuoteServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.QuoteService
        fields = ('id', 'name', 'description', 'price',
                  'est_time', 'comment', 'quote')


class ShopServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.ShopService
        fields = ('id', 'service', 'price', 'est_time')


class ShopQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = m.Shop
        fields = ('id', 'name')


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.Shop
        # ('id', 'name', 'address', 'email', 'phone', 'description', 'owner', 'hours', 'employees', 'latitude', 'longitude')
        fields = '__all__'


class VehicleDetailSerializer(serializers.ModelSerializer):
    make = serializers.CharField(source='make.name')
    model = serializers.CharField(source='model.name')
    owner = CustomerSerializer(many=False, read_only=True)

    class Meta:
        model = m.Vehicle
        fields = ('id', 'make', 'model', 'year',
                  'vin', 'plate_number', 'owner')


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.Vehicle
        fields = ('id', 'make', 'model', 'year',
                  'vin', 'plate_number', 'owner')


class QuoteRequestDetailSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(many=False, read_only=True)
    vehicle = VehicleDetailSerializer(many=False)
    shop = ShopSerializer(many=False)
    images = serializers.SerializerMethodField()
    quote_set = None

    class Meta:
        model = m.QuoteRequest
        fields = ('id', 'customer', 'description', 'part_preference',
                  'vehicle', 'shop', 'availability', 'created_at', 'quote_set', 'images')

    def get_fields(self, *args, **kwargs):
        fields = super().get_fields(*args, **kwargs)
        if self.context.get('showQuotes', False):
            fields['quote_set'] = QuoteDetailSerializer(many=True)
        return fields

    def get_images(self, obj):
        return [{"id": image.pk, "url": image.image.url, "size": image.image.file.size} for image in obj.images.all()]


class QuoteRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.QuoteRequest
        fields = ('id', 'customer', 'description', 'part_preference',
                  'vehicle', 'shop', 'availability', 'created_at')

class QuoteDetailSerializer(serializers.ModelSerializer):
    services = QuoteServiceSerializer(many=True)
    shop = ShopQuerySerializer(many=False)
    quote_request = None
    notification = serializers.SerializerMethodField()

    class Meta:
        model = m.Quote
        fields = ('id', 'shop', 'quote_request', 'priority', 'status',
                  'message', 'services', 'buid', 'comments', 'assigned_to', 'archived', 'new', 'notification')

    def get_fields(self, *args, **kwargs):
        fields = super().get_fields(*args, **kwargs)
        if self.context.get('showQuoteRequest', False):
            fields['quote_request'] = QuoteRequestDetailSerializer(many=False, read_only=True)
        return fields

    def get_notification(self, obj):
        if "user" in self.context:
            try:
                notification = obj.quotenotification_set.get(
                    user=self.context['user'])
                return notification.detail
            except m.QuoteNotification.DoesNotExist:
                return ""
        else:
            return ""


class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.Quote
        fields = ('id', 'shop', 'quote_request', 'priority',
                  'status', 'message', 'services', 'comments', 'assigned_to', 'archived', 'new')


class StringListField(serializers.ListField):
    child = serializers.CharField()


class VehicleModelSerializer(serializers.ModelSerializer):
    years = StringListField()

    class Meta:
        model = m.vehicleModel
        fields = ('id', 'name', 'vehicle_type', 'years')


class MakeSerializer(serializers.ModelSerializer):
    models = VehicleModelSerializer(many=True)

    class Meta:
        model = m.Make
        fields = ('id', 'name', 'slug', 'models')

class SimpleShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.Shop
        fields = ('id', 'name', 'address', 'phone')


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.Notification
        fields = ['id', 'detail', 'user', 'created', 'notice_type']

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if isinstance(instance, m.ChatNotification):
            representation['conversation'] = instance.conversation.pk
            representation['quote'] = instance.quote.pk

        elif isinstance(instance, m.QuoteNotification):
            representation['quote'] = instance.quote.pk
        return representation

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.Message
        fields = ('id', 'message')
        read_only_fields = ['author']

    def create(self, validated_data):
        author = self.context['author']
        message = self.Meta.model.objects.create(
            **validated_data, author=author)
        return message


class EdittedMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.MessageEdits
        fields = ('created_at', 'message')


class MessageReadSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', allow_null=True)
    message = serializers.SerializerMethodField()
    edits = serializers.SerializerMethodField()

    class Meta:
        model = m.Message
        fields = ('id', 'author', 'created_at',
                  'editted_at', 'deleted_at', 'message', 'edits')

    # Mask message content if deleted
    def get_message(self, obj):
        if obj.deleted_at:
            return "deleted"
        return obj.message

    # Mask message edits if deleted
    def get_edits(self, obj):
        if obj.deleted_at:
            return None
        return EdittedMessageSerializer(obj.edits, many=True).data


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True)
    messages = MessageReadSerializer(many=True)
    last_read = serializers.SerializerMethodField()
    email_subscribed = serializers.SerializerMethodField()

    class Meta:
        model = m.Conversation
        fields = ('id', 'subject', 'messages', 'participants',
                  'last_read', 'email_subscribed')

    def get_last_read(self, obj):
        return self.context['lastRead']

    def get_email_subscribed(self, obj):
        return obj.email_notify.filter(pk=self.context['user'].pk).exists()


class AvailabileSlotsSerializzer(serializers.ModelSerializer):
    free_slots = serializers.SerializerMethodField()

    class Meta:
        model = a.EmployeeAvailability
        fields = ('id', 'employee', 'free_slots')

    def get_free_slots(self, instance):
        print(instance)
        slots = []
        for occurrence in instance.occurrences.all():
            slots.append((occurrence.start, occurrence.end))
        return slots


def remake_occurrences(instance, days=30, start=None, end=None, tz=None):
    if start is None:
        start = instance.start_date
    if end is None:
        end = start + datetime.timedelta(days=days)
    converted = [d_to_dt(start, instance.timezone), d_to_dt(end, instance.timezone)]
    # print(f'converted: {converted}')
    # print(f'types: {type(converted[0])=}, {type(converted[1])=}')
    instance.recreate_occurrences(*converted)

class EmployeeAvailabilitySerializer(serializers.ModelSerializer):
    # employee = serializers.CharField(source='employee.user.username')
    # timezone = serializers.ChoiceField(choices=pytz.common_timezones)
    start_date = serializers.DateField(format='%Y-%m-%d')
    start_time = serializers.TimeField(format='%H:%M:%S')
    end_time = serializers.TimeField(format='%H:%M:%S')
    timezone = serializers.CharField()

    class Meta:
        model = a.EmployeeAvailability
        fields = ('id','employee', 'start_date', 'start_time',
                  'end_time', 'recurrence', 'timezone')


    def create(self, validated_data):
        availability = self.Meta.model.objects.create(
            **validated_data,)
        remake_occurrences(availability)
        return availability

    
    # def update(self, instance, validated_data):
        # remake_occurrences(instance)
        # print(instance.timezones)
        # return super().update(instance, validated_data)
    def update(self, instance, validated_data):
        print(f'Updating {instance} with {validated_data}')
        instance.start_date = validated_data.get(
            'start_date', instance.start_date)
        instance.start_time = validated_data.get(
            'start_time', instance.start_time)
        instance.end_time = validated_data.get('end_time', instance.end_time)
        instance.recurrence = validated_data.get(
            'recurrence', instance.recurrence)
        instance.timezone = validated_data.get('timezone', instance.timezone)
        remake_occurrences(instance)
        return super().update(instance, validated_data)

    def validate(self, data):
        if data['start_time'] > data['end_time']:
            raise serializers.ValidationError(
                "Start time must be before end time")
        return data

    def validate_timezone(self, value):
        if value not in pytz.all_timezones:
            raise serializers.ValidationError(
                "Timezone must be a valid timezone")
        return value

    def validate_start_date(self, value):
        print(f'validating start date: {value} type: {type(value)} ')
        if value < datetime.datetime.now(pytz.timezone('US/Eastern')).date():
            raise serializers.ValidationError("Start date must be today or later")
        return value


class EmployeeReservationCreateSerializer(serializers.ModelSerializer):
    # schedule = serializers.IntegerField(source='employee.id', write_only=True)
    employee = serializers.IntegerField(source='schedule')
    
    class Meta:
        model = a.EmployeeReservation
        fields = ('time', 'duration', 'state', 'employee')

    # def validate_schedule(self, value):
    #     schedule = get_object_or_404(a.Employee, pk=value)
        # if schedule.employee != self.context['employee']:
        #     raise serializers.ValidationError("Schedule does not belong to employee")
        # return schedule
    # def to_representation(self, instance):
    #     instance.schedule = instance.schedule.user.id
    #     return super().to_representation(instance)
    
    def create(self, validated_data):
        # print(validated_data)
        # schedule = validated_data['schedule']
        # print(schedule)
        # print(self.context)
        
        validated_data['schedule'] = get_object_or_404(Employee, pk=self.context['employee'])
        print(validated_data['schedule'])
        reservation = self.Meta.model.objects.create(
            **validated_data)
        # schedule = a.EmployeeAvailability.objects.filter(employee=self.context['employee']).first()
        # schedules = a.EmployeeAvailability.objects.filter(employee=schedule.employee)
        # for schedule in schedules:
        #     remake_occurrences(schedule)
        return reservation
    

class EmployeeReservationSerializer(serializers.ModelSerializer):
    # employee_schedule = EmployeeAvailabilitySerializer(source='schedule', read_only=True)
    # schedule = serializers.PrimaryKeyRelatedField(queryset=a.EmployeeAvailability.objects.all())

    class Meta:
        model = a.EmployeeReservation
        
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    reservation=EmployeeReservationSerializer(read_only=False)
    class Meta:
        model = m.Appointment
        fields = '__all__'

    def create(self, validated_data):
        reservation_data = validated_data.pop('reservation')
        reservation = a.EmployeeReservation.objects.create(**reservation_data)
        if reservation:
            validated_data['reservation'] = reservation
        appointment = self.Meta.model.objects.create(**validated_data)
        return appointment


class WorkOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = m.WorkOrder
        fields = ('id', 'appointment', 'status',
                  'services', 'work_description', 'note')



class AppointmentDetailSerializer(serializers.ModelSerializer):
    shop = SimpleShopSerializer(many=False, source='quote.shop')
    customer = CustomerSerializer(many=False, source='quote.quote_request.customer')
    quote = QuoteDetailSerializer(many=False, read_only=True)
    reservation = EmployeeReservationSerializer(many=False) #serializers.DateTimeField(source='reservation.time')

    class Meta:
        model = m.Appointment
        fields = ('id', 'title', 'description',
                  'reservation', 'time_estimate', 'quote', 'price_estimate', 'message', 'shop', 'customer')
    
    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.time_estimate = validated_data.get('time_estimate', instance.time_estimate)
        instance.price_estimate = validated_data.get('price_estimate', instance.price_estimate)
        instance.message = validated_data.get('message', instance.message)
        
        reservation_data = validated_data.get('reservation', {})
        if reservation_data:
            reservation_instance = instance.reservation
            if 'time' in reservation_data:
                reservation_instance.time = reservation_data['time']
            if 'duration' in reservation_data:
                reservation_instance.duration = reservation_data['duration']
            if 'schedule' in reservation_data:
                reservation_instance.schedule = reservation_data['schedule']
            reservation_instance.save()

        
        instance.save()
        return instance        
        


class WorkOrderDetailSerializer(serializers.ModelSerializer):
    appointment = AppointmentDetailSerializer(read_only=True)
    services = ShopServiceDetailSerializer(many=True, read_only=True)

    class Meta:
        model = m.WorkOrder
        fields = ('id', 'appointment', 'status',
                  'services', 'work_description', 'note')