from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from backend.views import RootStatusView


# Setup dynamic Swagger schema documentation with JWT header support
schema_view = get_schema_view(
   openapi.Info(
      title="Superlaps API Documentation",
      default_version='v1',
      description=(
          "Comprehensive API documentation for the Superlaps Ecommerce Platform.\n\n"
          "To test authenticated endpoints: Click 'Authorize' button below, type `Bearer <your_jwt_token>`, and click Authorize."
      ),
      contact=openapi.Contact(email="admin@superlaps.local"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Standard Admin Site
    path('admin/', admin.site.urls),

    # Health Check Status View (Checks server & PostgreSQL)
    path('', RootStatusView.as_view(), name='api_status'),

    # Modular Authentication URLs
    path('api/auth/', include('authentication.urls')),

    # Enterprise Products APIs
    path('api/v1/products/', include('products.urls')),

    # Interactive Swagger Documentation URLs
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui-docs'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
