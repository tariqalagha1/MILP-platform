import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard - Get consolidated executive dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    const where: any = {};
    if (branchId) where.branchId = branchId;

    // Claims stats
    const totalClaims = await prisma.claim.count({ where });
    const rejectedClaims = await prisma.claim.count({
      where: { ...where, status: 'REJECTED' },
    });
    const claimsRejectionRate = totalClaims > 0 ? (rejectedClaims / totalClaims) * 100 : 0;
    
    // Calculate recoverable amount from claims
    const rejectedClaimsData = await prisma.claim.findMany({
      where: { ...where, status: 'REJECTED' },
    });
    const recoverableClaimsAmount = rejectedClaimsData.reduce((sum, c) => sum + (c.amount || 0), 0) * 0.5;

    // Patient stats
    const totalPatients = await prisma.patient.count({ where });
    const overduePatients = await prisma.patient.count({
      where: {
        ...where,
        nextDueAt: { lt: new Date() },
      },
    });

    // Appointment stats
    const totalAppointments = await prisma.appointment.count({ where });
    const noShowAppointments = await prisma.appointment.count({
      where: { ...where, status: 'NO_SHOW' },
    });
    const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

    // Calculate revenue impact
    const completedAppointments = await prisma.appointment.findMany({
      where: { ...where, status: 'COMPLETED' },
    });
    const totalRevenue = completedAppointments.reduce((sum, a) => sum + (a.value || 0), 0);

    // Calculate potential recovery (no-shows + rejected claims)
    const noShowAppointmentsData = await prisma.appointment.findMany({
      where: { ...where, status: 'NO_SHOW' },
    });
    const noShowLoss = noShowAppointmentsData.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalRecoverable = (noShowLoss * 0.4) + recoverableClaimsAmount; // 40% of no-shows recoverable

    // Recent activity
    const recentClaims = await prisma.claim.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentAppointments = await prisma.appointment.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      take: 5,
      include: {
        patient: true,
      },
    });

    return NextResponse.json({
      summary: {
        totalPatients,
        totalAppointments,
        totalClaims,
        totalRevenue,
      },
      metrics: {
        noShowRate,
        claimsRejectionRate,
        overduePatients,
        recoverableAmount: totalRecoverable,
      },
      alerts: {
        highNoShowRate: noShowRate > 15,
        highRejectionRate: claimsRejectionRate > 15,
        overdueFollowUps: overduePatients > 0,
      },
      recentActivity: {
        claims: recentClaims,
        appointments: recentAppointments,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
