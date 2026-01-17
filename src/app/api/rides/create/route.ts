import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      passengerId,
      pickup,
      dropoff,
      rideDate, // can be null for instant rides
      fare,
      distanceKm,
    } = body;

    if (!passengerId || !pickup || !dropoff) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isInstant = !rideDate;

          // TEMP MVP BLOCK — future rides disabled
if (rideDate && new Date(rideDate) > new Date()) {
  return NextResponse.json(
    { error: 'Scheduled rides are coming soon' },
    { status: 403 }
  );
}

    
    const { data, error } = await supabaseAdmin
  .from('rides')
  .insert({
    passenger_id: passengerId,

    pickup_location: pickup.address,
    pickup_lat: pickup.lat,
    pickup_lng: pickup.lng,

    dropoff_location: dropoff.address,
    dropoff_lat: dropoff.lat,
    dropoff_lng: dropoff.lng,

    scheduled_time: rideDate ?? null,
    is_instant: isInstant,

    ride_type: 'instant',
    status: 'requested',

    fare_estimate: fare,
    distance_km: distanceKm,
  })
  .select()
  .single();




    if (error) {
      console.error('CREATE RIDE ERROR:', error);
      return NextResponse.json(
        { error: 'Failed to create ride' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ride: data });
  } catch (err) {
    console.error('API ERROR:', err);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 500 }
    );
  }
}
