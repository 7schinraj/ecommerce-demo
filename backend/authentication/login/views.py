from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from authentication.models import CustomUser
from authentication.login.serializers import LoginSerializer
from authentication.login.schemas import LOGIN_SWAGGER_SCHEMA


class LoginView(APIView):
    """
    API View to authenticate a user using email and password.
    Returns custom validation errors for non-existent accounts and wrong passwords.
    Integrates email case-normalization seamlessly.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(**LOGIN_SWAGGER_SCHEMA)
    def post(self, request):
        try:
            # Enforce serializer validation for clean Swagger schema integration and email normalization
            serializer = LoginSerializer(data=request.data)
            if not serializer.is_valid():
                # Format serializer errors to a clean user-understandable ValidationError
                first_err_key = list(serializer.errors.keys())[0]
                first_err_val = serializer.errors[first_err_key][0]
                raise ValidationError(f"{first_err_key.capitalize()}: {first_err_val}")

            email = serializer.validated_data.get('email')
            password = serializer.validated_data.get('password')

            # 1. Check if user account exists in database (using case-normalized email)
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                raise ValidationError("Account doesn't exists. please register.")

            # 2. Validate password
            if not user.check_password(password):
                raise ValidationError("Invalid password. please try again.")

            # 3. Generate SimpleJWT access and refresh tokens
            refresh = RefreshToken.for_user(user)

            response_data = {
                "message": "Login successful.",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,  # Return the user's role on successful login
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            # Let DRF handle and envelop validation exceptions
            raise e
        except Exception as e:
            # Wrap unexpected server issues inside a clean validation envelope
            raise ValidationError(str(e))
