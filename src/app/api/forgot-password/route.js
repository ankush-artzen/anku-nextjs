
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/jwt";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "User not registered with this email" }, { status: 404 });
    }

    const tokenPayload = {
      userId: user.id,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    const token = encryptToken(JSON.stringify(tokenPayload));
    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL ;
    const resetUrl = `${baseUrl}/reset-password/${encodeURIComponent(token)}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      `<p>You requested a password reset.</p>
       <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
       <p>This link will expire in 15 minutes.</p>`
    );

    return NextResponse.json({ message: "Reset link sent to email" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
