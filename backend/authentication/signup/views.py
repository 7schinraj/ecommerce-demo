from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from authentication.signup.serializers import SignupSerializer
from authentication.signup.schemas import SIGNUP_SWAGGER_SCHEMA


class SignupView(APIView):

    permission_classes = [AllowAny]

    @swagger_auto_schema(**SIGNUP_SWAGGER_SCHEMA)
    def post(self, request):
        try:
            serializer = SignupSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            response_data = {
                "message": "Account registered successfully.",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                }
            }

            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except ValidationError as e:
            raise e
        except Exception as e:
            raise ValidationError(f"Failed to register account: {str(e)}")
