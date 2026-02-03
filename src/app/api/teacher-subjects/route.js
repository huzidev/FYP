import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/teacher-subjects - Get all teacher-subject assignments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const subjectId = searchParams.get("subjectId");
    const semester = searchParams.get("semester");
    const academicYear = searchParams.get("academicYear");
    const isActive = searchParams.get("isActive");

    const where = {
      ...(teacherId && { teacherId: parseInt(teacherId) }),
      ...(subjectId && { subjectId: parseInt(subjectId) }),
      ...(semester && { semester }),
      ...(academicYear && { academicYear }),
      ...(isActive !== null &&
        isActive !== undefined && { isActive: isActive === "true" }),
    };

    const teacherSubjects = await prisma.teacherSubject.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
          },
        },
        subject: {
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
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get enrollment counts by subjectId (not teacherSubjectId)
    // because enrollments from courses page don't have teacherSubjectId
    const result = await Promise.all(
      teacherSubjects.map(async (ts) => {
        const enrolledCount = await prisma.enrollment.count({
          where: { subjectId: ts.subjectId },
        });
        return {
          ...ts,
          enrolledCount,
          availableSpots: ts.capacity - enrolledCount,
          isFull: enrolledCount >= ts.capacity,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching teacher-subjects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teacher-subject assignments" },
      { status: 500 },
    );
  }
}

// POST /api/teacher-subjects - Assign a teacher to a subject
export async function POST(request) {
  try {
    const body = await request.json();
    const { teacherId, subjectId, capacity, semester, academicYear } = body;

    // Validation
    if (!teacherId || !subjectId) {
      return NextResponse.json(
        { success: false, error: "Teacher ID and Subject ID are required" },
        { status: 400 },
      );
    }

    // Check if teacher exists and is a TEACHER role
    const teacher = await prisma.staff.findUnique({
      where: { id: parseInt(teacherId) },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: "Teacher not found" },
        { status: 404 },
      );
    }

    if (teacher.role !== "TEACHER") {
      return NextResponse.json(
        { success: false, error: "Staff member is not a teacher" },
        { status: 400 },
      );
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 },
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: parseInt(teacherId),
        subjectId: parseInt(subjectId),
        semester: semester || null,
        academicYear: academicYear || null,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Teacher is already assigned to this subject for the specified period",
        },
        { status: 400 },
      );
    }

    // Create assignment
    const teacherSubject = await prisma.teacherSubject.create({
      data: {
        teacherId: parseInt(teacherId),
        subjectId: parseInt(subjectId),
        capacity: capacity ? parseInt(capacity) : 50,
        semester: semester || null,
        academicYear: academicYear || null,
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
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
      {
        success: true,
        message: "Teacher assigned to subject successfully",
        data: teacherSubject,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating teacher-subject assignment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign teacher to subject" },
      { status: 500 },
    );
  }
}
