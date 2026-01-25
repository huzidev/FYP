import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/subjects/[id]/available-teachers - Get available teachers for a subject
// Used by students when enrolling to see which teachers they can choose
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');

    // Get subject info
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        code: true,
        creditHours: true,
        department: {
          select: {
            id: true,
            name: true,
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

    // Get all teacher assignments for this subject
    const where = {
      subjectId: parseInt(id),
      isActive: true,
      teacher: {
        isActive: true,
      },
    };

    // Filter by semester/academic year if provided
    if (semester) {
      where.OR = [
        { semester: semester },
        { semester: null }, // Also include assignments without specific semester
      ];
    }
    if (academicYear) {
      where.OR = [
        ...(where.OR || []),
        { academicYear: academicYear },
        { academicYear: null }, // Also include assignments without specific year
      ];
    }

    const teacherAssignments = await prisma.teacherSubject.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: [
        { teacher: { fullName: 'asc' } },
      ],
    });

    // Transform data with availability info
    const teachers = teacherAssignments.map(ta => ({
      teacherId: ta.teacher.id,
      teacherSubjectId: ta.id,
      fullName: ta.teacher.fullName,
      staffId: ta.teacher.staffId,
      email: ta.teacher.email,
      capacity: ta.capacity,
      enrolledCount: ta._count.enrollments,
      availableSpots: Math.max(0, ta.capacity - ta._count.enrollments),
      isFull: ta._count.enrollments >= ta.capacity,
      semester: ta.semester,
      academicYear: ta.academicYear,
    }));

    // Separate available and full teachers
    const availableTeachers = teachers.filter(t => !t.isFull);
    const fullTeachers = teachers.filter(t => t.isFull);

    return NextResponse.json({
      success: true,
      data: {
        subject,
        teachers,
        summary: {
          totalTeachers: teachers.length,
          availableTeachers: availableTeachers.length,
          fullTeachers: fullTeachers.length,
          totalCapacity: teachers.reduce((sum, t) => sum + t.capacity, 0),
          totalEnrolled: teachers.reduce((sum, t) => sum + t.enrolledCount, 0),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching available teachers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch available teachers' },
      { status: 500 }
    );
  }
}
