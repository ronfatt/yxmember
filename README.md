# MetaEnergy (元象) Membership + Referral + Points MVP

Next.js App Router MVP for member auth, referral commissions, keep-alive resets, points, and simple frequency tools.

## Stack

- Next.js 14 App Router
- Supabase Auth + Postgres
- Tailwind CSS
- Vercel deployment target

## Environment

Copy [`.env.example`](/Users/rms/Desktop/元像/yuanxiang%20app/.env.example) to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL_ALLOWLIST`
- `CRON_SECRET`
- `RESEND_API_KEY` (optional, for program reservation emails)
- `EMAIL_FROM` (optional sender for reservation emails)
- `BANK_BANK_NAME` (optional, shown on member programs page)
- `BANK_ACCOUNT_NAME` (optional, shown on member programs page)
- `BANK_ACCOUNT_NUMBER` (optional, shown on member programs page)
- `BANK_TRANSFER_NOTE` (optional payment reference / note)

## Database setup

Run the Supabase SQL migrations in order:

1. [`supabase/migrations/0001_init.sql`](/Users/rms/Desktop/元像/yuanxiang%20app/supabase/migrations/0001_init.sql)
2. [`supabase/migrations/0002_metaenergy_mvp.sql`](/Users/rms/Desktop/元像/yuanxiang%20app/supabase/migrations/0002_metaenergy_mvp.sql)
3. [`supabase/migrations/0003_mentor_booking_mvp.sql`](/Users/rms/Desktop/元像/yuanxiang%20app/supabase/migrations/0003_mentor_booking_mvp.sql)
4. [`supabase/migrations/0004_frequency_rituals.sql`](/Users/rms/Desktop/元像/yuanxiang%20app/supabase/migrations/0004_frequency_rituals.sql)
5. [`supabase/migrations/0005_admin_accounts_and_stock.sql`](/Users/rms/Desktop/元像/yuanxiang%20app/supabase/migrations/0005_admin_accounts_and_stock.sql)
6. [`supabase/migrations/0006_stock_movements.sql`](/Users/rms/Desktop/元像/yuanxiang%20app/supabase/migrations/0006_stock_movements.sql)
7. [`supabase/migrations/0007_product_order_inventory.sql`](/Users/rms/Desktop/元像/yuanxiang%20app/supabase/migrations/0007_product_order_inventory.sql)

`0002_metaenergy_mvp.sql` adds:

- `users_profile`
- `referral_orders`
- `points_ledger`
- `monthly_stats`
- `frequency_reports`
- `weekly_reminders`
- `orders` extensions for `amount_total`, `cash_paid`, and `points_redeemed`
- updated `handle_new_user()` trigger logic for profile bootstrap + referral linking

## Local run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth and referral flow

- Visit `/r/[code]` to store the `ref_code` cookie and redirect to registration.
- Register on `/register`; the signup payload passes the referral code in auth metadata.
- The Supabase trigger creates both `public.users` and `public.users_profile`, generates a unique referral code, and links `referred_by` when the code exists.

## API routes

- `POST /api/orders/create`
  - Admin-only via Supabase session and `ADMIN_EMAIL_ALLOWLIST` or `admin_roles`
  - Creates a paid order, handles point redemption/earning, updates monthly stats, and credits referral commission using the referrer tier before this order
- `POST /api/frequency/generate`
  - Authenticated member route
  - Builds and stores a simple birthday-based frequency report
- `POST /api/reminder/generate`
  - Authenticated member route
  - Generates or updates the current week reminder
- `POST /api/points/redeem`
  - Authenticated simulator route for redemption cap and cash-required preview
- `POST /api/cron/keepalive`
  - Protected by `CRON_SECRET` in `Authorization: Bearer ...` or `x-cron-secret`
  - Checks the previous month, updates `monthly_stats`, increments strikes, and resets tier progress after 2 consecutive sub-RM50 months
- `POST /api/appointments/quote`
  - Authenticated member quote route for mentor session pricing and points cap
- `POST /api/appointments/create`
  - Authenticated member route to create a pending mentor appointment
- `POST /api/admin/appointments/confirm`
  - Admin route to confirm an appointment slot
- `POST /api/admin/appointments/mark-paid`
  - Admin route to settle an appointment and create a paid `service` order
- `POST /api/admin/appointments/cancel`
  - Admin route to cancel an appointment
- `POST /api/enrollments`
  - Authenticated member route to create a free or paid course/program reservation
  - Free sessions are auto-confirmed
  - Paid sessions create a pending bank-transfer order
- `POST /api/orders/slip`
  - Authenticated member route to attach a transfer slip to a pending order

## Business rules implemented

- Referral tier thresholds:
  - `< RM1000` => `0%`
  - `>= RM1000` => `15%`
  - `>= RM3000` => `20%`
  - `>= RM10000` => `25%`
- Strict non-retroactive commission:
  - commission rate is read before the new referred order updates cumulative sales
  - the order that crosses a threshold still uses the old rate
- Points:
  - 10 points earned for each full RM100 of cash paid
  - 1 point = RM0.10
  - redemption is capped at 50% of order total

## Dashboard routes

- `/dashboard`
- `/dashboard/programs`
- `/dashboard/appointments`
- `/dashboard/referrals`
- `/dashboard/points`
- `/dashboard/frequency`
- `/book/[mentorId]/[serviceId]`
- `/book/intake`
- `/book/confirm`
- `/admin/appointments`
- `/admin/mentors`
- `/admin/orders`
- `/admin/courses`
- `/admin/accounts`
- `/admin/products`
- `/admin/inventory`

## Mentor booking MVP

This repository now includes a first-pass mentor booking flow for authenticated members:

- `/mentors`
  - public mentor list with active services
- `/mentors/[id]`
  - mentor profile and service selection
- `/book/[mentorId]/[serviceId]`
  - choose a slot generated from weekly rules and date exceptions
- `/book/intake`
  - collect the session intention before confirmation
- `/book/confirm`
  - apply points up to the 50% cap and submit the appointment
- `/dashboard/appointments`
  - member view for pending and confirmed sessions
- `/admin/appointments`
  - confirm, cancel, and mark appointments as paid

Admin setup currently happens from `/admin/mentors`:

- create mentor profiles
- add 30/60/90 minute services
- add weekly availability rules

When an admin marks an appointment as paid, the app creates a normal `service` order through the existing MetaEnergy order pipeline, so:

- points earning and redemption still apply
- personal monthly spend still updates
- referral attribution and commission still apply for downlines

## Programs and events

This repository also supports member-facing course and event enrollment:

- `/courses`
  - public listing for published courses and activities
- `/courses/[id]`
  - public detail page with published sessions
- `/dashboard/programs`
  - member-only page to:
    - review available programs
    - see pending reservations
    - upload bank transfer slips for paid sessions
- `/admin/courses`
  - admin page to:
    - create courses
    - create sessions
    - publish sessions
    - review transfer slips
    - mark paid reservations as confirmed

Email notes:

- If `RESEND_API_KEY` and `EMAIL_FROM` are set, the app sends reservation emails for:
  - free program confirmations
  - paid reservation instructions
  - transfer-approved confirmations
- If those env vars are omitted, the enrollment flow still works and email sending is skipped safely.

## Admin accounts and stock

The admin backend also supports:

- `/admin/accounts`
  - manage bank transfer accounts in the database
  - choose which accounts are active for member-facing transfer instructions
- `/admin/products`
  - manage product SKU, MYR price, stock count, inventory tracking, and preorder allowance
  - record stock movements such as stock-in, stock-out, and stocktake adjustments
  - product orders created from `/admin/orders` can now deduct stock automatically
- `/admin/inventory`
  - dedicated inventory management page for:
    - viewing current stock
    - entering stock in / stock out / stocktake adjustments
    - reviewing recent stock movement history

Member/public display:

- `/dashboard/programs`
  - prefers active `payment_accounts` from the database
  - falls back to `BANK_*` env vars only if no active account exists
- `/products`
  - shows inventory state such as in stock, preorder, out of stock, and low-stock warnings

## Vercel deployment

1. Create a Supabase project and run both migrations.
2. Add the environment variables in Vercel.
3. Deploy the repository to Vercel.
4. Create a Vercel cron or external scheduler that `POST`s to `/api/cron/keepalive` with `CRON_SECRET`.

## Notes

- This workspace already contained a legacy `orders` table, so the MVP migration extends that table instead of dropping it.
- Admin creation currently uses the Supabase service role in the route handler for simplicity and predictable writes.
