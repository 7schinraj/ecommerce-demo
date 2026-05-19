from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from drf_yasg.utils import swagger_auto_schema
from products.serializers import ProductSerializer
from products.services.product import ProductService
from products.schemas import (
    PRODUCT_DETAIL_SCHEMA, PRODUCT_UPDATE_SCHEMA, PRODUCT_DELETE_SCHEMA
)


class ProductDetailView(APIView):

    permission_classes = [AllowAny]

    @swagger_auto_schema(**PRODUCT_DETAIL_SCHEMA)
    def get(self, request, pk):
        try:
            # 1. Fetch product from service layer
            product = ProductService.get_product(pk)

            # 2. Serialize and return data
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            # Propagation of validation errors
            raise e
        except Exception as e:
            # Elegant wrapper for unexpected exceptions
            raise ValidationError(f"Failed to retrieve product details: {str(e)}")

    @swagger_auto_schema(**PRODUCT_UPDATE_SCHEMA)
    def put(self, request, pk):
        try:
            # 1. Fetch existing product
            product = ProductService.get_product(pk)

            # 2. Parse and validate complete update payload
            serializer = ProductSerializer(product, data=request.data)
            serializer.is_valid(raise_exception=True)

            # 3. Delegate update execution to service layer
            updated_product = ProductService.update_product(pk, serializer.validated_data)

            # 4. Serialize updated data
            output_serializer = ProductSerializer(updated_product)
            response_data = output_serializer.data
            response_data['message'] = "Product updated successfully."

            return Response(response_data, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            # Propagation of validation errors
            raise e
        except Exception as e:
            # Elegant wrapper for unexpected exceptions
            raise ValidationError(f"Failed to update product: {str(e)}")

    @swagger_auto_schema(**PRODUCT_UPDATE_SCHEMA)
    def patch(self, request, pk):
        try:
            # 1. Fetch existing product
            product = ProductService.get_product(pk)

            # 2. Parse and validate partial update payload (partial=True)
            serializer = ProductSerializer(product, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            # 3. Delegate update execution to service layer
            updated_product = ProductService.update_product(pk, serializer.validated_data)

            # 4. Serialize updated data
            output_serializer = ProductSerializer(updated_product)
            response_data = output_serializer.data
            response_data['message'] = "Product updated successfully."

            return Response(response_data, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            # Propagation of validation errors
            raise e
        except Exception as e:
            # Elegant wrapper for unexpected exceptions
            raise ValidationError(f"Failed to update product: {str(e)}")

    @swagger_auto_schema(**PRODUCT_DELETE_SCHEMA)
    def delete(self, request, pk):
        try:
            # 1. Delegate deletion execution to service layer
            ProductService.delete_product(pk)

            # 2. Return standard enveloped success response
            return Response({
                "message": "Product deleted successfully."
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            # Propagation of validation errors
            raise e
        except Exception as e:
            # Elegant wrapper for unexpected exceptions
            raise ValidationError(f"Failed to delete product: {str(e)}")
