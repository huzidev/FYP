import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/fees - Get all fees
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    const where = {
      ...(studentId && { studentId: parseInt(studentId) }),
      ...(status && { status }),
    };

    const fees = await prisma.fee.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
            email: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: fees,
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fees' },
      { status: 500 }
    );
  }
}

// POST /api/fees - Create new fee
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      studentId, 
      amount, 
      semester, 
      academicYear, 
      dueDate, 
      description 
    } = body;

    // Validation
    if (!studentId || !amount) {
      return NextResponse.json(
        { error: 'Student ID and amount are required' },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Create fee
    const fee = await prisma.fee.create({
      data: {
        studentId: parseInt(studentId),
        amount: parseFloat(amount),
        dueAmount: parseFloat(amount),
        semester,
        academicYear,
        dueDate: dueDate ? new Date(dueDate) : null,
        description,
        status: 'PENDING',
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

    return NextResponse.json(
      { message: 'Fee created successfully', data: fee },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating fee:', error);
    return NextResponse.json(
      { error: 'Failed to create fee' },
      { status: 500 }
    );
  }
}