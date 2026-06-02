# Aer Lights — Premium 3D Designer Lamps

Ultra-luxury Swiss designer lamp e-commerce website.  
Built by **Vodnik Digital Solutions** for the Swiss B2B/B2C luxury market.

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (utility classes via inline styles for portability)
- **Lucide React** icons
- React Context API for Cart + Language state

## Setup

```bash
npm install
npm run dev
```

## Deploy to Vercel
1. Push to GitHub
2. Import repo on vercel.com
3. Deploy — zero config needed

## Features
- 🌍 DE-CH / EN language toggle (Swiss orthography: "ss" not "ß")
- 🛒 Slide-out cart drawer with +/− quantity controls
- 🔍 Quick-view product modal
- 💳 Mock checkout (Stripe-ready structure)
- 📸 Real product photography
- 🎨 Nordic/alpine luxury dark theme
- 💰 CHF pricing

## Stripe Integration
When ready, wire `app/api/checkout/route.ts` to the Checkout component's form submit.

---
*Developed by [Vodnik Digital Solutions](https://vodnik.ch)*
