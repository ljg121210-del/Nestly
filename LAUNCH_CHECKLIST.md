# Nestly V6 Launch Checklist

1. Supabase
- Create `.env.local`
- Add Supabase URL and anon/publishable key
- Run `supabase/schema.sql`
- Enable realtime for jobs, quotes, payments, messages, notifications

2. Stripe
- Add Stripe test keys to `.env.local`
- Test Checkout with test cards
- Add webhook endpoint `/api/stripe/webhook`
- Add `STRIPE_WEBHOOK_SECRET`
- Set `NESTLY_COMMISSION_PERCENT=12` or your chosen fee

3. Domain + Deployment
- Deploy to Vercel
- Add your domain
- Change `NEXT_PUBLIC_APP_URL`
- Update Supabase redirect URLs

4. Before taking real money
- Add terms/privacy/refund policy
- Verify providers manually
- Test full customer/provider flow
- Review Supabase RLS policies
