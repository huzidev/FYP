import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const visibility = searchParams.get('visibility');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let whereClause = {
      isActive: true,
      ...(type && { type })
    };

    // Handle visibility filtering for students
    if (visibility === 'student') {
      whereClause.visibility = {
        in: ['STUDENTS_ONLY', 'BOTH']
      };
    } else if (visibility) {
      whereClause.visibility = visibility;
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        queries: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Limit initial queries shown
        },
        _count: {
          select: {
            queries: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.announcement.count({
      where: whereClause
    });

    return NextResponse.json({
      announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      imageUrl,
      type,
      visibility,
      createdById,
      createdByType
    } = body;

    // Validate required fields
    if (!title || !content || !type || !visibility || !createdById || !createdByType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate enums
    const validTypes = ['QUESTION', 'ANNOUNCEMENT'];
    const validVisibilities = ['STAFF_ONLY', 'STUDENTS_ONLY', 'BOTH'];
    const validCreatedByTypes = ['ADMIN', 'STAFF'];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid announcement type' },
        { status: 400 }
      );
    }

    if (!validVisibilities.includes(visibility)) {
      return NextResponse.json(
        { error: 'Invalid visibility option' },
        { status: 400 }
      );
    }

    if (!validCreatedByTypes.includes(createdByType)) {
      return NextResponse.json(
        { error: 'Invalid creator type' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        imageUrl,
        type,
        visibility,
        createdById,
        createdByType
      },
      include: {
        queries: true,
        _count: {
          select: {
            queries: true
          }
        }
      }
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}