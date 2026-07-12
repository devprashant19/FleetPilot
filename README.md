<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=FleetPilot+Logo" alt="FleetPilot Logo" width="150" height="150" />
  <h1 align="center">🚛 FleetPilot</h1>
  <p align="center">
    <strong>A professional, full-stack fleet management platform built for real-time vehicle tracking, trip dispatch workflows, driver management, and operational analytics.</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> • 
    <a href="#tech-stack">Tech Stack</a> • 
    <a href="#quick-start-docker">Quick Start</a> • 
    <a href="#demo-login-credentials">Demo</a> • 
    <a href="#api-reference">API</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

<p align="center">
  <img src="https://via.placeholder.com/800x400.png?text=FleetPilot+Dashboard+Preview" alt="FleetPilot Dashboard Preview" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
</p>

---

## 📖 Overview

FleetPilot provides complete control over your fleet's operations, seamlessly integrating drivers, vehicles, maintenance logs, and financial analytics into one intuitive dashboard. Designed for scalability and ease of use, it simplifies complex logistics into actionable insights.

## ✨ Key Features

- 📍 **Real-Time Tracking & Dispatch**: Instantly assign drivers and vehicles to trips, and monitor their status live.
- 📊 **Advanced Analytics & Reporting**: Generate insightful reports on fuel efficiency, operational costs, and fleet utilization.
- 👥 **Role-Based Access Control (RBAC)**: Dedicated interfaces for Fleet Managers, Drivers, Safety Officers, and Financial Analysts.
- 🛠️ **Maintenance & Expense Management**: Track vehicle health, log repairs, and manage operational expenses effortlessly.
- 🚀 **Modern Tech Stack**: Built with React, TypeScript, Node.js, and PostgreSQL for robust performance.

---

## 🚀 Quick Start (Docker)

Get FleetPilot up and running in minutes using Docker.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Installation

1. **Clone & Configure**
   ```bash
   git clone <repo-url>
   cd FleetPilot
   cp .env.example .env  # No changes needed for Docker
   ```

2. **Start the Infrastructure**
   ```bash
   docker compose up --build
   ```
   *This command will:*
   - Start **PostgreSQL** on port `5432`
   - Run **Prisma migrations** automatically
   - Seed the database with demo data
   - Start the **Backend API** on `http://localhost:3001`
   - Serve the **Frontend** on `http://localhost:5173`

3. **Open the Application**
   Navigate to 👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔐 Demo Login Credentials

Jump straight into the app with these pre-configured role accounts:

| Role | Email | Password |
|------|-------|----------|
| 🔵 **Fleet Manager** | `fleet@fleetpilot.com` | `fleet123` |
| 🟢 **Driver** | `driver@fleetpilot.com` | `fleet123` |
| 🟡 **Safety Officer** | `safety@fleetpilot.com` | `fleet123` |
| 🟣 **Financial Analyst** | `finance@fleetpilot.com` | `fleet123` |

---

## ✅ Demo Script (Judges Checklist)

Follow this step-by-step guide to explore FleetPilot's core capabilities:

1. **Log in** as `Fleet Manager`.
2. **Register a Vehicle:** Add "Van-05" (Reg: `VAN-05`, Type: `VAN`, Max Capacity: `500 kg`, Status: `Available`).
3. **Register a Driver:** Add "Alex" (ensure valid future license date).
4. **Create Valid Trip:** Log in as Driver (or stay as Fleet Manager) → Create a trip with `450 kg` cargo → ✅ **Succeeds**.
5. **Create Invalid Trip:** Create trip with `600 kg` cargo → ❌ **Rejected** *(exceeds 500 kg max capacity)*.
6. **Dispatch Trip:** Dispatch the valid trip. Notice Van-05 and Alex switch to "On Trip" and are removed from selection dropdowns.
7. **Complete Trip:** Enter odometer readings + fuel consumed. Status reverts to "Available".
8. **Maintenance Workflow:** Create a Maintenance Log for Van-05 → Status changes to "In Shop", removed from dispatch availability.
9. **Close Maintenance:** Close the log → Status reverts to "Available".
10. **Analytics:** Visit the Reports page to see live updates in Fuel Efficiency and Cost charts based on recent activity.
11. **Live Dashboard:** Observe KPI cards updating dynamically throughout the process.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS, shadcn/ui (Radix)
- **Data Fetching:** TanStack Query
- **Charts:** Recharts

### Backend & Database
- **Server:** Node.js, Express, TypeScript
- **Validation:** Zod
- **Database:** PostgreSQL 15 via Prisma ORM
- **Authentication:** JWT (localStorage), bcrypt password hashing

### Infrastructure
- **Containerization:** Docker Compose

---

## 🏗 Architecture

```text
FleetPilot/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Data models
│   │   └── seed.ts            # Seeding scripts for demo data
│   └── src/
│       ├── index.ts           # Express app entry point
│       ├── middleware/auth.ts # JWT authentication & RBAC logic
│       ├── validators/        # Zod validation schemas
│       └── routes/            # REST API endpoints
├── frontend/
│   └── src/
│       ├── pages/             # Route-level components
│       ├── components/        # Reusable UI & layout elements
│       ├── contexts/          # React Context (Auth)
│       └── lib/               # API clients, utilities
└── docker-compose.yml         # Docker orchestration
```

---

## 🛡 Business Rules Enforced (Server-Side)

FleetPilot enforces strict operational logic to prevent data inconsistencies:

- 🚫 **Unique Registration:** Duplicate vehicle registration numbers are instantly rejected.
- 🚫 **Status Filtering:** "Retired" or "In Shop" vehicles are never available for dispatch.
- 🚫 **Driver Validation:** Drivers with expired licenses or suspended status cannot be assigned to trips.
- 🔒 **Concurrency Safety:** "On Trip" vehicles or drivers cannot be assigned elsewhere (race-condition safe).
- ⚖️ **Capacity Validation:** Cargo weight must not exceed the vehicle's max capacity (checked on create and dispatch).
- ⚡ **Atomic Transactions:** 
  - **Dispatch:** Atomically updates both vehicle and driver to `ON_TRIP`.
  - **Complete:** Atomically restores to `AVAILABLE`, updates odometer, and auto-generates fuel logs.
  - **Cancel:** Instantly restores assets to `AVAILABLE` from a dispatched state.

---

## 📌 Assumptions & Design Decisions

1. **Revenue Management:** Revenue is entered manually on `Trip` entries (optional) and aggregated per vehicle for ROI calculations.
2. **Cost Calculation:** Operational Cost = `FuelLog.cost` + `MaintenanceLog.cost` + `Expense.amount` (per vehicle).
3. **Authentication Mechanism:** Uses `localStorage` JWT for rapid hackathon deployment (production would use `httpOnly` cookies).
4. **Data Export:** CSV export is handled entirely client-side based on visible table data.
5. **Fuel Cost Estimations:** Cost is estimated at the trip completion phase; actuals can be refined via the Fuel page.
6. **Fleet Utilization Metric:** Calculated as `(ON_TRIP + IN_SHOP) / (All non-RETIRED vehicles) × 100%`.
7. **Onboarding:** A signup endpoint exists (`POST /api/auth/signup`), but demo accounts are the intended primary demonstration flow.

---

## 🛠 Local Development (Without Docker)

*Requires Node.js 20+ and a running PostgreSQL instance.*

<details>
<summary><b>Backend Setup</b></summary>
<br>

```bash
cd backend
cp ../.env.example .env
# Edit DATABASE_URL in .env to point to your local PostgreSQL instance
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

</details>

<details>
<summary><b>Frontend Setup</b></summary>
<br>

*(In a separate terminal)*
```bash
cd frontend
npm install
# Ensure you create frontend/.env.local: VITE_API_URL=http://localhost:3001
npm run dev
```

</details>

---

## 🌐 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| **Auth** | | |
| `/api/auth/login` | `POST` | Authenticate user |
| `/api/auth/signup` | `POST` | Register new account |
| `/api/auth/me` | `GET` | Retrieve current user profile |
| **Vehicles** | | |
| `/api/vehicles` | `GET`/`POST` | List all / Register new vehicle |
| `/api/vehicles/:id` | `GET`/`PUT`/`DELETE` | Retrieve, update, or remove vehicle |
| **Drivers** | | |
| `/api/drivers` | `GET`/`POST` | List all / Register new driver |
| `/api/drivers/:id` | `GET`/`PUT`/`DELETE` | Retrieve, update, or remove driver |
| **Trips & Workflows** | | |
| `/api/trips` | `GET`/`POST` | List all / Create new trip |
| `/api/trips/:id/dispatch` | `POST` | Dispatch trip (updates asset statuses) |
| `/api/trips/:id/complete` | `POST` | Complete trip (logs fuel/odometer) |
| `/api/trips/:id/cancel` | `POST` | Cancel active trip |
| **Operations** | | |
| `/api/maintenance` | `GET`/`POST` | Retrieve / Create maintenance logs |
| `/api/maintenance/:id/close` | `POST` | Close an active maintenance log |
| `/api/fuel` | `GET`/`POST` | Retrieve / Create fuel logs |
| `/api/expenses` | `GET`/`POST` | Retrieve / Create general expenses |
| **Analytics** | | |
| `/api/dashboard` | `GET` | Retrieve live Key Performance Indicators |
| `/api/reports` | `GET` | Retrieve aggregated analytics reports |

---

<div align="center">
  <p>Made with ❤️ by the FleetPilot Team</p>
</div>

