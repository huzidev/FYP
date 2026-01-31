import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/enrollments/[id] - Get single enrollment
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
            email: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            creditHours: true,
          },
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
            email: true,
          },
        },
        teacherSubject: {
          select: {
            id: true,
            capacity: true,
          },
        },
        grade: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollment' },
      { status: 500 }
    );
  }
}

// PUT /api/enrollments/[id] - Update enrollment
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, teacherSubjectId, semester, academicYear } = body;

    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // If changing teacher assignment, validate capacity
    let teacherId = existingEnrollment.teacherId;
    let validatedTeacherSubjectId = existingEnrollment.teacherSubjectId;

    if (teacherSubjectId && teacherSubjectId !== existingEnrollment.teacherSubjectId) {
      const teacherSubject = await prisma.teacherSubject.findUnique({
        where: { id: parseInt(teacherSubjectId) },
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (!teacherSubject) {
        return NextResponse.json(
          { success: false, error: 'Teacher assignment not found' },
          { status: 404 }
        );
      }

      if (teacherSubject.subjectId !== existingEnrollment.subjectId) {
        return NextResponse.json(
          { success: false, error: 'Teacher is not assigned to this subject' },
          { status: 400 }
        );
      }

      if (!teacherSubject.isActive) {
        return NextResponse.json(
          { success: false, error: 'This teacher assignment is not active' },
          { status: 400 }
        );
      }

      if (teacherSubject._count.enrollments >= teacherSubject.capacity) {
        return NextResponse.json(
          { success: false, error: "This teacher's class is full" },
          { status: 400 }
        );
      }

      teacherId = teacherSubject.teacherId;
      validatedTeacherSubjectId = teacherSubject.id;
    }

    const enrollment = await prisma.enrollment.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && { status }),
        ...(teacherSubjectId && { teacherId, teacherSubjectId: validatedTeacherSubjectId }),
        ...(semester !== undefined && { semester }),
        ...(academicYear !== undefined && { academicYear }),
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
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            creditHours: true,
          },
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollment updated successfully',
      data: enrollment,
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}

// DELETE /api/enrollments/[id] - Delete enrollment
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id) },
      include: {
        grade: true,
      },
    });

    if (!existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Delete associated grade first if exists (cascade should handle this, but being explicit)
    if (existingEnrollment.grade) {
      await prisma.grade.delete({
        where: { id: existingEnrollment.grade.id },
      });
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete enrollment' },
      { status: 500 }
    );
  }
}
