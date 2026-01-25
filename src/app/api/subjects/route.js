import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/subjects - Get all subjects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const level = searchParams.get('level');
    const search = searchParams.get('search') || '';

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(departmentId && { departmentId: parseInt(departmentId) }),
      ...(level && { level }),
    };

    const subjects = await prisma.subject.findMany({
      where,
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
      orderBy: { name: 'asc' },
    });

    // Transform to include teachers array for backward compatibility
    const transformedSubjects = subjects.map(subject => ({
      ...subject,
      teachers: subject.teacherSubjects.map(ts => ({
        ...ts.teacher,
        capacity: ts.capacity,
        teacherSubjectId: ts.id,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: transformedSubjects,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

// POST /api/subjects - Create new subject
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      code,
      description,
      creditHours,
      semester,
      level,
      departmentId,
      teacherAssignments // Array of { teacherId, capacity } objects
    } = body;

    // Validation
    if (!name || !code || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Name, code, and department are required' },
        { status: 400 }
      );
    }

    // Check if subject already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code },
    });

    if (existingSubject) {
      return NextResponse.json(
        { success: false, error: 'Subject with this code already exists' },
        { status: 400 }
      );
    }

    // Create subject with teacher assignments in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create subject
      const subject = await tx.subject.create({
        data: {
          name,
          code,
          description,
          creditHours: creditHours ? parseInt(creditHours) : 3,
          semester: semester ? parseInt(semester) : null,
          level,
          departmentId: parseInt(departmentId),
        },
      });

      // Create teacher assignments if provided
      if (teacherAssignments && teacherAssignments.length > 0) {
        for (const assignment of teacherAssignments) {
          // Validate teacher exists and is a TEACHER
          const teacher = await tx.staff.findUnique({
            where: { id: parseInt(assignment.teacherId) },
          });

          if (!teacher || teacher.role !== 'TEACHER') {
            throw new Error(`Invalid teacher ID: ${assignment.teacherId}`);
          }

          await tx.teacherSubject.create({
            data: {
              teacherId: parseInt(assignment.teacherId),
              subjectId: subject.id,
              capacity: assignment.capacity ? parseInt(assignment.capacity) : 50,
            },
          });
        }
      }

      // Fetch complete subject with relations
      return tx.subject.findUnique({
        where: { id: subject.id },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          teacherSubjects: {
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
        },
      });
    });

    // Transform response
    const transformedSubject = {
      ...result,
      teachers: result.teacherSubjects.map(ts => ({
        ...ts.teacher,
        capacity: ts.capacity,
        teacherSubjectId: ts.id,
      })),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Subject created successfully',
        data: transformedSubject
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create subject' },
      { status: 500 }
    );
  }
}
