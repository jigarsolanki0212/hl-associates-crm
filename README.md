# HL Associates Sales CRM — Enterprise Regulatory Compliance Suite

A full-stack enterprise CRM built specifically for regulatory compliance consulting firms, managing the entire client lifecycle from initial inquiry, proforma proposal generation, client conversion, to automated milestone-based license renewal tracking.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL 16**, and **Prisma ORM**.

---

## 🌟 Key Features

1. **Dashboard & Executive Analytics**
   - Live KPI cards: Total Inquiries, Proposals Sent, Conversion Rates, and Expiring Services (<60 Days).
   - Geometric Inquiry Source visualization & Service Demand bar charts.
   - Actionable Expiring Soon alerts with one-click management.

2. **Inquiry Pipeline & State Machine**
   - Track prospects across lifecycle states: `NEW` ➔ `PROFORMA_SENT` ➔ `ACCEPTED` ➔ `CONVERTED` (terminal), with `LOST` and `REOPENED` workflows.
   - Multi-criteria filtering (ID, Company, Contact, Service Area, Date Range).
   - Assigned sales rep workflows with interactive status transitions.

3. **Commercial Snapshots & Proforma Invoicing**
   - Concurrency-safe atomic sequence numbering (`#INQ-XXXX`, `#CL-XXXX`, `PI-YYYY-XXXX`).
   - Immutable commercial snapshotting on proposals preserving historical pricing, scope, and tax rates.
   - Server-side A4 Proforma Invoice document generator with embedded printable view and email dispatch tracking.

4. **Client 360° View & Atomic Conversion**
   - 1-Click atomic transaction converting inquiries to active clients with scheduled renewal milestones.
   - Tabbed 360° workspace: Overview, Active Services, Proformas, Renewals & Reminders, Follow-ups, and Audit History.

5. **Compliance Renewal Engine & Automated Background Jobs**
   - Timezone-aware expiry engine (`Asia/Kolkata`) tracking 4 key milestones: **60 Days**, **30 Days**, **7 Days**, and **Expiry Day**.
   - Automated background scanner (`/api/jobs/renewals`) with idempotent reminder delivery and duplicate prevention.

6. **Enterprise Security & Administration**
   - Server-side session authentication with `hl_session` HTTP-only cookies and bcryptjs hashing.
   - Strict RBAC matrix separating `ADMIN` and `SALES` privileges.
   - AES-256-GCM authenticated symmetric encryption for SMTP credentials at rest.
   - Immutable audit logging on all regulatory actions.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/jigarsolanki0212/hl-associates-crm.git
cd hl-associates-crm
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hl_associates_crm?schema=public"
SESSION_SECRET="hl-associates-super-secret-session-key-change-in-production"
ENCRYPTION_SECRET="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
CRON_SECRET="hl-associates-crm-cron-secure-token-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed Demo Data
```bash
npx prisma db push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel

1. **Push to GitHub**: Repository is connected to your GitHub account (`jigarsolanki0212/hl-associates-crm`).
2. **Import Project into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Import the `hl-associates-crm` repository.
3. **Provision a PostgreSQL Database**:
   - Use **Vercel Postgres**, **Neon**, or **Supabase**.
4. **Set Environment Variables in Vercel**:
   - `DATABASE_URL`: Your hosted PostgreSQL connection string with SSL (`?sslmode=require`).
   - `SESSION_SECRET`: Random 32+ character string.
   - `ENCRYPTION_SECRET`: 64-character hex string for AES-256-GCM encryption.
   - `CRON_SECRET`: Secure token for background jobs.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production domain (e.g., `https://your-app.vercel.app`).
5. **Initialize Remote Schema**:
   Run locally or in CI against your remote database:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
6. **Deploy**:
   Click **Deploy**! The `postinstall` script automatically runs `prisma generate`.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@hlassociates.com` | `Password123!` |
| **Sales Representative** | `sales@hlassociates.com` | `Password123!` |

---

## 🧪 Running Automated Tests

```bash
npm test
```
Executes unit and integration tests across date calculations, RBAC matrix, and AES-256-GCM crypto with Vitest.

---

&copy; 2026 HL Associates. Enterprise Regulatory Compliance Suite.
