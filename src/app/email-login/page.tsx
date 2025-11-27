// src/app/email-login/page.tsx
import EmailLoginForm from '@/components/auth/email-login-form';

export default function EmailLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">Get Started</h1>
        <EmailLoginForm />
      </div>
    </main>
  );
}
