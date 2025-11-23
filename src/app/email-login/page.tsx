// src/app/email-login/page.tsx  (or wherever you want)
'use client';
import EmailOtpForm from '@/components/auth/EmailOtpForm';

export default function EmailLoginPage() {
  return (
    <div className="p-6">
      <EmailOtpForm />
    </div>
  );
}
