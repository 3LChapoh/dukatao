# Dukatao

Single-vendor household-products storefront — MERN stack (Express/MongoDB backend in `server/`, React/Vite frontend in `client/`).

## Setup

**Server**
```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, etc. if you don't have one yet
npm run dev
```

Create the first admin account (only needed once, or to reset it if you get locked out):
```bash
cd server
ADMIN_USERNAME=shopadmin ADMIN_PASSWORD=changeme ADMIN_NAME="Boneye" \
node src/seed/seedAdmin.js
```

A second admin account (up to 2 total) can be created from the app itself at
`#/admin` → "Create account" — it'll show a one-time recovery code, used at
`#/admin` → "Forgot password?" if the password is ever lost. There's no email
service wired up, so that recovery code is the only way back in.

**Client**
```bash
cd client
npm install
npm run dev
```
