import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/validations/supabaseClient";
import { blogSchema } from "@/lib/validations/blogSchema";

const JWT_SECRET = process.env.JWT_SECRET;

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
      console.log("Decoded JWT payload:", payload);

      const userId = payload.id || payload.userId || payload._id; // add all possibilities

      if (!userId) {
        return NextResponse.json(
          { message: "Unauthorized: Invalid token payload" },
          { status: 401 }
        );
      }

      // Use userId later in prisma create
    } catch (err) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // 3. Parse form data
    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const file = formData.get("image");

    // 4. Validate blog fields
    await blogSchema.validate({ title, content }, { abortEarly: false });

    // 5. Validate image file presence and type
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

      if (!urlData?.publicUrl) {
        return NextResponse.json(
          { message: "Failed to get public URL from Supabase" },
          { status: 500 }
        );
      }

      imageUrl = urlData.publicUrl;
    } catch (uploadErr) {
      console.error("Image upload failed:", uploadErr);
      return NextResponse.json(
        { message: "Image upload failed" },
        { status: 500 }
      );
    }

    // 7. Create blog entry in database with author connected by payload.id
    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        image: imageUrl,
        author: {
          connect: {
            id: payload.id, // payload is defined here, no ReferenceError
          },
        },
      },
    });

    // 8. Return created blog with 201 status
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Unexpected server error:", error);
    return NextResponse.json(
      { message: "Unexpected server error", details: error.message },
      { status: 500 }
    );
  }
}
