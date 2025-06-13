import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/utils/redis";
import { getCookie } from 'cookies-next';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 6;
    const skip = (page - 1) * limit;

    // Get visitor ID from cookies
    const visitorId = getCookie('visitorId', { req });
    
    // Base cache key without visitor ID
    const cacheKey = `blogs:page=${page}:limit=${limit}`;

    // Try cache first
    let cached;
    try {
      cached = await redis.get(cacheKey);
      if (cached) {
        console.log("Cache hit for", cacheKey);
        
        // Track visit in Redis if visitor exists
        if (visitorId) {
          await trackVisitor(visitorId);
        }
        
        return NextResponse.json(JSON.parse(cached), { status: 200 });
      }
    } catch (err) {
      console.log("Redis GET failed", err.message);
    }

    // Fetch from database
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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

    // Track visitor in Redis if exists
    if (visitorId) {
      await trackVisitor(visitorId);
    }

    const totalPages = Math.ceil(total / limit);
    const response = {
      blogs,
      pagination: { total, totalPages, currentPage: page },
    };

    // Set cache
    try {
      await redis.set(cacheKey, JSON.stringify(response), { ex: 60 * 60 });
    } catch (err) {
      console.log("Redis SET failed", err.message);
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("get blogs error", error?.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Helper function to track visitor in Redis
async function trackVisitor(visitorId) {
  try {
    const visitorKey = `visitor:${visitorId}`;
    
    // Using Redis pipeline for multiple operations
    const pipeline = redis.pipeline();
    
    // Increment visit count
    pipeline.hincrby(visitorKey, 'visitCount', 1);
    
    // Update last visit time
    pipeline.hset(visitorKey, 'lastVisited', new Date().toISOString());
    
    // Set expiration (30 days)
    pipeline.expire(visitorKey, 60 * 60 * 24 * 30);
    
    await pipeline.exec();
    
  } catch (err) {
    console.error("Failed to track visitor in Redis:", err.message);
  }
}