import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { calculateGradeDetails } from '@/lib/gradeUtils';

// GET /api/grades/[id] - Get a specific grade
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const grade = await prisma.grade.findUnique({
      where: { id: parseInt(id) },
      include: {
        enrollment: {
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
              },
            },
          },
        },
      },
    });

    if (!grade) {
      return NextResponse.json(
        { success: false, error: 'Grade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: grade,
    });
  } catch (error) {
    console.error('Error fetching grade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grade' },
      { status: 500 }
    );
  }
}

// PUT /api/grades/[id] - Update a grade
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { marks, totalMarks, examType, remarks } = body;

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingGrade) {
      return NextResponse.json(
        { success: false, error: 'Grade not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {};

    if (marks !== undefined) {
      const total = totalMarks !== undefined ? parseFloat(totalMarks) : existingGrade.totalMarks;

      // Validate marks
      if (marks < 0 || marks > total) {
        return NextResponse.json(
          { success: false, error: `Marks must be between 0 and ${total}` },
          { status: 400 }
        );
      }

      // Recalculate grade details
      const gradeDetails = calculateGradeDetails(marks, total);

      updateData.marks = parseFloat(marks);
      updateData.totalMarks = total;
      updateData.percentage = gradeDetails.percentage;
      updateData.letterGrade = gradeDetails.letterGrade;
      updateData.gpa = gradeDetails.gpa;
    }

    if (examType !== undefined) updateData.examType = examType;
    if (remarks !== undefined) updateData.remarks = remarks;

    // Update grade
    const grade = await prisma.grade.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        enrollment: {
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
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Grade updated successfully',
      data: grade,
    });
  } catch (error) {
    console.error('Error updating grade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update grade' },
      { status: 500 }
    );
  }
}

// DELETE /api/grades/[id] - Delete a grade
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingGrade) {
      return NextResponse.json(
        { success: false, error: 'Grade not found' },
        { status: 404 }
      );
    }

    await prisma.grade.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Grade deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting grade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete grade' },
      { status: 500 }
    );
  }
}
