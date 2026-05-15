import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) return NextResponse.json({ error:"Missing webhook secret/signature" }, { status:400 });
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
    if (event.type === "checkout.session.completed") {
      const session:any = event.data.object;
      const jobId = session.metadata?.jobId;
      const quoteId = session.metadata?.quoteId;
      await supabase.from("payments").update({ status:"deposit_paid" }).eq("stripe_checkout_session_id", session.id);
      if (jobId) await supabase.from("jobs").update({ status:"paid" }).eq("id", jobId);
      if (quoteId) await supabase.from("quotes").update({ status:"accepted" }).eq("id", quoteId);
    }
    return NextResponse.json({ received:true });
  } catch (error:any) { return NextResponse.json({ error:error.message || "Webhook failed" }, { status:400 }); }
}
