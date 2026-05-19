from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from authentication.models import CustomUser


class SignupSerializer(serializers.ModelSerializer):
    """
    Serializer to handle user registration with username, email, password, and role.
    Hashes passwords securely and performs case-insensitive normalization on email and role.
    """
    username = serializers.CharField(
        required=True,
        help_text="Enter a unique username for your account (e.g. john_doe)"
    )
    email = serializers.EmailField(
        required=True,
        help_text="Enter a valid email address (e.g. chinraj1438@gmail.com)"
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        min_length=6,
        help_text="Enter a secure password (minimum 6 characters)"
    )
    role = serializers.CharField(
        required=False,
        default='customer',
        help_text="Enter user role: customer or admin (case-insensitive)"
    )

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'role')
        extra_kwargs = {
            'username': {
                'validators': []  # Removes Django's default UniqueValidator for username
            },
            'email': {
                'validators': []  # Removes Django's default UniqueValidator for email
            }
        }

    def validate(self, attrs):
        # 1. Normalize email to lowercase
        email = attrs.get('email')
        if email:
            attrs['email'] = email.strip().lower()

        # 2. Normalize and validate role to lowercase
        role = attrs.get('role', 'customer')
        if role:
            normalized_role = role.strip().lower()
            if normalized_role not in ['customer', 'admin']:
                raise serializers.ValidationError({"role": ["Role must be either 'customer' or 'admin'."]})
            attrs['role'] = normalized_role
        else:
            attrs['role'] = 'customer'

        username = attrs.get('username')
        
        # Verify account uniqueness using normalized email
        if CustomUser.objects.filter(username=username).exists() or CustomUser.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("Account already exists")

        return attrs

    def create(self, validated_data):
        # Create CustomUser with hashed password and normalized role/email
        return CustomUser.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data['role'],
            password=make_password(validated_data['password'])
        )
