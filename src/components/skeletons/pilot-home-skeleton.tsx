'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PilotHomeSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-12 w-full" />

      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
      <div className="mt-8 text-center">
        <div className='inline-flex flex-col items-center gap-2'>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-48" />
        </div>
      </div>
    </div>
  );
}
