import { supabase } from "./supabaseClient";

export async function createOrUpdateUser(
  id: string,
  role: "passenger" | "pilot",
  full_name: string | null,
  phone: string | null,
  email: string | null,
  avatar_url: string | null
) {
  // First try to update the user
  const { error: updateError } = await supabase
    .from("users")
    .update({
      role,
      full_name,
      phone,
      email,
      avatar_url,
    })
    .eq("id", id);

  // If no row was updated → insert new user
  if (updateError) {
    console.error("Update error:", updateError);
  }

  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !existingUser) {
    const { error: insertError } = await supabase.from("users").insert([
      {
        id,
        role,
        full_name,
        phone,
        email,
        avatar_url,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
    }
  }
}
