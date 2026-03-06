import { NextResponse } from 'next/server';
import { getDistanceInKm } from '@/lib/googleDistance';
import { calculateFare } from '@/lib/fare';

export async function POST(req: Request) {
  try {
    const { pickup, dropoff } = await req.json();

    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: 'Missing locations' },
        { status: 400 }
      );
    }

    // 🔐 Server truth
    const distanceKm = await getDistanceInKm(pickup, dropoff);

    const fareEstimate = calculateFare({
      distanceKm,
      rideType: 'quick',
      isNight: false,
    });

    return NextResponse.json({
      distanceKm,
      fareEstimate,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to preview fare' },
      { status: 500 }
    );
  }
}
