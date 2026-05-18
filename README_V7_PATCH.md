# Nestly V7 Patch

Copy these files into your current Nestly project and replace existing files.

Then run the SQL file in Supabase:

`supabase/v7_patch.sql`

Then push:

```bash
git add .
git commit -m "Apply V7 marketplace simplification patch"
git push
```

## What this patch changes

- One top navigation only; side/bottom duplicate nav removed.
- Mobile hamburger menu works.
- Customer and provider dashboards are clearly different.
- Request flow is simpler.
- Optional job/problem photos added.
- Provider status matching: online providers only.
- Provider accepts/declines matched requests.
- Map shows provider markers within the customer area.
- RLS fix for `new row violates row-level security policy for table users`.
- Adds 20% deposit Stripe route.
- Adds completion photo/final-payment structure.
