// app/api/rides/accepted/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';

// 🔐 User-auth client (NOT service role)
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pilotId = user.id;

    /* ================= ATOMIC ACCEPT =================
       This prevents double-accepts
    */

    const { data: updatedRide, error: updateError } =
      await supabaseAdmin
        .from('rides')
        .update({
          status: 'accepted',
          pilot_id: pilotId,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', ride_id)
        .eq('status', 'requested') // 🔐 atomic guard
        .select()
        .single();

    if (updateError || !updatedRide) {
      return NextResponse.json(
        { error: 'Ride already taken' },
        { status: 409 }
      );
    }

    /* ================= RIDE EVENT ================= */

    await supabaseAdmin.from('ride_events').insert({
      ride_id,
      pilot_id: pilotId,
      event_type: 'accepted',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      ride_id,
    });
  } catch (err: any) {
    console.error('ACCEPT ERROR:', err);
    return NextResponse.json(
      { error: err.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
