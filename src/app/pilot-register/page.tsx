'use client';
import PilotRegisterForm from "@/app/register/components/pilot-register-form";
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PilotRegisterPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                 <div className="mb-4">
                    <Button variant="ghost" onClick={() => router.push('/register')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Role Selection
                    </Button>
                </div>
                 <Card className="shadow-2xl">
                    <PilotRegisterForm />
                </Card>
            </div>
        </div>
    )
}
