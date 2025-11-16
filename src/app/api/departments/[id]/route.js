import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/departments/[id] - Get department by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
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
    const { id } = params;
    const body = await request.json();
    const { name, code, description, isActive } = body;

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Update department
    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        description,
        isActive,
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
    const { id } = params;

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
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