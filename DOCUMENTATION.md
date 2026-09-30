# HEALTHLINK Platform Documentation

Welcome to the official documentation for the **HEALTHLINK** healthcare management system.

---

## 1. Project Overview
HEALTHLINK is an integrated digital healthcare platform designed to securely bridge the gap between Patients, Doctors, and Hospital Administrators. It provides specialized portals for each role, offering telemedicine chat, appointment scheduling, health records management, and real-time operational analytics.

## 2. Architecture
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Vanilla)
- **Database ORM:** Prisma
- **Authentication:** Custom JWT-based stateless authentication (HttpOnly Cookies)
- **Rendering:** Static Site Generation (SSG) for layouts; Server-Side Rendering (SSR) & Edge Functions for APIs.

## 3. Folder Structure
```text
/src
  /app         # Next.js App Router (Pages, Layouts, API Routes)
  /components  # Reusable UI components (Forms, Tables, Chat, Charts)
  /config      # System-wide static configurations and route definitions
  /contexts    # React Context providers (e.g., RealtimeContext)
  /lib         # Core utilities (JWT, Logger, Mock DB, Password Hashing)
  /types       # TypeScript interfaces (Auth, Appointments, Realtime)
/prisma        # Database schema and (PLANNED) migrations
```

## 4. Frontend
The frontend heavily utilizes React Server Components to minimize JavaScript bundles. Interactive components (Chat, Image Uploads, AI Assistant) are explicitly marked with `"use client"`. The visual identity strictly adheres to the HEALTHLINK red/white professional aesthetic via standard Tailwind CSS utility classes.

## 5. Backend
The backend consists of Next.js Route Handlers (`route.ts`) living within `src/app/api/`. These handle authentication, data fetching, mutations, and specialized security middleware checks.

## 6. Database
- **Current State:** SQLite (`dev.db`) is used for local development, supplemented by in-memory caching arrays in `src/lib/mockDb.ts` for rapid prototyping.
- **PLANNED:** Migration to a PostgreSQL cluster for production.

## 7. Authentication
Users authenticate via `/api/auth/login`. Upon successful credential verification, a secure, 64-character encrypted JWT is generated and attached to the client as an `HttpOnly`, `Strict` cookie. No passwords or tokens are ever exposed to the client DOM.

## 8. Authorization
Role-Based Access Control (RBAC) is strictly enforced via global Edge Middleware (`src/middleware.ts`). 
- **Patient Role:** Can access `/patient/*`
- **Doctor Role:** Can access `/doctor/*`
- **Hospital Role:** Can access `/hospital/*`
Attempts to cross namespace boundaries result in immediate `403 Forbidden` or `307 Temporary Redirect` responses. IDOR/BOLA protections are enforced at the API layer (e.g., Doctors can only query appointments for their authorized patients).

## 9. API Documentation
Key endpoints include:
- `POST /api/auth/login`: Authenticate and receive HttpOnly cookie.
- `GET /api/auth/me`: Retrieve current session payload.
- `GET /api/appointments`: Fetch appointments (filtered by caller's role context).
- `POST /api/appointments`: Book an appointment (includes double-booking conflict detection).
- `GET /api/health`: Load-balancer health check (`200 OK`).
- `GET /api/hospital/system`: Operational health telemetry and redacted logs.

## 10. Patient Portal
**Status:** Implemented
Patients can view their timeline, book appointments with their assigned doctors, upload documents, and interact with the AI assistant. 

## 11. Doctor Portal
**Status:** Implemented
Doctors possess a specialized dashboard for reviewing upcoming appointments, analyzing patient health trends, interacting with patients via telemedicine chat, and writing clinical notes.

## 12. Hospital Portal
**Status:** Implemented
Hospital Administrators manage overarching operations, including Staff and Doctor directories, hospital inventory, bed assignments, and global audit logs.

## 13. Communication
**Status:** UI Implemented | **CONFIGURATION REQUIRED**
The Chat Interface supports Text, Image (`URL.createObjectURL`), and Voice blobs.
- **PLANNED:** Integration with a production WebSocket provider (e.g., Pusher) is required for true cross-network real-time delivery.

## 14. Appointments
**Status:** Implemented
Supports automated time-conflict detection, role-based creation (Patients booking Doctors, or Hospital booking on behalf of Patients), and status tracking (`REQUESTED`, `CONFIRMED`, `CANCELLED`).

## 15. Documents
**Status:** UI Implemented | **CONFIGURATION REQUIRED**
Client-side validation restricts uploads to images under 5MB. 
- **PLANNED:** An external blob storage provider (e.g., AWS S3) must be configured in production for permanent storage.

## 16. AI
**Status:** UI Implemented | **CONFIGURATION REQUIRED**
The Clinical AI Assistant interface is active, but fallback responses are hardcoded. A valid `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` must be provisioned to route live queries.

## 17. Analytics
**Status:** Implemented
The platform features responsive Bar Charts and trend analytics natively built using Tailwind CSS and `div` scaling, avoiding heavy third-party charting libraries.

## 18. Security
- **BOLA/IDOR:** Fixed. Users cannot modify or query records outside their relational bounds.
- **Rate Limiting:** IP-based tracking limits brute-force login attempts (10 req/min).
- **Logging:** Centralized `logger.ts` redacts sensitive fields (`password`, `token`, `ssn`) prior to stdout.
- **Headers:** Strict CSP and frame-denial headers implemented in `next.config.ts`.

## 19. Deployment
**Status:** Instructions Available
Deployment SOP is fully defined in `deployment_instructions.md`, highlighting the dangers of `db push` in production and mandating a 5-step Post-Deployment Verification smoke test.

## 20. Environment Variables
**Status:** Separated
Development and production variables are isolated. See `.env.example` for all required infrastructure keys. **Never commit `.env.development` or `.env.production`.**

## 21. Testing
**Status:** Manual Verification Established | **NOT AVAILABLE YET (Automated)**
Rigorous manual edge-routing and smoke testing has been documented. 
- **PLANNED:** Automated E2E testing using Playwright or Cypress to cover user journey flows continuously.

## 22. Troubleshooting
- **Port 3000 in use:** Run `kill -9 $(lsof -t -i:3000)` on Unix to free the port.
- **Database Lock (`dev.db`):** If SQLite locks during hot-reloading, delete the `prisma/dev.db-journal` file and restart the dev server.
- **Invalid Credentials Error (500):** Verify that the `JWT_SECRET` in your `.env.development` is exactly 32+ characters long, otherwise the crypto library will throw an initialization error.
