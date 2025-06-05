import { NextResponse } from "next/server";
import { decryptToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ message: "Token and valid password are required" }, { status: 400 });
  }

  let decrypted;
  try {
    const decodedToken = decodeURIComponent(token); // Decode token from URL
    decrypted = decryptToken(decodedToken);         // Your decryptToken method
  } catch {
    return NextResponse.json({ message: "Invalid token format" }, { status: 400 });
  }

  let parsedToken;
  try {
    parsedToken = JSON.parse(decrypted);
  } catch {
    return NextResponse.json({ message: "Invalid token content" }, { status: 400 });
  }

  if (Date.now() > parsedToken.expires) {
    return NextResponse.json({ message: "Reset token has expired" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: parsedToken.userId } });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: parsedToken.userId },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
}
