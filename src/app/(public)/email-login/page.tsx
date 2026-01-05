'use client';

import { Card, CardContent } from '@/components/ui/card';
import { EmailLoginForm } from '@/components/auth/email-login-form';

export default function EmailLoginPage() {
  return (
    <div className="w-full max-w-md backdrop-blur-sm">
      {/* Brand */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">
          AutoLink
        </h1>
        <p className="text-sm text-gray-700 mt-1">
          Where tech meets tuktuk
        </p>
      </div>

      {/* Login Card */}
      <Card className="shadow-xl">
        <CardContent className="pt-6">
          <EmailLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
