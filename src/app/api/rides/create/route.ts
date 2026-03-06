import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

import { getDistanceInKm } from '@/lib/googleDistance';
import { calculateFare } from '@/lib/fare';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      passengerId,
      pickup,
      dropoff,
      rideDate, // can be null for instant rides
      ride_type, // 👈 accept from frontend
    } = body;

    if (!passengerId || !pickup || !dropoff) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 🚫 TEMP MVP BLOCK — future rides disabled
    if (rideDate && new Date(rideDate) > new Date()) {
      return NextResponse.json(
        { error: 'Scheduled rides are coming soon' },
        { status: 403 }
      );
    }

    /* ================= SERVER TRUTH ================= */

    // 🔐 1️⃣ Real distance from Google Maps
    const distanceKm = await getDistanceInKm(pickup, dropoff);

    // 👇 default to quick if not provided (backward safe)
    const finalRideType = ride_type ?? 'quick';

    // 🔐 2️⃣ Fare calculated ONLY from server distance
    const fareEstimate = calculateFare({
      distanceKm,
      rideType: finalRideType, // 👈 dynamic now
      isNight: false, // later auto-detect
    });

    /* ================= CREATE RIDE ================= */

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

        is_instant: true,
        ride_type: finalRideType, // 👈 dynamic now
        status: 'requested',

        distance_km: distanceKm,
        fare_estimate: fareEstimate,
      })
      .select()
      .single();

    if (error) {
  console.error('CREATE RIDE ERROR FULL:', error);

  return NextResponse.json(
    { error: error.message || 'Database error' },
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