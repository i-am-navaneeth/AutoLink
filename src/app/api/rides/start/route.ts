import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { ride_id } = await req.json();

    if (!ride_id) {
      return NextResponse.json(
        { error: 'ride_id is required' },
        { status: 400 }
      );
    }

    /* ================= AUTH ================= */
    const auth = req.headers.get('authorization');
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(auth.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /* ================= FETCH RIDE ================= */
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('id, pilot_id, status')
      .eq('id', ride_id)
      .single();

    if (rideError || !ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    if (ride.pilot_id !== user.id) {
      return NextResponse.json(
        { error: 'Not your ride' },
        { status: 403 }
      );
    }

    if (ride.status !== 'assigned') {
      return NextResponse.json(
        { error: 'Ride cannot be started' },
        { status: 400 }
      );
    }

    /* ================= UPDATE RIDE ================= */
    const { error: updateRideError } = await supabase
      .from('rides')
      .update({ status: 'started' })
      .eq('id', ride_id);

    if (updateRideError) {
      return NextResponse.json(
        { error: updateRideError.message },
        { status: 400 }
      );
    }

    /* ================= RIDE EVENT (C-3) ================= */
    await supabase.from('ride_events').insert({
      ride_id,
      event_type: 'started',
      metadata: {
        pilot_id: user.id,
      },
    });

    /* ================= UPDATE PILOT ================= */
    const { error: pilotError } = await supabase
      .from('pilots')
      .update({
        is_on_ride: true,
        live_mode: null, // stop receiving new requests
      })
      .eq('id', user.id);

    if (pilotError) {
      return NextResponse.json(
        { error: pilotError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
