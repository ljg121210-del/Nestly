import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY. Add Stripe keys later when ready." },
        { status: 400 }
      );
    }

    const { jobId, estimatedAmountPence } = await req.json();

    const depositPence = Math.round(Number(estimatedAmountPence || 0) * 0.2);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nestly.network";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Nestly 20% booking deposit",
              description:
                "Refundable if the provider does not arrive. Final payment is made after completion.",
            },
            unit_amount: Math.max(depositPence, 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/job/${jobId}?deposit=success`,
      cancel_url: `${appUrl}/job/${jobId}?deposit=cancelled`,
      metadata: {
        jobId,
        payment_type: "deposit",
        deposit_percent: "20",
      },
    });

    await supabase.from("payments").insert({
      job_id: jobId,
      amount_pence: Math.max(depositPence, 100),
      platform_fee_pence: 0,
      stripe_checkout_session_id: session.id,
      status: "checkout_started",
      payment_type: "deposit",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Stripe checkout failed" }, { status: 500 });
  }
}
