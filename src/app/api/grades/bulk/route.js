import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { calculateGradeDetails } from '@/lib/gradeUtils';

// POST /api/grades/bulk - Bulk create/update grades (for teachers)
export async function POST(request) {
  try {
    const body = await request.json();
    const { grades, examType = 'FINAL' } = body;

    // Validation
    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Grades array is required' },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      updated: 0,
      failed: [],
    };

    // Process each grade
    for (const gradeEntry of grades) {
      const { enrollmentId, marks, totalMarks = 100, remarks } = gradeEntry;

      try {
        // Skip if no enrollmentId or marks
        if (!enrollmentId || marks === undefined) {
          results.failed.push({
            enrollmentId,
            error: 'Missing enrollmentId or marks',
          });
          continue;
        }

        // Validate marks
        if (marks < 0 || marks > totalMarks) {
          results.failed.push({
            enrollmentId,
            error: `Marks must be between 0 and ${totalMarks}`,
          });
          continue;
        }

        // Check if enrollment exists
        const enrollment = await prisma.enrollment.findUnique({
          where: { id: parseInt(enrollmentId) },
          include: { grade: true },
        });

        if (!enrollment) {
          results.failed.push({
            enrollmentId,
            error: 'Enrollment not found',
          });
          continue;
        }

        // Calculate grade details
        const gradeDetails = calculateGradeDetails(marks, totalMarks);

        if (enrollment.grade) {
          // Update existing grade
          await prisma.grade.update({
            where: { id: enrollment.grade.id },
            data: {
              marks: parseFloat(marks),
              totalMarks: parseFloat(totalMarks),
              percentage: gradeDetails.percentage,
              letterGrade: gradeDetails.letterGrade,
              gpa: gradeDetails.gpa,
              examType,
              remarks,
            },
          });
          results.updated++;
        } else {
          // Create new grade
          await prisma.grade.create({
            data: {
              enrollmentId: parseInt(enrollmentId),
              marks: parseFloat(marks),
              totalMarks: parseFloat(totalMarks),
              percentage: gradeDetails.percentage,
              letterGrade: gradeDetails.letterGrade,
              gpa: gradeDetails.gpa,
              semester: enrollment.semester,
              examType,
              remarks,
            },
          });
          results.created++;
        }
      } catch (err) {
        results.failed.push({
          enrollmentId,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${grades.length} grades: ${results.created} created, ${results.updated} updated, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    console.error('Error processing bulk grades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk grades' },
      { status: 500 }
    );
  }
}
