import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/subjects - Get all subjects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const level = searchParams.get('level');
    const search = searchParams.get('search') || '';

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(departmentId && { departmentId: parseInt(departmentId) }),
      ...(level && { level }),
    };

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teachers: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      data: subjects,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

// POST /api/subjects - Create new subject
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      code, 
      description, 
      creditHours, 
      semester, 
      level, 
      departmentId,
      teacherIds 
    } = body;

    // Validation
    if (!name || !code || !departmentId) {
      return NextResponse.json(
        { error: 'Name, code, and department are required' },
        { status: 400 }
      );
    }

    // Check if subject already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Subject with this code already exists' },
        { status: 400 }
      );
    }

    // Create subject
    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        description,
        creditHours: creditHours ? parseInt(creditHours) : 3,
        semester: semester ? parseInt(semester) : null,
        level,
        departmentId: parseInt(departmentId),
        ...(teacherIds && teacherIds.length > 0 && {
          teachers: {
            connect: teacherIds.map(id => ({ id: parseInt(id) })),
          },
        }),
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teachers: {
          select: {
            id: true,
            fullName: true,
            staffId: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Subject created successfully', data: subject },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}