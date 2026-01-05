import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing pilot id' },
        { status: 400 }
      );
    }

    // 1️⃣ Reject pilot
    const { error: pilotError } = await supabase
      .from('pilots')
      .update({
        verification_status: 'rejected',
        verified: false,
      })
      .eq('id', id);

    if (pilotError) {
      return NextResponse.json(
        { error: pilotError.message },
        { status: 400 }
      );
    }

    // 2️⃣ Downgrade user role → passenger (safety)
    const { error: userError } = await supabase
      .from('users')
      .update({ role: 'passenger' })
      .eq('id', id);

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
