import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { calculateGradeDetails } from '@/lib/gradeUtils';

// GET /api/grades - Get all grades with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');
    const teacherId = searchParams.get('teacherId');
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    const skip = (page - 1) * limit;

    const where = {
      enrollment: {
        ...(studentId && { studentId: parseInt(studentId) }),
        ...(subjectId && { subjectId: parseInt(subjectId) }),
        ...(teacherId && { teacherId: parseInt(teacherId) }),
        ...(semester && { semester }),
        ...(academicYear && { academicYear }),
      },
    };

    const [grades, total] = await Promise.all([
      prisma.grade.findMany({
        where,
        skip,
        take: limit,
        include: {
          enrollment: {
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
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.grade.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: grades,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}

// POST /api/grades - Create a new grade
export async function POST(request) {
  try {
    const body = await request.json();
    const { enrollmentId, marks, totalMarks = 100, examType, remarks } = body;

    // Validation
    if (!enrollmentId || marks === undefined) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID and marks are required' },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) },
      include: {
        subject: { select: { creditHours: true } },
        grade: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if grade already exists
    if (enrollment.grade) {
      return NextResponse.json(
        { success: false, error: 'Grade already exists for this enrollment. Use PUT to update.' },
        { status: 400 }
      );
    }

    // Validate marks
    if (marks < 0 || marks > totalMarks) {
      return NextResponse.json(
        { success: false, error: `Marks must be between 0 and ${totalMarks}` },
        { status: 400 }
      );
    }

    // Calculate grade details
    const gradeDetails = calculateGradeDetails(marks, totalMarks);

    // Create grade
    const grade = await prisma.grade.create({
      data: {
        enrollmentId: parseInt(enrollmentId),
        marks: parseFloat(marks),
        totalMarks: parseFloat(totalMarks),
        percentage: gradeDetails.percentage,
        letterGrade: gradeDetails.letterGrade,
        gpa: gradeDetails.gpa,
        semester: enrollment.semester,
        examType: examType || 'FINAL',
        remarks,
      },
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentId: true,
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
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Grade created successfully',
        data: grade,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create grade' },
      { status: 500 }
    );
  }
}
