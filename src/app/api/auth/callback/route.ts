import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => '',
        set: () => {},
        remove: () => {},
      },
    }
  );

  await supabase.auth.exchangeCodeForSession(code);

  // 🔒 SAFE DEFAULT REDIRECT
  return NextResponse.redirect(`${origin}/quick-rides`);
}
