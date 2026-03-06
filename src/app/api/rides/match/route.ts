// app/api/rides/match/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Adaptive radius matching
 * 1️⃣ 5 km
 * 2️⃣ 8 km
 * 3️⃣ 12 km (hard stop)
 */
const RADII_KM = [5, 8, 12];
const MAX_PILOTS = 5; // safety cap

export async function POST(req: Request) {
  try {
    const { rideId } = await req.json();

    if (!rideId) {
      return NextResponse.json(
        { error: 'rideId required' },
        { status: 400 }
      );
    }

    /* ================= LOAD RIDE ================= */

    const { data: ride, error: rideError } = await supabaseAdmin
      .from('rides')
      .select('id, pickup_lat, pickup_lng, status')
      .eq('id', rideId)
      .single();

    if (rideError || !ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    if (ride.status !== 'requested') {
      return NextResponse.json(
        { error: 'Ride not in requested state' },
        { status: 409 }
      );
    }

    /* ================= MATCH PILOTS ================= */

    let matchedPilots: { pilot_id: string }[] = [];
    let usedRadius: number | null = null;

    for (const radius of RADII_KM) {
      const { data: pilots } = await supabaseAdmin.rpc(
        'find_nearby_pilots',
        {
          p_lat: ride.pickup_lat,
          p_lng: ride.pickup_lng,
          p_radius_km: radius,
        }
      );

      // Defensive check
      if (!Array.isArray(pilots)) {
        console.error('Invalid RPC response:', pilots);
        continue;
      }

      if (pilots.length > 0) {
        matchedPilots = pilots.slice(0, MAX_PILOTS);
        usedRadius = radius;
        break;
      }
    }

    if (matchedPilots.length === 0) {
      return NextResponse.json({
        matched: 0,
        message: 'No pilots available',
      });
    }

    /* ================= CREATE RIDE EVENTS ================= */

    const events = matchedPilots.map(p => ({
      ride_id: ride.id,
      pilot_id: p.pilot_id,
      event_type: 'ride_offered',
      created_at: new Date().toISOString(),
    }));

    const { error: eventError } = await supabaseAdmin
      .from('ride_events')
      .insert(events);

    if (eventError) {
      console.error('EVENT INSERT ERROR:', eventError);
      return NextResponse.json(
        { error: 'Failed to create ride events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      matched: matchedPilots.length,
      radius_km: usedRadius,
      pilots: matchedPilots.map(p => p.pilot_id), // debug visibility
    });
  } catch (err) {
    console.error('MATCH ERROR:', err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
