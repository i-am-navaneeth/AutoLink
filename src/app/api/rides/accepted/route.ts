import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔐 SERVER ONLY
);

export async function POST(req: NextRequest) {
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
      .select('id, status, pilot_id')
      .eq('id', ride_id)
      .single();

    if (rideError || !ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    if (ride.status !== 'requested') {
      return NextResponse.json(
        { error: 'Ride already accepted or unavailable' },
        { status: 400 }
      );
    }

    /* ================= ASSIGN RIDE ================= */
    const { error: assignError } = await supabase
      .from('rides')
      .update({
        status: 'assigned',
        pilot_id: user.id,
        assigned_at: new Date().toISOString(),
      })
      .eq('id', ride_id);

    if (assignError) {
      return NextResponse.json(
        { error: assignError.message },
        { status: 500 }
      );
    }

    /* ================= RIDE EVENT ================= */
    await supabase.from('ride_events').insert({
      ride_id,
      event_type: 'accepted',
      metadata: {
        pilot_id: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
