import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { requestId, jobId, response } = await req.json();
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { error: requestError } = await supabase
      .from("job_requests")
      .update({ status: response })
      .eq("id", requestId)
      .eq("provider_id", auth.user.id);

    if (requestError) {
      return NextResponse.json({ error: requestError.message }, { status: 500 });
    }

    if (response === "accepted") {
      const { data: providerUser } = await supabase
        .from("users")
        .select("name, phone")
        .eq("id", auth.user.id)
        .single();

      const { error: jobError } = await supabase
        .from("jobs")
        .update({
          status: "assigned",
          provider_id: auth.user.id,
          provider_name: providerUser?.name || "Provider",
          provider_phone: providerUser?.phone || "",
        })
        .eq("id", jobId);

      if (jobError) {
        return NextResponse.json({ error: jobError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
