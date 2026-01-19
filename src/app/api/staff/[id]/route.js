import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// GET /api/staff/[id] - Get staff by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...staffData } = staff;

    return NextResponse.json({ data: staffData });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// PUT /api/staff/[id] - Update staff
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      fullName, 
      email, 
      password, 
      role, 
      staffId, 
      phone, 
      address, 
      salary, 
      hireDate, 
      isActive,
      subjectIds 
    } = body;

    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      fullName,
      email,
      role,
      staffId,
      phone,
      address,
      salary: salary ? parseFloat(salary) : null,
      hireDate: hireDate ? new Date(hireDate) : null,
      isActive,
    };

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Handle subject connections
    if (subjectIds !== undefined) {
      // First disconnect all existing subjects
      await prisma.staff.update({
        where: { id: parseInt(id) },
        data: {
          subjects: {
            set: [],
          },
        },
      });

      // Then connect new subjects if any
      if (subjectIds && subjectIds.length > 0) {
        updateData.subjects = {
          connect: subjectIds.map(subjectId => ({ id: parseInt(subjectId) })),
        };
      }
    }

    // Update staff
    const staff = await prisma.staff.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Remove password from response
    const { password: _, ...staffData } = staff;

    return NextResponse.json({
      message: 'Staff updated successfully',
      data: staffData,
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Failed to update staff' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Delete staff
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    // Delete staff
    await prisma.staff.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}