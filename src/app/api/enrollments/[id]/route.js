import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
