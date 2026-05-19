from rest_framework.exceptions import ValidationError
from products.models import Product
from products.filters import ProductFilter
from core.services.cloudinary import CloudinaryService


class ProductService:
    """
    Enterprise Business Logic Service Layer for Product operations.
    Acts as the single source of truth for all Product domain manipulations,
    completely isolating DB actions from the HTTP View layers.
    """

    @staticmethod
    def list_products(filter_params):
        """
        Retrieves products list based on incoming query params and sorting configurations.
        """
        queryset = Product.objects.all()
        # Apply custom django-filter logic dynamically
        product_filter = ProductFilter(filter_params, queryset=queryset)
        if product_filter.is_valid():
            return product_filter.qs
        return queryset

    @staticmethod
    def get_product(product_id):
        """
        Retrieves a single product by primary key ID or raises a custom validation error.
        """
        try:
            return Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            raise ValidationError(f"Product with ID {product_id} does not exist.")

    @staticmethod
    def create_product(validated_data):
        """
        Creates a new product in the database. Performs custom duplicate SKU verification.
        Uses global CloudinaryService to upload image files to Cloudinary.
        """
        sku = validated_data.get('sku')
        if Product.objects.filter(sku=sku).exists():
            raise ValidationError({"sku": ["Product with this SKU already exists."]})

        # Intercept and upload image to Cloudinary if it is an uploaded file object
        image_data = validated_data.get('image')
        if image_data and not isinstance(image_data, str):
            secure_url = CloudinaryService.upload_image(image_data)
            validated_data['image'] = secure_url

        product = Product(**validated_data)
        product.save()
        return product

    @staticmethod
    def update_product(product_id, validated_data):
        """
        Updates an existing product in the database. 
        Re-slugifies the product automatically if its name is altered.
        Uses global CloudinaryService to upload new image files to Cloudinary.
        """
        product = ProductService.get_product(product_id)

        # Enforce SKU uniqueness if modified
        sku = validated_data.get('sku')
        if sku and sku != product.sku:
            if Product.objects.filter(sku=sku).exists():
                raise ValidationError({"sku": ["Product with this SKU already exists."]})

        # If name is altered, clear slug to trigger unique auto-slugify in save()
        name = validated_data.get('name')
        if name and name != product.name:
            product.slug = ""

        # Intercept and upload image to Cloudinary if it is a new uploaded file object
        image_data = validated_data.get('image')
        if image_data and not isinstance(image_data, str):
            secure_url = CloudinaryService.upload_image(image_data)
            validated_data['image'] = secure_url

        # Update fields dynamically
        for field, value in validated_data.items():
            setattr(product, field, value)

        product.save()
        return product

    @staticmethod
    def delete_product(product_id):
        """
        Deletes a product by ID.
        """
        product = ProductService.get_product(product_id)
        product.delete()
        return True
