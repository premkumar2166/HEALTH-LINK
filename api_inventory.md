# API Inventory & Audit

### /api/ai/chat
- **Methods:** POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/analytics/doctor
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ✅ Yes (Mock)

### /api/analytics/hospital
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ✅ Yes (Mock)

### /api/analytics/patient
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ✅ Yes (Mock)

### /api/analytics/patient/trends
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/appointments/notes
- **Methods:** POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/appointments
- **Methods:** GET, POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ✅ Yes (Mock)

### /api/appointments/[id]
- **Methods:** PATCH
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ✅ Yes (Mock)

### /api/auth/login
- **Methods:** POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)
- **Rate Limiting:** ✅ Route-specific (Strict)

### /api/auth/logout
- **Methods:** POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)
- **Rate Limiting:** ✅ Global (Middleware)

### /api/auth/me
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)
- **Rate Limiting:** ✅ Global (Middleware)

### /api/auth/register
- **Methods:** POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)
- **Rate Limiting:** ✅ Route-specific (Strict)

### /api/doctor/connect
- **Methods:** POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/doctor/patients/[id]/health-data
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/doctor/patients/[id]
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/doctor/patients/[id]/timeline
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/documents
- **Methods:** GET, POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ✅ Yes (Mock)

### /api/documents/[id]/audit
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ✅ Yes (Mock)

### /api/documents/[id]
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ✅ Yes (Mock)

### /api/health-data
- **Methods:** POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/admissions/discharge
- **Methods:** POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/admissions
- **Methods:** GET, POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/admissions/[id]
- **Methods:** PATCH
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/appointments
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/audit
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/beds/assign
- **Methods:** POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/billing
- **Methods:** GET, POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/billing/[id]
- **Methods:** PATCH
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/departments
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/doctors
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/inventory
- **Methods:** GET, POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/inventory/[id]
- **Methods:** PATCH
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/patients
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/reports
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/hospital/rooms
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/messages
- **Methods:** GET, POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/security/events
- **Methods:** GET
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/security/sessions
- **Methods:** GET, DELETE
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ✅ Yes
- **Database Interaction:** ❌ None (Dead/Static endpoint)

### /api/voice-messages
- **Methods:** POST
- **Global Auth (Middleware):** ✅ Yes
- **Route Auth Checking:** ❌ No (Relies on Middleware only)
- **Database Interaction:** ❌ None (Dead/Static endpoint)

