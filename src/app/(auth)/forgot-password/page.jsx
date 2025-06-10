'use client';

import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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

      if (!res.ok) throw new Error(result.message || "Failed to send reset link");

      toast.success(result.message || "Reset link sent successfully!");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Outer Container Padding */}
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="w-full max-w-md p-6">
        {/* Card Padding */}
        <CardHeader className="pb-6">
          {/* Card Header Padding Bottom */}
          <CardTitle className="text-center text-2xl font-semibold mb-2">
            {/* Card Title Styling and Margin Bottom */}
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Card Content (Spacing handled within the form) */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Spacing */}
            <div className="space-y-2">
              {/* Input Group Spacing */}
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4 cursor-pointer">
              {/* Button Margin Top */}
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
