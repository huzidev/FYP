import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

// GET /api/students - Get all students
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId");
    const level = searchParams.get("level");

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { studentId: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(departmentId && { departmentId: parseInt(departmentId) }),
      ...(level && { level }),
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          

          enrollments: {
            select: {
              id: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where }),
    ]);

    // Remove password from response
    const studentsWithoutPassword = students.map(
      ({ password, ...studentData }) => studentData,
    );

    return NextResponse.json({
      data: studentsWithoutPassword,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}

// POST /api/students - Create new student
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      password,
      studentId,
      level,
      departmentId,
      phone,
      address,
      dateOfBirth,
      fatherName,
      cnic,
      admissionDate,
    } = body;

    // Validation
    if (!fullName || !email || !password || !level || !departmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Auto-generate student ID if not provided
    let finalStudentId = studentId;
    if (!finalStudentId) {
      // Get department code
      const department = await prisma.department.findUnique({
        where: { id: parseInt(departmentId) },
        select: { code: true },
      });

      // Get the last student ID for this department
      const lastStudent = await prisma.student.findFirst({
        where: {
          studentId: {
            startsWith: department?.code || "STD",
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Generate new student ID
      if (lastStudent) {
        const lastNum =
          parseInt(lastStudent.studentId.replace(/[^0-9]/g, "")) || 0;
        finalStudentId = `${department?.code || "STD"}${String(lastNum + 1).padStart(4, "0")}`;
      } else {
        finalStudentId = `${department?.code || "STD"}0001`;
      }
    }

    console.log("SW what is student ID", finalStudentId);

    // Check if student already exists
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ email }, { studentId: finalStudentId }, ...(cnic && [{ cnic }])],
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        {
          error: "Student with this email, student ID, or CNIC already exists",
        },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await prisma.student.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        studentId: finalStudentId,
        level,
        departmentId: parseInt(departmentId),
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        fatherName,
        cnic,
        admissionDate: admissionDate ? new Date(admissionDate) : null,
      },
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

    // Remove password from response
    const { password: _, ...studentData } = student;

    return NextResponse.json(
      { message: "Student created successfully", data: studentData },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
