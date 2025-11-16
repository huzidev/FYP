import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PATCH /api/fees/[id]/status - Update fee status
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, paidAmount, receiptNumber } = body;

    // Validation
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Get current fee
    const currentFee = await prisma.fee.findUnique({
      where: { id: parseInt(id) },
    });

    if (!currentFee) {
      return NextResponse.json(
        { error: 'Fee not found' },
        { status: 404 }
      );
    }

    // Calculate due amount
    const newPaidAmount = paidAmount !== undefined ? parseFloat(paidAmount) : currentFee.paidAmount;
    const dueAmount = currentFee.amount - newPaidAmount;

    // Update fee
    const updatedFee = await prisma.fee.update({
      where: { id: parseInt(id) },
      data: {
        status,
        paidAmount: newPaidAmount,
        dueAmount,
        receiptNumber,
        paidDate: status === 'PAID' || status === 'PARTIAL' ? new Date() : null,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Fee status updated successfully',
      data: updatedFee,
    });
  } catch (error) {
    console.error('Error updating fee status:', error);
    return NextResponse.json(
      { error: 'Failed to update fee status' },
      { status: 500 }
    );
  }
}