import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase/supabaseClient";
import { blogSchema } from "@/lib/validations/blogSchema";
import { redis } from "@/lib/utils/redis";  

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to clear relevant cache entries
async function clearUserBlogsCache(userId) {
  try {
    // Clear all paginated blog caches for this user
    const keys = await redis.keys(`userBlogs:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
    
    // Clear global blog listings
    const globalKeys = await redis.keys('blogs:*');
    if (globalKeys.length > 0) {
      await redis.del(globalKeys);
    }
  } catch (err) {
    console.error("Cache clearing failed:", err.message);
    throw err; // Re-throw to handle in the main function
  }
}

export async function POST(req) {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    // 2. Verify token and extract payload
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Extract user ID from payload (handling different possible fields)
    const userId = payload.id || payload.userId || payload._id;
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token payload" },
        { status: 401 }
      );
    }

    // 3. Parse form data
    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const file = formData.get("image");

    // 4. Validate blog fields
    try {
      await blogSchema.validate({ title, content }, { abortEarly: false });
    } catch (validationError) {
      return NextResponse.json(
        { 
          message: "Validation failed",
          errors: validationError.errors 
        },
        { status: 400 }
      );
    }

    // 5. Validate image file
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    // 6. Upload image to Supabase
    let imageUrl;
    try {
      const fileBuffer = await file.arrayBuffer();
      const fileName = `${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(fileName, new Uint8Array(fileBuffer), {
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          { message: "Image upload failed" },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from("blog-images")
        .getPublicUrl(fileName);

      imageUrl = urlData?.publicUrl;
      if (!imageUrl) {
        throw new Error("Failed to get public URL");
      }
    } catch (uploadErr) {
      console.error("Image upload failed:", uploadErr);
      return NextResponse.json(
        { message: "Image upload failed" },
        { status: 500 }
      );
    }

    // 7. Create blog entry in database
    let newBlog;
    try {
      newBlog = await prisma.blog.create({
        data: {
          title,
          content,
          image: imageUrl,
          author: {
            connect: {
              id: userId
            }
          }
        }
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { message: "Failed to create blog post" },
        { status: 500 }
      );
    }

    // 8. Clear relevant caches
    try {
      await clearUserBlogsCache(userId);
    } catch (cacheError) {
      console.error("Cache invalidation failed:", cacheError);
      // Continue even if cache invalidation fails
    }

    // 9. Return created blog with 201 status
    return NextResponse.json(newBlog, { status: 201 });

  } catch (error) {
    console.error("Unexpected server error:", error);
    return NextResponse.json(
      { 
        message: "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.message 
        })
      },
      { status: 500 }
    );
  }
}