import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/staff/[id]/courses - Get all courses assigned to a teacher
// This endpoint is for teachers to see their assigned courses and enrolled students
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');
    const includeStudents = searchParams.get('includeStudents') === 'true';

    // Verify teacher exists and is a TEACHER role
    const teacher = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        fullName: true,
        staffId: true,
        email: true,
        role: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    if (teacher.role !== 'TEACHER') {
      return NextResponse.json(
        { success: false, error: 'Staff member is not a teacher' },
        { status: 400 }
      );
    }

    // Build where clause for teacher subjects
    const where = {
      teacherId: parseInt(id),
      isActive: true,
    };

    if (semester) {
      where.OR = [
        { semester: semester },
        { semester: null },
      ];
    }
    if (academicYear) {
      where.OR = [
        ...(where.OR || []),
        { academicYear: academicYear },
        { academicYear: null },
      ];
    }

    // Get teacher's assigned courses
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where,
      include: {
        subject: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        enrollments: includeStudents ? {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentId: true,
                email: true,
                phone: true,
              },
            },
            grade: true,
          },
          orderBy: {
            student: { fullName: 'asc' },
          },
        } : false,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        subject: { name: 'asc' },
      },
    });

    // Transform data
    const courses = teacherSubjects.map(ts => ({
      teacherSubjectId: ts.id,
      capacity: ts.capacity,
      enrolledCount: ts._count.enrollments,
      availableSpots: ts.capacity - ts._count.enrollments,
      isFull: ts._count.enrollments >= ts.capacity,
      semester: ts.semester,
      academicYear: ts.academicYear,
      subject: {
        id: ts.subject.id,
        name: ts.subject.name,
        code: ts.subject.code,
        creditHours: ts.subject.creditHours,
        semester: ts.subject.semester,
        department: ts.subject.department,
      },
      ...(includeStudents && {
        students: ts.enrollments.map(e => ({
          enrollmentId: e.id,
          ...e.student,
          enrollmentStatus: e.status,
          grade: e.grade,
        })),
      }),
    }));

    // Calculate summary statistics
    const summary = {
      totalCourses: courses.length,
      totalStudents: courses.reduce((sum, c) => sum + c.enrolledCount, 0),
      totalCapacity: courses.reduce((sum, c) => sum + c.capacity, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        teacher: {
          id: teacher.id,
          fullName: teacher.fullName,
          staffId: teacher.staffId,
          email: teacher.email,
        },
        courses,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teacher courses' },
      { status: 500 }
    );
  }
}
