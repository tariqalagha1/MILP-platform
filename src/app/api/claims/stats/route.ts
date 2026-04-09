import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/claims/stats - Get claims statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    const where: any = {};
    if (branchId) where.branchId = branchId;

    // Get counts by status
    const statusCounts = await prisma.claim.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
      _sum: { amount: true },
    });

    // Get total claims and amounts
    const totalStats = await prisma.claim.aggregate({
      where,
      _count: { id: true },
      _sum: { amount: true },
    });

    // Get recent rejected claims with risk and missing fields
    const recentRejected = await prisma.claim.findMany({
      where: { ...where, status: 'REJECTED' },
      orderBy: { submittedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        claimNumber: true,
        amount: true,
        rejectionReason: true,
        submittedAt: true,
        rejectionRisk: true,
        missingFields: true,
        status: true,
      },
    });

    // Calculate rejection rate
    const totalClaims = (totalStats as any)._count.id || 0;
    const rejectedClaims = (statusCounts as any[]).find((s: any) => s.status === 'REJECTED')?._count?.status || 0;
    const rejectionRate = totalClaims > 0 ? (rejectedClaims / totalClaims) * 100 : 0;

    // Calculate recoverable amount (rejected claims)
    const recoverableAmount = (statusCounts as any[]).find((s: any) => s.status === 'REJECTED')?._sum?.amount || 0;

    return NextResponse.json({
      totalClaims,
      totalAmount: totalStats._sum.amount || 0,
      rejectionRate,
      rejectedClaims,
      recoverableAmount,
      statusBreakdown: statusCounts,
      recentRejected,
    });
  } catch (error) {
    console.error('Error fetching claim stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claim statistics' },
      { status: 500 }
    );
  }
}
