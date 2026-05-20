from django.core.management.base import BaseCommand
from products.models import Category, Product

class Command(BaseCommand):
    help = 'Seed the database with 10 high-quality beauty parlor products with short descriptions and images.'

    def handle(self, *args, **options):
        self.stdout.write("Clearing existing products and categories...")
        Product.objects.all().delete()
        Category.objects.all().delete()

        # 1. Categories seed data
        categories_data = [
            "Face Creams & Moisturizers",
            "Hair Oils & Serums",
            "Facial Serums & Cleansers",
            "Body Lotions & Scrubs",
            "Face Masks & Peels"
        ]
        
        categories_map = {}
        for cat_name in categories_data:
            category, created = Category.objects.get_or_create(name=cat_name)
            categories_map[cat_name] = category
            self.stdout.write(self.style.SUCCESS(f"Created category: {cat_name}"))

        # 2. Products seed data
        products_data = [
            {
                "name": "Glow Essence Face Cream",
                "category_name": "Face Creams & Moisturizers",
                "description": "Hydrating daily moisturizer with vitamin C and hyaluronic acid for radiant skin.",
                "price": 24.99,
                "sku": "BP-CREAM-001",
                "stock": 45,
                "image": "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=800&q=80",
                "rating": 4.70
            },
            {
                "name": "Organic Argan Hair Oil",
                "category_name": "Hair Oils & Serums",
                "description": "Pure Moroccan argan oil to nourish, strengthen, and add brilliant shine to hair.",
                "price": 18.50,
                "sku": "BP-OIL-002",
                "stock": 35,
                "image": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
                "rating": 4.80
            },
            {
                "name": "Retinol Youth Renewal Serum",
                "category_name": "Facial Serums & Cleansers",
                "description": "Fast-acting nighttime retinol serum to visibly minimize lines and wrinkles.",
                "price": 38.00,
                "sku": "BP-SERUM-003",
                "stock": 20,
                "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
                "rating": 4.60
            },
            {
                "name": "Lavender Soothing Body Lotion",
                "category_name": "Body Lotions & Scrubs",
                "description": "Calming body lotion infused with natural lavender extract for deep hydration.",
                "price": 14.99,
                "sku": "BP-LOTION-004",
                "stock": 60,
                "image": "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80",
                "rating": 4.50
            },
            {
                "name": "Charcoal Detoxifying Clay Mask",
                "category_name": "Face Masks & Peels",
                "description": "Deep pore cleansing clay mask with activated charcoal and bentonite clay.",
                "price": 19.99,
                "sku": "BP-MASK-005",
                "stock": 30,
                "image": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
                "rating": 4.40
            },
            {
                "name": "Rosewater Hydrating Toner",
                "category_name": "Facial Serums & Cleansers",
                "description": "Refreshing facial mist made from pure distilled rose petals to balance skin pH.",
                "price": 15.00,
                "sku": "BP-TONER-006",
                "stock": 40,
                "image": "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80",
                "rating": 4.30
            },
            {
                "name": "Coconut Exfoliating Body Scrub",
                "category_name": "Body Lotions & Scrubs",
                "description": "Smoothing body scrub with real coconut shell powder and moisturizing shea butter.",
                "price": 16.99,
                "sku": "BP-SCRUB-007",
                "stock": 25,
                "image": "https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?auto=format&fit=crop&w=800&q=80",
                "rating": 4.60
            },
            {
                "name": "Tea Tree Anti-Acne Cleanser",
                "category_name": "Facial Serums & Cleansers",
                "description": "Gentle foaming cleanser with tea tree oil to purify skin and reduce breakouts.",
                "price": 12.99,
                "sku": "BP-CLEAN-008",
                "stock": 50,
                "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
                "rating": 4.20
            },
            {
                "name": "Keratin Therapy Hair Serum",
                "category_name": "Hair Oils & Serums",
                "description": "Leave-in keratin serum to smooth frizz, protect from heat, and repair damage.",
                "price": 22.50,
                "sku": "BP-SERUM-009",
                "stock": 18,
                "image": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80",
                "rating": 4.70
            },
            {
                "name": "Gold Radiance Peel-Off Mask",
                "category_name": "Face Masks & Peels",
                "description": "Luxury peel-off facial mask infused with colloidal gold to firm and brighten skin.",
                "price": 27.00,
                "sku": "BP-MASK-010",
                "stock": 15,
                "image": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
                "rating": 4.80
            }
        ]

        for prod in products_data:
            cat = categories_map[prod["category_name"]]
            Product.objects.create(
                sku=prod["sku"],
                category=cat,
                name=prod["name"],
                description=prod["description"],
                price=prod["price"],
                stock=prod["stock"],
                image=prod["image"],
                rating=prod["rating"],
                is_available=True
            )
            self.stdout.write(self.style.SUCCESS(f"Created beauty product: {prod['name']}"))

        self.stdout.write(self.style.SUCCESS("Database beauty parlor seeding completed successfully!"))
