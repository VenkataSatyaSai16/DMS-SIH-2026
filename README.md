# Digital Evidence & Case Management System (DMS)

Official Digital Evidence Management System (DMS) built for law enforcement, investigative agencies, and judicial authorities. This platform enforces **Zero-Trust Access Control (RBAC & ABAC)**, chain-of-custody integrity for digital evidence, and real-time administrative workflows.

---

## 🏛️ System Features & Capabilities

### 📄 Case Registry & Dashboard
- **Official Sequential Reference IDs**: Automatically generates official `DMS-YYYY-000001` reference numbers in transaction blocks.
- **Status Lifecycle Control**: Single-click quick actions to transition case statuses between `ACTIVE`, `CLOSED`, and `ARCHIVED` with visual badge indicators.
- **Involved Persons Records**: Track victims, suspects, complainants, and witnesses with statement notes.

### 🛡️ Digital Evidence Inventory
- **Authenticated File Downloads**: Streams files securely via authenticated API blobs (`/api/cases/:caseId/files/:fileId/download`), preventing unauthorized access or URL leaking.
- **Cryptographic Audit**: Computes SHA-256 hashes and integrates with optional blockchain verification networks for chain-of-custody integrity.
- **Multi-Format Support**: Handles evidence files including documents, images, video recordings, and text statements.

### 🔐 Zero-Trust Security & Access Scopes
- **Granular Scope Control**:
  - `ORGANIZATION`: Full organizational access (Supervisors / Directors).
  - `OWN_UNIT`: Access restricted to assigned department unit.
  - `UNIT_AND_DESCENDANTS`: Access to unit and child branches.
  - `ASSIGNED_CASES`: Access strictly limited to explicitly assigned cases.
  - `EXPLICIT_CASES`: Case-level security clearance grants.
- **Auto-Creator Clearance**: Case creators are automatically granted access and registered as assigned officers.

### 🏢 Organization Units & Personnel Directory
- **Department Hierarchies**: Manage administrative units, parent-child relationships, and unit codes.
- **Role & Permission Management**: Manage granular capability checks (`CASE_CREATE`, `CASE_VIEW`, `CASE_MODIFY`, `CASE_ASSIGN`, `EVIDENCE_UPLOAD`, `EVIDENCE_DOWNLOAD`, `EVIDENCE_VERIFY`, `AUDIT_VIEW`).

### 📊 Audit Trails & Officer Profile
- **Zero-Trust Audit Logs**: Tracks system requests, access decisions (`ALLOWED` / `DENIED`), IP addresses, and actions.
- **Officer Profile View**: View security clearance, assigned roles, department memberships, and active authorizations.

---

## 🛠️ Technology Stack

- **Frontend (`/client`)**: React 18, Vite, React Router DOM, Axios, Lucide Icons, CSS Custom Properties (Formal Government Theme).
- **Backend (`/server`)**: Node.js, Express, Prisma ORM, PostgreSQL, Zod Schema Validation, JSON Web Token (JWT) Authentication.
- **Storage & Infrastructure**: Local Blob Streaming / S3 Compatible Storage, PostgreSQL database engine.

---

## 📁 Repository Structure

```text
├── client/                     # Vite + React Frontend Application
│   ├── public/                 # Static assets & government iconography
│   ├── src/
│   │   ├── components/         # Shared UI components (Layout, Sidebar, Navbar)
│   │   ├── context/            # AuthContext & state providers
│   │   ├── hooks/              # Custom hooks (usePermissions, etc.)
│   │   ├── pages/              # Primary views (Cases, CaseDetails, Units, Users, AuditLogs, Profile, Login)
│   │   ├── services/           # Axios API client instance
│   │   ├── App.jsx             # Route definitions & guards
│   │   └── main.jsx            # Entry point
│   ├── .env.example            # Client environment template
│   └── package.json            # Client dependencies
│
├── server/                     # Express + Prisma Backend API
│   ├── prisma/                 # Database schema & migrations
│   │   ├── schema.prisma       # PostgreSQL models & indexes
│   │   └── seed.js             # Initial database seed script
│   ├── src/
│   │   ├── authorization/      # Access & Scope evaluation engine
│   │   ├── config/             # DB & server configuration
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth, Authorize, Zero-Trust & Validation middleware
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Business logic & database operations
│   │   ├── validators/         # Zod schemas for input validation
│   │   └── app.js              # Express app initialization
│   ├── .env.example            # Server environment template
│   └── package.json            # Server dependencies
│
├── .env.example                # Combined environment configuration guide
├── .gitignore                  # Combined Git ignore definitions
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **PostgreSQL**: Running instance on port `5432`

---

### 2. Backend Setup (`server`)

1. Navigate into the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   *Configure your `DATABASE_URL` and `JWT_SECRET` inside `.env`.*

4. Apply database schema and seed default data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on **`http://localhost:3000`**.

---

### 3. Frontend Setup (`client`)

1. Open a new terminal and navigate into the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
   Access the web interface at **`http://localhost:5173`**.

---

## 📡 Core API Endpoints

| Method | Endpoint | Description | Permission Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Officer authentication & JWT issuance | Public |
| `GET` | `/api/auth/me` | Fetch active user credentials & profile | Authenticated |
| `GET` | `/api/cases` | Fetch authorized case list based on scope | `CASE_VIEW` |
| `POST` | `/api/cases` | Register a new official case record | `CASE_CREATE` |
| `GET` | `/api/cases/:id` | Fetch detailed case dashboard & files | `CASE_VIEW` |
| `PATCH` | `/api/cases/:id` | Update case metadata / status (`ACTIVE`/`CLOSED`/`ARCHIVED`) | `CASE_MODIFY` |
| `GET` | `/api/cases/:id/files/:fileId/download` | Stream evidence file blob via API | `EVIDENCE_DOWNLOAD` |
| `POST` | `/api/cases/:id/files` | Upload digital evidence file | `EVIDENCE_UPLOAD` |
| `GET` | `/api/organization-units` | List all administrative department units | `UNIT_VIEW` |
| `GET` | `/api/users` | List user directory & roles | `USER_VIEW` |
| `GET` | `/api/audit-logs` | Fetch zero-trust security audit logs | `AUDIT_VIEW` |

---

## 📜 Security Compliance & Design Principles

- **Formal Administrative Aesthetic**: Designed adhering to Government Digital Service standards (Deep Navy `#1b365d`, crisp white cards, light slate `#f4f6f9` background).
- **No Insecure Public File Exposure**: All evidence downloads are authorized in-memory blobs via JWT headers.
- **Fail-Safe Authorization Messages**: Explicit user messaging for `403 Access Denied` and `401 Unauthorized` states without exposing raw secrets or internal tracebacks.
