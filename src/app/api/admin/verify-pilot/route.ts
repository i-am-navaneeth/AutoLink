import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET!;

/**
 * Server-side Supabase client (service role)
 */
function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase admin credentials missing');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Require admin secret
 */
function requireAdmin(req: Request) {
  const secret = req.headers.get('x-admin-secret');
  return secret === ADMIN_API_SECRET;
}

export async function POST(req: Request) {
  try {
    if (!ADMIN_API_SECRET) {
      return NextResponse.json(
        { error: 'Admin secret not configured' },
        { status: 500 }
      );
    }

    if (!requireAdmin(req)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, approve } = (await req.json()) as {
      id?: string;
      approve?: boolean;
    };

    if (!id || typeof approve !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    /* 1️⃣ Update pilots table */
    const { error: pilotError } = await supabaseAdmin
      .from('pilots')
      .update({
        verification_status: approve ? 'approved' : 'rejected',
        is_verified: approve,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (pilotError) {
      return NextResponse.json(
        { error: pilotError.message },
        { status: 500 }
      );
    }

    /* 2️⃣ Update users role */
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({
        role: approve ? 'pilot' : 'passenger',
      })
      .eq('id', id);

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error';

    console.error('[VERIFY PILOT ERROR]', message);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
