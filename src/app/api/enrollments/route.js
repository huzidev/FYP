import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/enrollments - Get all enrollments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');
    const teacherId = searchParams.get('teacherId');
    const teacherSubjectId = searchParams.get('teacherSubjectId');
    const status = searchParams.get('status');
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');

    const where = {
      ...(studentId && { studentId: parseInt(studentId) }),
      ...(subjectId && { subjectId: parseInt(subjectId) }),
      ...(teacherId && { teacherId: parseInt(teacherId) }),
      ...(teacherSubjectId && { teacherSubjectId: parseInt(teacherSubjectId) }),
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
        teacher: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
            email: true,
          },
        },
        teacherSubject: {
          select: {
            id: true,
            capacity: true,
          },
        },
        grade: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

// POST /api/enrollments - Create new enrollment with teacher selection
export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, subjectId, teacherSubjectId, semester, academicYear } = body;

    // Validation
    if (!studentId || !subjectId) {
      return NextResponse.json(
        { success: false, error: 'Student ID and Subject ID are required' },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        semester: semester || null,
        academicYear: academicYear || null,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Student is already enrolled in this subject for the specified semester' },
        { status: 400 }
      );
    }

    // If teacherSubjectId is provided, validate and check capacity
    let teacherId = null;
    let validatedTeacherSubjectId = null;

    if (teacherSubjectId) {
      const teacherSubject = await prisma.teacherSubject.findUnique({
        where: { id: parseInt(teacherSubjectId) },
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (!teacherSubject) {
        return NextResponse.json(
          { success: false, error: 'Teacher assignment not found' },
          { status: 404 }
        );
      }

      // Verify teacher is assigned to the correct subject
      if (teacherSubject.subjectId !== parseInt(subjectId)) {
        return NextResponse.json(
          { success: false, error: 'Teacher is not assigned to this subject' },
          { status: 400 }
        );
      }

      // Check if teacher assignment is active
      if (!teacherSubject.isActive) {
        return NextResponse.json(
          { success: false, error: 'This teacher assignment is not active' },
          { status: 400 }
        );
      }

      // Check capacity
      if (teacherSubject._count.enrollments >= teacherSubject.capacity) {
        return NextResponse.json(
          { success: false, error: 'This teacher\'s class is full. Please select another teacher.' },
          { status: 400 }
        );
      }

      teacherId = teacherSubject.teacherId;
      validatedTeacherSubjectId = teacherSubject.id;
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        teacherId: teacherId,
        teacherSubjectId: validatedTeacherSubjectId,
        semester: semester || null,
        academicYear: academicYear || null,
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
        teacher: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Enrollment created successfully',
        data: enrollment
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}
