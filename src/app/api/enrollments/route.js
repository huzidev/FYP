import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/enrollments - Get all enrollments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const subjectId = searchParams.get("subjectId");
    const teacherId = searchParams.get("teacherId");
    const teacherSubjectId = searchParams.get("teacherSubjectId"); // <-- fix here
    const status = searchParams.get("status");
    const semester = searchParams.get("semester");
    const academicYear = searchParams.get("academicYear");

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
            semester: true,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 },
    );
  }
}

// POST /api/enrollments - Create enrollment
export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, subjectId, semester, academicYear } = body;

    // Only studentId and subjectId are required
    if (!studentId || !subjectId) {
      return NextResponse.json(
        { success: false, error: "Student ID and Subject ID are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.enrollment.findFirst({
      where: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        semester: semester || null,
        academicYear: academicYear || null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this course" },
        { status: 409 },
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        semester: semester || null,
        academicYear: academicYear || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Enrollment created successfully",
      data: enrollment,
    });
  } catch (error) {
    console.error("Enrollment creation failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create enrollment" },
      { status: 500 },
    );
  }
}
