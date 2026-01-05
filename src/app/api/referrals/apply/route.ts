import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  try {
    const { referralCode } = await req.json();

    if (!referralCode) {
      return NextResponse.json({ success: true }); // silent ignore
    }

    /* ================= AUTH ================= */
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true });
    }

    /* ================= FIND PILOT BY CODE ================= */
    const { data: pilot } = await supabase
      .from('pilots')
      .select('user_id')
      .eq('referral_code', referralCode)
      .single();

    if (!pilot) {
      return NextResponse.json({ success: true });
    }

    // ❌ prevent self-referral
    if (pilot.user_id === user.id) {
      return NextResponse.json({ success: true });
    }

    /* ================= CHECK DUPLICATE ================= */
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ success: true });
    }

    /* ================= DETERMINE REFERRED ROLE ================= */
    const { data: pilotCheck } = await supabase
      .from('pilots')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    const referredRole = pilotCheck ? 'pilot' : 'passenger';

    /* ================= INSERT REFERRAL ================= */
    const { data: referral } = await supabase
      .from('referrals')
      .insert({
        referrer_pilot_id: pilot.user_id,
        referred_user_id: user.id,
        referred_role: referredRole,
        reward_applied: false,
      })
      .select()
      .single();

    if (!referral) {
      return NextResponse.json({ success: true });
    }

    /* ================= APPLY REWARD ================= */
    await supabase.rpc('add_pilot_free_day', {
      p_pilot_id: pilot.user_id,
    });

    await supabase.from('ledger').insert({
      user_id: pilot.user_id,
      type: 'REFERRAL_REWARD',
      amount: 1,
      description: '1 free day for referral',
    });

    await supabase
      .from('referrals')
      .update({ reward_applied: true })
      .eq('id', referral.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Referral apply error:', error);
    return NextResponse.json({ success: true });
  }
}
