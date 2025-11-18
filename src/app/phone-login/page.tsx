'use client';
import { PhoneLoginForm } from '@/components/auth/phone-login-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PhoneLoginPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Button>
                <Card>
                    <CardContent className="pt-6">
                        <PhoneLoginForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
