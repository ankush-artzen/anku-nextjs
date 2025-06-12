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

// ✅ import redux
import { useDispatch } from "react-redux";
import { clearAllBlogs } from "@/redux/slices/blogSlice";
import { clearPublicBlogs } from "@/redux/slices/publicSlice";

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
  const dispatch = useDispatch();  // ✅ initialize redux dispatch

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

      // ✅ Clear blog caches after login
      dispatch(clearAllBlogs());
      dispatch(clearPublicBlogs());

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
      <Card className="w-full max-w-md p-6">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-2xl font-semibold mb-2">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4 cursor-pointer">
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center mt-4 text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline font-semibold cursor-pointer">
                Signup
              </Link>
            </p>

            <p className="text-center mt-2 text-sm text-gray-600">
              <Link href="/forgot-password" className="text-blue-600 hover:underline cursor-pointer">
                Forgot Password?
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
