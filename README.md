# Invoice Management Dashboard

A full-stack invoice management application built with React, Node.js, Express, and MongoDB.

Live demo: https://invoice-dashboard-blue.vercel.app

---

## Tech Stack

| Layer     | Technology                                                 |
|-----------|------------------------------------------------------------|
| Frontend  | React 18, Vite, React Router v6, TanStack Query, MUI v5, Recharts |
| Backend   | Node.js, Express.js                                        |
| Database  | MongoDB with Mongoose (Used Atlas for Deployment           |
| Container | Docker + Docker Compose                                    |

---

## Project Structure

```
invoice-dashboard/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose schemas (Customer, Invoice)
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── seed/            # Seed script + seed-data.json
│   │   └── app.js           # Express app entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # InvoicesPage, SummaryPage, CustomerProfilePage
│   │   ├── components/      # StatusChip, InvoiceFormModal
│   │   ├── api/             # Axios API client
│   │   ├── hooks/           # TanStack Query hooks
│   │   ├── layouts/         # MainLayout (sidebar)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── theme.js         # MUI theme
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Docker — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone / unzip the project
```bash
cd invoice-dashboard
```

### 2. Start all services
```bash
docker compose up --build
```
This starts three containers: `mongo`, `backend` (port 5000), `frontend` (port 3000).

### 3. Run the seed script (once)
Open a new terminal while the containers are running:
```bash
docker compose exec backend node src/seed/seed.js
```
You should see:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
✅ Inserted 61 customers
✅ Inserted invoices 1–500
✅ Inserted invoices 501–1000
✅ Inserted invoices 1001–1500
✅ Inserted invoices 1501–2000
🎉 Seed complete: 61 customers, 2000 invoices
```

### 4. Open the app
Visit **http://localhost:3000**

---

## Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env → set MONGO_URI=mongodb://localhost:27017/invoice_dashboard
npm install
npm run seed          # Load seed data
npm run dev           # Start dev server (nodemon)
```
Backend runs at **http://localhost:5000**

### Frontend
```bash
cd frontend
npm install
npm run dev           # Start Vite dev server
```
Frontend runs at **http://localhost:3000**

> The Vite proxy (`/api → http://backend:5000`) handles CORS automatically in Docker.
> For local dev, update `vite.config.js` proxy target to `http://localhost:5000`.

---

## API Reference

### Invoices

| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| GET    | `/api/invoices`       | List invoices (paginated, filtered, sorted) |
| GET    | `/api/invoices/summary` | Aggregate summary + top 5 customers    |
| GET    | `/api/invoices/:id`   | Single invoice                           |
| POST   | `/api/invoices`       | Create invoice                           |
| PUT    | `/api/invoices/:id`   | Update invoice                           |
| DELETE | `/api/invoices/:id`   | Delete invoice                           |

#### Query Parameters for `GET /api/invoices`

| Param          | Type   | Description                                 |
|----------------|--------|---------------------------------------------|
| `page`         | number | Page number (default: 1)                   |
| `limit`        | number | Results per page (default: 20, max: 100)   |
| `search`       | string | Search by invoiceId or customer name       |
| `status`       | string | Filter by status (Paid, Unpaid, etc.)      |
| `taxRate`      | number | Filter by tax rate (0/3/5/18/28)           |
| `sortBy`       | string | Sort field: `amount` or `dueDate`          |
| `sortOrder`    | string | `asc` or `desc`                            |
| `issueDateFrom`| date   | Issue date range start (YYYY-MM-DD)        |
| `issueDateTo`  | date   | Issue date range end (YYYY-MM-DD)          |
| `dueDateFrom`  | date   | Due date range start (YYYY-MM-DD)          |
| `dueDateTo`    | date   | Due date range end (YYYY-MM-DD)            |

### Customers

| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| GET    | `/api/customers`      | List all customers                       |
| GET    | `/api/customers/:id`  | Customer profile with invoice history    |

---

## Data Modeling Rationale

### Two-Collection Design: `customers` + `invoices`

**Why separate collections?**

The seed data has a strict **1:1 customer → company** relationship (61 unique customers, 2000 invoices). Embedding company in every invoice document would:
- Duplicate company name strings across ~33 invoices per customer on average
- Make it expensive to update a customer's company name (would require updating ~33 documents)
- Make customer profile queries require aggregating across string-matched fields

By normalizing into a `Customer` collection:
- Each customer's name + company is stored **once**
- Invoice documents reference customers via `ObjectId` (4 bytes vs ~30 bytes per string)
- Customer profile queries become a simple `Invoice.find({ customer: id })` — O(1) lookup via index
- Summary aggregations (top customers by value) are clean `$group` pipelines on `customer` ObjectIds

**Why store `tax` and `total` redundantly?**

Although `tax = amount × taxRate / 100` and `total = amount + tax` are computable, storing them:
- Enables **indexed range queries** on `total` without application-level computation
- Enables **fast aggregations** (`$sum: '$total'`) across 2000 records
- Preserves the exact values from the seed (avoids float precision drift on re-computation)

### Indexes

| Collection | Index                        | Purpose                          |
|------------|------------------------------|----------------------------------|
| invoices   | `status`                     | Filter by status                 |
| invoices   | `customer`                   | Customer profile lookups         |
| invoices   | `issueDate`                  | Date range filters               |
| invoices   | `dueDate`                    | Date range filters + sort        |
| invoices   | `total`                      | Amount sort                      |
| invoices   | `invoiceId` (unique)         | Dedup + search                   |
| customers  | `name`                       | Customer name search             |
| customers  | `name + company` (unique)    | Prevent duplicate entries        |

---

## Assumptions

1. `taxRate` is always one of `0, 3, 5, 18, 28` — enforced via Mongoose `enum`.
2. A customer name is unique within a company (enforced by compound unique index).
3. The seed script is idempotent — running it twice clears and re-loads all data.
4. Invoice IDs are generated with the format `INV-XXXXXXX` for new invoices.
5. "Outstanding" = sum of totals where status is `Sent`, `Unpaid`, or `Overdue`.

---

## Stretch Goals Implemented

- [x] Docker Compose (Mongo + API + Frontend)

