# HEALTHLINK - RELEASE CANDIDATE INVENTORY
**Date:** September 30, 2026
**Version:** 0.1.0-RC1

This document represents the absolute state of the HEALTHLINK platform at the moment of the Step 35 Feature Freeze.

---

## 1. Current Features
*   **Authentication:** Stateless JWT HttpOnly cookies with bcrypt password hashing.
*   **Authorization:** Middleware-driven Role-Based Access Control (RBAC).
*   **Patient Portal:** Dashboard, Timeline, Appointments, Messaging UI, Document Upload UI, AI Assistant UI.
*   **Doctor Portal:** Patient filtering, Appointment management, Clinical reports charting, Chat UI.
*   **Hospital Portal:** Operational Health dashboard, Audit Logs, Staff/Doctor Management, Beds, Inventory, Analytics.
*   **Security:** Rate-limiting (10 req/minute), Centralized Redacted Logging, BOLA/IDOR protection.
*   **UI/UX:** Responsive unified layout, optimized Turbopack SSG builds, 3D WebGL lazy-loaded landing page.

## 2. Current Routes
*   **Public:** `/`, `/login`, `/register`
*   **Patient Context (`/patient/*`):** `/patient`, `/patient/appointments`, `/patient/documents`, `/patient/messages`, `/patient/profile`, `/patient/settings`, `/patient/timeline`, `/patient/trends`
*   **Doctor Context (`/doctor/*`):** `/doctor`, `/doctor/appointments`, `/doctor/messages`, `/doctor/patients`, `/doctor/reports`, `/doctor/settings`
*   **Hospital Context (`/hospital/*`):** `/hospital`, `/hospital/admissions`, `/hospital/ai`, `/hospital/analytics`, `/hospital/appointments`, `/hospital/audit`, `/hospital/beds`, `/hospital/billing`, `/hospital/departments`, `/hospital/doctors`, `/hospital/inventory`, `/hospital/notifications`, `/hospital/patients`, `/hospital/security`, `/hospital/settings`, `/hospital/staff`, `/hospital/system`

## 3. Current APIs
*   **Auth:** `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`
*   **Appointments:** `GET /api/appointments`, `POST /api/appointments`, `PATCH /api/appointments/[id]`
*   **Documents:** `GET /api/documents`
*   **Health Data:** `GET /api/health-data`, `GET /api/patient/timeline`, `GET /api/patient/trends`
*   **Hospital Ops:** `GET /api/hospital/analytics`, `GET /api/hospital/audit`, `GET /api/hospital/system`
*   **Network:** `GET /api/health` (Load balancer ping)

## 4. Current Database Schema (`prisma/schema.prisma`)
*   **Provider:** `sqlite` (frozen RC target).
*   **Models:**
    *   `User`: id, email, passwordHash, role, firstName, lastName, phone, createdAt, updatedAt
    *   `Profile`: id, userId, data (JSON), createdAt, updatedAt
    *   `PatientData`: id, patientId, bloodType, allergies, chronicConditions, createdAt, updatedAt
    *   `DoctorData`: id, doctorId, specialty, department, hospital, createdAt, updatedAt
    *   `Appointment`: id, patientId, doctorId, dateTime, durationMinutes, status, reason, notes, createdAt, updatedAt

## 5. Current Dependencies
*   **Core:** `next` (16.3.6), `react` (19.2.8), `react-dom` (19.2.8)
*   **Security:** `jose` (^6.2.12), `bcryptjs` (^3.0.3)
*   **Database:** `@prisma/client` (^7.10.0)
*   **Styling & UI:** `tailwindcss` (^4), `@react-three/fiber` (^9.8.1), `@react-three/drei` (^10.7.9), `three` (^0.186.1)

## 6. Environment Configuration (`.env.example`)
*   **Core:** `NODE_ENV`, `PORT`, `NEXT_PUBLIC_APP_URL`
*   **Security:** `JWT_SECRET`, `JWT_EXPIRES_IN`, `PASSWORD_SALT_ROUNDS`
*   **Database:** `DATABASE_URL`
*   **Realtime/Communications (PLANNED):** `NEXT_PUBLIC_WS_URL`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_API_KEY`, `TWILIO_API_SECRET`
*   **Storage (PLANNED):** `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`
*   **AI (PLANNED):** `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

## 7. Known Limitations
*   The current database relies heavily on the `src/lib/mockDb.ts` module instead of fully querying the SQLite Prisma client due to sandbox execution safety during the rapid prototyping phase.
*   Chat messaging utilizes local `setTimeout` functions to simulate remote responses.
*   File uploads (like images and audio blobs) are bound to the browser tab lifecycle using `URL.createObjectURL` and do not persist across hard reloads.

## 8. Configuration-Required Services
*   **S3 Object Storage:** Required to persist Document and Image uploads securely.
*   **WebSocket/Pusher Service:** Required for the RealtimeContext to push Chat and Live Notifications.
*   **Twilio/WebRTC:** Required to operationalize the Calling/Telemedicine interface.
*   **OpenAI API:** Required to enable the Clinical AI Assistant live chat fallback logic.
*   **PostgreSQL:** Required for replacing the local `dev.db` file in the cloud production environment.

---
**STATUS:** FROZEN
