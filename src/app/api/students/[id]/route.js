import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// GET /api/students/[id] - Get student by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        fees: {
          select: {
            id: true,
            amount: true,
            paidAmount: true,
            status: true,
            dueDate: true,
            semester: true,
            academicYear: true,
          },
        },
        enrollments: {
          include: {
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
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...studentData } = student;

    return NextResponse.json({ data: studentData });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - Update student
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      fullName, 
      email, 
      password, 
      studentId, 
      level, 
      departmentId,
      phone, 
      address, 
      dateOfBirth,
      fatherName,
      cnic,
      admissionDate,
      isActive 
    } = body;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      fullName,
      email,
      studentId,
      level,
      departmentId: departmentId ? parseInt(departmentId) : undefined,
      phone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      fatherName,
      cnic,
      admissionDate: admissionDate ? new Date(admissionDate) : null,
      isActive,
    };

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update student
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Remove password from response
    const { password: _, ...studentData } = student;

    return NextResponse.json({
      message: 'Student updated successfully',
      data: studentData,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - Delete student
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete student (cascading deletes will handle related records)
    await prisma.student.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}