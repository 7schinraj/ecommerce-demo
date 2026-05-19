from drf_yasg import openapi
from products.serializers import ProductSerializer


PRODUCT_LIST_SCHEMA = {
    "operation_description": "Retrieves a paginated list of products. Supports comprehensive full-text searches, price filters, availability status, minimum ratings, and sorted results.",
    "manual_parameters": [
        openapi.Parameter('q', openapi.IN_QUERY, description="Case-insensitive search query matching name or description (e.g. iphone)", type=openapi.TYPE_STRING),
        openapi.Parameter('min_price', openapi.IN_QUERY, description="Filter products costing greater than or equal to this price", type=openapi.TYPE_NUMBER),
        openapi.Parameter('max_price', openapi.IN_QUERY, description="Filter products costing less than or equal to this price", type=openapi.TYPE_NUMBER),
        openapi.Parameter('min_rating', openapi.IN_QUERY, description="Filter products rating greater than or equal to this rating (0.00 to 5.00)", type=openapi.TYPE_NUMBER),
        openapi.Parameter('is_available', openapi.IN_QUERY, description="Filter products by active availability (true/false)", type=openapi.TYPE_BOOLEAN),
        openapi.Parameter('sort_by', openapi.IN_QUERY, description="Order results by field options: 'price_asc', 'price_desc', 'newest', 'rating'", type=openapi.TYPE_STRING),
        openapi.Parameter('page', openapi.IN_QUERY, description="Page number of the paginated list", type=openapi.TYPE_INTEGER),
        openapi.Parameter('page_size', openapi.IN_QUERY, description="Number of results per page. Allowed options: 10, 20, 50, 100", type=openapi.TYPE_INTEGER),
    ],
    "responses": {
        200: openapi.Response(
            description="Products retrieved successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Operation completed successfully.",
                    "data": {
                        "count": 1,
                        "next": None,
                        "previous": None,
                        "results": [
                            {
                                "id": 1,
                                "name": "iPhone 15 Pro Max",
                                "slug": "iphone-15-pro-max",
                                "description": "Flagship titanium Apple smartphone with A17 Pro chip.",
                                "price": "1199.00",
                                "sku": "IPH15PROMAX",
                                "stock": 45,
                                "is_available": True,
                                "image": None,
                                "rating": "4.90",
                                "created_at": "2026-05-18T18:06:21Z",
                                "updated_at": "2026-05-18T18:06:21Z"
                            }
                        ]
                    },
                    "errors": None
                }
            }
        )
    }
}


PRODUCT_CREATE_SCHEMA = {
    "operation_description": "Registers a new e-commerce product. Enforces unique SKU validations and automatic slugification.",
    "request_body": ProductSerializer,
    "responses": {
        201: openapi.Response(
            description="Product created successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Product created successfully.",
                    "data": {
                        "id": 1,
                        "name": "iPhone 15 Pro Max",
                        "slug": "iphone-15-pro-max",
                        "description": "Flagship titanium Apple smartphone with A17 Pro chip.",
                        "price": "1199.00",
                        "sku": "IPH15PROMAX",
                        "stock": 45,
                        "is_available": True,
                        "image": None,
                        "rating": "4.90",
                        "created_at": "2026-05-18T18:06:21Z",
                        "updated_at": "2026-05-18T18:06:21Z"
                    },
                    "errors": None
                }
            }
        ),
        400: openapi.Response(
            description="Validation Error (e.g. Duplicate SKU, negative price/stock)",
            examples={
                "application/json": {
                    "success": False,
                    "message": "Product with this SKU already exists.",
                    "data": None,
                    "errors": {
                        "sku": [
                            "Product with this SKU already exists."
                        ]
                    }
                }
            }
        )
    }
}


PRODUCT_DETAIL_SCHEMA = {
    "operation_description": "Retrieves comprehensive information of a specific product by its database primary ID.",
    "responses": {
        200: openapi.Response(
            description="Product details retrieved successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Operation completed successfully.",
                    "data": {
                        "id": 1,
                        "name": "iPhone 15 Pro Max",
                        "slug": "iphone-15-pro-max",
                        "description": "Flagship titanium Apple smartphone with A17 Pro chip.",
                        "price": "1199.00",
                        "sku": "IPH15PROMAX",
                        "stock": 45,
                        "is_available": True,
                        "image": None,
                        "rating": "4.90",
                        "created_at": "2026-05-18T18:06:21Z",
                        "updated_at": "2026-05-18T18:06:21Z"
                    },
                    "errors": None
                }
            }
        ),
        400: openapi.Response(
            description="Product Not Found",
            examples={
                "application/json": {
                    "success": False,
                    "message": "Product with ID 99 does not exist.",
                    "data": None,
                    "errors": [
                        "Product with ID 99 does not exist."
                    ]
                }
            }
        )
    }
}


PRODUCT_UPDATE_SCHEMA = {
    "operation_description": "Updates details of an existing product. Support complete/partial replacements.",
    "request_body": ProductSerializer,
    "responses": {
        200: openapi.Response(
            description="Product updated successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Product updated successfully.",
                    "data": {
                        "id": 1,
                        "name": "iPhone 15 Pro Max",
                        "slug": "iphone-15-pro-max",
                        "description": "Updated flagship titanium Apple smartphone with A17 Pro chip.",
                        "price": "1150.00",
                        "sku": "IPH15PROMAX",
                        "stock": 40,
                        "is_available": True,
                        "image": None,
                        "rating": "4.90",
                        "created_at": "2026-05-18T18:06:21Z",
                        "updated_at": "2026-05-18T18:06:50Z"
                    },
                    "errors": None
                }
            }
        ),
        400: openapi.Response(
            description="Validation Error (e.g. Price bounds or duplicate SKU)",
            examples={
                "application/json": {
                    "success": False,
                    "message": "Price must be a positive number.",
                    "data": None,
                    "errors": {
                        "price": [
                            "Price must be a positive number."
                        ]
                    }
                }
            }
        )
    }
}


PRODUCT_DELETE_SCHEMA = {
    "operation_description": "Removes a product completely from the database by its primary ID.",
    "responses": {
        200: openapi.Response(
            description="Product deleted successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Product deleted successfully.",
                    "data": None,
                    "errors": None
                }
            }
        ),
        400: openapi.Response(
            description="Product Not Found",
            examples={
                "application/json": {
                    "success": False,
                    "message": "Product with ID 99 does not exist.",
                    "data": None,
                    "errors": [
                        "Product with ID 99 does not exist."
                    ]
                }
            }
        )
    }
}


CATEGORY_LIST_SCHEMA = {
    "operation_description": "Retrieves the list of all e-commerce product categories sorted alphabetically.",
    "responses": {
        200: openapi.Response(
            description="Categories retrieved successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Operation completed successfully.",
                    "data": [
                        {
                            "id": "e8a939bc-3b47-49d6-b82b-8a8bfa84617c",
                            "name": "Electronics",
                            "slug": "electronics",
                            "created_at": "2026-05-18T18:06:21Z"
                        }
                    ],
                    "errors": None
                }
            }
        )
    }
}


CATEGORY_CREATE_SCHEMA = {
    "operation_description": "Creates a new category. Enforces name uniqueness (case-insensitive) and auto-slugifies.",
    "request_body": openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=["name"],
        properties={
            "name": openapi.Schema(type=openapi.TYPE_STRING, description="Name of the category")
        }
    ),
    "responses": {
        201: openapi.Response(
            description="Category created successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Category created successfully.",
                    "data": {
                        "id": "e8a939bc-3b47-49d6-b82b-8a8bfa84617c",
                        "name": "Electronics",
                        "slug": "electronics",
                        "created_at": "2026-05-18T18:06:21Z"
                    },
                    "errors": None
                }
            }
        ),
        400: openapi.Response(
            description="Validation Error (e.g. Duplicate name)",
            examples={
                "application/json": {
                    "success": False,
                    "message": "A category with this name already exists.",
                    "data": None,
                    "errors": {
                        "name": [
                            "A category with this name already exists."
                        ]
                    }
                }
            }
        )
    }
}


CATEGORY_DETAIL_SCHEMA = {
    "operation_description": "Retrieves information of a specific category by its UUID primary key.",
    "responses": {
        200: openapi.Response(
            description="Category retrieved successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Operation completed successfully.",
                    "data": {
                        "id": "e8a939bc-3b47-49d6-b82b-8a8bfa84617c",
                        "name": "Electronics",
                        "slug": "electronics",
                        "created_at": "2026-05-18T18:06:21Z"
                    },
                    "errors": None
                }
            }
        ),
        400: openapi.Response(
            description="Category Not Found",
            examples={
                "application/json": {
                    "success": False,
                    "message": "Category with ID e8a939bc-3b47-49d6-b82b-8a8bfa84617c does not exist.",
                    "data": None,
                    "errors": [
                        "Category with ID e8a939bc-3b47-49d6-b82b-8a8bfa84617c does not exist."
                    ]
                }
            }
        )
    }
}


CATEGORY_UPDATE_SCHEMA = {
    "operation_description": "Updates details of an existing category by its UUID primary key.",
    "request_body": openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=["name"],
        properties={
            "name": openapi.Schema(type=openapi.TYPE_STRING, description="New name of the category")
        }
    ),
    "responses": {
        200: openapi.Response(
            description="Category updated successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Category updated successfully.",
                    "data": {
                        "id": "e8a939bc-3b47-49d6-b82b-8a8bfa84617c",
                        "name": "Updated Electronics",
                        "slug": "updated-electronics",
                        "created_at": "2026-05-18T18:06:21Z"
                    },
                    "errors": None
                }
            }
        )
    }
}


CATEGORY_DELETE_SCHEMA = {
    "operation_description": "Removes a category by UUID primary key from the database.",
    "responses": {
        200: openapi.Response(
            description="Category deleted successfully.",
            examples={
                "application/json": {
                    "success": True,
                    "message": "Category deleted successfully.",
                    "data": None,
                    "errors": None
                }
            }
        )
    }
}

