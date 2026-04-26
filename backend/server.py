"""GS Customize Hub - FastAPI Backend"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Header, Query, Request
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from pathlib import Path
from datetime import datetime, timezone, timedelta
import os
import logging
import uuid
import bcrypt
import jwt as pyjwt
import requests
import razorpay
import hmac
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
APP_NAME = os.environ['APP_NAME']
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
RAZORPAY_KEY_ID = os.environ['RAZORPAY_KEY_ID']
RAZORPAY_KEY_SECRET = os.environ['RAZORPAY_KEY_SECRET']

razor_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# ----------- Storage Helpers -----------
storage_key: Optional[str] = None

def init_storage() -> str:
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ----------- Auth Helpers -----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(data: dict, expires_minutes: int = 60 * 24 * 7) -> str:
    payload = data.copy()
    payload['exp'] = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    return pyjwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict:
    try:
        return pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
    except HTTPException:
        return None
    if payload.get("role") != "user":
        return None
    user = await db.users.find_one({"id": payload.get("sub")}, {"_id": 0, "password": 0})
    return user

async def require_user(authorization: Optional[str] = Header(None)) -> dict:
    user = await get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

async def require_admin(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin token required")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return {"role": "admin"}

# ----------- Models -----------
class SignupBody(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginBody(BaseModel):
    email: EmailStr
    password: str

class AdminLoginBody(BaseModel):
    password: str

class ProductBody(BaseModel):
    name: str
    description: str
    category: str
    price: float
    stock: int = 100
    colors: List[str] = []
    sizes: List[str] = []
    images: List[str] = []  # storage paths
    video: Optional[str] = None  # storage path or YouTube URL
    is_featured: bool = False
    is_active: bool = True

class CartItem(BaseModel):
    product_id: str
    quantity: int
    color: Optional[str] = None
    size: Optional[str] = None
    custom_text: Optional[str] = None
    custom_image: Optional[str] = None  # storage path

class OrderBody(BaseModel):
    items: List[CartItem]
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    address: str
    city: str
    pincode: str
    payment_method: str  # cod | razorpay
    coupon_code: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None

class StatusBody(BaseModel):
    status: str

class CouponBody(BaseModel):
    code: str
    discount_percent: float
    min_order: float = 0
    is_active: bool = True

class CreateRazorpayOrderBody(BaseModel):
    amount: float  # in INR rupees

class SettingsBody(BaseModel):
    site_name: Optional[str] = "GS Customize Hub"
    tagline: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    whatsapp: Optional[str] = ""
    facebook: Optional[str] = ""
    instagram: Optional[str] = ""
    youtube: Optional[str] = ""
    twitter: Optional[str] = ""
    logo: Optional[str] = ""  # storage path or URL

# ----------- Auth Routes -----------
@api_router.post("/auth/signup")
async def signup(body: SignupBody):
    existing = await db.users.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "name": body.name,
        "email": body.email,
        "password": hash_password(body.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_token({"sub": user_id, "role": "user"})
    return {"token": token, "user": {"id": user_id, "name": body.name, "email": body.email}}

@api_router.post("/auth/login")
async def login(body: LoginBody):
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": user["id"], "role": "user"})
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}

@api_router.get("/auth/me")
async def me(user: dict = Depends(require_user)):
    return user

@api_router.post("/auth/admin-login")
async def admin_login(body: AdminLoginBody):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    token = create_token({"sub": "admin", "role": "admin"})
    return {"token": token}

# ----------- Upload / Files -----------
@api_router.post("/upload")
async def upload(file: UploadFile = File(...), folder: str = Form("misc")):
    ext = (file.filename or "file").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "bin"
    safe_folder = "".join(c for c in folder if c.isalnum() or c in "-_")
    path = f"{APP_NAME}/{safe_folder}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "application/octet-stream")
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}

@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type") or content_type)

# ----------- Products -----------
@api_router.get("/products")
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None, q: Optional[str] = None):
    query = {"is_active": True}
    if category:
        query["category"] = category
    if featured is not None:
        query["is_featured"] = featured
    if q:
        query["$or"] = [{"name": {"$regex": q, "$options": "i"}}, {"description": {"$regex": q, "$options": "i"}}]
    items = await db.products.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api_router.get("/products/{pid}")
async def get_product(pid: str):
    item = await db.products.find_one({"id": pid}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    return item

@api_router.post("/admin/products")
async def create_product(body: ProductBody, _: dict = Depends(require_admin)):
    pid = str(uuid.uuid4())
    doc = body.model_dump()
    doc["id"] = pid
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/products/{pid}")
async def update_product(pid: str, body: ProductBody, _: dict = Depends(require_admin)):
    update = body.model_dump()
    res = await db.products.update_one({"id": pid}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    item = await db.products.find_one({"id": pid}, {"_id": 0})
    return item

@api_router.delete("/admin/products/{pid}")
async def delete_product(pid: str, _: dict = Depends(require_admin)):
    res = await db.products.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}

@api_router.get("/admin/products")
async def admin_list_products(_: dict = Depends(require_admin)):
    items = await db.products.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items

# ----------- Categories (static seed) -----------
CATEGORIES = [
    {"slug": "photo-mugs", "name": "Photo Mugs", "image": "https://images.unsplash.com/photo-1653104838836-3c79156a7d99?crop=entropy&cs=srgb&fm=jpg&w=600"},
    {"slug": "t-shirts", "name": "T-Shirts", "image": "https://images.unsplash.com/photo-1622445272461-c6580cab8755?crop=entropy&cs=srgb&fm=jpg&w=600"},
    {"slug": "cushions", "name": "Cushions", "image": "https://images.unsplash.com/photo-1630655115300-7f2c2d4364e0?crop=entropy&cs=srgb&fm=jpg&w=600"},
    {"slug": "photo-frames", "name": "Photo Frames", "image": "https://images.unsplash.com/photo-1550243595-4cb7dd708a89?crop=entropy&cs=srgb&fm=jpg&w=600"},
]

@api_router.get("/categories")
async def list_categories():
    return CATEGORIES

# ----------- Coupons -----------
@api_router.post("/coupons/validate")
async def validate_coupon(code: str, total: float):
    coupon = await db.coupons.find_one({"code": code.upper(), "is_active": True}, {"_id": 0})
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon")
    if total < coupon.get("min_order", 0):
        raise HTTPException(status_code=400, detail=f"Minimum order ₹{coupon['min_order']} required")
    discount = round(total * coupon["discount_percent"] / 100, 2)
    return {"code": coupon["code"], "discount_percent": coupon["discount_percent"], "discount": discount}

@api_router.post("/admin/coupons")
async def create_coupon(body: CouponBody, _: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["code"] = doc["code"].upper()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.coupons.update_one({"code": doc["code"]}, {"$set": doc}, upsert=True)
    return {"ok": True, "code": doc["code"]}

@api_router.get("/admin/coupons")
async def list_coupons(_: dict = Depends(require_admin)):
    items = await db.coupons.find({}, {"_id": 0}).to_list(500)
    return items

# ----------- Razorpay -----------
@api_router.post("/payment/create-order")
async def create_razorpay_order(body: CreateRazorpayOrderBody):
    amount_paise = int(round(body.amount * 100))
    order = razor_client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "payment_capture": 1,
    })
    return {"order_id": order["id"], "amount": order["amount"], "currency": order["currency"], "key_id": RAZORPAY_KEY_ID}

def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    body = f"{order_id}|{payment_id}".encode()
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

# ----------- Orders -----------
@api_router.post("/orders")
async def create_order(body: OrderBody, authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)

    # Compute totals
    total = 0.0
    enriched_items = []
    for item in body.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        line_total = product["price"] * item.quantity
        total += line_total
        enriched_items.append({
            **item.model_dump(),
            "product_name": product["name"],
            "product_image": product["images"][0] if product.get("images") else None,
            "unit_price": product["price"],
            "line_total": line_total,
        })

    discount = 0.0
    coupon_code = None
    if body.coupon_code:
        coupon = await db.coupons.find_one({"code": body.coupon_code.upper(), "is_active": True}, {"_id": 0})
        if coupon and total >= coupon.get("min_order", 0):
            discount = round(total * coupon["discount_percent"] / 100, 2)
            coupon_code = coupon["code"]

    final_total = round(total - discount, 2)

    # Verify Razorpay payment if applicable
    if body.payment_method == "razorpay":
        if not (body.razorpay_order_id and body.razorpay_payment_id and body.razorpay_signature):
            raise HTTPException(status_code=400, detail="Razorpay payment details missing")
        if not verify_razorpay_signature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature):
            raise HTTPException(status_code=400, detail="Invalid Razorpay signature")

    order_id = str(uuid.uuid4())
    order_doc = {
        "id": order_id,
        "user_id": user["id"] if user else None,
        "items": enriched_items,
        "customer_name": body.customer_name,
        "customer_phone": body.customer_phone,
        "customer_email": body.customer_email,
        "address": body.address,
        "city": body.city,
        "pincode": body.pincode,
        "payment_method": body.payment_method,
        "payment_status": "paid" if body.payment_method == "razorpay" else "pending",
        "razorpay_order_id": body.razorpay_order_id,
        "razorpay_payment_id": body.razorpay_payment_id,
        "subtotal": round(total, 2),
        "discount": discount,
        "coupon_code": coupon_code,
        "total": final_total,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order_doc)
    order_doc.pop("_id", None)
    return order_doc

@api_router.get("/orders/me")
async def my_orders(user: dict = Depends(require_user)):
    items = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api_router.get("/orders/{oid}")
async def get_order(oid: str, authorization: Optional[str] = Header(None)):
    order = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.get("/admin/orders")
async def admin_list_orders(status: Optional[str] = None, _: dict = Depends(require_admin)):
    query = {}
    if status:
        query["status"] = status
    items = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items

@api_router.put("/admin/orders/{oid}/status")
async def update_order_status(oid: str, body: StatusBody, _: dict = Depends(require_admin)):
    valid = {"pending", "processing", "shipped", "delivered", "cancelled"}
    if body.status not in valid:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.orders.update_one({"id": oid}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"ok": True}

@api_router.get("/admin/dashboard")
async def admin_dashboard(_: dict = Depends(require_admin)):
    total_orders = await db.orders.count_documents({})
    pending = await db.orders.count_documents({"status": "pending"})
    processing = await db.orders.count_documents({"status": "processing"})
    shipped = await db.orders.count_documents({"status": "shipped"})
    delivered = await db.orders.count_documents({"status": "delivered"})

    pipeline = [{"$group": {"_id": None, "sum": {"$sum": "$total"}}}]
    earnings_doc = await db.orders.aggregate(pipeline).to_list(1)
    earnings = earnings_doc[0]["sum"] if earnings_doc else 0

    recent = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    return {
        "total_orders": total_orders,
        "pending": pending,
        "processing": processing,
        "shipped": shipped,
        "delivered": delivered,
        "earnings": round(earnings, 2),
        "recent": recent,
    }

# ----------- Site Settings -----------
DEFAULT_SETTINGS = {
    "site_name": "GS Customize Hub",
    "tagline": "Personalized gifts that tell your story",
    "phone": "+91 99999 99999",
    "email": "hello@gscustomizehub.com",
    "address": "India",
    "whatsapp": "919999999999",
    "facebook": "",
    "instagram": "",
    "youtube": "",
    "twitter": "",
    "logo": "",
}

@api_router.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"key": "site"}, {"_id": 0})
    if not doc:
        return DEFAULT_SETTINGS
    return {k: doc.get(k, v) for k, v in DEFAULT_SETTINGS.items()}

@api_router.put("/admin/settings")
async def update_settings(body: SettingsBody, _: dict = Depends(require_admin)):
    update = body.model_dump()
    update["key"] = "site"
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.settings.update_one({"key": "site"}, {"$set": update}, upsert=True)
    doc = await db.settings.find_one({"key": "site"}, {"_id": 0})
    return doc

# ----------- Seed Data -----------
async def seed_initial_data():
    count = await db.products.count_documents({})
    if count > 0:
        return
    sample = [
        {
            "name": "Personalized Photo Mug",
            "description": "High-quality ceramic 11oz mug. Print your favorite photo and a custom message. Microwave & dishwasher safe.",
            "category": "photo-mugs",
            "price": 299, "stock": 100,
            "colors": ["White", "Black", "Pink"], "sizes": ["11oz", "15oz"],
            "images": ["https://images.unsplash.com/photo-1653104838836-3c79156a7d99?crop=entropy&cs=srgb&fm=jpg&w=900"],
            "video": None, "is_featured": True, "is_active": True,
        },
        {
            "name": "Custom Photo T-Shirt",
            "description": "Premium 180gsm cotton t-shirt with full-color photo print. Available in multiple sizes & colors.",
            "category": "t-shirts",
            "price": 599, "stock": 80,
            "colors": ["White", "Black", "Navy", "Red"], "sizes": ["S", "M", "L", "XL", "XXL"],
            "images": ["https://images.unsplash.com/photo-1622445272461-c6580cab8755?crop=entropy&cs=srgb&fm=jpg&w=900"],
            "video": None, "is_featured": True, "is_active": True,
        },
        {
            "name": "Memory Photo Cushion",
            "description": "16x16 inch soft polyester cushion with HD photo printing. Perfect gift for loved ones.",
            "category": "cushions",
            "price": 449, "stock": 60,
            "colors": ["White"], "sizes": ["12x12", "16x16"],
            "images": ["https://images.unsplash.com/photo-1630655115300-7f2c2d4364e0?crop=entropy&cs=srgb&fm=jpg&w=900"],
            "video": None, "is_featured": True, "is_active": True,
        },
        {
            "name": "Wooden Photo Frame",
            "description": "Premium wooden photo frame with glass cover. Personalized with your photo & engraved message.",
            "category": "photo-frames",
            "price": 699, "stock": 40,
            "colors": ["Natural Wood", "Walnut", "White"], "sizes": ["6x8", "8x10", "10x12"],
            "images": ["https://images.unsplash.com/photo-1550243595-4cb7dd708a89?crop=entropy&cs=srgb&fm=jpg&w=900"],
            "video": None, "is_featured": True, "is_active": True,
        },
        {
            "name": "Couple Photo Mug Set",
            "description": "Set of 2 matching mugs for couples. Custom photo & names printed on each.",
            "category": "photo-mugs",
            "price": 549, "stock": 50,
            "colors": ["White"], "sizes": ["11oz"],
            "images": ["https://images.unsplash.com/photo-1572119865084-43c285814d63?crop=entropy&cs=srgb&fm=jpg&w=900"],
            "video": None, "is_featured": False, "is_active": True,
        },
        {
            "name": "Birthday Custom Cushion",
            "description": "Make birthdays special with a custom printed cushion featuring photos & wishes.",
            "category": "cushions",
            "price": 499, "stock": 70,
            "colors": ["White", "Yellow"], "sizes": ["16x16"],
            "images": ["https://images.unsplash.com/photo-1592078615290-033ee584e267?crop=entropy&cs=srgb&fm=jpg&w=900"],
            "video": None, "is_featured": False, "is_active": True,
        },
    ]
    for s in sample:
        s["id"] = str(uuid.uuid4())
        s["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_many(sample)

    # Seed coupon
    await db.coupons.update_one(
        {"code": "WELCOME10"},
        {"$set": {"id": str(uuid.uuid4()), "code": "WELCOME10", "discount_percent": 10, "min_order": 0, "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    logger.info("Seeded initial products & coupon")

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    try:
        await seed_initial_data()
    except Exception as e:
        logger.error(f"Seed failed: {e}")

@api_router.get("/")
async def root():
    return {"message": "GS Customize Hub API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
