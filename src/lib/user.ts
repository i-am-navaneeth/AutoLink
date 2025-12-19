import { supabase } from '@/lib/supabase/client';

export async function createOrUpdateUser(
  id: string,
  role: 'passenger' | 'pilot',
  full_name: string | null,
  email: string | null,
  avatar_url: string | null
) {
  // 🔁 Try UPDATE first
  const { error: updateError } = await supabase
    .from('users')
    .update({
      role,
      full_name,
      email,
      avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  // ✅ If update worked, exit
  if (!updateError) {
    return;
  }

  // 🔁 If update failed (row not found), INSERT
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id,
      role,
      full_name,
      email,
      avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (insertError) {
    // ✅ Type-safe, Next.js-safe logging
    console.error(
      insertError instanceof Error
        ? insertError.message
        : 'Failed to create user'
    );

    throw insertError;
  }
}
