import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 6;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.blog.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response = {
      blogs,
      pagination: { total, totalPages, currentPage: page },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("get blogs error", error?.message);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
