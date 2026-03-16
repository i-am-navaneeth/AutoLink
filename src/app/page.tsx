'use client';

import { Button } from '@/components/ui/button';

export default function LandingPage() {
const handleWaitlist = () => {
window.open('https://tally.so/r/VLZkoN', '_blank');
};

return (
<main
className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
style={{
backgroundImage: "null",
}}
>
{/* Overlay */} <div className="absolute inset-0 bg-white/20" />


  {/* Content */}
  <div className="relative max-w-md w-full text-center space-y-6">

    <div className="flex items-center justify-center gap-3">
  <img
    src="/logo/autolink-logo.png" 
    alt="AutoLink Logo"
    className="h-10 w-10"
  />
  <h1 className="text-3xl font-extrabold tracking-wide text-gray-900">
    AutoLink
  </h1>
</div>

    <p className="text-gray-800 text-lg font-medium">
      Fair rides for passengers
      <br />
      Fair earnings for drivers
    </p>

    <p className="text-gray-700">
      India’s transparent ride platform.
    </p>

    <p className="text-gray-600 text-sm">
      Launching soon.
    </p>

    <p className="text-gray-600 text-sm font-medium">
      If 7000 people join the waitlist, we launch early 🚀
    </p>

    <div className="pt-4">
      <Button
        className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-black text-base font-semibold"
        onClick={handleWaitlist}
      >
        Join Early Access
      </Button>
    </div>

  </div>
</main>

);
}
