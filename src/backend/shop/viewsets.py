from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt import authentication
from drf_yasg import openapi
from . import models as m
from django.contrib.auth import get_user_model
from accounts.models import Employee
from django.contrib.auth.models import Group
from . import serializers as s
from drf_yasg.utils import swagger_auto_schema
from rest_framework import mixins, generics, filters
from rest_framework import viewsets
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from templated_mail.mail import BaseEmailMessage
from . import agenda as a
import pytz
import os

tz = pytz.timezone('Canada/Eastern')

User = get_user_model()


class QuoteRequestViewSet(viewsets.ModelViewSet):
    serializer_class = s.QuoteRequestSerializer
    queryset = m.QuoteRequest.objects.all()

    @swagger_auto_schema(operation_description="Create a new quote request", request_body=s.QuoteRequestSerializer, tags=['Quote'])
    def create(self, request):
        quote_serializer = s.QuoteRequestSerializer(data=request.data)
        if quote_serializer.is_valid():
            quote_serializer.save()
            return Response({"success": "Quote Request created successfully", "quoteRequest": quote_serializer.data})
        else:
            return Response({"failure": quote_serializer.errors}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(tags=['Quote'])
    def list(self, request):
        quotes = m.QuoteRequest.objects.all()
        data = s.QuoteRequestDetailSerializer(quotes, many=True).data
        return Response({'quote_requests': data})

    @swagger_auto_schema(tags=['Quote'])
    def retrieve(self, request, pk):
        quote = m.QuoteRequest.objects.get(id=pk)
        data = s.QuoteRequestDetailSerializer(quote).data
        return Response({'quote_request': data})

    @swagger_auto_schema(operation_description="Update a given quote request", request_body=s.QuoteRequestSerializer, tags=['Quote'])
    def update(self, request, pk):
        try:
            quote = m.QuoteRequest.objects.get(id=pk)
        except m.QuoteRequest.DoesNotExist:
            return Response({"failure": "The Quote request does not exist"})

        quote_data = request.data
        quote_serializer = s.QuoteRequestSerializer(
            instance=quote, data=quote_data, partial=True)
        if quote_serializer.is_valid(raise_exception=True):
            quote_serializer.save()
            return Response({"success": "Quote request'{}' updated successfully".format(pk)})
        return Response({"failure": quote_serializer.errors})

    @swagger_auto_schema(tags=['Quote'])
    def destroy(self, request, pk):
        try:
            quote = m.QuoteRequest.objects.get(id=pk)
            quote.delete()
            return Response({"success": "Quote request '{}' deleted successfully".format(quote.id)})
        except m.QuoteRequest.DoesNotExist:
            return Response({"failure": "The Quote request does not exist"})


class quoteRequestImageViewSet(viewsets.ModelViewSet):
    authentication_classes = [authentication.JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, pk):
        images = request.FILES.getlist("images")
        print("IMAGE UPLOAD")
        quote = m.QuoteRequest.objects.get(id=pk)
        try:
            for image in images:
                m.ImageQuote.objects.create(
                    image=image, quote=quote, uploader=request.user)
            print(f"{len(images)} uploaded successfully for quoteRequest #{quote.id}")
            return Response({"success": f"{len(images)} uploaded successfully for quoteRequest #{quote.id}"})
        except Exception as err:
            print(err)
            return Response({"failure": err})

    def destroy(self, request, pk):
        print("IMAGE DELETION")
        try:
            image = m.ImageQuote.objects.get(id=pk)
            if request.user == image.uploader or image.uploader == None:
                if os.path.exists(image.image.path):
                    os.remove(image.image.path)
                image.delete()
                print("successful deletion")
                return Response({"success": "Image '{}' deleted successfully".format(pk)})
            else:
                print("failed deletion: unauthorized")
                return Response({"failure": "Do not have authorization to delete this image"})
        except m.ImageQuote.DoesNotExist:
            print("failed deletion: DOES NOT EXIST")
            return Response({"failure": "The image does not exist"})


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = s.VehicleSerializer
    queryset = m.Vehicle.objects.all()
    # permission_classes = (IsAuthenticated)

    @swagger_auto_schema(operation_description="Create a new vehicle", request_body=s.VehicleSerializer, tags=['Customer'])
    def create(self, request):
        vehicle_serializer = s.VehicleSerializer(data=request.data)
        if vehicle_serializer.is_valid():
            vehicle_serializer.save()
            return Response({"success": "Vehicle created successfully", "vehicle": vehicle_serializer.data})
        else:
            return Response({"failure": vehicle_serializer.errors})

    @swagger_auto_schema(tags=['Customer'])
    def retrieve(self, request, pk):
        vehicle = m.Vehicle.objects.get(id=pk)
        data = s.VehicleSerializer(vehicle).data
        return Response({'vehicle': data})

    @swagger_auto_schema(operation_description="Update a given vehicle", request_body=s.VehicleSerializer, tags=['Customer'])
    def update(self, request, pk):
        try:
            vehicle = m.Vehicle.objects.get(id=pk)
        except m.Vehicle.DoesNotExist:
            return Response({"failure": "The vehicle does not exist"})

        vehicle_data = request.data
        vehicle_serializer = s.VehicleSerializer(
            instance=vehicle, data=vehicle_data, partial=True)
        if vehicle_serializer.is_valid(raise_exception=True):
            vehicle_serializer.save()
            return Response({"success": "Vehicle '{}' updated successfully".format(vehicle_serializer.data['model'])})
        return Response({"failure": vehicle_serializer.errors})

    @swagger_auto_schema(tags=['Customer'])
    def destroy(self, request, pk):
        try:
            vehicle = m.Vehicle.objects.get(id=pk)
            vehicle.delete()
            return Response({"success": "Vehicle '{}' deleted successfully".format(vehicle.model)})
        except m.Vehicle.DoesNotExist:
            return Response({"failure": "The vehicle does not exist"})


class ShopViewSet(viewsets.ModelViewSet):
    queryset = m.Shop.objects.all()
    serializer_class = s.ShopSerializer

    @swagger_auto_schema(operation_description="Create a new shop", request_body=s.ShopSerializer, tags=['Shop'])
    def create(self, request):
        shop_serializer = s.ShopSerializer(data=request.data)
        if shop_serializer.is_valid():
            shop_serializer.save()
            group_name = f'{shop_serializer.data["name"].lower()}_owners'
            shop_owners, created = Group.objects.get_or_create(name=group_name)
            if (created):
                print(f'Created group {group_name}')
            # shop_owners.user_set.add(request.user)
            shop_owners.user_set.add(request.data['owner'])
            return Response({"success": "Shop '{}' created successfully".format(shop_serializer.data['name'])}, status=status.HTTP_200_OK)
        else:
            return Response({"failure": shop_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(operation_description="Update a given shop", request_body=s.ShopSerializer, tags=['Shop'])
    def update(self, request, pk):
        try:
            shop = m.Shop.objects.get(id=pk)
        except m.Shop.DoesNotExist:
            return Response({"failure": "The shop does not exist"})

        shop_data = request.data
        shop_serializer = s.ShopSerializer(instance=shop, data=shop_data, partial=True)

        if shop_serializer.is_valid():
            shop_serializer.save()
            return Response({"success": "Shop '{}' updated successfully".format(shop_serializer.data['name'])}, status=status.HTTP_200_OK)
        return Response({"failure": shop_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(tags=['Shop'])
    def destroy(self, request, pk):
        try:
            shop = m.Shop.objects.get(id=pk)
            shop.delete()
            return Response({"success": "Shop '{}' deleted successfully".format(shop.name)}, status=status.HTTP_200_OK)
        except:
            return Response({"failure": "The shop does not exist"}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(tags=['Shop'])
    def retrieve(self, request, pk):
        try:
            shop = m.Shop.objects.get(id=pk)
            return Response({"success": {"shop": s.ShopSerializer(shop).data}}, status=status.HTTP_200_OK)
        except:
            return Response({"failure": "The shop does not exist"}, status=status.HTTP_400_BAD_REQUEST)


class QuoteViewSet(viewsets.ModelViewSet):
    serializer_class = s.QuoteSerializer
    queryset = m.Quote.objects.all()

    authentication_classes = [authentication.JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(operation_description="Create a new quote", request_body=s.QuoteSerializer, tags=['Quote'])
    def create(self, request):
        quote_serializer = s.QuoteSerializer(data=request.data)
        if quote_serializer.is_valid():
            quote = quote_serializer.save()
            try:
                BaseEmailMessage(
                    template_name="email/quote_notice.html", context={'user': quote.quote_request.customer.user, 'quote': quote}).send([quote.shop.email])
                print("notification emails sent:", quote.shop.email)
            except Exception as e:
                print(e)
                print("email server Error!")
            return Response({"success": "Quote Request '{}' created successfully".format(quote_serializer.data['id'])})
        else:
            return Response({"failure": quote_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(tags=['Quote'])
    def retrieve(self, request, pk):
        quote = m.Quote.objects.get(id=pk)
        if quote.comments == None:
            print("creating new conversation")
            quote.comments = m.Conversation()
            quote.save()
        data = s.QuoteDetailSerializer(quote, context={"user": request.user, 'showQuoteRequest':True}).data
        return Response({'quote': data})

    @swagger_auto_schema(operation_description="Update a given quote", request_body=s.QuoteSerializer, tags=['Quote'])
    def update(self, request, pk):
        try:
            quote = m.Quote.objects.get(id=pk)
        except m.Quote.DoesNotExist:
            return Response({"failure": "The Quote does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        quote_data = request.data
        quote_serializer = s.QuoteSerializer(
            instance=quote, data=quote_data, partial=True)
        if quote_serializer.is_valid(raise_exception=True):

            quote = quote_serializer.save()
            data = s.QuoteDetailSerializer(quote).data
            return Response({"success": f"Quote '{pk}' updated successfully", "quote": data})
        return Response({"failure": quote_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(tags=['Quote'])
    def destroy(self, request, pk):
        try:
            quote = m.Quote.objects.get(id=pk)
            quote.delete()
            return Response({"success": "Quote '{}' deleted successfully".format(quote.id)})
        except m.Quote.DoesNotExist:
            return Response({"failure": "The Quote does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
    def respond(self, request, pk):
        try:
            quote = m.Quote.objects.get(id=pk)
            if (quote.assigned_to == None):
                print("assigning responder to the quote")
                quote.assigned_to = request.user
                # remove existing quote_request notification from all other store employees
                quote.comments.participants.add(request.user)
            quote.new = False
            m.QuoteNotification.objects.update_or_create(user=quote.quote_request.customer.user, quote=quote, defaults={
                "notice_type": "quote",
                "detail": f"{request.user.get_full_name() } added a response to your quote request for {quote.shop.name}",
                "created": datetime.now()
            })
            m.Message.objects.create(
                message=f"{request.user.get_full_name() } posted an update to this quote.", conversation=quote.comments)
            quote.save()
            return Response({"success": f"Response saved for quote #{pk}"})
        except m.Quote.DoesNotExist:
            return Response({"failure": "The Quote does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
    def _remove_notification(self, user, quote):
        try:
            notification = m.QuoteNotification.objects.get(user=user, quote=quote)
            notification.delete()
        except m.QuoteNotification.DoesNotExist:
            print(f"Quote notification for quote #{quote.id} does not exist!")

    def view(self, request, pk):
        try:
            quote = m.Quote.objects.get(id=pk)
            self._remove_notification(request.user, quote)
            return Response({"success": "Quote marked as read"})
        except m.Quote.DoesNotExist:
            return Response({"failure": "The Quote does not exist"}, status=status.HTTP_400_BAD_REQUEST)



class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = m.Appointment.objects.all()
    serializer_class = s.AppointmentDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['showQuoteRequest'] = True
        return context

    def get_queryset(self):
        if self.request.GET.get('sort') and self.request.GET.get('filter'):
            sort_field = self.request.GET.get('sort')
            filter_field = self.request.GET.get('filter')
            queryset = m.Appointment.objects.all().order_by(sort_field)
            queryset = queryset.filter(
                **{filter_field: self.request.GET.get(filter_field)})
            return queryset
        elif self.request.GET.get('sort'):
            sort_field = self.request.GET.get('sort')
            return m.Appointment.objects.all().order_by(sort_field)
        elif self.request.GET.get('filter'):
            if 'customer' in self.request.GET.get('filter'):
                queryset = m.Appointment.objects.filter(quote__quote_request__customer__user__id=self.request.GET.get('customer'))
                return queryset
            if 'shop' in self.request.GET.get('filter'):
                queryset = m.Appointment.objects.filter(quote__shop__id=self.request.GET.get('shop'))
                return queryset
            filter_field = self.request.GET.get('filter')
            queryset = m.Appointment.objects.all()
            queryset = queryset.filter(
                **{filter_field: self.request.GET.get(filter_field)})
            return queryset
        else:
            return m.Appointment.objects.all()

    @swagger_auto_schema(tags=['Appointment'], operation_description="List all appointments", manual_parameters=[
        openapi.Parameter('sort', openapi.IN_QUERY, description="Sort by field", type=openapi.TYPE_STRING),
        openapi.Parameter('filter', openapi.IN_QUERY, description="Filter by field", type=openapi.TYPE_STRING),
        openapi.Parameter('customer', openapi.IN_QUERY, description="Filter by customer", type=openapi.TYPE_STRING),
        openapi.Parameter('shop', openapi.IN_QUERY, description="Filter by shop", type=openapi.TYPE_STRING),
    ]
    )
    def list(self, request):
        queryset = self.get_queryset()
        serializer = s.AppointmentSerializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(tags=['Appointment'])
    def retrieve(self, request, pk=None):
        queryset = m.Appointment.objects.all()
        appointment = get_object_or_404(queryset, pk=pk)
        serializer = s.AppointmentDetailSerializer(appointment)
        return Response(serializer.data)

    @swagger_auto_schema(operation_description="Create a new appointment", request_body=s.AppointmentSerializer, tags=['Appointment'])
    def create(self, request):
        serializer = s.AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": "Appointment '{}' created successfully".format(serializer.data['id'])})
        else:
            return Response({"failure": serializer.errors})

    @swagger_auto_schema(operation_description="Update a given appointment", request_body=s.AppointmentSerializer, tags=['Appointment'])
    def update(self, request, pk=None):
        try:
            appointment = m.Appointment.objects.get(id=pk)
        except m.Appointment.DoesNotExist:
            return Response({"failure": "This appointment does not exist"})

        request_data = request.data
        serializer = s.AppointmentDetailSerializer(
            instance=appointment, data=request_data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({"success": "Appointment '{}' updated successfully".format(serializer.data['id'])})
        return Response({"failure": serializer.errors})

    @swagger_auto_schema(tags=['Appointment'])
    def destroy(self, request, pk=None):
        try:
            appointment = m.Appointment.objects.get(id=pk)
            appointment.delete()
            return Response({"success": "Appointment '{}' deleted successfully".format(appointment.id)})
        except m.Appointment.DoesNotExist:
            return Response({"failure": "This appointment does not exist"})


class WorkOrderViewSet(viewsets.ModelViewSet):
    queryset = m.WorkOrder.objects.all()
    serializer_class = s.WorkOrderSerializer

    def get_queryset(self):
        if self.request.GET.get('sort') and self.request.GET.get('filter'):
            sort_field = self.request.GET.get('sort')
            filter_field = self.request.GET.get('filter')
            queryset = m.WorkOrder.objects.all().order_by(sort_field)
            queryset = queryset.filter(
                **{filter_field: self.request.GET.get(filter_field)})
            return queryset
        elif self.request.GET.get('sort'):
            sort_field = self.request.GET.get('sort')
            return m.WorkOrder.objects.all().order_by(sort_field)
        elif self.request.GET.get('filter'):
            filter_field = self.request.GET.get('filter')
            queryset = m.WorkOrder.objects.all()
            queryset = queryset.filter(
                **{filter_field: self.request.GET.get(filter_field)})
            return queryset
        else:
            return m.WorkOrder.objects.all()

    @swagger_auto_schema(tags=['WorkOrder'])
    def list(self, request):
        queryset = self.get_queryset()
        serializer = s.WorkOrderSerializer(queryset, many=True)
        return Response({"success": serializer.data})

    @swagger_auto_schema(tags=['WorkOrder'])
    def retrieve(self, request, pk=None):
        queryset = m.WorkOrder.objects.all()
        WorkOrder = get_object_or_404(queryset, pk=pk)
        serializer = s.WorkOrderDetailSerializer(WorkOrder)
        return Response(serializer.data)

    @swagger_auto_schema(operation_description="Create a new WorkOrder", request_body=s.WorkOrderSerializer, tags=['WorkOrder'])
    def create(self, request):
        serializer = s.WorkOrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": "WorkOrder '{}' created successfully".format(serializer.data['id'])})
        else:
            return Response({"failure": serializer.errors})

    @swagger_auto_schema(operation_description="Update a given WorkOrder", request_body=s.WorkOrderSerializer, tags=['WorkOrder'])
    def update(self, request, pk=None):
        try:
            WorkOrder = m.WorkOrder.objects.get(id=pk)
        except m.WorkOrder.DoesNotExist:
            return Response({"failure": "This WorkOrder does not exist"})

        request_data = request.data
        serializer = s.WorkOrderSerializer(
            instance=WorkOrder, data=request_data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({"success": "WorkOrder '{}' updated successfully".format(serializer.data['id'])})
        return Response({"failure": serializer.errors})

    @swagger_auto_schema(tags=['WorkOrder'])
    def destroy(self, request, pk=None):
        try:
            WorkOrder = m.WorkOrder.objects.get(id=pk)
            WorkOrder.delete()
            return Response({"success": "WorkOrder '{}' deleted successfully".format(WorkOrder.id)})
        except m.WorkOrder.DoesNotExist:
            return Response({"failure": "This WorkOrder does not exist"})


class MessageViewSet(viewsets.ModelViewSet):
    authentication_classes = [authentication.JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    queryset = m.Message.objects.all()
    serializer_class = s.MessageSerializer

    def _get_last_read(self, user, conversation):
        try: 
            last_read = m.LastRead.objects.get(
                user=user, conversation=conversation)
            return last_read.last_read_at
        except m.LastRead.DoesNotExist:
            return datetime.fromtimestamp(0)

    def _update_last_read(self, user, conversation):
        last_read, _ = m.LastRead.objects.get_or_create(
            user=user, conversation=conversation)
        last_read.last_read_at = datetime.now()
        last_read.save()
        # also remove notification for unread messages
        try:
            notification = m.ChatNotification.objects.get(user=user, conversation=conversation)
            notification.delete()
        except m.ChatNotification.DoesNotExist:
            print(f"Chat notification does not exist for {user.username}")
    
    @swagger_auto_schema(operation_description="Mark conversation as read", tags=['Messaging'])
    def read(self, request, pk=None):
        try:
            conversation = get_object_or_404(m.Conversation.objects.all(), pk=pk)
            self._update_last_read(request.user, conversation)
            return Response({"success": "message read"})
        except m.Conversation.DoesNotExist:
            return Response({"fail": "conversation not found"}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(operation_description="Get conversation", tags=['Messaging'])
    def get_conversation(self, request, pk=None):
        conversation = get_object_or_404(m.Conversation.objects.all(), pk=pk)
        lastRead = self._get_last_read(request.user, conversation)
        serializer = s.ConversationSerializer(
            conversation, context={'lastRead': lastRead, 'user': request.user})
        return Response(serializer.data)

    @swagger_auto_schema(operation_description="Create a new message", request_body=s.MessageSerializer, tags=['Messaging'])
    def create(self, request, pk):
        message_serializer = s.MessageSerializer(
            data=request.data, context={'author': request.user})
        if message_serializer.is_valid():
            message = message_serializer.save()
            conversation, created = m.Conversation.objects.get_or_create(pk=pk)

            # insert author into conversation.participants.
            # TODO: this should be disabled in the future. Participants should be set by quote creatio to prevent users forcing their ways into a conversation
            conversation.participants.add(request.user)
            conversation.save()

            self._update_last_read(request.user, conversation)
            if (created):
                print(f'Created conversation {conversation.pk}')
            message.conversation = conversation
            message.save()

            for user in conversation.participants.all():
                if user != request.user:
                    m.ChatNotification.objects.update_or_create(user=user, conversation=conversation, defaults={
                        "notice_type": "message",
                        "detail": f"{request.user.get_full_name() } added a new comment to a conversation",
                        "created": datetime.now(),
                        "quote": conversation.quote
                    })

            # email subscribed users (other than message author)
            try:
                email_receivers = [
                    user.email for user in conversation.email_notify.all() if user != request.user]
                BaseEmailMessage(
                    template_name="email/message_notice.html", context={'message': message}).send(email_receivers)
                print("notification emails sent:", email_receivers)
            except Exception as e:
                print(e)
                print("email server Error!")

            return Response({"success": f"Message {message.pk} created successfully"})
        else:
            return Response({"failure": message_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(operation_description="Edit a given message", request_body=s.MessageSerializer, tags=['Messaging'])
    def update(self, request, pk):
        try:
            message = m.Message.objects.get(pk=pk)
            if message.author != request.user:
                return Response({"failure": "Can only edit your own message"})
            if message.deleted_at:
                return Response({"failure": "Cannot edit a deleted message"})
        except m.Message.DoesNotExist:
            return Response({"failure": "The message does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        self._update_last_read(request.user, message.conversation)
        if request.data['message'] != message.message:
            prev_message = message.message
            prev_editted_at = message.editted_at if message.editted_at else message.created_at
            m.MessageEdits.objects.create(
                parent=message, message=prev_message, created_at=prev_editted_at)
            message.editted_at = datetime.now()
            message.message = request.data['message']
            message.save()
            return Response({"success": f"Message {pk} editted successfully."})
        else:
            return Response({"failure": "No changes detected"}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(operation_description="Delete a given message", tags=['Messaging'])
    def destroy(self, request, pk):
        try:
            message = m.Message.objects.get(pk=pk)
            if message.author != request.user:
                return Response({"failure": "Can only delete your own message"}, status=status.HTTP_400_BAD_REQUEST)
            self._update_last_read(request.user, message.conversation)
            message.deleted_at = datetime.now()
            message.save()
            return Response({"success": f"Message '{pk}' deleted successfully"})
        except m.Message.DoesNotExist:
            return Response({"failure": "The message does not exist"}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(operation_description="Set email notification status for a user", tags=['Messaging'], manual_parameters=[openapi.Parameter('enabled', openapi.IN_QUERY, description="toggle status of email subscription", type=openapi.TYPE_BOOLEAN)])
    def email_notify(self, request, pk):
        try:
            conversation = m.Conversation.objects.get(pk=pk)
            # TODO: add check to make sure request user is a participant
            notify = request.query_params['enabled'].lower() == 'true'

            if (notify):
                conversation.email_notify.add(request.user)
                print(
                    f"{request.user.username} will receive email notification for conversation {pk}")
            else:
                conversation.email_notify.remove(request.user)
                print(
                    f"{request.user.username} will stop receiving email notification for conversation {pk}")
            return Response({"enabled": notify})
        except Exception as e:
            return Response({"failure": e}, status=status.HTTP_400_BAD_REQUEST)


class NotificationViewSet(viewsets.ModelViewSet):
    # authentication_classes = [authentication.JWTAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    queryset = m.Notification.objects.all()
    serializer_class = s.NotificationSerializer

    @swagger_auto_schema(operation_description="Get a list of notifications for user pk", tags=['Notification'])
    def retrieve(self, request, pk=None):
        notifications = list(m.ChatNotification.objects.filter(user__id=pk)) + list(m.QuoteNotification.objects.filter(user__id=pk))
        serializer = s.NotificationSerializer(notifications, many=True)
        return Response({"count": len(notifications), "notifications": serializer.data})


class AvailabilityViewSet(viewsets.ViewSet):
    queryset = a.EmployeeAvailability.objects.all()
    serializer_class = s.EmployeeAvailabilitySerializer

    @swagger_auto_schema(operation_description="Get the availability of a given employee", tags=['Availability'], responses={200: s.AvailabileSlotsSerializzer})
    def list(self, request, employee=None):
        if employee:
            queryset = a.EmployeeAvailability.objects.filter(employee=employee)
        else:
            queryset = a.EmployeeAvailability.objects.filter(employee=request.user)
        serializer = s.AvailabileSlotsSerializzer(queryset, many=True)
        return Response(serializer.data)


class ShopAvailabilityViewSet(viewsets.ViewSet):
    queryset = a.EmployeeAvailability.objects.all()
    serializer_class = s.EmployeeAvailabilitySerializer

    def get_queryset(self, request, owner=None):
        if owner:
            employee_set = m.Shop.objects.filter(owner=owner).first().employees.all()
            queryset = a.EmployeeAvailability.objects.filter(employee__in=employee_set)
        return queryset
    
    def list(self, request, owner=None):
        shop = get_object_or_404(m.Shop, owner=owner)
        employee_set = shop.employees.all()
        print(shop, employee_set)
        res = []
        for e in employee_set:
            queryset = a.EmployeeAvailability.objects.filter(employee=e.user.id)
            serializer = s.EmployeeAvailabilitySerializer(queryset, many=True)
            # serializer.data['employee'] = {'id': e.user.id, 'username': e.user.username}
            data = serializer.data
            res.append({'employee': {'id': e.user.id, 'username': e.user.username,
                                     'first_name': e.user.first_name, 'last_name': e.user.last_name}, 'availability': data})
        print(res)
        return Response(res)

        

class EmployeeAvailabilityViewSet(viewsets.ViewSet):
    # authentication_classes = [authentication.JWTAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    queryset = a.EmployeeAvailability.objects.all()
    serializer_class = s.EmployeeAvailabilitySerializer

    def get_queryset(self, employee=None):
        employee = employee if employee else self.request.user
        queryset = a.EmployeeAvailability.objects.filter(employee=employee)
        return queryset
    
    @swagger_auto_schema(operation_description="Get the availability of a given employee", tags=['Availability'], responses={200: s.EmployeeAvailabilitySerializer})
    def retrieve(self, request, employee=None, pk=None):
        queryset = self.get_queryset(employee)
        availability = get_object_or_404(queryset, pk=pk)
        serializer = s.EmployeeAvailabilitySerializer(availability)
        return Response(serializer.data)

    @swagger_auto_schema(operation_description="Create or update the availability of a given employee", tags=['Availability'], request_body=s.EmployeeAvailabilitySerializer, responses={200: s.EmployeeAvailabilitySerializer})
    def create(self, request, employee=None):
        employee = get_object_or_404(Employee, user__id=employee) if employee else request.user
        serializer = s.EmployeeAvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors)

    @swagger_auto_schema(operation_description="Update the availability of a given employee", tags=['Availability'], request_body=s.EmployeeAvailabilitySerializer, responses={200: s.EmployeeAvailabilitySerializer})
    def update(self, request, employee=None, pk=None):
        employee = get_object_or_404(Employee, user__id=employee) if employee else request.user
        queryset = self.get_queryset(employee)
        availability = get_object_or_404(queryset, employee=employee, pk=pk)
        serializer = s.EmployeeAvailabilitySerializer(instance=availability, data=request.data, partial=True)
        # data = s.EmployeeAvailabilitySerializer(serializer).data
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            print(f'Updated availability: {request.data}')
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors)
        
    @swagger_auto_schema(operation_description="Delete the availability of a given employee", tags=['Availability'])
    def destroy(self, request, employee=None, pk=None):
        queryset = self.get_queryset(employee)
        availability = get_object_or_404(queryset, pk=pk)
        availability.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
        
    @swagger_auto_schema(operation_description="List all availability schedules for a given user", tags=['Availability'], responses={200: s.EmployeeAvailabilitySerializer})
    def list(self, request, employee=None):
        queryset = self.get_queryset(employee)
        serializer = s.EmployeeAvailabilitySerializer(queryset, many=True)
        return Response(serializer.data)


class EmployeeReservationViewSet(viewsets.ViewSet):
    # authentication_classes = [authentication.JWTAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    queryset = a.EmployeeReservation.objects.all()
    serializer_class = s.EmployeeReservationSerializer
    
    
    def get_queryset(self, request, pk=None):
        if pk:
            queryset = a.EmployeeReservation.objects.filter(schedule=pk)
        else:
            queryset = a.EmployeeReservation.objects.filter(schedule=request.user)
        return queryset
    

    @swagger_auto_schema(operation_description="Get the reservations of a given employee",tags=['Reservations'], responses={200: s.EmployeeReservationSerializer})
    def retrieve(self, request, employee=None, pk=None):
        queryset = self.get_queryset(request, employee)
        print(queryset, employee, pk)
        reservations = get_object_or_404(queryset, id=pk)
        print(reservations)
        serializer = s.EmployeeReservationSerializer(reservations)
        return Response(serializer.data)

    @swagger_auto_schema(operation_description="Create or update the reservations of a given employee", tags=['Reservations'],request_body=s.EmployeeReservationCreateSerializer, responses={200: s.EmployeeReservationSerializer})
    def create(self, request, employee=None):
        # schedule = get_object_or_404(a.EmployeeAvailability, employee=employee) if employee else request.user
        data = request.data
        # data.update({'schedule': employee})
        serializer = s.EmployeeReservationCreateSerializer(
            data=data, context={'employee': employee})
        if serializer.is_valid():
            # Update the availability
            try:
                obj = serializer.save()
                obj.clean()
                avail = get_object_or_404(a.EmployeeAvailability, employee=employee)
                # availability = a.EmployeeAvailability.objects.get(employee=employee)
                print(f'Updating availability for {avail}')
                duration = datetime.strptime(request.data['duration'], '%H:%M:%S')
                delta = timedelta(hours=duration.hour, minutes=duration.minute, seconds=duration.second)
                start_time = datetime.fromisoformat(request.data['time'][:-1])
                end_time = datetime.fromisoformat(request.data['time'][:-1]) + max(delta, timedelta(days=30))
                # # print(f'Updating availability from {start_time} to {end_time}')
                # s.remake_occurrences(avail)
                avail.recreate_occurrences(start=s.d_to_dt(start_time, tz='Canada/Eastern'), end=s.d_to_dt(end_time, tz='Canada/Eastern')) 
            except Exception as e:
                print(e)
                raise ValueError({'error': 'Could not update availability'})
            
            return Response({"success": f'Created reservation for {employee}'})
            
        else:
            return Response(serializer.errors)

    @swagger_auto_schema(operation_description="Update the reservations of a given employee", tags=['Reservations'],request_body=s.EmployeeReservationSerializer, responses={200: s.EmployeeReservationSerializer})
    def update(self, request, employee=None, pk=None):
        queryset = self.get_queryset(request, employee)
        reservation = get_object_or_404(queryset, pk=pk)
        serializer = s.EmployeeReservationSerializer(
            reservation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors)

    @swagger_auto_schema(operation_description="Delete the reservations of a given employee",tags=['Reservations'])
    def destroy(self, request, employee=None, pk=None):
        queryset = self.get_queryset(request, employee)
        reservations = get_object_or_404(queryset, pk=pk)
        reservations.delete()
        return Response({"success": f"Reservation {pk} deleted successfully"})

    # @swagger_auto_schema(operation_description="List all availability schedules for a given user", tags=['Availability'], responses={200: s.EmployeeAvailabilitySerializer})
    # def list(self, request, employee=None):
    #     queryset = self.get_queryset(employee)
    #     serializer = s.EmployeeAvailabilitySerializer(queryset, many=True)
    #     return Response(serializer.data)
    @swagger_auto_schema(operation_description="List the reservations of a given employee", tags=['Reservations'], responses={200: s.EmployeeReservationSerializer})
    def list(self, request, employee=None):
        queryset = self.get_queryset(request, employee)
        serializer = s.EmployeeReservationSerializer(queryset, many=True)
        res = serializer.data
        return Response(res)

class ReservationSpanViewSet(viewsets.ViewSet):
    @swagger_auto_schema(operation_description="List the reservations of a given employee", tags=['Reservations'], responses={200: s.EmployeeReservationSerializer})
    def list(self, request, employee=None):
        if employee:
            queryset = a.EmployeeReservation.objects.filter(schedule=employee)
        else:
            queryset = a.EmployeeReservation.objects.filter(schedule=request.user)
        output = []
        for q in queryset:
            serializer = s.EmployeeReservationSerializer(q)
            duration = datetime.strptime(serializer.data['duration'], '%H:%M:%S')
            delta = timedelta(hours=duration.hour, minutes=duration.minute, seconds=duration.second)
            try:
                start = datetime.strptime(serializer.data['time'],'%Y-%m-%dT%H:%M:%S.%fZ')
            except ValueError:
                start = datetime.strptime(serializer.data['time'],'%Y-%m-%dT%H:%M:%SZ')
                
            end = start + delta 
            start = tz.localize(start).astimezone(pytz.utc)
            end = tz.localize(end).astimezone(pytz.utc)
            time_slot = {
                'start': start,
                'end': end, 
                'title': f'Reserved',
                'employee': serializer.data['schedule'],
            }
            output.append(time_slot)

        
        return Response(output)
