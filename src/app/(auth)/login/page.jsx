"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCookie } from "cookies-next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { loginSchema } from "@/lib/validations/authSchema";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(data) {
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Login failed");

      setCookie("user", JSON.stringify(result.user), {
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      toast.success("Login successful!");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Outer Container Padding */}
      <Card className="w-full max-w-md p-6">
        {/* Card Padding */}
        <CardHeader className="pb-6">
          {/* Card Header Padding Bottom */}
          <CardTitle className="text-center text-2xl font-semibold mb-2">
            {/* Card Title Styling and Margin Bottom */}
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Card Content (Spacing handled within the form) */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Spacing */}
            <div className="space-y-2">
              {/* Input Group Spacing */}
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              {/* Input Group Spacing */}
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4 cursor-pointer">
              {/* Button Margin Top */}
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center mt-4 text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:underline font-semibold cursor-pointer"

              >
                Signup
              </Link>
            </p>

            <p className="text-center mt-2 text-sm text-gray-600">
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:underline cursor-pointer"
              
              >
                Forgot Password?
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
