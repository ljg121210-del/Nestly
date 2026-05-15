import Stripe from "stripe";

export const stripe = new Stripe(
process.env.STRIPE_SECRET_KEY || "sk_test_placeholder"
);

export function commissionPercent() {
return Number(process.env.NESTLY_COMMISSION_PERCENT || 12);
}

export function commission(amountPence: number) {
return Math.round(amountPence * (commissionPercent() / 100));
}