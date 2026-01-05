import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  try {
    const { mode, shared } = await req.json();

    if (!mode) {
      return NextResponse.json(
        { error: 'Mode is required' },
        { status: 400 }
      );
    }

    /* ================= AUTH ================= */
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    /* ================= BUSINESS LOGIC ================= */
    // user.id is VALID & TRUSTED here
    // keep your existing live-mode logic untouched

    return NextResponse.json({
      success: true,
      mode,
      shared,
    });

  } catch (error) {
    console.error('Pilot live-mode error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
