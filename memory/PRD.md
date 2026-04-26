# GS Customize Hub - PRD

## Original Problem
Customized gift e-commerce website (GS Customize Hub) selling personalized photo mugs, t-shirts, cushions, photo frames. Customer uploads photo + custom text, picks color/size, places order. Admin panel for orders/products/custom orders.

## User Choices
- Payment: Razorpay (test keys integrated: rzp_test_Si3FxrXfJYqWK)
- Admin auth: Simple password (admin123)
- Storage: Object Storage (Emergent)
- User auth: Guest + optional JWT signup/login
- WhatsApp: floating click-to-chat button

## Architecture
- Backend: FastAPI + MongoDB (Motor) at /app/backend/server.py
- Frontend: React 19 + Tailwind + Shadcn-style brutalist (Bricolage Grotesque + Space Grotesk fonts, peach/cream palette, hard borders + block shadows)
- Storage: Emergent Object Storage for product images/videos and customer custom images
- Payment: Razorpay (test keys), HMAC-SHA256 signature verification on backend

## Implemented (2026-04-26)
### Customer-facing
- Homepage: Hero with marquee outline text, Categories grid, Featured products, How It Works (3 steps), Testimonials (dark section)
- Product Listing: Filters by category, search query, sort by price/newest
- Product Detail: Sticky preview pane (left) with live custom photo + text overlay, customizer (right): photo upload, custom text, color/size selectors, video player (storage or YouTube embed)
- Cart: localStorage-backed, qty edit/remove, free shipping >= ₹499
- Checkout: Guest enabled, Razorpay or COD, coupon validate (WELCOME10 = 10%), order summary
- Auth: Signup/Login pages, JWT in localStorage
- My Orders + Order Tracking page (4-step status timeline)
- WhatsApp floating button (uses settings.whatsapp)

### Admin-facing
- Admin Login (password-only)
- Dashboard: stat cards (orders, earnings, pending, delivered), recent orders table
- Orders: filterable list, status dropdown (pending/processing/shipped/delivered/cancelled), order detail modal with custom image download links
- Products: CRUD with multi-image drag-drop upload, video upload or YouTube URL, colors/sizes, featured toggle
- **Settings**: Brand logo upload, site name/tagline, contact phone/email/address, WhatsApp number, Facebook/Instagram/YouTube/Twitter URLs (live updates the public site)

### Backend APIs (all /api prefix)
- /auth/signup, /auth/login, /auth/me, /auth/admin-login
- /products (list, get, search, filter), /admin/products (CRUD)
- /upload (multipart), /files/{path} (serve)
- /orders (create, get), /orders/me (user's), /admin/orders (list, status update)
- /admin/dashboard (stats)
- /coupons/validate, /admin/coupons
- /payment/create-order (Razorpay)
- /settings (public GET), /admin/settings (PUT)
- /categories (4 hardcoded slugs)

## Seed Data
- 6 products across 4 categories
- 1 coupon: WELCOME10 (10% off, no minimum)

## Test Credentials
- Admin password: admin123
- Test user: create via signup (e.g., testuser@gs.com / Test@1234)
- Razorpay test card: 4111 1111 1111 1111

## P0/P1 Backlog
- P1: Email notifications on order placement (Resend / SendGrid)
- P1: Stock decrement on order (currently informational only)
- P1: User profile page with saved addresses
- P2: Multi-language Hindi toggle (UI strings)
- P2: Bulk order export to CSV in admin
- P2: SMS/WhatsApp order auto-message via Twilio API
- P2: Live preview drag positioning of photo/text on product mockup
- P2: Product reviews & ratings
