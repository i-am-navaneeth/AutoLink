import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const referralCode = body?.referralCode?.trim().toUpperCase();

    // Silent ignore
    if (!referralCode) {
      return NextResponse.json({ success: true });
    }

    /* ================= SERVER AUTH ================= */
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

    /* ================= FIND PILOT ================= */
    const { data: pilot } = await supabase
      .from('pilots')
      .select('id, user_id')
      .eq('referral_code', referralCode)
      .maybeSingle();

    if (!pilot) {
      return NextResponse.json({ success: true });
    }

    // ❌ Self-referral guard (FIXED)
    if (pilot.user_id === user.id) {
      return NextResponse.json({ success: true });
    }

    /* ================= DUPLICATE GUARD ================= */
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', user.id)
      .maybeSingle();

    if (existingReferral) {
      return NextResponse.json({ success: true });
    }

    /* ================= CHECK REFERRAL LIMIT ================= */
    const { data: credits } = await supabase
      .from('pilot_credits')
      .select('free_days, referrals_used, max_referrals')
      .eq('pilot_id', pilot.id)
      .maybeSingle();

    if (!credits || credits.referrals_used >= credits.max_referrals) {
      return NextResponse.json({ success: true });
    }

    /* ================= DETERMINE ROLE (FIXED) ================= */
    const { data: pilotCheck } = await supabase
      .from('pilots')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    const referredRole = pilotCheck ? 'pilot' : 'passenger';

    /* ================= INSERT REFERRAL ================= */
    const { data: referral } = await supabase
      .from('referrals')
      .insert({
        referrer_pilot_id: pilot.id,
        referred_user_id: user.id,
        referred_role: referredRole,
        reward_applied: false,
      })
      .select()
      .single();

    if (!referral) {
      return NextResponse.json({ success: true });
    }

    /* ================= APPLY CREDIT ================= */
    await supabase
      .from('pilot_credits')
      .update({
        free_days: credits.free_days + 1,
        referrals_used: credits.referrals_used + 1,
      })
      .eq('pilot_id', pilot.id);

    /* ================= LEDGER ENTRY ================= */
    await supabase.from('ledger').insert({
      user_id: pilot.user_id,
      type: 'REFERRAL_REWARD',
      amount: 1,
      description: '1 free day credited via referral',
    });

    /* ================= FINALIZE ================= */
    await supabase
      .from('referrals')
      .update({ reward_applied: true })
      .eq('id', referral.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Referral apply error:', error);
    // Never block signup
    return NextResponse.json({ success: true });
  }
}
