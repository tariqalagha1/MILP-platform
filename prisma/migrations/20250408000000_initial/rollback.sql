-- MILP Healthcare Revenue Intelligence Platform
-- Rollback Migration: Initial Schema
-- Run this script to completely undo the initial migration
-- WARNING: This will DROP ALL DATA in the database

-- Drop foreign key constraints first
ALTER TABLE IF EXISTS "appointments" DROP CONSTRAINT IF EXISTS "appointments_patientId_fkey";
ALTER TABLE IF EXISTS "appointments" DROP CONSTRAINT IF EXISTS "appointments_branchId_fkey";
ALTER TABLE IF EXISTS "patients" DROP CONSTRAINT IF EXISTS "patients_branchId_fkey";
ALTER TABLE IF EXISTS "claims" DROP CONSTRAINT IF EXISTS "claims_branchId_fkey";
ALTER TABLE IF EXISTS "roi_calculations" DROP CONSTRAINT IF EXISTS "roi_calculations_branchId_fkey";
ALTER TABLE IF EXISTS "branches" DROP CONSTRAINT IF EXISTS "branches_organizationId_fkey";
ALTER TABLE IF EXISTS "users" DROP CONSTRAINT IF EXISTS "users_organizationId_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "appointments_patientId_idx";
DROP INDEX IF EXISTS "appointments_branchId_scheduledAt_idx";
DROP INDEX IF EXISTS "patients_branchId_nextDueAt_idx";
DROP INDEX IF EXISTS "patients_branchId_externalId_key";
DROP INDEX IF EXISTS "claims_branchId_submittedAt_idx";
DROP INDEX IF EXISTS "claims_branchId_status_idx";
DROP INDEX IF EXISTS "roi_calculations_branchId_idx";
DROP INDEX IF EXISTS "branches_organizationId_idx";
DROP INDEX IF EXISTS "users_clerkUserId_key";
DROP INDEX IF EXISTS "organizations_clerkOrgId_key";
DROP INDEX IF EXISTS "organizations_slug_key";

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS "appointments";
DROP TABLE IF EXISTS "patients";
DROP TABLE IF EXISTS "claims";
DROP TABLE IF EXISTS "roi_calculations";
DROP TABLE IF EXISTS "branches";
DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "organizations";

-- Drop enums
DROP TYPE IF EXISTS "ApptStatus";
DROP TYPE IF EXISTS "ClaimStatus";
DROP TYPE IF EXISTS "Plan";
