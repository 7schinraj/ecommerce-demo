from rest_framework.exceptions import ValidationError
from products.models import Category


class CategoryService:
    """
    Enterprise Business Logic Service Layer for Category operations.
    Isolates DB transactions and unique validations from the HTTP API views.
    """

    @staticmethod
    def list_categories():
        """
        Retrieves all categories sorted alphabetically.
        """
        return Category.objects.all().order_by('name')

    @staticmethod
    def get_category(category_id):
        """
        Retrieves a single category by primary key UUID.
        """
        try:
            return Category.objects.get(pk=category_id)
        except Category.DoesNotExist:
            raise ValidationError(f"Category with ID {category_id} does not exist.")

    @staticmethod
    def create_category(validated_data):
        """
        Creates a new category in the database. Performs case-insensitive duplicate checks.
        """
        name = validated_data.get('name', '').strip()
        if Category.objects.filter(name__iexact=name).exists():
            raise ValidationError({"name": ["Category with this name already exists."]})
        
        category = Category(name=name)
        category.save()
        return category

    @staticmethod
    def update_category(category_id, validated_data):
        """
        Updates an existing category's properties.
        """
        category = CategoryService.get_category(category_id)
        name = validated_data.get('name')
        if name:
            name = name.strip()
            if Category.objects.filter(name__iexact=name).exclude(pk=category_id).exists():
                raise ValidationError({"name": ["Category with this name already exists."]})
            category.slug = "" # Clear slug to trigger auto-re-slugify on save
            category.name = name

        category.save()
        return category

    @staticmethod
    def delete_category(category_id):
        """
        Deletes a category by primary key.
        """
        category = CategoryService.get_category(category_id)
        category.delete()
        return True
