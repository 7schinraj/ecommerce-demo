from drf_yasg import openapi
from authentication.login.serializers import LoginSerializer


LOGIN_SWAGGER_SCHEMA = {
    "operation_description": "Authenticates user credentials. Returns JWT tokens upon successful login.",
    "request_body": LoginSerializer,
    "responses": {
        200: openapi.Response(
            description="Login successful. Returns JWT credentials.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Login successful.",
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
            description="Validation Error (Non-existent email OR Incorrect password)",
            examples={
                "application/json": {
                    "success": False,
                    "message": "Account doesn't exists. please register. (or) Invalid password. please try again.",
                    "data": None,
                    "errors": {
                        "non_field_errors": [
                            "Account doesn't exists. please register."
                        ]
                    }
                }
            }
        )
    }
}
