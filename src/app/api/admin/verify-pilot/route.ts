// src/app/api/admin/verify-pilot/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET!;

/**
 * Create a server-side Supabase client (service role).
 * NEVER import this into client components.
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
 * Require admin secret header for ALL environments.
 */
function requireAdmin(req: Request) {
  const secret = req.headers.get('x-admin-secret');
  return !!secret && secret === ADMIN_API_SECRET;
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

    const body = await req.json();
    const { id, approve } = body as {
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

    const { error } = await supabaseAdmin
      .from('pilots')
      .update({
        is_verified: approve,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to create ride:', error?.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
  const message =
    err instanceof Error ? err.message : 'Unknown error';

  console.error(message);
}

}
