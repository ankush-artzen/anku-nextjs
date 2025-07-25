"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { setCookie } from "cookies-next";
import { signupFormSchema } from "@/lib/validations/authSchema";
import { useDispatch } from "react-redux";
import { clearAllBlogs } from "@/redux/slices/blogSlice";
import { clearPublicBlogs } from "@/redux/slices/publicSlice";

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupFormSchema),
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();  // ✅ useDispatch hook

  async function onSubmit(data) {
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || result.message || "Signup failed");
      }

      setCookie("user", JSON.stringify(result.user), {
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      // ✅ clear redux blog cache after successful signup
      dispatch(clearAllBlogs());
      dispatch(clearPublicBlogs());

      toast.success("Signup successful!");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Signup error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-2xl font-semibold mb-2">
            Sign Up
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" {...register("username")} />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4 cursor-pointer">
              {loading ? "Signing up..." : "Sign Up"}
            </Button>

            <p className="text-center mt-4 text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
