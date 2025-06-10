import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/authSchema";
import { createToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate login input
    await loginSchema.validate(body, { abortEarly: false });

    const { email, password } = body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User does not exist" }, { status: 401 });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Wrong Password. Please try again." }, { status: 401 });
    }

    // Create JWT token
    const token = createToken(user);

    // Set cookie
    const cookieStore = cookies();
    cookieStore.set("token", token, {
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);

    if (err.name === "ValidationError") {
      return NextResponse.json({ message: "Validation failed", errors: err.errors }, { status: 400 });
    }

    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
