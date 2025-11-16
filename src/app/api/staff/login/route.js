import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// POST /api/staff/login - Staff login
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

    // Find staff by email
    const staff = await prisma.staff.findUnique({
      where: { email },
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if staff is active
    if (!staff.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, staff.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.staff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    // Return staff data (without password)
    const { password: _, ...staffData } = staff;

    return NextResponse.json({
      message: 'Login successful',
      data: {
        ...staffData,
        userType: 'staff',
      },
    });
  } catch (error) {
    console.error('Error during staff login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}