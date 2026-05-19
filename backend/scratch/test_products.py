import json
import urllib.request
import urllib.error
import random

BASE_URL = "http://127.0.0.1:8000"

def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status_code = response.status
            body = json.loads(response.read().decode("utf-8"))
            return status_code, body
    except urllib.error.HTTPError as e:
        status_code = e.code
        try:
            body = json.loads(e.read().decode("utf-8"))
        except Exception:
            body = e.reason
        return status_code, body
    except Exception as e:
        return 500, str(e)


def main():
    print("=========================================")
    print("Superlaps Enterprise Products API Testing")
    print("=========================================")

    salt = random.randint(1000, 9999)

    # 0. Register/Sign up to get a fresh JWT Access Token
    print("0. Registering temporary user for authenticated products testing...")
    user_payload = {
        "username": f"prod_tester_{salt}",
        "email": f"prod_tester_{salt}@superlaps.local",
        "password": "Password123!"
    }
    status, resp = make_request("/api/auth/signup/", method="POST", data=user_payload)
    if status == 201:
        token = resp.get("data", {}).get("tokens", {}).get("access")
        print(f"   Successfully registered and retrieved access token: {token[:20]}...")
    else:
        print(f"   Failed to register: {resp}")
        token = None

    test_products = [
        {
            "name": f"iPhone 15 Pro Max {salt}",
            "description": "Premium titanium Apple smartphone with A17 Pro chip.",
            "price": 1199.00,
            "sku": f"IPH15PROMAX_{salt}",
            "stock": 50,
            "is_available": True,
            "rating": 4.90
        },
        {
            "name": f"iPhone 14 {salt}",
            "description": "High performance Apple smartphone with dual camera system.",
            "price": 799.00,
            "sku": f"IPH14_{salt}",
            "stock": 30,
            "is_available": True,
            "rating": 4.40
        },
        {
            "name": f"Samsung Galaxy S24 {salt}",
            "description": "Premium Android smartphone with Galaxy AI capabilities.",
            "price": 999.00,
            "sku": f"SAMS24_{salt}",
            "stock": 25,
            "is_available": True,
            "rating": 4.80
        },
        {
            "name": f"Budget Phone X {salt}",
            "description": "Essential entry-level phone for daily tasks.",
            "price": 150.00,
            "sku": f"BUDGETX_{salt}",
            "stock": 10,
            "is_available": True,
            "rating": 3.50
        },
        {
            "name": f"Out of Stock Phone {salt}",
            "description": "Unlisted phone with no stock available.",
            "price": 499.00,
            "sku": f"OOSPHONE_{salt}",
            "stock": 0,
            "is_available": False,
            "rating": 4.00
        }
    ]

    created_ids = []

    # 1. Test POST /api/v1/products/ (Product Creation)
    print("\n1. Testing Product Registration...")
    for prod in test_products:
        status, resp = make_request("/api/v1/products/", method="POST", data=prod, token=token)
        print(f"POST {prod['name']} -> Status: {status}")
        if status == 201:
            prod_data = resp.get("data", {})
            created_ids.append(prod_data.get("id"))
            print(f"   Success Message: {resp.get('message')}")
            print(f"   Auto-generated Slug: {prod_data.get('slug')}")
            print(f"   Envelope Check: success={resp.get('success')}, errors={resp.get('errors')}")
        else:
            print(f"   Failed: {resp}")

    # 1.1 Test POST /api/v1/products/ with excessively long description (2005 characters)
    print("\n1.1 Testing Product Registration with excessively long description...")
    long_desc_product = {
        "name": f"Extreme Desc Phone {salt}",
        "description": "X" * 2005,
        "price": 499.00,
        "sku": f"LONGDESC_{salt}",
        "stock": 10,
        "is_available": True,
        "rating": 4.00
    }
    status, resp = make_request("/api/v1/products/", method="POST", data=long_desc_product, token=token)
    print(f"POST Extreme Desc Phone -> Status: {status}")
    print(f"   Error Message: {resp.get('message')}")
    print(f"   Errors: {resp.get('errors')}")

    if not created_ids:
        print("Product creation failed. Aborting tests.")
        return

    # 2. Test GET /api/v1/products/ (List all with pagination envelope)
    print("\n2. Testing Product Listing & Standard Pagination Wrapper...")
    status, resp = make_request("/api/v1/products/", token=token)
    print(f"Status: {status}")
    print(f"Envelope Check: success={resp.get('success')}, message={resp.get('message')}")
    data_block = resp.get("data", {})
    print(f"Pagination Data: count={data_block.get('count')}, next={data_block.get('next')}, previous={data_block.get('previous')}")
    print(f"Total returned results on page 1: {len(data_block.get('results', []))}")

    # 2.5 Testing Dynamic Page Sizing (?page_size=20)
    print("\n2.5 Testing Dynamic Page Sizing (?page_size=20)...")
    status, resp = make_request("/api/v1/products/?page_size=20", token=token)
    print(f"Status: {status}")
    results_count_20 = len(resp.get('data', {}).get('results', []))
    print(f"Request with page_size=20 returns results: {results_count_20}")

    # 2.6 Testing Sanitized Invalid Page Sizing (?page_size=15 -> Falls back to 10)
    print("\n2.6 Testing Sanitized Invalid Page Sizing (?page_size=15 -> Falls back to 10)...")
    status, resp = make_request("/api/v1/products/?page_size=15", token=token)
    print(f"Status: {status}")
    results_count_15 = len(resp.get('data', {}).get('results', []))
    print(f"Request with invalid page_size=15 falls back to results: {results_count_15}")

    # 3. Test Search GET /api/v1/products/?q=iphone
    print(f"\n3. Testing Full-text Search (?q=iPhone)...")
    status, resp = make_request(f"/api/v1/products/?q=iPhone", token=token)
    print(f"Status: {status}")
    results = resp.get("data", {}).get("results", [])
    matches = [r for r in results if str(salt) in r.get("name")]
    print(f"Matches found for this test run salt ({salt}): {len(matches)}")
    for r in matches:
        print(f"   - Match: {r.get('name')} (Price: {r.get('price')})")

    # 4. Test Availability Filter GET /api/v1/products/?is_available=false
    print("\n4. Testing Availability Filtering (?is_available=false)...")
    status, resp = make_request(f"/api/v1/products/?is_available=false&q={salt}", token=token)
    print(f"Status: {status}")
    results = resp.get("data", {}).get("results", [])
    print(f"Non-available matches found: {len(results)}")
    for r in results:
        print(f"   - UnAvailable Match: {r.get('name')} (Stock: {r.get('stock')})")

    # 5. Test Rating Filter GET /api/v1/products/?min_rating=4.8
    print("\n5. Testing Rating Threshold Filtering (?min_rating=4.8)...")
    status, resp = make_request(f"/api/v1/products/?min_rating=4.8&q={salt}", token=token)
    print(f"Status: {status}")
    results = resp.get("data", {}).get("results", [])
    print(f"High-rated matches found: {len(results)}")
    for r in results:
        print(f"   - High-rated Match: {r.get('name')} (Rating: {r.get('rating')})")

    # 6. Test Price Filter GET /api/v1/products/?min_price=100&max_price=200
    print("\n6. Testing Price Range Filtering (?min_price=100&max_price=200)...")
    status, resp = make_request(f"/api/v1/products/?min_price=100&max_price=200&q={salt}", token=token)
    print(f"Status: {status}")
    results = resp.get("data", {}).get("results", [])
    print(f"Price-bounded matches found: {len(results)}")
    for r in results:
        print(f"   - Price Match: {r.get('name')} (Price: {r.get('price')})")

    # 7. Test Price Sorting GET /api/v1/products/?sort_by=price_asc
    print("\n7. Testing Price Sorting Ascending (?sort_by=price_asc)...")
    status, resp = make_request(f"/api/v1/products/?sort_by=price_asc&q={salt}", token=token)
    print(f"Status: {status}")
    results = resp.get("data", {}).get("results", [])
    print(f"Sorted items:")
    for r in results:
        print(f"   - {r.get('name')}: Price={r.get('price')}")

    # 8. Test Price Sorting Descending GET /api/v1/products/?sort_by=price_desc
    print("\n8. Testing Price Sorting Descending (?sort_by=price_desc)...")
    status, resp = make_request(f"/api/v1/products/?sort_by=price_desc&q={salt}", token=token)
    print(f"Status: {status}")
    results = resp.get("data", {}).get("results", [])
    print(f"Sorted items:")
    for r in results:
        print(f"   - {r.get('name')}: Price={r.get('price')}")

    # 9. Test GET /api/v1/products/<id>/ (Retrieve Details)
    target_id = created_ids[0]
    print(f"\n9. Testing Product Detail Retrieval (ID: {target_id})...")
    status, resp = make_request(f"/api/v1/products/{target_id}/", token=token)
    print(f"Status: {status}")
    print(f"Retrieved Product Name: {resp.get('data', {}).get('name')}")
    print(f"Retrieve Success Check: {resp.get('success')}")

    # 10. Test PATCH /api/v1/products/<id>/ (Partial Update)
    print(f"\n10. Testing Product Partial Update (ID: {target_id})...")
    patch_data = {"price": 1099.99, "stock": 48}
    status, resp = make_request(f"/api/v1/products/{target_id}/", method="PATCH", data=patch_data, token=token)
    print(f"Status: {status}")
    print(f"Response Message: {resp.get('message')}")
    print(f"Updated price: {resp.get('data', {}).get('price')}, Updated stock: {resp.get('data', {}).get('stock')}")

    # 11. Test DELETE /api/v1/products/<id>/ (Delete Product)
    print(f"\n11. Testing Product Deletion (ID: {target_id})...")
    status, resp = make_request(f"/api/v1/products/{target_id}/", method="DELETE", token=token)
    print(f"Status: {status}")
    print(f"Deletion Message: {resp.get('message')}")
    print(f"Deletion Success Check: {resp.get('success')}")

    # 12. Verify retrieval of deleted product returns 400 Validation Error
    print(f"\n12. Verifying Deleted Product cannot be retrieved (ID: {target_id})...")
    status, resp = make_request(f"/api/v1/products/{target_id}/", token=token)
    print(f"Status: {status}")
    print(f"Error Message: {resp.get('message')}")
    print(f"Errors returned: {resp.get('errors')}")

    # 13. Verify that querying WITHOUT token results in 401 Unauthorized
    print("\n13. Verifying Security: Querying without JWT Token should fail...")
    sec_status, sec_resp = make_request("/api/v1/products/")
    print(f"Query without token -> Status: {sec_status}")
    print(f"   Response payload: {sec_resp}")
    if sec_status == 401:
        print("Verdict: SECURE!")
    else:
        print("Verdict: VULNERABLE!")

    print("\n=========================================")
    print("Testing Completed Successfully!")
    print("=========================================")


if __name__ == "__main__":
    main()
