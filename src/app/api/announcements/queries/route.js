import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { content, announcementId, userId } = body;

    // Validate required fields
    if (!content || !announcementId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if announcement exists and allows queries
    const announcement = await prisma.announcement.findUnique({
      where: {
        id: parseInt(announcementId),
        isActive: true
      }
    });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    if (announcement.type !== 'QUESTION') {
      return NextResponse.json(
        { error: 'This announcement does not allow queries' },
        { status: 400 }
      );
    }

    const query = await prisma.announcementQuery.create({
      data: {
        content,
        announcementId: parseInt(announcementId),
        userId: parseInt(userId)
      }
    });

    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    console.error('Error creating query:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const announcementId = searchParams.get('announcementId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereClause = {
      ...(announcementId && { announcementId: parseInt(announcementId) })
    };

    const queries = await prisma.announcementQuery.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.announcementQuery.count({
      where: whereClause
    });

    return NextResponse.json({
      queries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching queries:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}