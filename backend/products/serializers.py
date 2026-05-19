from rest_framework import serializers
from products.models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'created_at')

    def validate_name(self, value):
        name_stripped = value.strip()
        if not name_stripped:
            raise serializers.ValidationError("Category name cannot be empty.")
        
        # Check duplicate category name (case-insensitive)
        queryset = Category.objects.filter(name__iexact=name_stripped)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("A category with this name already exists.")
        return name_stripped


class HybridImageField(serializers.Field):
    """
    Custom Hybrid Serializer Field to support both direct file uploads
    (e.g. multipart form files) and raw URL strings in the same attribute.
    """
    def to_internal_value(self, data):
        # If it is a string (e.g. an existing Cloudinary URL), return it directly
        if isinstance(data, str):
            return data
        
        # If it is a file upload, use DRF's built-in ImageField to validate
        file_validator = serializers.ImageField(allow_empty_file=False)
        return file_validator.to_internal_value(data)

    def to_representation(self, value):
        # Returns the stored URL string directly
        return value


class ProductSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, required=False, default=0.00)
    image = HybridImageField(required=False, allow_null=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True
    )
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'category_name', 'name', 'slug', 'description', 'price',
            'sku', 'stock', 'is_available', 'image', 'rating',
            'created_at', 'updated_at'
        )

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price must be a positive number.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock count cannot be negative.")
        return value

    def validate_description(self, value):
        if value and len(value) > 2000:
            raise serializers.ValidationError("Description is too long. Please keep it under 2000 characters.")
        return value
