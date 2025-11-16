import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/departments - Get all departments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
    };

    const departments = await prisma.department.findMany({
      where,
      include: {
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      data: departments,
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST /api/departments - Create new department
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, code, description } = body;

    // Validation
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if department already exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [
          { name },
          { code },
        ],
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department with this name or code already exists' },
        { status: 400 }
      );
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
      },
      include: {
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Department created successfully', data: department },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}