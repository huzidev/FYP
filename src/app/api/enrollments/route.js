import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/enrollments - Get all enrollments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');
    const status = searchParams.get('status');
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');

    const where = {
      ...(studentId && { studentId: parseInt(studentId) }),
      ...(subjectId && { subjectId: parseInt(subjectId) }),
      ...(status && { status }),
      ...(semester && { semester }),
      ...(academicYear && { academicYear }),
    };

    const enrollments = await prisma.enrollment.findMany({
      where,
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
        grade: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: enrollments,
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

// POST /api/enrollments - Create new enrollment
export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, subjectId, semester, academicYear } = body;

    // Validation
    if (!studentId || !subjectId) {
      return NextResponse.json(
        { error: 'Student ID and Subject ID are required' },
        { status: 400 }
      );
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        semester,
        academicYear,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this subject for the specified semester' },
        { status: 400 }
      );
    }

    // Check if student and subject exist
    const [student, subject] = await Promise.all([
      prisma.student.findUnique({ where: { id: parseInt(studentId) } }),
      prisma.subject.findUnique({ where: { id: parseInt(subjectId) } }),
    ]);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        semester,
        academicYear,
      },
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
      },
    });

    return NextResponse.json(
      { message: 'Enrollment created successfully', data: enrollment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}