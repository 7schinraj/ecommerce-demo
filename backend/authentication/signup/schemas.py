from drf_yasg import openapi
from authentication.signup.serializers import SignupSerializer


SIGNUP_SWAGGER_SCHEMA = {
    "tags": ["Authentication"],
    "operation_description": "Registers a new user account with unique username and email. Returns JWT tokens upon success.",
    "request_body": SignupSerializer,
    "responses": {
        201: openapi.Response(
            description="Account registered successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Account registered successfully.",
                    "data": {
                        "tokens": {
                            "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        },
                        "user": {
                            "id": 1,
                            "username": "Chinraj",
                            "email": "chinraj1438@gmail.com"
                        }
                    },
                    "errors": None
                }
            }
        ),
        400: openapi.Response(
            description="Validation Error (e.g. Account Already Exists)",
            examples={
                "application/json": {
                    "success": False,
                    "message": "Account already exists",
                    "data": None,
                    "errors": {
                        "non_field_errors": [
                            "Account already exists"
                        ]
                    }
                }
            }
        )
    }
}
