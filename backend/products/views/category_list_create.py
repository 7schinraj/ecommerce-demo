from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from drf_yasg.utils import swagger_auto_schema
from products.serializers import CategorySerializer
from products.services.category import CategoryService
from products.schemas import CATEGORY_LIST_SCHEMA, CATEGORY_CREATE_SCHEMA


class CategoryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(**CATEGORY_LIST_SCHEMA)
    def get(self, request):
        try:
            queryset = CategoryService.list_categories()
            serializer = CategorySerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            raise e
        except Exception as e:
            raise ValidationError(f"Failed to retrieve categories: {str(e)}")

    @swagger_auto_schema(**CATEGORY_CREATE_SCHEMA)
    def post(self, request):
        try:
            serializer = CategorySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            category = CategoryService.create_category(serializer.validated_data)
            
            output_serializer = CategorySerializer(category)
            response_data = output_serializer.data
            response_data['message'] = "Category created successfully."
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            raise e
        except Exception as e:
            raise ValidationError(f"Failed to create category: {str(e)}")
