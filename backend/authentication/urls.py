from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from authentication.signup.views import SignupView
from authentication.login.views import LoginView


urlpatterns = [
    # Custom authentication endpoints
    path('signup/', SignupView.as_view(), name='auth_signup'),
    path('login/', LoginView.as_view(), name='auth_login'),

    # Standard built-in SimpleJWT endpoints
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
