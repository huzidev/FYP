import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/teacher-subjects/[id] - Get single teacher-subject assignment
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const teacherSubject = await prisma.teacherSubject.findUnique({
      where: { id: parseInt(id) },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
            email: true,
            phone: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            creditHours: true,
            semester: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentId: true,
                email: true,
              },
            },
            grade: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { success: false, error: 'Teacher-subject assignment not found' },
        { status: 404 }
      );
    }

    const result = {
      ...teacherSubject,
      enrolledCount: teacherSubject._count.enrollments,
      availableSpots: teacherSubject.capacity - teacherSubject._count.enrollments,
      isFull: teacherSubject._count.enrollments >= teacherSubject.capacity,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching teacher-subject:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teacher-subject assignment' },
      { status: 500 }
    );
  }
}

// PUT /api/teacher-subjects/[id] - Update teacher-subject assignment
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { capacity, isActive, semester, academicYear } = body;

    // Check if assignment exists
    const existing = await prisma.teacherSubject.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Teacher-subject assignment not found' },
        { status: 404 }
      );
    }

    // If reducing capacity, check if new capacity is less than enrolled count
    if (capacity !== undefined && parseInt(capacity) < existing._count.enrollments) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot reduce capacity below current enrollment count (${existing._count.enrollments} students enrolled)`
        },
        { status: 400 }
      );
    }

    const teacherSubject = await prisma.teacherSubject.update({
      where: { id: parseInt(id) },
      data: {
        ...(capacity !== undefined && { capacity: parseInt(capacity) }),
        ...(isActive !== undefined && { isActive }),
        ...(semester !== undefined && { semester }),
        ...(academicYear !== undefined && { academicYear }),
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher-subject assignment updated successfully',
      data: teacherSubject,
    });
  } catch (error) {
    console.error('Error updating teacher-subject:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update teacher-subject assignment' },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher-subjects/[id] - Remove teacher-subject assignment
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if assignment exists and has enrollments
    const existing = await prisma.teacherSubject.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Teacher-subject assignment not found' },
        { status: 404 }
      );
    }

    if (existing._count.enrollments > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete assignment with active enrollments (${existing._count.enrollments} students enrolled). Remove enrollments first or deactivate instead.`
        },
        { status: 400 }
      );
    }

    await prisma.teacherSubject.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher-subject assignment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting teacher-subject:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete teacher-subject assignment' },
      { status: 500 }
    );
  }
}
