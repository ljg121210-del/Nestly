import { NextResponse } from "next/server";
import { stripe, commission } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error:"Missing STRIPE_SECRET_KEY" }, { status:400 });
    const { jobId, quoteId, amountPence } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
    const platformFee = commission(Number(amountPence || 0));
    const session = await stripe.checkout.sessions.create({
      mode:"payment",
      line_items:[{ price_data:{ currency:"gbp", product_data:{ name:"Nestly booking deposit" }, unit_amount:Number(amountPence || 1000) }, quantity:1 }],
      success_url:`${appUrl}/job/${jobId}?payment=success`,
      cancel_url:`${appUrl}/job/${jobId}/quotes?payment=cancelled`,
      metadata:{ jobId, quoteId, platformFee:String(platformFee) }
    });
    await supabase.from("payments").insert({ job_id:jobId, quote_id:quoteId, amount_pence:amountPence, platform_fee_pence:platformFee, stripe_checkout_session_id:session.id, status:"checkout_started" });
    return NextResponse.json({ url:session.url });
  } catch (error:any) { return NextResponse.json({ error:error.message || "Stripe checkout failed" }, { status:500 }); }
}
