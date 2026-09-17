# DukaTao

DukaTao is a single-vendor online shop built with the MERN stack.

## Architecture

- React + Vite frontend
- Node.js + Express backend
- MongoDB + Mongoose
- Cloudinary for product images
- JWT authentication
- Admin and customer accounts

## Account Types

### Customer

Customers can:

- Register
- Log in
- Browse products
- Add products to cart
- Checkout
- View their orders
- Cancel eligible orders

### Admin

DukaTao has one shop admin account.

The admin can:

- Log in with username and password
- Add products
- Edit products
- Delete products
- Manage orders
- Update order status
- Manage hero images
- Change the admin password

There is no vendor account or vendor dashboard.

## Project Structure

```text
dukatao/
├── client/
└── server/
