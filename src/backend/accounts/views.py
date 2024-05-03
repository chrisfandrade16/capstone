from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt import authentication

from .models import Profile, Employee
from . import serializers as s 
from drf_yasg.utils import swagger_auto_schema
from django.contrib.auth import get_user_model

import djoser.views
from  djoser.utils import decode_uid
from djoser import email
from djoser.serializers import UidAndTokenSerializer
from rest_framework.decorators import action
from templated_mail.mail import BaseEmailMessage
from shop.models import Shop
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

Users = get_user_model()
roleChoice = dict(zip('ceo', ['customer', 'employee', 'shopowner']))
roleSerializers = dict(zip(['customer', 'employee', 'shopowner'], [s.CustomerSerializer, s.EmployeeSerializer, s.ShopOwnerSerializer]))
roleCreateSerializers = dict(zip(['customer', 'employee', 'shopowner'], [s.CustomerCreateSerializer, s.EmployeeCreateSerializer, s.ShopOwnerCreateSerializer]))


class SingleProfileView(APIView):
    """
    Returns the profile details of an account
    """
    authentication_classes = [authentication.JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(tags=['Profile'])
    def get(self, request, pk):
        if (pk == "me"):
            profile = Profile.objects.get(user=request.user)
        else:
            profile = Profile.objects.get(user=pk)
        data = s.ProfileDetailSerializer(profile).data
        return Response({'profile': data})

    @swagger_auto_schema(operation_description="Update a profile", request_body=s.ProfileUpdateSerializer, tags=['Profile'])
    def put(self, request, pk):
        try:
            profile = Profile.objects.get(user=pk)
        except Profile.DoesNotExist:
            return Response({"failure": "The profile does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        profile_data = request.data
        profile_serializer = s.ProfileUpdateSerializer(
            instance=profile, data=profile_data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
            return Response({"success": "Profile '{}' updated successfully".format(profile.user.username)})
        return Response({"failure": profile_serializer.errors})
    

class EmployeesView(APIView):
    @swagger_auto_schema(operation_description="Get a shop's employee accounts", tags=['Profile'])
    def get(self, request, id):
        try:
            users = []
            employees = Shop.objects.get(id=id).employees.all()
            for employee in employees:
                user = employee.user
                users.append({
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phone": employee.phone,
                    "salary": employee.salary
                })
            return Response({"success": {"employees": users}}, status=status.HTTP_200_OK)
        except Shop.DoesNotExist:
            return Response({"failure": "The shop does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
    @swagger_auto_schema(operation_description="Activate an employee account", tags=['Profile'])
    def post(self, request, id):
        username = request.data["username"]
        try:
            user = Users.objects.get(username=username)
            return Response({"failure": "The username is already taken"}, status=status.HTTP_409_CONFLICT)
        except Users.DoesNotExist:
            try:
                user_id = decode_uid(id)
                user = Users.objects.get(pk=user_id)
                employee = Employee.objects.get(user=user_id)
            except Users.DoesNotExist or Employee.DoesNotExist:
                return Response({"failure": "The employee account does not exist"}, status=status.HTTP_400_BAD_REQUEST)
    
            user_data = request.data
            updated_user = s.UserUpdateSerializer(
                instance=user, data=user_data, partial=True)
            employee_data = {
                'phone': request.data["phone"],
            }
            updated_employee = s.EmployeeUpdateSerializer(
                instance=employee, data=employee_data, partial=True)
            
            if not updated_user.is_valid():
                return Response({"failure": updated_user.errors}, status=status.HTTP_400_BAD_REQUEST)

            if not updated_employee.is_valid():
                return Response({"failure": updated_employee.errors}, status=status.HTTP_400_BAD_REQUEST)

            updated_user.save()
            updated_employee.save()

            return Response({"success": "Employee account '{}' activated successfully".format(username)}, status=status.HTTP_200_OK)
        
    @swagger_auto_schema(operation_description="Update an employee account", tags=['Profile'])
    def put(self, request, id):
        try:
            user = Users.objects.get(pk=id)
            employee = Employee.objects.get(user=id)
        except Users.DoesNotExist or Employee.DoesNotExist:
            return Response({"failure": "The employee account does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        username = request.data["username"]

        if username != user.username:
            try:
                other_existing_user = Users.objects.get(username=username)
                return Response({"failure": "The username is already taken"}, status=status.HTTP_409_CONFLICT)
            except Users.DoesNotExist:
                pass
        
        user_data = request.data
        updated_user = s.UserUpdateSerializer(
            instance=user, data=user_data, partial=True)
        employee_data = {
            'phone': request.data["phone"],
            'salary': request.data["salary"]
        }
        updated_employee = s.EmployeeUpdateSerializer(
            instance=employee, data=employee_data, partial=True)
        
        if not updated_user.is_valid():
            print("user serializer not valid")
            return Response({"failure": updated_user.errors}, status=status.HTTP_400_BAD_REQUEST)

        if not updated_employee.is_valid():
            print("employee serializer not valid")
            return Response({"failure": updated_employee.errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_user.save()
        updated_employee.save()

        return Response({"success": "Employee account '{}' updated successfully".format(username)}, status=status.HTTP_200_OK)

    @swagger_auto_schema(operation_description="Delete an employee account", tags=['Profile'])
    def delete(self, request, id):
        try:
            user = Users.objects.get(pk=id)
        except Users.DoesNotExist:
            return Response({"failure": "The employee account does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        username = user.username
        user.delete()

        return Response({"success": "Employee account '{}' deleted successfully".format(username)}, status=status.HTTP_200_OK)

class RegisterView(APIView):
    """
    registers account and profile
    """

    @swagger_auto_schema(operation_description="Register an account", tags=['Profile'])
    def post(self, request):
        profile_data = request.data
        username = profile_data["username"].lower()
        try:
            # user already exists
            user = Users.objects.get(username=username)
            return Response({"detail": f"The username '{username}' already exist", "type": "USERNAME_EXISTS"}, status=status.HTTP_409_CONFLICT)
        except Users.DoesNotExist:
            # register new User
            # TODO: more comprehensive server-side input check
            email = profile_data["email"]
            password = profile_data["password"]
            first_name = profile_data["first_name"]
            last_name = profile_data["last_name"]

            if profile_data['role'] == "e":
                password = Users.objects.make_random_password()
            else:
                try:
                    validate_password(password)
                except ValidationError as e:
                    return Response({"detail": f"The password '{username}' is not of valid format", "type": "INSUFFICIENT_PASSWORD"}, status=status.HTTP_406_NOT_ACCEPTABLE)

            user = Users.objects.create_user(username, email=email, password=password,
                                             first_name=first_name, last_name=last_name, role=roleChoice[profile_data['role']])
            print("completed user creation")
            profile_data['user'] = user.id
            profile_serializer = roleCreateSerializers[roleChoice[profile_data['role']]](data=profile_data)
            
            if profile_serializer.is_valid():
                user.save()
                # save profile
                profile_serializer.save()
                
                try:
                    if profile_data['role'] != "e":
                        BaseEmailMessage(
                            template_name="email/welcome.html", context={'user': user}).send([email])
                except Exception as e:
                    print(e)
                    user.delete()
                    print("email server Error!")
                    
                    return Response({"detail": "Email server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return Response({"success": "Registration success", "username": user.username, "userid": user.id})

            else:
                user.delete()
                print("profile info is NOT valid")
                return Response({"detail": profile_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


# Validates token and uid validity for reset password page rendering
class PasswordResetValidation(djoser.views.UserViewSet):
    permission_classes = djoser.views.settings.PERMISSIONS.password_reset_confirm
    serializer_class = UidAndTokenSerializer

    @action(["post"], detail=False)
    def validate_reset_password(self, request, *args, **kwargs):

        serializer = self.serializer_class(
            data=request.data, context={'request': request, 'view': self})

        if serializer.is_valid(raise_exception=False):
            print("good uid + token")
            return Response(status=status.HTTP_204_NO_CONTENT)
        print("bad uid + token")
        return Response(status=status.HTTP_400_BAD_REQUEST)

# overrides djoser reset email template
class PasswordResetEmail(email.PasswordResetEmail):
    template_name = 'email/pw_reset.html'

class InviteEmployeeEmail(email.UsernameResetEmail):
    template_name = 'email/activate_employee.html'
