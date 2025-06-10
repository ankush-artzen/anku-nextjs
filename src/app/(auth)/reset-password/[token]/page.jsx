'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return <p className="text-center p-6 text-red-500">Invalid or missing reset token</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      toast.success('Password reset successful!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6">
      {/* Outer Container Padding */}
      <Card className="w-full max-w-md p-6">
        {/* Card Padding */}
        <CardHeader className="pb-6">
          {/* Card Header Padding Bottom */}
          <CardTitle className="text-center text-2xl font-semibold mb-2">
            {/* Card Title Styling and Margin Bottom */}
            Reset Your Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Card Content (Spacing handled within the form) */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Spacing */}
            <div className="space-y-2">
              {/* Input Group Spacing */}
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              {/* Input Group Spacing */}
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-4 cursor-pointor">
              {/* Button Margin Top */}
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
