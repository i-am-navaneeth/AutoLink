'use client';

import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const handleWaitlist = () => {
    window.open('https://tally.so/r/VLZkoN', '_blank');
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-white to-gray-100">

      {/* Content */}
      <div className="max-w-lg w-full text-center space-y-8">

        {/* Logo + Name */}
        <div className="flex items-center justify-center gap-3">
          <img
            src="/logo/autolink-logo.png"
            alt="AutoLink Logo"
            className="h-12 w-12"
          />
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            AutoLink
          </h1>
        </div>

        {/* Main Tagline */}
        <p className="text-xl font-medium text-gray-800 leading-relaxed">
          Fair rides for passengers <br />
          Fair earnings for drivers
        </p>

        {/* Subtext */}
        <p className="text-gray-600">
          India’s transparent ride-sharing platform built for drivers and passengers.
        </p>

        {/* Launch Info */}
        <div className="space-y-2">
          <p className="text-gray-700 font-medium">
            Launching soon 🚀
          </p>

          <p className="text-sm text-gray-500">
            If <span className="font-semibold text-gray-800">7000 people</span> join the waitlist,
            we launch early.
          </p>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Button
            className="w-full py-6 text-base font-semibold bg-[#FFC107] hover:bg-[#FFB300] text-black shadow-md hover:shadow-lg transition"
            onClick={handleWaitlist}
          >
            Join Early Access
          </Button>
        </div>

        {/* Trust line */}
        <p className="text-xs text-gray-400">
          No spam. Just launch updates.
        </p>

      </div>
    </main>
  );
}