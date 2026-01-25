import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { calculateGradeDetails } from '@/lib/gradeUtils';

// GET /api/enrollments/[id]/grade - Get grade for enrollment
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
      data: {
        enrollment: {
          id: enrollment.id,
          student: enrollment.student,
          subject: enrollment.subject,
          semester: enrollment.semester,
          academicYear: enrollment.academicYear,
        },
        grade: enrollment.grade,
      },
    });
  } catch (error) {
    console.error('Error fetching enrollment grade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollment grade' },
      { status: 500 }
    );
  }
}

// PUT /api/enrollments/[id]/grade - Create or update grade for enrollment
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { marks, totalMarks = 100, examType = 'FINAL', remarks } = body;

    // Validation
    if (marks === undefined) {
      return NextResponse.json(
        { success: false, error: 'Marks are required' },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id) },
      include: {
        subject: { select: { creditHours: true } },
        grade: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Validate marks
    if (marks < 0 || marks > totalMarks) {
      return NextResponse.json(
        { success: false, error: `Marks must be between 0 and ${totalMarks}` },
        { status: 400 }
      );
    }

    // Calculate grade details
    const gradeDetails = calculateGradeDetails(marks, totalMarks);

    let grade;

    if (enrollment.grade) {
      // Update existing grade
      grade = await prisma.grade.update({
        where: { id: enrollment.grade.id },
        data: {
          marks: parseFloat(marks),
          totalMarks: parseFloat(totalMarks),
          percentage: gradeDetails.percentage,
          letterGrade: gradeDetails.letterGrade,
          gpa: gradeDetails.gpa,
          examType,
          remarks,
        },
      });
    } else {
      // Create new grade
      grade = await prisma.grade.create({
        data: {
          enrollmentId: parseInt(id),
          marks: parseFloat(marks),
          totalMarks: parseFloat(totalMarks),
          percentage: gradeDetails.percentage,
          letterGrade: gradeDetails.letterGrade,
          gpa: gradeDetails.gpa,
          semester: enrollment.semester,
          examType,
          remarks,
        },
      });
    }

    // Fetch updated enrollment with grade
    const updatedEnrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
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
        grade: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: enrollment.grade ? 'Grade updated successfully' : 'Grade created successfully',
      data: {
        enrollment: {
          id: updatedEnrollment.id,
          student: updatedEnrollment.student,
          subject: updatedEnrollment.subject,
          semester: updatedEnrollment.semester,
          academicYear: updatedEnrollment.academicYear,
        },
        grade: updatedEnrollment.grade,
      },
    });
  } catch (error) {
    console.error('Error updating enrollment grade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update enrollment grade' },
      { status: 500 }
    );
  }
}

// DELETE /api/enrollments/[id]/grade - Delete grade for enrollment
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id) },
      include: { grade: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    if (!enrollment.grade) {
      return NextResponse.json(
        { success: false, error: 'No grade exists for this enrollment' },
        { status: 404 }
      );
    }

    await prisma.grade.delete({
      where: { id: enrollment.grade.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Grade deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting enrollment grade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete enrollment grade' },
      { status: 500 }
    );
  }
}
