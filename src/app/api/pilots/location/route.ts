import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { pilotId, lat, lng } = await req.json();

    if (!pilotId || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      );
    }
    console.log('📍 PILOT LOCATION API HIT');

    const { error } = await supabaseAdmin
      .from('pilot_locations')
      .upsert(
        {
          pilot_id: pilotId,
          lat,
          lng,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'pilot_id' }
      );

    if (error) {
      console.error('LOCATION UPDATE ERROR:', error);
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API ERROR:', err);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 500 }
    );
  }
}
