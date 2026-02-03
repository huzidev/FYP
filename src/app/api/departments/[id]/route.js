import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/departments/[id] - Get department by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (!numericId || Number.isNaN(numericId)) {
      return NextResponse.json(
        { error: 'Department id is required and must be a number' },
        { status: 400 }
      );
    }

    const department = await prisma.department.findUnique({
      where: { id: numericId },
      include: {
        students: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
            level: true,
            isActive: true,
          },
        },
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
            creditHours: true,
            level: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: department });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    );
  }
}

// PUT /api/departments/[id] - Update department
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    const body = await request.json();
    const { name, code, description, isActive, level } = body;

    const allowedLevels = ["BACHELOR", "MASTER"];

    // Check if department exists
    if (!numericId || Number.isNaN(numericId)) {
      return NextResponse.json(
        { error: 'Department id is required and must be a number' },
        { status: 400 }
      );
    }

    const existingDepartment = await prisma.department.findUnique({
      where: { id: numericId },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    if (level && !allowedLevels.includes(level)) {
      return NextResponse.json(
        { error: 'Invalid department level' },
        { status: 400 }
      );
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid active status' },
        { status: 400 }
      );
    }

    // Update department
    const department = await prisma.department.update({
      where: { id: numericId },
      data: {
        name,
        code,
        description,
        isActive,
        level,
      },
      include: {
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE /api/departments/[id] - Delete department
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (!numericId || Number.isNaN(numericId)) {
      return NextResponse.json(
        { error: 'Department id is required and must be a number' },
        { status: 400 }
      );
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: numericId },
      include: {
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if department has students or subjects
    if (existingDepartment._count.students > 0 || existingDepartment._count.subjects > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete department with existing students or subjects',
          details: {
            students: existingDepartment._count.students,
            subjects: existingDepartment._count.subjects,
          },
        },
        { status: 400 }
      );
    }

    // Delete department
    await prisma.department.delete({
      where: { id: numericId },
    });

    return NextResponse.json({
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}