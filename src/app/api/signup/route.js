import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const body = await req.json();

    const { username, email, password } = body;

    // ✅ Check for existing email
    const existingEmailUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmailUser) {
      return Response.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 409 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // ✅ Create JWT token
    const token = createToken(user);

    // ✅ Set token as cookie
    const cookieStore = cookies();
    cookieStore.set({
      name: "token",
      value: token,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // ✅ Return success response
    return Response.json(
      {
        success: true,
        message: "User created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return Response.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
