import { NextResponse } from "next/server";
import { clearUserCookie } from "@/lib/session";

export async function POST() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createSupabaseServerClient } = await import("@/lib/supabase/server");
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    }
    clearUserCookie();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/auth/logout]", err);
    return NextResponse.json({ error: "Errore durante il logout" }, { status: 500 });
  }
}
