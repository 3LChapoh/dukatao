# Dukatao (Ruby's Choice)

Single-vendor luxury perfume storefront — MERN stack (Express/MongoDB backend in `server/`, React/Vite frontend in `client/`).

## Setup

**Server**
```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, etc. if you don't have one yet
npm run dev
```

Create the one boutique account (only needed once, or to reset its details):
```bash
cd server
VENDOR_BOUTIQUE_NAME="Ruby's Choice" VENDOR_CONTACT_NAME="Boneye" \
VENDOR_EMAIL=you@example.com VENDOR_PHONE="07XX XXX XXX" VENDOR_PASSWORD=changeme \
node src/seed/seedVendor.js
```

**Client**
```bash
cd client
npm install
npm run dev
```
