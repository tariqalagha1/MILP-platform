import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/patients - List patients with follow-up status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const overdue = searchParams.get('overdue') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (overdue) {
      where.nextDueAt = { lt: new Date() };
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { nextDueAt: 'asc' },
      take: limit,
      include: {
        appointments: {
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branchId, externalId, noShowCount, lastVisitAt, nextDueAt } = body;

    const patient = await prisma.patient.create({
      data: {
        branchId,
        externalId,
        noShowCount: noShowCount || 0,
        lastVisitAt: lastVisitAt ? new Date(lastVisitAt) : null,
        nextDueAt: nextDueAt ? new Date(nextDueAt) : null,
      },
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
