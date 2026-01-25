import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/subjects/[id]/students - Get all students enrolled in a subject
// Optionally filter by teacher to get only that teacher's students
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const teacherSubjectId = searchParams.get('teacherSubjectId');
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');
    const status = searchParams.get('status');

    // Get subject info
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
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

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Build where clause for enrollments
    const where = {
      subjectId: parseInt(id),
    };

    if (teacherId) {
      where.teacherId = parseInt(teacherId);
    }

    if (teacherSubjectId) {
      where.teacherSubjectId = parseInt(teacherSubjectId);
    }

    if (semester) {
      where.semester = semester;
    }

    if (academicYear) {
      where.academicYear = academicYear;
    }

    if (status) {
      where.status = status;
    }

    // Get enrollments with student details
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
            email: true,
            phone: true,
            gender: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
          },
        },
        grade: true,
      },
      orderBy: {
        student: { fullName: 'asc' },
      },
    });

    // Transform data
    const students = enrollments.map(e => ({
      enrollmentId: e.id,
      studentId: e.student.id,
      studentCode: e.student.studentId,
      fullName: e.student.fullName,
      email: e.student.email,
      phone: e.student.phone,
      gender: e.student.gender,
      department: e.student.department,
      enrollmentStatus: e.status,
      semester: e.semester,
      academicYear: e.academicYear,
      teacher: e.teacher,
      grade: e.grade ? {
        id: e.grade.id,
        marks: e.grade.marks,
        totalMarks: e.grade.totalMarks,
        percentage: e.grade.percentage,
        letterGrade: e.grade.letterGrade,
        gpa: e.grade.gpa,
      } : null,
    }));

    // Calculate statistics
    const stats = {
      totalStudents: students.length,
      byStatus: {
        active: students.filter(s => s.enrollmentStatus === 'ACTIVE').length,
        dropped: students.filter(s => s.enrollmentStatus === 'DROPPED').length,
        completed: students.filter(s => s.enrollmentStatus === 'COMPLETED').length,
      },
      graded: students.filter(s => s.grade !== null).length,
      notGraded: students.filter(s => s.grade === null).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        subject: {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          creditHours: subject.creditHours,
          department: subject.department,
        },
        students,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching subject students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subject students' },
      { status: 500 }
    );
  }
}
