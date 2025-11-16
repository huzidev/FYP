import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// POST /api/students/login - Student login
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find student by email
    const student = await prisma.student.findUnique({
      where: { email },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        fees: {
          select: {
            id: true,
            amount: true,
            paidAmount: true,
            status: true,
            dueDate: true,
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
              },
            },
            grade: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if student is active
    if (!student.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.student.update({
      where: { id: student.id },
      data: { lastLoginAt: new Date() },
    });

    // Return student data (without password)
    const { password: _, ...studentData } = student;

    return NextResponse.json({
      message: 'Login successful',
      data: {
        ...studentData,
        userType: 'student',
      },
    });
  } catch (error) {
    console.error('Error during student login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}