"""Backend tests for GS Customize Hub."""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://gs-customize.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/admin-login", json={"password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def user_creds():
    return {"name": "Tester", "email": f"test_{uuid.uuid4().hex[:8]}@gs.com", "password": "Test@1234"}


@pytest.fixture(scope="session")
def user_token(user_creds):
    r = requests.post(f"{API}/auth/signup", json=user_creds, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


# --------- Health & Static ---------
def test_root():
    r = requests.get(f"{API}/", timeout=30)
    assert r.status_code == 200
    assert "message" in r.json()


def test_categories():
    r = requests.get(f"{API}/categories", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) == 4
    slugs = {c["slug"] for c in data}
    assert {"photo-mugs", "t-shirts", "cushions", "photo-frames"} <= slugs


# --------- Products ---------
def test_products_list():
    r = requests.get(f"{API}/products", timeout=30)
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 6
    assert all("_id" not in p for p in items)
    assert all("id" in p for p in items)


def test_products_featured():
    r = requests.get(f"{API}/products", params={"featured": "true"}, timeout=30)
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1
    assert all(p["is_featured"] is True for p in items)


def test_product_detail():
    r = requests.get(f"{API}/products", timeout=30)
    pid = r.json()[0]["id"]
    r2 = requests.get(f"{API}/products/{pid}", timeout=30)
    assert r2.status_code == 200
    assert r2.json()["id"] == pid

    r3 = requests.get(f"{API}/products/nonexistent-id-xxx", timeout=30)
    assert r3.status_code == 404


# --------- Auth ---------
def test_signup_login_me(user_creds, user_token):
    # login
    r = requests.post(f"{API}/auth/login", json={"email": user_creds["email"], "password": user_creds["password"]}, timeout=30)
    assert r.status_code == 200
    assert "token" in r.json()
    # me
    r2 = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {user_token}"}, timeout=30)
    assert r2.status_code == 200
    assert r2.json()["email"] == user_creds["email"]
    assert "password" not in r2.json()
    # bad login
    r3 = requests.post(f"{API}/auth/login", json={"email": user_creds["email"], "password": "wrong"}, timeout=30)
    assert r3.status_code == 401
    # duplicate signup
    r4 = requests.post(f"{API}/auth/signup", json=user_creds, timeout=30)
    assert r4.status_code == 400


def test_admin_login_correct_and_wrong():
    r = requests.post(f"{API}/auth/admin-login", json={"password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200 and "token" in r.json()
    r2 = requests.post(f"{API}/auth/admin-login", json={"password": "wrong"}, timeout=30)
    assert r2.status_code == 401


# --------- Admin Products CRUD ---------
def test_admin_products_crud(admin_token):
    # Auth required
    r = requests.post(f"{API}/admin/products", json={"name": "x", "description": "y", "category": "photo-mugs", "price": 100}, timeout=30)
    assert r.status_code == 401

    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "name": "TEST_Mug", "description": "Test product", "category": "photo-mugs",
        "price": 199, "stock": 10, "colors": ["White"], "sizes": ["11oz"],
        "images": [], "is_featured": False, "is_active": True,
    }
    r = requests.post(f"{API}/admin/products", json=payload, headers=headers, timeout=30)
    assert r.status_code == 200
    pid = r.json()["id"]
    assert "_id" not in r.json()

    # Update
    payload["name"] = "TEST_Mug_Updated"
    r = requests.put(f"{API}/admin/products/{pid}", json=payload, headers=headers, timeout=30)
    assert r.status_code == 200
    assert r.json()["name"] == "TEST_Mug_Updated"

    # Verify GET
    r = requests.get(f"{API}/products/{pid}", timeout=30)
    assert r.status_code == 200 and r.json()["name"] == "TEST_Mug_Updated"

    # Delete
    r = requests.delete(f"{API}/admin/products/{pid}", headers=headers, timeout=30)
    assert r.status_code == 200
    r = requests.get(f"{API}/products/{pid}", timeout=30)
    assert r.status_code == 404


# --------- Coupons ---------
def test_coupon_validate():
    r = requests.post(f"{API}/coupons/validate", params={"code": "WELCOME10", "total": 1000}, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["discount"] == 100
    assert d["discount_percent"] == 10

    r2 = requests.post(f"{API}/coupons/validate", params={"code": "BADCODE", "total": 1000}, timeout=30)
    assert r2.status_code == 404


# --------- Orders ---------
@pytest.fixture(scope="session")
def sample_product():
    r = requests.get(f"{API}/products", timeout=30)
    return r.json()[0]


def test_order_cod(sample_product, user_token):
    body = {
        "items": [{"product_id": sample_product["id"], "quantity": 2}],
        "customer_name": "TEST_Cust", "customer_phone": "9999999999",
        "customer_email": "test@example.com",
        "address": "123 Test St", "city": "Mumbai", "pincode": "400001",
        "payment_method": "cod",
    }
    r = requests.post(f"{API}/orders", json=body, headers={"Authorization": f"Bearer {user_token}"}, timeout=30)
    assert r.status_code == 200, r.text
    o = r.json()
    assert o["payment_method"] == "cod"
    assert o["payment_status"] == "pending"
    assert o["status"] == "pending"
    assert "_id" not in o
    item = o["items"][0]
    assert item["product_name"] == sample_product["name"]
    assert item["unit_price"] == sample_product["price"]
    assert item["line_total"] == sample_product["price"] * 2
    expected_subtotal = round(sample_product["price"] * 2, 2)
    assert o["subtotal"] == expected_subtotal
    assert o["total"] == expected_subtotal  # no shipping field in model

    # GET order
    r2 = requests.get(f"{API}/orders/{o['id']}", timeout=30)
    assert r2.status_code == 200 and r2.json()["id"] == o["id"]
    return o


def test_order_with_coupon(sample_product):
    body = {
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
        "customer_name": "TEST_C2", "customer_phone": "9999999999",
        "address": "addr", "city": "Mumbai", "pincode": "400001",
        "payment_method": "cod", "coupon_code": "WELCOME10",
    }
    r = requests.post(f"{API}/orders", json=body, timeout=30)
    assert r.status_code == 200, r.text
    o = r.json()
    expected_disc = round(sample_product["price"] * 0.10, 2)
    assert o["discount"] == expected_disc
    assert o["coupon_code"] == "WELCOME10"
    assert o["total"] == round(sample_product["price"] - expected_disc, 2)


def test_order_razorpay_missing_fields(sample_product):
    body = {
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
        "customer_name": "x", "customer_phone": "9999999999",
        "address": "addr", "city": "Mumbai", "pincode": "400001",
        "payment_method": "razorpay",
    }
    r = requests.post(f"{API}/orders", json=body, timeout=30)
    assert r.status_code == 400


def test_order_razorpay_bad_signature(sample_product):
    body = {
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
        "customer_name": "x", "customer_phone": "9999999999",
        "address": "addr", "city": "Mumbai", "pincode": "400001",
        "payment_method": "razorpay",
        "razorpay_order_id": "order_xxx", "razorpay_payment_id": "pay_xxx", "razorpay_signature": "bogus",
    }
    r = requests.post(f"{API}/orders", json=body, timeout=30)
    assert r.status_code == 400


def test_my_orders(user_token, sample_product):
    body = {
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
        "customer_name": "Me", "customer_phone": "9999999999",
        "address": "addr", "city": "Mumbai", "pincode": "400001",
        "payment_method": "cod",
    }
    requests.post(f"{API}/orders", json=body, headers={"Authorization": f"Bearer {user_token}"}, timeout=30)
    r = requests.get(f"{API}/orders/me", headers={"Authorization": f"Bearer {user_token}"}, timeout=30)
    assert r.status_code == 200
    arr = r.json()
    assert isinstance(arr, list) and len(arr) >= 1


# --------- Admin dashboard / orders / status ---------
def test_admin_dashboard(admin_token):
    r = requests.get(f"{API}/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
    assert r.status_code == 200
    d = r.json()
    for k in ["total_orders", "earnings", "pending", "processing", "shipped", "delivered", "recent"]:
        assert k in d

    r2 = requests.get(f"{API}/admin/dashboard", timeout=30)
    assert r2.status_code == 401


def test_admin_orders_and_status_update(admin_token, sample_product):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # ensure at least one order
    body = {
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
        "customer_name": "S", "customer_phone": "9999999999",
        "address": "addr", "city": "Mumbai", "pincode": "400001",
        "payment_method": "cod",
    }
    o = requests.post(f"{API}/orders", json=body, timeout=30).json()

    r = requests.get(f"{API}/admin/orders", headers=headers, timeout=30)
    assert r.status_code == 200 and isinstance(r.json(), list)

    for status in ["processing", "shipped", "delivered", "cancelled", "pending"]:
        rr = requests.put(f"{API}/admin/orders/{o['id']}/status", json={"status": status}, headers=headers, timeout=30)
        assert rr.status_code == 200, f"{status}: {rr.text}"

    rr = requests.put(f"{API}/admin/orders/{o['id']}/status", json={"status": "bogus"}, headers=headers, timeout=30)
    assert rr.status_code == 400

    # without admin
    rr = requests.put(f"{API}/admin/orders/{o['id']}/status", json={"status": "pending"}, timeout=30)
    assert rr.status_code == 401


# --------- Razorpay create-order ---------
def test_razorpay_create_order():
    r = requests.post(f"{API}/payment/create-order", json={"amount": 500}, timeout=60)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "order_id" in d and d["order_id"].startswith("order_")
    assert d["amount"] == 50000
    assert d["currency"] == "INR"
    assert d["key_id"]


# --------- File upload + serve ---------
def test_file_upload_and_serve():
    content = b"hello-world-test-bytes"
    files = {"file": ("test.txt", io.BytesIO(content), "text/plain")}
    r = requests.post(f"{API}/upload", files=files, data={"folder": "tests"}, timeout=60)
    assert r.status_code == 200, r.text
    path = r.json()["path"]
    r2 = requests.get(f"{API}/files/{path}", timeout=60)
    assert r2.status_code == 200
    assert r2.content == content
