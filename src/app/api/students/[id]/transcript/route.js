import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { calculateCGPA, getGradeClassification } from '@/lib/gradeUtils';

// GET /api/students/[id]/transcript - Get student transcript with all grades and CGPA
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Fetch student with all enrollments and grades
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        enrollments: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                creditHours: true,
                semester: true,
              },
            },
            teacher: {
              select: {
                id: true,
                fullName: true,
              },
            },
            grade: true,
          },
          orderBy: [
            { academicYear: 'asc' },
            { semester: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Group enrollments by semester/academic year
    const semesterGroups = {};
    const allGrades = [];

    for (const enrollment of student.enrollments) {
      const key = `${enrollment.academicYear || 'N/A'}_${enrollment.semester || 'N/A'}`;

      if (!semesterGroups[key]) {
        semesterGroups[key] = {
          academicYear: enrollment.academicYear || 'N/A',
          semester: enrollment.semester || 'N/A',
          courses: [],
          grades: [],
        };
      }

      const courseData = {
        enrollmentId: enrollment.id,
        subject: enrollment.subject,
        teacher: enrollment.teacher,
        status: enrollment.status,
        grade: enrollment.grade ? {
          id: enrollment.grade.id,
          marks: enrollment.grade.marks,
          totalMarks: enrollment.grade.totalMarks,
          percentage: enrollment.grade.percentage,
          letterGrade: enrollment.grade.letterGrade,
          gpa: enrollment.grade.gpa,
          examType: enrollment.grade.examType,
          remarks: enrollment.grade.remarks,
        } : null,
      };

      semesterGroups[key].courses.push(courseData);

      if (enrollment.grade) {
        semesterGroups[key].grades.push({
          ...enrollment.grade,
          creditHours: enrollment.subject.creditHours,
        });
        allGrades.push({
          ...enrollment.grade,
          enrollment: {
            subject: {
              creditHours: enrollment.subject.creditHours,
            },
          },
        });
      }
    }

    // Calculate GPA for each semester
    const semesters = Object.values(semesterGroups).map(sem => {
      const semesterGPA = calculateCGPA(sem.grades.map(g => ({
        gpa: g.gpa,
        creditHours: g.creditHours,
      })));

      return {
        academicYear: sem.academicYear,
        semester: sem.semester,
        courses: sem.courses,
        totalCredits: semesterGPA.totalCredits,
        semesterGPA: semesterGPA.cgpa,
        totalCourses: sem.courses.length,
        gradedCourses: sem.grades.length,
      };
    });

    // Calculate cumulative GPA
    const cumulativeResult = calculateCGPA(allGrades);
    const classification = getGradeClassification(cumulativeResult.cgpa);

    // Summary statistics
    const totalEnrollments = student.enrollments.length;
    const completedWithGrades = allGrades.length;
    const activeEnrollments = student.enrollments.filter(e => e.status === 'ACTIVE').length;
    const completedEnrollments = student.enrollments.filter(e => e.status === 'COMPLETED').length;

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          fullName: student.fullName,
          studentId: student.studentId,
          email: student.email,
          level: student.level,
          department: student.department,
          admissionDate: student.admissionDate,
        },
        transcript: {
          semesters,
          summary: {
            cgpa: cumulativeResult.cgpa,
            totalCredits: cumulativeResult.totalCredits,
            totalQualityPoints: cumulativeResult.totalQualityPoints,
            classification,
            totalEnrollments,
            completedWithGrades,
            activeEnrollments,
            completedEnrollments,
          },
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching student transcript:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student transcript' },
      { status: 500 }
    );
  }
}
