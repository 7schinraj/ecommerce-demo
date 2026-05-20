from django.urls import path
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from authentication.signup.views import SignupView
from authentication.login.views import LoginView


@method_decorator(name='post', decorator=swagger_auto_schema(
    tags=['Authentication'],
    operation_description="Refresh JWT access token using a valid refresh token."
))
class TaggedTokenRefreshView(TokenRefreshView):
    pass


@method_decorator(name='post', decorator=swagger_auto_schema(
    tags=['Authentication'],
    operation_description="Verify validity of an access token."
))
class TaggedTokenVerifyView(TokenVerifyView):
    pass


urlpatterns = [
    path('signup/', SignupView.as_view(), name='auth_signup'),
    path('login/', LoginView.as_view(), name='auth_login'),

    path('token/refresh/', TaggedTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TaggedTokenVerifyView.as_view(), name='token_verify'),
]
