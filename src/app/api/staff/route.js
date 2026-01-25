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
          teacherSubjects: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.staff.count({ where }),
    ]);

    // Transform and remove password from response
    const staffWithoutPassword = staff.map(({ password, teacherSubjects, ...staffData }) => ({
      ...staffData,
      // Transform teacherSubjects to subjects for backward compatibility
      subjects: teacherSubjects.map(ts => ts.subject),
    }));

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

    // Create staff (without subject assignment - use TeacherSubject API for that)
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
      },
    });

    // If subjectIds provided and staff is a teacher, create TeacherSubject assignments
    if (subjectIds && subjectIds.length > 0 && role === 'TEACHER') {
      for (const subjectId of subjectIds) {
        await prisma.teacherSubject.create({
          data: {
            teacherId: staff.id,
            subjectId: parseInt(subjectId),
            capacity: 50, // Default capacity
          },
        });
      }
    }

    // Fetch staff with subjects
    const staffWithSubjects = await prisma.staff.findUnique({
      where: { id: staff.id },
      include: {
        teacherSubjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    // Remove password and transform response
    const { password: _, teacherSubjects, ...staffData } = staffWithSubjects;

    return NextResponse.json(
      {
        message: 'Staff created successfully',
        data: {
          ...staffData,
          subjects: teacherSubjects.map(ts => ts.subject),
        }
      },
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
