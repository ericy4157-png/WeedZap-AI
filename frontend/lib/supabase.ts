import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(url, key);
  }

  return supabaseAdmin;
}

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function uploadImage(
  file: File,
  filename: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { data, error } = await supabase.storage
    .from("weed-uploads")
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error.message);
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from("weed-uploads")
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}
