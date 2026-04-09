import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/patients/stats - Get patient follow-up statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    const where: any = {};
    if (branchId) where.branchId = branchId;

    // Get total patients
    const totalPatients = await prisma.patient.count({ where });

    // Get overdue patients (nextDueAt < now)
    const overduePatients = await prisma.patient.count({
      where: {
        ...where,
        nextDueAt: { lt: new Date() },
      },
    });

    // Get patients with high no-show risk (> 50%)
    const highRiskPatients = await prisma.patient.count({
      where: {
        ...where,
        noShowRisk: { gt: 50 },
      },
    });

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      take: 10,
      include: {
        patient: true,
      },
    });

    // Calculate no-show rate
    const totalAppointments = await prisma.appointment.count({ where });
    const noShowAppointments = await prisma.appointment.count({
      where: {
        ...where,
        status: 'NO_SHOW',
      },
    });
    const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

    return NextResponse.json({
      totalPatients,
      overduePatients,
      highRiskPatients,
      noShowRate,
      recentAppointments,
    });
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient statistics' },
      { status: 500 }
    );
  }
}
