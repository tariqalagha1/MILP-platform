import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, isDemoMode } from '@/lib/auth';
import { RATE_LIMITS, withRateLimit } from '@/lib/rate-limit';

// POST /api/seed - Seed sample data for demo (ADMIN ONLY in production)
const seedHandler = async (request: NextRequest, user: any) => {
  // Block seed endpoint in production unless in demo mode
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && !isDemoMode()) {
    return NextResponse.json(
      { error: 'Seed endpoint disabled in production', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }
  
  try {
    const branchId = 'demo-branch-1';
    
    // Seed patients
    const patients = [
      { externalId: 'PAT-001', noShowCount: 0, noShowRisk: 15, lastVisitAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), nextDueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { externalId: 'PAT-002', noShowCount: 2, noShowRisk: 65, lastVisitAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), nextDueAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { externalId: 'PAT-003', noShowCount: 1, noShowRisk: 35, lastVisitAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), nextDueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      { externalId: 'PAT-004', noShowCount: 0, noShowRisk: 10, lastVisitAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), nextDueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { externalId: 'PAT-005', noShowCount: 3, noShowRisk: 80, lastVisitAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), nextDueAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { externalId: 'PAT-006', noShowCount: 0, noShowRisk: 5, lastVisitAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), nextDueAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      { externalId: 'PAT-007', noShowCount: 1, noShowRisk: 45, lastVisitAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), nextDueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { externalId: 'PAT-008', noShowCount: 0, noShowRisk: 20, lastVisitAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), nextDueAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
    ];

    const createdPatients: any[] = [];
    for (const patient of patients) {
      const created = await prisma.patient.create({
        data: { ...patient, branchId },
      });
      createdPatients.push(created);
    }

    // Seed appointments
    const appointments = [
      { patientId: createdPatients[0]?.id, scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), status: 'SCHEDULED', value: 350, noShowRisk: 15 },
      { patientId: createdPatients[1]?.id, scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), status: 'SCHEDULED', value: 500, noShowRisk: 65 },
      { patientId: createdPatients[2]?.id, scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'COMPLETED', value: 400 },
      { patientId: createdPatients[3]?.id, scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: 'SCHEDULED', value: 250, noShowRisk: 10 },
      { patientId: createdPatients[4]?.id, scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'NO_SHOW', value: 450, noShowRisk: 80 },
      { patientId: createdPatients[5]?.id, scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'COMPLETED', value: 600 },
      { patientId: createdPatients[6]?.id, scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'CANCELLED', value: 300 },
      { patientId: createdPatients[7]?.id, scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: 'COMPLETED', value: 550 },
      { patientId: createdPatients[0]?.id, scheduledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), status: 'COMPLETED', value: 350 },
      { patientId: createdPatients[2]?.id, scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'SCHEDULED', value: 400 },
    ];

    for (const appt of appointments) {
      if (appt.patientId) {
        await prisma.appointment.create({
          data: { ...appt, branchId },
        });
      }
    }

    // Seed claims with rejection risk and missing fields
    const claims = [
      { claimNumber: 'CLM-2024-001', amount: 2500, status: 'APPROVED', submittedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), rejectionReason: null, rejectionRisk: 15, missingFields: [] },
      { claimNumber: 'CLM-2024-002', amount: 1800, status: 'REJECTED', submittedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), rejectionReason: 'Missing authorization code', rejectionRisk: 92, missingFields: ['authorization_code', 'icd_code'] },
      { claimNumber: 'CLM-2024-003', amount: 3200, status: 'APPROVED', submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), rejectionReason: null, rejectionRisk: 22, missingFields: [] },
      { claimNumber: 'CLM-2024-004', amount: 950, status: 'PENDING', submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), rejectionReason: null, rejectionRisk: 45, missingFields: [] },
      { claimNumber: 'CLM-2024-005', amount: 4100, status: 'REJECTED', submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), rejectionReason: 'Invalid diagnosis code', rejectionRisk: 78, missingFields: ['diagnosis_code', 'physician_signature'] },
      { claimNumber: 'CLM-2024-006', amount: 2200, status: 'APPROVED', submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), rejectionReason: null, rejectionRisk: 18, missingFields: [] },
      { claimNumber: 'CLM-2024-007', amount: 1500, status: 'REJECTED', submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), rejectionReason: 'Patient eligibility expired', rejectionRisk: 67, missingFields: ['eligibility_verification'] },
      { claimNumber: 'CLM-2024-008', amount: 3800, status: 'PENDING', submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), rejectionReason: null, rejectionRisk: 34, missingFields: [] },
      { claimNumber: 'CLM-2024-009', amount: 2700, status: 'APPROVED', submittedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), rejectionReason: null, rejectionRisk: 12, missingFields: [] },
      { claimNumber: 'CLM-2024-010', amount: 1950, status: 'REJECTED', submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), rejectionReason: 'Duplicate submission', rejectionRisk: 88, missingFields: ['submission_id', 'original_claim_ref'] },
    ];

    for (const claim of claims) {
      await prisma.claim.create({
        data: { ...claim, branchId },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      counts: {
        patients: patients.length,
        appointments: appointments.length,
        claims: claims.length,
      },
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    );
  }
};

// Export with rate limiting and admin role requirement
export const POST = withRateLimit(
  RATE_LIMITS.seed,
  withRole('admin', seedHandler)
);
