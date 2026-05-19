from django.contrib import admin
from products.models import Product, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'sku', 'price', 'stock', 'is_available', 'rating')
    list_filter = ('category', 'is_available')
    search_fields = ('name', 'sku', 'description')
    prepopulated_fields = {'slug': ('name',)}

