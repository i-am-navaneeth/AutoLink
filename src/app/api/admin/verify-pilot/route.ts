// src/app/api/admin/verify-pilot/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// simple server-side guard — optionally check a header or auth in production
function requireAdminHeader(req: Request) {
  // In production please replace with real auth verification!
  const ok = req.headers.get('x-admin-secret') === process.env.ADMIN_API_SECRET;
  return ok;
}

export async function POST(req: Request) {
  try {
    // optional quick guard:
    if (process.env.NODE_ENV === 'production') {
      if (!requireAdminHeader(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();
    const { id, approve } = body as { id?: string; approve?: boolean };
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('pilots')
      .update({ isVerified: approve, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .limit(1);

    if (error) {
      console.error('Supabase admin update error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
