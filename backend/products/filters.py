from django.db import models
import django_filters
from products.models import Product


class ProductFilter(django_filters.FilterSet):
    q = django_filters.CharFilter(method='filter_search', label="Search by name or description")
    category = django_filters.CharFilter(method='filter_category', label="Category ID(s)")
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte', label="Minimum price")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte', label="Maximum price")
    min_rating = django_filters.NumberFilter(field_name="rating", lookup_expr='gte', label="Minimum rating")
    is_available = django_filters.BooleanFilter(field_name="is_available", label="Availability status")
    sort_by = django_filters.CharFilter(method='filter_sort', label="Sort by field")

    class Meta:
        model = Product
        fields = ['category', 'min_price', 'max_price', 'min_rating', 'is_available']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(models.Q(name__icontains=value) | models.Q(description__icontains=value))

    def filter_category(self, queryset, name, value):
        if not value:
            return queryset
        import uuid
        category_ids = []
        for val in value.split(','):
            val_stripped = val.strip()
            try:
                uuid.UUID(val_stripped)
                category_ids.append(val_stripped)
            except ValueError:
                pass
        if not category_ids:
            return queryset.none()
        return queryset.filter(category_id__in=category_ids)

    def filter_sort(self, queryset, name, value):
        ordering_map = {
            'price_asc': 'price',
            'price_desc': '-price',
            'newest': '-created_at',
            'rating': '-rating'
        }
        
        db_sort = ordering_map.get(value)
        if db_sort:
            return queryset.order_by(db_sort)
        
        return queryset
