import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// GET /api/staff - Get all staff members
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { staffId: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role }),
    };

    const [staff, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take: limit,
        include: {
          subjects: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.staff.count({ where }),
    ]);

    // Remove password from response
    const staffWithoutPassword = staff.map(({ password, ...staffData }) => staffData);

    return NextResponse.json({
      data: staffWithoutPassword,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create new staff member
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      fullName, 
      email, 
      password, 
      role, 
      staffId, 
      phone, 
      address, 
      salary, 
      hireDate,
      subjectIds 
    } = body;

    // Validation
    if (!fullName || !email || !password || !role || !staffId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if staff already exists
    const existingStaff = await prisma.staff.findFirst({
      where: {
        OR: [
          { email },
          { staffId },
        ],
      },
    });

    if (existingStaff) {
      return NextResponse.json(
        { error: 'Staff with this email or staff ID already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create staff with subjects if provided
    const staff = await prisma.staff.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
        staffId,
        phone,
        address,
        salary: salary ? parseFloat(salary) : null,
        hireDate: hireDate ? new Date(hireDate) : null,
        ...(subjectIds && subjectIds.length > 0 && {
          subjects: {
            connect: subjectIds.map(id => ({ id: parseInt(id) })),
          },
        }),
      },
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

    // Remove password from response
    const { password: _, ...staffData } = staff;

    return NextResponse.json(
      { message: 'Staff created successfully', data: staffData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    );
  }
}