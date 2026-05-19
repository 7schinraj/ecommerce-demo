from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from drf_yasg.utils import swagger_auto_schema
from products.serializers import CategorySerializer
from products.services.category import CategoryService
from products.schemas import CATEGORY_DETAIL_SCHEMA, CATEGORY_UPDATE_SCHEMA, CATEGORY_DELETE_SCHEMA


class CategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(**CATEGORY_DETAIL_SCHEMA)
    def get(self, request, pk):
        try:
            category = CategoryService.get_category(pk)
            serializer = CategorySerializer(category)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            raise e
        except Exception as e:
            raise ValidationError(f"Failed to retrieve category details: {str(e)}")

    @swagger_auto_schema(**CATEGORY_UPDATE_SCHEMA)
    def put(self, request, pk):
        try:
            category = CategoryService.get_category(pk)
            serializer = CategorySerializer(category, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            
            updated_category = CategoryService.update_category(pk, serializer.validated_data)
            
            output_serializer = CategorySerializer(updated_category)
            response_data = output_serializer.data
            response_data['message'] = "Category updated successfully."
            
            return Response(response_data, status=status.HTTP_200_OK)
        except ValidationError as e:
            raise e
        except Exception as e:
            raise ValidationError(f"Failed to update category: {str(e)}")

    @swagger_auto_schema(**CATEGORY_DELETE_SCHEMA)
    def delete(self, request, pk):
        try:
            CategoryService.delete_category(pk)
            return Response({
                "success": True,
                "message": "Category deleted successfully.",
                "data": None,
                "errors": None
            }, status=status.HTTP_200_OK)
        except ValidationError as e:
            raise e
        except Exception as e:
            raise ValidationError(f"Failed to delete category: {str(e)}")
