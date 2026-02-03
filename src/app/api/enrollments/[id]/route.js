import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/enrollments/[id] - Get enrollment by ID with full details
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Invalid enrollment ID' },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id) },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            creditHours: true,
            semester: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            classroom: true,
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
            email: true,
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
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error('Error fetching enrollment details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollment details' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Id is missing" },
        { status: 400 },
      );
    }

    const parsedId = parseInt(id, 10);

    if (Number.isNaN(parsedId)) {
      return NextResponse.json(
        { success: false, error: "Invalid enrollment id" },
        { status: 400 },
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parsedId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 },
      );
    }

    await prisma.enrollment.delete({
      where: { id: parsedId },
    });

    return NextResponse.json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete enrollment" },
      { status: 500 },
    );
  }
}
