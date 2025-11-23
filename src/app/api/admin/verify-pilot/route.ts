// src/app/api/admin/verify-pilot/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET;

// Ensure required envs exist (return early in runtime with helpful error)
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

/**
 * Create a server-side Supabase client using the service role key.
 * Created inside the file to avoid accidental client-side bundling/import-time work.
 */
function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase admin credentials are not configured');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

// server-side guard — check a header or admin secret
function requireAdminHeader(req: Request) {
  // Note: in production you should use stronger auth (JWT verification, etc.)
  const header = req.headers.get('x-admin-secret');
  if (!ADMIN_API_SECRET) return false;
  return header === ADMIN_API_SECRET;
}

export async function POST(req: Request) {
  try {
    // In production require header; in non-production you may allow it (optional)
    if (process.env.NODE_ENV === 'production') {
      if (!requireAdminHeader(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      // if ADMIN_API_SECRET exists in non-prod, prefer checking it too (safer)
      if (ADMIN_API_SECRET) {
        if (!requireAdminHeader(req)) {
          return NextResponse.json({ error: 'Unauthorized (dev)' }, { status: 401 });
        }
      }
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

    const { id, approve } = body as { id?: string; approve?: boolean };
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();

    // Use snake_case columns (typical in Postgres). Adjust if your schema differs.
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
      // set both possible column names to be safe (if you used camelCase earlier)
      is_verified: approve === true,
      isverified: approve === true,
      isVerified: approve === true,
    };

    // Prefer updating canonical column name if you know it; here we try 'is_verified'
    const { data, error } = await supabaseAdmin
      .from('pilots')
      .update({
        is_verified: approve === true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .limit(1);

    if (error) {
      console.error('Supabase admin update error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('verify-pilot route error:', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
