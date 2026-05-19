from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError
from drf_yasg.utils import swagger_auto_schema
from products.serializers import ProductSerializer
from products.services.product import ProductService
from products.schemas import PRODUCT_LIST_SCHEMA, PRODUCT_CREATE_SCHEMA


class ProductPagination(PageNumberPagination):
    """
    Standard page-based paginator for Products listings.
    Supports dynamic page sizes: 10, 20, 50, 100.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_page_size(self, request):
        if self.page_size_query_param:
            try:
                val = int(request.query_params[self.page_size_query_param])
                if 0 < val <= self.max_page_size:
                    return val
            except (KeyError, ValueError):
                pass
        return self.page_size


class ProductListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(**PRODUCT_LIST_SCHEMA)
    def get(self, request):
        try:
            # 1. Fetch filtered queryset from service layer
            queryset = ProductService.list_products(request.query_params)

            # 2. Paginate queryset
            paginator = ProductPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request)

            # 3. Serialize list
            serializer = ProductSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        except ValidationError as e:
            # Propagation of validation errors
            raise e
        except Exception as e:
            # Elegant wrapper for unexpected exceptions
            raise ValidationError(f"Failed to retrieve products: {str(e)}")

    @swagger_auto_schema(**PRODUCT_CREATE_SCHEMA)
    def post(self, request):
        try:
            # 1. Validate incoming payload
            serializer = ProductSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # 2. Create product via service
            product = ProductService.create_product(serializer.validated_data)

            # 3. Serialize product and output
            output_serializer = ProductSerializer(product)
            response_data = output_serializer.data
            response_data['message'] = "Product created successfully."

            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except ValidationError as e:
            # Propagation of validation errors
            raise e
        except Exception as e:
            # Elegant wrapper for unexpected exceptions
            raise ValidationError(f"Failed to create product: {str(e)}")
