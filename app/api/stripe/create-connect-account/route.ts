import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error:"Missing STRIPE_SECRET_KEY" }, { status:400 });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const account = await stripe.accounts.create({ type:"express", country:"GB", capabilities:{ card_payments:{ requested:true }, transfers:{ requested:true } } });
    const link = await stripe.accountLinks.create({ account:account.id, refresh_url:`${appUrl}/provider/onboarding?stripe=refresh`, return_url:`${appUrl}/provider/onboarding?stripe=complete`, type:"account_onboarding" });
    return NextResponse.json({ url:link.url, accountId:account.id });
  } catch (error:any) { return NextResponse.json({ error:error.message || "Stripe Connect failed" }, { status:500 }); }
}
