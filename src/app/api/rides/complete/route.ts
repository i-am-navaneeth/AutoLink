import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔐 SERVER ONLY
);

export async function POST(req: NextRequest) {
  try {
    const { ride_id, fare } = await req.json();

    if (!ride_id || fare == null || fare < 0) {
      return NextResponse.json(
        { error: 'Invalid input' },
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

    if (ride.status !== 'started') {
      return NextResponse.json(
        { error: 'Ride not active' },
        { status: 400 }
      );
    }

    /* ================= COMPLETE RIDE ================= */
    await supabase
      .from('rides')
      .update({
        status: 'completed',
        fare,
        completed_at: new Date().toISOString(),
      })
      .eq('id', ride_id);

    /* ================= UPDATE PILOT ================= */
    await supabase
      .from('pilots')
      .update({
        is_on_ride: false,
      })
      .eq('id', user.id);

    /* ================= DAILY SUBSCRIPTION LOGIC ================= */
    const today = new Date().toISOString().slice(0, 10);

    const { data: existing } = await supabase
      .from('pilot_subscriptions')
      .select('id')
      .eq('pilot_id', user.id)
      .eq('date', today)
      .maybeSingle();

    // ✅ Create ONLY if first ride of the day
    if (!existing) {
      await supabase.from('pilot_subscriptions').insert({
        pilot_id: user.id,
        date: today,
        is_paid: false,
        amount_due: 9, // ₹9 — Phase 1 locked
      });
    }

    /* ================= EVENT LOG ================= */
    await supabase.from('ride_events').insert({
      ride_id,
      event_type: 'completed',
      metadata: {
        fare,
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
