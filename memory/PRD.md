# GS Customize Hub - PRD

## Status: MVP COMPLETE + Soft Pink/Nude Redesign + Logo Integrated

## Original Problem
Customized gift e-commerce website (GS Customize Hub) selling personalized photo mugs, t-shirts, cushions, photo frames. Customer uploads photo + custom text, picks color/size, places order. Admin panel for orders/products/custom orders/settings.

## User Choices
- Payment: Razorpay (test keys: rzp_test_Si3FxrXfJYqWK, secret kuEkUndsm3gZczjomzKPYkK) — live keys baad me
- Admin auth: Simple password (admin123)
- Storage: Object Storage (Emergent)
- User auth: Guest + optional JWT signup/login
- WhatsApp: floating click-to-chat
- Email notifications: NOT needed
- Theme: Soft light pink + nude + white, professional, no heavy outlines

## Architecture
- Backend: FastAPI + MongoDB at /app/backend/server.py
- Frontend: React 19 + Tailwind, soft elegant style (Playfair Display + Cormorant Garamond + Inter), pastel rose accent #D4A5A5
- Storage: Emergent Object Storage
- Payment: Razorpay test keys + HMAC-SHA256 signature verification

## Implemented (2026-04-27)
### Branding
- Custom logo uploaded (lotus design, GS Customize.Hub script)
- Light pink/nude/white palette across entire site
- Removed heavy black brutalist borders → clean cards with subtle shadows + rounded corners
- Serif display font + cursive accent for "your story" / quotes

### Customer Site
- Homepage: gradient hero, category grid, featured products, How It Works (3 steps), testimonials, footer
- Product listing: search, filter, sort, pill-style category buttons
- Product detail: sticky live preview (photo + text overlay), customizer (photo upload, text, color/size), video player
- Cart + Guest checkout + Razorpay/COD + coupon (WELCOME10)
- User signup/login + My Orders + Order tracking timeline
- WhatsApp float button, click-to-call/email in footer

### Admin Panel (password: admin123)
- Dashboard: order stats + recent orders
- Orders: filter by status, change status, view full order with custom image download
- Products: CRUD with multi-image + video upload
- Settings: logo upload + site name/tagline + phone/email/address + WhatsApp + Facebook/Instagram/YouTube/Twitter URLs (live updates the public site)

## Test Credentials
- Admin URL: /admin/login · Password: `admin123`
- Razorpay test card: 4111 1111 1111 1111

## P1/P2 Backlog
- Live Razorpay keys (after merchant KYC)
- Stock auto-decrement on order placement
- Festive combo bundles category for higher AOV
- Bulk CSV order export
- Live drag positioning of photo/text on product mockup
- Product reviews & ratings
- Hindi UI toggle
