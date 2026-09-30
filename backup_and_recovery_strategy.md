# HEALTHLINK Backup & Recovery Strategy

This document outlines the standard operating procedures (SOP) for backing up and recovering HEALTHLINK data. This strategy ensures compliance with healthcare data retention laws and prevents catastrophic data loss.

## 1. Database Strategy (PostgreSQL/Production)

### What is backed up?
- The entire PostgreSQL relational database, including Users, Patients, Doctors, Appointments, Health Records, Messages, and Audit Logs.

### How often?
- **Continuous:** Write-Ahead Logging (WAL) is enabled for Point-in-Time Recovery (PITR) up to the last 5 minutes.
- **Daily:** Full automated snapshots are taken at 02:00 UTC during low-traffic periods.

### Where is it stored?
- Backups are stored in an encrypted, geographically isolated AWS S3 bucket (or equivalent cloud storage provider).
- Storage buckets have `Object Lock` enabled (WORM - Write Once, Read Many) to prevent ransomware modification.

### Retention
- **WAL Logs:** Retained for 7 days.
- **Daily Snapshots:** Retained for 30 days.
- **Monthly Snapshots:** Retained for 7 years (Compliance mandate).

### How restoration is performed
1. **Identify Failure:** Determine the timestamp of the corruption or data loss.
2. **Provision Instance:** Spin up a parallel read-only recovery PostgreSQL instance.
3. **Restore Data:** Run `pg_restore` (or use managed cloud UI like RDS Restore) to the exact timestamp prior to the failure using the WAL logs.
4. **Verification:** QA engineers verify the integrity of the data on the isolated recovery instance.
5. **Failover:** Redirect application traffic to the newly restored database.

---

## 2. File Storage Strategy (S3/Documents)

### What is backed up?
- All user-uploaded assets: Patient avatars, medical images, PDFs, billing invoices, and voice message audio blobs.

### Backup Strategy
- **Versioning:** S3 Bucket Versioning is explicitly enabled. Every modified or deleted file is kept as a hidden version.
- **Replication:** Cross-Region Replication (CRR) is enabled, instantly cloning all newly uploaded objects to a secondary region bucket.

### Recovery Strategy
- If a file is accidentally deleted or corrupted by ransomware, an administrator runs a script to revert the specific object to its previous version ID.
- In the event of a total region failure, DNS routing is updated to point the `STORAGE_PROVIDER` URL to the secondary replicated bucket.

### Access Control
- All backups are heavily restricted via Identity and Access Management (IAM) policies.
- Only the "Disaster Recovery Admin" role possesses `s3:GetObjectVersion` and `s3:RestoreObject` permissions.

---

## 3. Routine Verification
- **Quarterly Game Days:** Operations teams must perform a complete simulated restore to a staging environment every 3 months.
- **Automated Validation:** A daily automated script restores the latest snapshot to a temporary database, runs a basic `SELECT 1` health check, and destroys the temporary database.
