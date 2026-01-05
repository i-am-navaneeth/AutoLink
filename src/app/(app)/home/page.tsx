'use client';

import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function PassengerHomePage() {
  return (
    <div className="flex justify-center px-4 py-10">
      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Find Your Ride
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your destination to find pilots heading your way.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* FROM */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Your current location"
                className="pl-10"
              />
            </div>
          </div>

          {/* TO */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Your desired destination"
                className="pl-10"
              />
            </div>
          </div>

          {/* SEARCH BUTTON */}
          <Button
            className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-medium"
            size="lg"
          >
            <Search className="mr-2 h-5 w-5" />
            Search
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
