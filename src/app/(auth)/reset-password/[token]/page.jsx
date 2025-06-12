'use client';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useState } from "react";
import {resetPasswordSchema } from "@/lib/validations/authSchema";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  if (!token) {
    return <p className="text-center p-6 text-red-500">Invalid or missing reset token</p>;
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }

      toast.success('Password reset successful!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-2xl font-semibold mb-2">
            Reset Your Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New Password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm Password"
                {...register("confirm")}
              />
              {errors.confirm && (
                <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>
              )}
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-4 cursor-pointer">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
