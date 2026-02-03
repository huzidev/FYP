import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { calculateGradeDetails } from '@/lib/gradeUtils';

// GET /api/grades - Get all grades with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('enrollmentId');
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');
    const teacherId = searchParams.get('teacherId');
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    const skip = (page - 1) * limit;

    let where = {};
    
    if (enrollmentId) {
      where.enrollmentId = parseInt(enrollmentId);
    } else {
      where.enrollment = {
        ...(studentId && { studentId: parseInt(studentId) }),
        ...(subjectId && { subjectId: parseInt(subjectId) }),
        ...(teacherId && { teacherId: parseInt(teacherId) }),
        ...(semester && { semester }),
        ...(academicYear && { academicYear }),
      };
    }

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

    // No need for compatibility processing since database now has the new structure
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

// POST /api/grades - Create or update a grade with detailed marks
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      enrollmentId,
      classParticipation = 0,
      midTerm = 0,
      project = 0,
      finalTerm = 0,
      assignment = 0,
      quiz = 0,
      semester,
      remarks
    } = body;

    // Validation
    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    // Validate individual marks
    if (classParticipation < 0 || classParticipation > 5 ||
        midTerm < 0 || midTerm > 20 ||
        project < 0 || project > 15 ||
        finalTerm < 0 || finalTerm > 40 ||
        assignment < 0 || assignment > 10 ||
        quiz < 0 || quiz > 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid marks. Please check the limits for each component.' },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Calculate total obtained marks and derived values
    const obtainedMarks = classParticipation + midTerm + project + finalTerm + assignment + quiz;
    const percentage = (obtainedMarks / 100) * 100;
    
    // Calculate letter grade and GPA
    let letterGrade = 'F';
    let gpa = 0.0;
    
    if (percentage >= 90) {
      letterGrade = 'A+';
      gpa = 4.0;
    } else if (percentage >= 85) {
      letterGrade = 'A';
      gpa = 3.7;
    } else if (percentage >= 80) {
      letterGrade = 'A-';
      gpa = 3.3;
    } else if (percentage >= 75) {
      letterGrade = 'B+';
      gpa = 3.0;
    } else if (percentage >= 70) {
      letterGrade = 'B';
      gpa = 2.7;
    } else if (percentage >= 65) {
      letterGrade = 'B-';
      gpa = 2.3;
    } else if (percentage >= 60) {
      letterGrade = 'C+';
      gpa = 2.0;
    } else if (percentage >= 55) {
      letterGrade = 'C';
      gpa = 1.7;
    } else if (percentage >= 50) {
      letterGrade = 'C-';
      gpa = 1.3;
    } else if (percentage >= 45) {
      letterGrade = 'D';
      gpa = 1.0;
    }

    // Check if grade already exists
    const existingGrade = await prisma.grade.findUnique({
      where: { enrollmentId: parseInt(enrollmentId) },
    });

    // Use the new database structure
    const gradeData = {
      enrollmentId: parseInt(enrollmentId),
      classParticipation: parseFloat(classParticipation),
      midTerm: parseFloat(midTerm),
      project: parseFloat(project),
      finalTerm: parseFloat(finalTerm),
      assignment: parseFloat(assignment),
      quiz: parseFloat(quiz),
      obtainedMarks: parseFloat(obtainedMarks),
      percentage: parseFloat(percentage),
      letterGrade,
      gpa: parseFloat(gpa),
      semester: semester || enrollment.semester,
      remarks,
      isComplete: true,
    };

    let grade;
    if (existingGrade) {
      grade = await prisma.grade.update({
        where: { enrollmentId: parseInt(enrollmentId) },
        data: gradeData,
        include: {
          enrollment: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  creditHours: true,
                },
              },
              student: {
                select: {
                  id: true,
                  fullName: true,
                  studentId: true,
                },
              },
            },
          },
        },
      });
    } else {
      grade = await prisma.grade.create({
        data: gradeData,
        include: {
          enrollment: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  creditHours: true,
                },
              },
              student: {
                select: {
                  id: true,
                  fullName: true,
                  studentId: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Grade saved successfully',
        data: grade,
      },
      { status: existingGrade ? 200 : 201 }
    );
  } catch (error) {
    console.error('Error saving grade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save grade' },
      { status: 500 }
    );
  }
}
