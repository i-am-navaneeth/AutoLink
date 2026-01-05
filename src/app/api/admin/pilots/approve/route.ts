import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get('id') as string | null;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing pilot id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('pilots')
      .update({
        verification_status: 'approved',
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // ✅ redirect back to admin page (important)
    return NextResponse.redirect(
      new URL('/admin/verify-pilots', req.url)
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
