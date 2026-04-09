import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/claims - List claims with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;

    const claims = await prisma.claim.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      take: limit,
      include: {
        branch: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

// POST /api/claims - Create a new claim
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branchId, claimNumber, patientId, amount, status, rejectionReason, missingFields } = body;

    const claim = await prisma.claim.create({
      data: {
        branchId,
        claimNumber,
        patientId,
        amount,
        status: status || 'SUBMITTED',
        rejectionReason,
        missingFields: missingFields || [],
      },
    });

    return NextResponse.json({ claim }, { status: 201 });
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}
