import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/appointments - List appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    if (upcoming) {
      where.scheduledAt = { gte: new Date() };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      take: limit,
      include: {
        patient: true,
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, branchId, scheduledAt, status, value, noShowRisk } = body;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        branchId,
        scheduledAt: new Date(scheduledAt),
        status: status || 'SCHEDULED',
        value: value || 0,
        noShowRisk: noShowRisk || null,
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
