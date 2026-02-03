import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/subjects/[id] - Get subject by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.findUnique({
      where: { 
        id: parseInt(id) 
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacherSubjects: {
          where: { isActive: true },
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                staffId: true,
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
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Transform to include teachers array for backward compatibility
    const transformedSubject = {
      ...subject,
      teachers: subject.teacherSubjects.map(ts => ({
        ...ts.teacher,
        capacity: ts.capacity,
        teacherSubjectId: ts.id,
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedSubject,
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subject' },
      { status: 500 }
    );
  }
}

// PUT /api/subjects/[id] - Update subject by ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      code,
      description,
      creditHours,
      semester,
      level,
      departmentId,
      dayOfWeek,
      startTime,
      endTime,
      classroom,
      teacherAssignments
    } = body;

    // Validation
    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Check if code is unique (excluding current subject)
    const codeExists = await prisma.subject.findFirst({
      where: {
        code,
        id: { not: parseInt(id) },
      },
    });

    if (codeExists) {
      return NextResponse.json(
        { success: false, error: 'Subject with this code already exists' },
        { status: 400 }
      );
    }

    // Update subject with all fields including schedule
    const updatedSubject = await prisma.subject.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        description: description || null,
        creditHours: creditHours ? parseInt(creditHours) : 3,
        semester: semester ? parseInt(semester) : null,
        level: level || null,
        departmentId: departmentId ? parseInt(departmentId) : existingSubject.departmentId,
        dayOfWeek: dayOfWeek || null,
        startTime: startTime || null,
        endTime: endTime || null,
        classroom: classroom || null,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacherSubjects: {
          where: { isActive: true },
          include: {
            teacher: {
              select: {
                id: true,
                fullName: true,
                staffId: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    // Transform response
    const transformedSubject = {
      ...updatedSubject,
      teachers: updatedSubject.teacherSubjects.map(ts => ({
        ...ts.teacher,
        capacity: ts.capacity,
        teacherSubjectId: ts.id,
      })),
    };

    return NextResponse.json({
      success: true,
      message: 'Subject updated successfully',
      data: transformedSubject,
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update subject' },
      { status: 500 }
    );
  }
}

// DELETE /api/subjects/[id] - Delete subject by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
      include: {
        enrollments: true,
        teacherSubjects: true,
      },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Check if subject has enrollments or teacher assignments
    if (existingSubject.enrollments.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete subject with existing enrollments' },
        { status: 400 }
      );
    }

    // Delete in transaction to handle teacher assignments
    await prisma.$transaction(async (tx) => {
      // Delete teacher assignments first
      await tx.teacherSubject.deleteMany({
        where: { subjectId: parseInt(id) },
      });

      // Delete subject
      await tx.subject.delete({
        where: { id: parseInt(id) },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete subject' },
      { status: 500 }
    );
  }
}