"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "react-toastify/dist/ReactToastify.css";
import { forgotPasswordSchema } from "@/lib/validations/authSchema";


export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(data) {
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();

      if (!res.ok)
        throw new Error(result.message || "Failed to send reset link");

      toast.success(result.message || "Reset link sent successfully!");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-2xl font-semibold mb-2">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 cursor-pointer"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          {/* Your new text here */}
          <p className="text-center mt-4 text-sm text-gray-600">
            <Link
              href="/login"
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Go back to login page
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
