import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: {
        id: parseInt(id),
        isActive: true
      },
      include: {
        queries: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            queries: true
          }
        }
      }
    });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      content,
      imageUrl,
      type,
      visibility,
      isActive
    } = body;

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const announcement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(type && { type }),
        ...(visibility && { visibility }),
        ...(isActive !== undefined && { isActive })
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

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}