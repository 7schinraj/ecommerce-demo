from django.urls import path
from products.views.list_create import ProductListCreateView
from products.views.detail import ProductDetailView
from products.views.category_list_create import CategoryListCreateView
from products.views.category_detail import CategoryDetailView


urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category_list_create'),
    path('categories/<uuid:pk>/', CategoryDetailView.as_view(), name='category_detail'),
    path('', ProductListCreateView.as_view(), name='product_list_create'),
    path('<uuid:pk>/', ProductDetailView.as_view(), name='product_detail'),
]
