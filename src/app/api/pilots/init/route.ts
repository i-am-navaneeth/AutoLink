import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

console.log(
  'SERVICE ROLE KEY EXISTS:',
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId, email, fullName, avatarUrl } = await req.json();

  if (!userId || !email) {
    return NextResponse.json(
      { error: 'Missing data' },
      { status: 400 }
    );
  }

  console.log('PROCESSING USER ID:', userId);

  // 1️⃣ Ensure users row exists, create if missing, otherwise update role
  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    return NextResponse.json(
      { error: selectError.message },
      { status: 400 }
    );
  }

  if (!existingUser) {
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        role: 'pilot',
        full_name: fullName ?? 'Pilot',
        avatar_url: avatarUrl,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }
  } else {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        role: 'pilot',
        full_name: fullName ?? 'Pilot',
        avatar_url: avatarUrl,
      })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }
  }

  // 2️⃣ Ensure pilots row exists
  const { error: pilotError } = await supabase
    .from('pilots')
    .upsert(
      {
        id: userId,
        verification_status: 'pending',
      },
      { onConflict: 'id' }
    );

  if (pilotError) {
    return NextResponse.json(
      { error: pilotError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
