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
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            classroom: true,
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
    const {
      studentId,
      subjectId,
      teacherId,
      teacherSubjectId,
      semester,
      academicYear,
    } = body;

    if (!studentId || !subjectId || !teacherSubjectId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existing = await prisma.enrollment.findFirst({
      where: {
        studentId: parseInt(studentId),
        teacherSubjectId: parseInt(teacherSubjectId),
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already enrolled" },
        { status: 409 },
      );
    }

    // If teacherSubjectId is provided, get the teacherId from it
    let resolvedTeacherId = teacherId ? parseInt(teacherId) : null;
    if (teacherSubjectId && !resolvedTeacherId) {
      const teacherSubject = await prisma.teacherSubject.findUnique({
        where: { id: parseInt(teacherSubjectId) },
      });
      if (teacherSubject) {
        resolvedTeacherId = teacherSubject.teacherId;
      }
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        teacherId: parseInt(teacherId),
        teacherSubjectId: parseInt(teacherSubjectId),
        semester,
        academicYear,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, data: enrollment });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Enrollment failed" },
      { status: 500 },
    );
  }
}
