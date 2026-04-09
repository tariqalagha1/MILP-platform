import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/claims/[id]/action - Update claim status/action
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body;

    let updateData: any = { updatedAt: new Date() };

    switch (action) {
      case 'review':
        updateData.status = 'PENDING_REVIEW';
        break;
      case 'resolve':
        updateData.status = 'RECOVERED';
        updateData.resolvedAt = new Date();
        break;
      case 'send_back':
        updateData.status = 'SUBMITTED';
        updateData.resubmissionCount = { increment: 1 };
        break;
      case 'mark_fixed':
        updateData.status = 'PENDING';
        updateData.fixAppliedAt = new Date();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (notes) {
      updateData.notes = notes;
    }

    const claim = await prisma.claim.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, claim });
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}
