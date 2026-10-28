# FlightFix – Aircraft Maintenance & MRO Management System

FlightFix is a production-grade 3D interactive Aircraft Maintenance, Repair & Overhaul (MRO) management web application. It combines enterprise-level aviation fleet engineering workflows with a real-time 3D WebGL digital twin for aircraft component diagnostics.

---

## Technical Stack & Architecture

- **Frontend:** React 18 + Vite + Tailwind CSS
- **3D Engine:** Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Icons & Styling:** Lucide React, Aviation Dark Navy & Charcoal Theme (`#070b12`)
- **Backend:** Python 3 + Django 5.2 + Django REST Framework (DRF)
- **API Communication:** Axios with automatic JWT Bearer token rotation & interceptors
- **Authentication:** JSON Web Tokens (SimpleJWT) with Role-Based Access Control (Admin, Maintenance Manager, Technician)
- **Database:** MySQL (using pure Python `PyMySQL` driver with zero C++ compilation dependencies) with automatic fallback to SQLite for instant plug-and-play development.

---

## 3D Aircraft Digital Twin & Interactive Diagnostics

- **Full Commercial Airliner Model:** Detailed 3D procedural mesh (Fuselage, Cockpit windscreen, Swept Wings with winglets, Twin High-Bypass Turbofans with animated spinning fan discs, Tricycle Landing Gear, Empennage Tail & Rudder, and Carbon Brake Assemblies).
- **Interactive Orbit Controls:** 360-degree rotation, smooth zooming, panning, and a one-click **Reset Camera** button.
- **7 Clickable Raycast Targets:**
  1. `Engine` (Port & Starboard turbofans & nacelles)
  2. `Landing Gear` (Nose gear & main multi-wheel bogies)
  3. `Wings` (Supercritical airfoils & winglets)
  4. `Fuselage` (Semi-monocoque pressurized cabin)
  5. `Cockpit` (Glass cockpit deck & avionics windscreen)
  6. `Tail` (Vertical stabilizer, rudder & elevators)
  7. `Brakes` (Carbon multi-disc brake assemblies on wheel hubs)
- **Visual Status Coding:**
  - **Operational:** Emerald Green (`#10b981`)
  - **Maintenance Due:** Amber / Orange (`#f59e0b`)
  - **Under Maintenance / AOG:** Pulsing Crimson Rose (`#f43f5e`)
  - **Warning Alert:** Yellow (`#eab308`)
- **Component Telemetry Panel:** Shows Component Name, Component ID, Status Badge, Airworthiness Condition Rating (0–100%), Last & Next Inspection Dates, Lead Assigned Technician, Related Work Orders list, and quick "Issue Work Order" action.

---

## Demo Accounts & Credentials

FlightFix comes pre-seeded with realistic aviation data. You can log in using any of the following accounts or use the **1-Click Demo Login** buttons on the login screen:

| Role | Username | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full access to fleet, users, inventory, system settings |
| **Maintenance Manager** | `manager` | `manager123` | Create & assign maintenance schedules, issue work orders, manage parts |
| **Technician** | `tech1` | `tech123` | Update tasks, log parts consumed, record maintenance notes |
| **Technician (Airframe)** | `tech2` | `tech123` | Inspect components, toggle checklist procedures |

---

## Step-by-Step Installation Guide

### Prerequisites
- **Node.js** (v18+ or v20+) and **npm**
- **Python** (v3.10, v3.11, v3.12, or v3.13)
- **MySQL** (Optional: e.g., XAMPP, WAMP, MySQL Server 8.0, or Docker)

---

### 1. How to Install Frontend

Navigate to the `frontend/` directory and install npm packages:

```bash
cd frontend
npm install
```

---

### 2. How to Install Backend

Navigate to the `backend/` directory, create a Python virtual environment, and install dependencies:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

---

### 3. How to Configure MySQL

FlightFix supports **MySQL** with PyMySQL.

1. Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command-line client) and create the database:
   ```sql
   CREATE DATABASE flightfix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Copy the sample environment file in `backend/`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your MySQL credentials:
   ```ini
   # Set to True to enable MySQL
   USE_MYSQL=True

   DB_NAME=flightfix_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=127.0.0.1
   DB_PORT=3306

   SECRET_KEY=flightfix-aviation-mro-secure-key-2026-xyz!
   DEBUG=True
   ```

*(Note: If `USE_MYSQL=False`, FlightFix runs on zero-configuration SQLite `db.sqlite3` out of the box).*

---

### 4. How to Run Migrations

From the `backend/` directory with virtual environment activated:

```bash
python manage.py makemigrations core
python manage.py migrate
```

---

### 5. How to Create a Superuser

To create an additional administrator account manually:

```bash
python manage.py createsuperuser
```
Follow the interactive prompts to set username, email, and password.

---

### 6. How to Seed Demo Data

FlightFix includes a custom aviation MRO seeding script that populates realistic commercial aircraft (`Boeing 737-800`, `Airbus A320neo`, `Boeing 787-9 Dreamliner`, `Airbus A321LR`, `Embraer E190`), all 35 installed components, spare parts, technicians, and work orders:

```bash
python manage.py seed_data
```

---

### 7. How to Start the Backend Server

From the `backend/` directory:

```bash
python manage.py runserver 127.0.0.1:8000
```
Backend API will be running at `http://127.0.0.1:8000/`.  
Django Admin portal is available at `http://127.0.0.1:8000/admin/`.

---

### 8. How to Start the Frontend Server

From the `frontend/` directory:

```bash
npm run dev
```
Open your browser at `http://localhost:3000/`.  
(The Vite development server proxies `/api` calls directly to `http://127.0.0.1:8000`).

---

## API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login/` | `POST` | Authenticate user & return JWT tokens |
| `/api/auth/refresh/` | `POST` | Refresh access token |
| `/api/auth/me/` | `GET` | Current authenticated operator profile |
| `/api/dashboard/stats/` | `GET` | Fleet stats, active WOs, low-stock alerts, trend data |
| `/api/aircraft/` | `GET, POST` | List all aircraft or register new airframe |
| `/api/aircraft/<id>/` | `GET, PATCH, DELETE` | Retrieve, update or deregister aircraft |
| `/api/aircraft/<id>/components/` | `GET` | Retrieve all 7 components with telemetry |
| `/api/aircraft/<id>/maintenance_history/` | `GET` | Historical airframe logbook records |
| `/api/components/<id>/` | `PATCH` | Update component condition, inspection date, or status |
| `/api/maintenance/` | `GET, POST` | List or create scheduled checks (A/B/C/D) |
| `/api/work-orders/` | `GET, POST` | List or create maintenance work orders |
| `/api/work-orders/<id>/add_task/` | `POST` | Add task step to work order checklist |
| `/api/work-orders/<id>/toggle_task/` | `POST` | Toggle completion status of task |
| `/api/work-orders/<id>/use_part/` | `POST` | Allocate spare part to work order (auto-deducts stock) |
| `/api/work-orders/<id>/mark_complete/` | `POST` | Sign off order, reset component condition, create audit log |
| `/api/technicians/` | `GET, POST` | View technician roster and workloads |
| `/api/spare-parts/` | `GET, POST` | Inventory catalogue and low-stock warnings |
| `/api/spare-parts/<id>/adjust_stock/` | `POST` | Log restocking or inventory adjustment |
| `/api/reports/data/` | `GET` | Compliance audits, downtime hours, parts usage, workload KPIs |

---

## System Verification Test

To verify all backend APIs programmatically, run:

```bash
python test_api.py
```
Expected output:
```
[OK] JWT Authentication Successful! Token acquired.
[OK] Authenticated Operator: admin (ADMIN)
[OK] Dashboard Stats API: 5 Aircraft, 3 Open WOs, 3 Low Stock Alerts
[OK] Aircraft API: 5 aircraft registered
[OK] Aircraft 3D Components API: 7 components installed on F-WZNR
[OK] Work Orders API: 4 work orders on roster
[OK] Spare Parts Inventory API: 8 part numbers tracked
[OK] Regulatory & MRO Reports API: Completion rate 25.0%

ALL FLIGHTFIX BACKEND APIS FUNCTIONING WITH 100% SUCCESS!
```
