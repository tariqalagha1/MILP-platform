import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reports - Get comprehensive reports data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const period = searchParams.get('period') || '30'; // days

    const where: any = {};
    if (branchId) where.branchId = branchId;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Revenue trends by month
    const appointments = await prisma.appointment.findMany({
      where: {
        ...where,
        scheduledAt: { gte: daysAgo },
      },
    });

    const revenueByMonth: Record<string, { completed: number; noShow: number; cancelled: number }> = {};
    appointments.forEach((appt) => {
      const month = new Date(appt.scheduledAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = { completed: 0, noShow: 0, cancelled: 0 };
      }
      if (appt.status === 'COMPLETED') {
        revenueByMonth[month].completed += appt.value || 0;
      } else if (appt.status === 'NO_SHOW') {
        revenueByMonth[month].noShow += appt.value || 0;
      } else if (appt.status === 'CANCELLED') {
        revenueByMonth[month].cancelled += appt.value || 0;
      }
    });

    // Claims trends
    const claims = await prisma.claim.findMany({
      where: {
        ...where,
        submittedAt: { gte: daysAgo },
      },
    });

    const claimsByMonth: Record<string, { submitted: number; approved: number; rejected: number }> = {};
    claims.forEach((claim) => {
      const month = new Date(claim.submittedAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!claimsByMonth[month]) {
        claimsByMonth[month] = { submitted: 0, approved: 0, rejected: 0 };
      }
      claimsByMonth[month].submitted += claim.amount || 0;
      if (claim.status === 'APPROVED') {
        claimsByMonth[month].approved += claim.amount || 0;
      } else if (claim.status === 'REJECTED') {
        claimsByMonth[month].rejected += claim.amount || 0;
      }
    });

    // Patient retention metrics
    const patients = await prisma.patient.findMany({ where });
    const totalPatients = patients.length;
    const returningPatients = patients.filter((p) => (p.noShowCount || 0) === 0).length;
    const atRiskPatients = patients.filter((p) => (p.noShowCount || 0) >= 2).length;

    // Status breakdown
    const appointmentStatusCounts = {
      SCHEDULED: appointments.filter((a) => a.status === 'SCHEDULED').length,
      COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
      NO_SHOW: appointments.filter((a) => a.status === 'NO_SHOW').length,
      CANCELLED: appointments.filter((a) => a.status === 'CANCELLED').length,
    };

    const claimStatusCounts = {
      PENDING: claims.filter((c) => c.status === 'PENDING').length,
      APPROVED: claims.filter((c) => c.status === 'APPROVED').length,
      REJECTED: claims.filter((c) => c.status === 'REJECTED').length,
    };

    // Calculate key metrics
    const totalRevenue = appointments
      .filter((a) => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.value || 0), 0);
    const lostRevenue = appointments
      .filter((a) => a.status === 'NO_SHOW' || a.status === 'CANCELLED')
      .reduce((sum, a) => sum + (a.value || 0), 0);
    const totalClaimsSubmitted = claims.reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalClaimsApproved = claims
      .filter((c) => c.status === 'APPROVED')
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    return NextResponse.json({
      period: parseInt(period),
      summary: {
        totalRevenue,
        lostRevenue,
        totalClaimsSubmitted,
        totalClaimsApproved,
        collectionRate: totalClaimsSubmitted > 0 ? (totalClaimsApproved / totalClaimsSubmitted) * 100 : 0,
        patientRetentionRate: totalPatients > 0 ? (returningPatients / totalPatients) * 100 : 0,
      },
      trends: {
        revenue: Object.entries(revenueByMonth).map(([month, data]) => ({
          month,
          ...data,
        })),
        claims: Object.entries(claimsByMonth).map(([month, data]) => ({
          month,
          ...data,
        })),
      },
      breakdown: {
        appointments: appointmentStatusCounts,
        claims: claimStatusCounts,
      },
      patients: {
        total: totalPatients,
        returning: returningPatients,
        atRisk: atRiskPatients,
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports data' },
      { status: 500 }
    );
  }
}
