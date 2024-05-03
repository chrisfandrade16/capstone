from rest_framework import serializers
from .models import Customer, Employee, ShopOwner, Profile
from django.contrib.auth import get_user_model
from djoser.serializers import SendEmailResetSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'role')

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'first_name', 'last_name')

    def update(self, instance, validated_data):
        if "email" in validated_data:
            instance.email = validated_data["email"]
        if "username" in validated_data:
            instance.username = validated_data["username"]
        if "password" in validated_data:
            instance.set_password(validated_data["password"])
        if "first_name" in validated_data:
            instance.first_name = validated_data["first_name"]
        if "last_name" in validated_data:
            instance.last_name = validated_data["last_name"]
        instance.save()
        return instance


class ProfileDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ('user', 'phone', 'address')


class ProfileBaseSerializer(serializers.ModelSerializer):
    user = serializers.IntegerField(source='user.id')
    class Meta:
        model = Profile
        fields = ('user', 'phone', 'address')


class ProfileBaseSerializer(serializers.ModelSerializer):
    user = serializers.IntegerField(source='user.id')
    class Meta:
        model = Profile
        fields = ('user', 'phone', 'address')
    def create(self, validated_data):
        user_data = validated_data.pop('user').get('id')
        user = User.objects.get(id=user_data)
        profile = self.Meta.model.objects.create(user=user, **validated_data)
        return profile



class ProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.CharField(source='user.email')

    class Meta:
        model = Profile
        fields = ('first_name', 'last_name', 'email', 'phone', 'address')

    def update(self, instance, validated_data):
        if 'user' in validated_data:
            user = instance.user
            user_data = validated_data.pop('user')
            user.first_name = user_data.get(
                'first_name', instance.user.first_name)
            user.last_name = user_data.get(
                'last_name', instance.user.last_name)
            user.email = user_data.get('email', instance.user.email)
            user.save()
        instance.phone = validated_data.get('phone', instance.phone)
        instance.save()
        return instance


class CustomerSerializer(ProfileDetailSerializer):
    class Meta(ProfileDetailSerializer.Meta):
        model = Customer
        fields = ProfileBaseSerializer.Meta.fields #+ ('points',)
    
    
class EmployeeSerializer(ProfileDetailSerializer):
    class Meta(ProfileDetailSerializer.Meta):
        model = Employee
        fields = ProfileDetailSerializer.Meta.fields + ('salary',)

class EmployeeUpdateSerializer(ProfileDetailSerializer):
    class Meta(ProfileDetailSerializer.Meta):
        model = Employee
        fields = ('phone', 'salary')

    def update(self, instance, validated_data):
        if "phone" in validated_data:
            instance.phone = validated_data["phone"]
        if "salary" in validated_data:
            instance.salary = validated_data["salary"]
        instance.save()
        return instance
    
    

class ShopOwnerSerializer(ProfileDetailSerializer):
    class Meta(ProfileBaseSerializer.Meta):
        model = ShopOwner
        fields = ProfileDetailSerializer.Meta.fields + ('earnings',)
    
class CustomerCreateSerializer(ProfileBaseSerializer):
    class Meta(ProfileBaseSerializer.Meta):
        model = Customer
        fields = ProfileBaseSerializer.Meta.fields #+ ('points',)
    
    
class EmployeeCreateSerializer(ProfileBaseSerializer):
    class Meta(ProfileBaseSerializer.Meta):
        model = Employee
        fields = ProfileBaseSerializer.Meta.fields + ('salary',)
    
    

class ShopOwnerCreateSerializer(ProfileBaseSerializer):
    class Meta(ProfileBaseSerializer.Meta):
        model = ShopOwner
        fields = ProfileBaseSerializer.Meta.fields + ('earnings',)
