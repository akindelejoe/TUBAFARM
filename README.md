# TUBA Farm Management System

A full-stack, production-style farm management application for tuba (palm wine) farms —
replacing paper records, spreadsheets, and disconnected files with one system that tracks
farms, trees, harvests, products, inventory, sales, customers, expenses, suppliers, and
reports.

## Problem it solves

Small farm operations typically scatter their records across notebooks, spreadsheets, and
memory. That makes it hard to answer basic operational questions: How many trees are
producing? Which ones are underperforming? What's in stock? Is the business profitable
this month? TUBA Farm centralizes that data and computes the answers from real
transactional records, not manual tallies.

## Features

- Multi-farm and tree registry with lifetime production tracking
- Daily tapping/harvest recording tied to the worker who logged it
- Product catalog with a real inventory ledger (stock in/out/adjust, audited)
- Multi-item sales with server-side total calculation and automatic inventory deduction
  inside a database transaction (all-or-nothing)
- Customer, supplier, and expense tracking
- Role-based access (Admin, Manager, Farm Worker, Sales)
- Operational dashboard: KPIs, production/sales/expense trends, low-stock alerts,
  top-producing trees, farm performance
- Seven CSV-exportable reports with date-range filtering
- JWT authentication with bcrypt password hashing, rate-limited login

## Architecture

```
React + TypeScript (Vite)
        │  Axios / REST
        ▼
Node.js + Express (TypeScript)
        │
        ▼
Prisma ORM
        │
        ▼
PostgreSQL
```

The frontend never talks to PostgreSQL directly — every read/write goes through the
Express REST API.

```
tuba-farm/
  client/     React + TypeScript frontend (Vite, Tailwind, React Router, Chart.js)
  server/     Node + Express + TypeScript backend
    src/
      controllers/  routes/  services/  middleware/  validators/  utils/  config/  types/
    prisma/
      schema.prisma  seed.ts
  docker-compose.yml
```

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Chart.js |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Validation | Zod |

## Database design

Core entities: `Farm` → `Tree` → `TappingRecord`; `Product` ↔ `Inventory` (1:1) with an
append-only `InventoryTransaction` ledger; `Sale` → `SaleItem` → `Product` (a sale can
contain many products; totals are computed and stored server-side, never trusted from the
client); `Customer`, `Supplier`, `Expense`, `User`. See `server/prisma/schema.prisma` for
the full schema with all fields and enums.

Key rules enforced at the database/service layer:
- A Tree must belong to a Farm; a TappingRecord must belong to a Tree.
- Tree codes and user emails are unique.
- Sales, tapping records, and expenses reference Users with `onDelete: Restrict` — history
  survives a user being deactivated.
- Farms/Products/Customers/Suppliers/Users are soft-archived, never hard-deleted, once
  they have related history.
- Inventory can never go negative; a sale or stock-out that would exceed on-hand quantity
  is rejected with a 409.

## Installation

Prerequisites: Node.js 20+, a PostgreSQL database (local, Neon, Supabase, Render, or
Railway all work), npm.

```bash
git clone <your-repo-url>
cd tuba-farm
```

### Backend

```bash
cd server
npm install
cp .env.example .env        # then set DATABASE_URL and JWT_SECRET
npm run prisma:migrate      # creates tables from the schema
npm run seed                # loads demo data (2 farms, 22 trees, products, sales, users...)
npm run dev                 # starts the API on http://localhost:4000
```

### Frontend

```bash
cd client
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:4000/api
npm run dev                  # starts the app on http://localhost:5173
```

### Docker (optional)

```bash
docker compose up --build
```

Runs Postgres, the API, and the frontend together. Run migrations/seed once against the
containerized database the same way as above (`docker compose exec server npm run prisma:migrate`).

## Environment variables

**server/.env**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random value in production |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |
| `PORT` | API port (default 4000) |
| `CORS_ORIGIN` | Allowed frontend origin |

**client/.env**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:4000/api` |

## Demo accounts

Seeded by `npm run seed` (password for all: `Demo@1234`, development only):

| Role | Email |
|---|---|
| Admin | admin@tubafarm.com |
| Manager | manager@tubafarm.com |
| Farm Worker | worker@tubafarm.com |
| Sales | sales@tubafarm.com |

## Authentication & roles

Login (`POST /api/auth/login`) returns a JWT; send it as `Authorization: Bearer <token>`
on every subsequent request. Roles and their access:

- **Admin** — full system access, including user management.
- **Manager** — farms, trees, inventory, products, customers, sales, expenses, reports.
- **Farm Worker** — view assigned farm/tree data, create tapping records.
- **Sales** — customers, products, inventory (stock-out only), sales.

## API structure

All responses follow `{ "success": boolean, "message": string, "data": ... }`, with
`{ "pagination": { total, page, pageSize, totalPages } }` added on list endpoints.

| Resource | Base path |
|---|---|
| Auth | `/api/auth` (`POST /login`, `GET /me`, `POST /logout`) |
| Farms | `/api/farms` |
| Trees | `/api/trees` |
| Tapping Records | `/api/tapping-records` |
| Products | `/api/products` |
| Inventory | `/api/inventory` (`/stock-in`, `/stock-out`, `/adjust`) |
| Inventory Transactions | `/api/inventory-transactions` |
| Customers | `/api/customers` |
| Sales | `/api/sales` |
| Expenses | `/api/expenses` |
| Suppliers | `/api/suppliers` |
| Users | `/api/users` (Admin only) |
| Reports | `/api/reports/{production,sales,inventory,expenses,profit-loss,tree-productivity,customer-sales}` (`?format=csv` to export) |
| Dashboard | `/api/dashboard` |

### Sample requests

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "admin@tubafarm.com", "password": "Demo@1234" }
```

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "firstName": "Ada", "lastName": "Admin", "email": "admin@tubafarm.com", "role": "ADMIN" }
  }
}
```

**Create a multi-item sale**

```http
POST /api/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "b3f1...",
  "paymentMethod": "CASH",
  "paymentStatus": "PAID",
  "discount": 10,
  "items": [
    { "productId": "p1", "quantity": 10 },
    { "productId": "p2", "quantity": 5 }
  ]
}
```

The server looks up each product's current price, computes `subtotal`/`totalAmount`
itself, rejects the request with `409` if any item exceeds available inventory, and — on
success — creates the `Sale`, its `SaleItem`s, decrements inventory, and logs a `SALE`
inventory transaction, all inside one database transaction.

## Testing

```bash
cd server
npm test
```

Backend tests use mocked Prisma calls (no live database required) and cover: login
success/failure paths (unknown email, inactive user, wrong password), role-based
authorization, tree creation against a missing farm, insufficient-stock rejection on
stock-out, and sale total/inventory-decrement calculations.

## Future improvements

- PDF export for reports (CSV export is already wired; the report layer returns plain
  row data so a PDF renderer can be added without touching the query logic)
- Swagger/OpenAPI generation from the existing Zod schemas
- A Python + pandas forecasting service reading the same PostgreSQL data (production
  forecasting, yield prediction, low-performer detection) — the schema was designed with
  this in mind: no computed/denormalized fields block a separate analytics read path
