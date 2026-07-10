# menubot — Pending Goals (next work session)

> Handoff list. Ordered by the founder's priority: **Google login → Flow payments
> → automatic recurring billing**, then supporting work and backlog.
> Env keys / provider accounts are things the **founder** provides (the build agent
> never handles credentials — they go in Railway env vars).

---

## 🥇 Priority 1 — Google login (do BEFORE Flow)

The Google provider is already wired in `auth.ts` (`Google({...})`) and the `signIn`
callback creates/links the Google user. What's left is configuration + testing.

- [ ] **Google Cloud OAuth app** — create OAuth 2.0 credentials (Client ID + Secret).
- [ ] **Authorized redirect URIs** in Google Console:
      `https://menubot-production.up.railway.app/api/auth/callback/google` and
      `http://localhost:3000/api/auth/callback/google`.
- [ ] **Env vars** (founder sets on Railway + `.env.local`): `GOOGLE_CLIENT_ID`,
      `GOOGLE_CLIENT_SECRET`.
- [ ] **Test the flow:** sign in with Google → user row created → redirect to dashboard.
- [ ] **Invite-only interaction:** new Google users are created un-approved; verify the
      gate sends them to `/auth/login?status=pending` and admin approval then lets them in.
- [ ] **Consent screen / verification** — for production Google may require app
      verification (logo, privacy policy URL, domain). Start this early (can take days).

**Blocker to start:** founder creates the Google OAuth app + provides the two env keys.

---

## 🥈 Priority 2 — Flow.cl payments for the plans

Scaffolding exists: `lib/payment/` (`flow-client.ts` stub + mock + `getPaymentClient()`),
`lib/billing/` (Bsale for boletas), `/api/flow/create-subscription`. The stub is
**incomplete** and needs to be built out to Flow's real subscription API.

- [ ] **Flow merchant account** — start with **sandbox** (`sandbox.flow.cl`). Production
      approval needs business docs and can take a few days — start now.
- [ ] **Env vars:** `FLOW_API_KEY`, `FLOW_SECRET_KEY`, `FLOW_API_URL` (sandbox),
      `MOCK_PAYMENTS=false`.
- [ ] **Create the plans in Flow** matching Starter / Pro / Multi (Flow `planId` ↔ our
      `lib/plans.ts`). Note prices are **net**; charge `withIva()` (19% IVA).
- [ ] **Complete `FlowPaymentClient`** to Flow's real subscription flow:
      create customer → **register card** (redirect) → create subscription → confirm via
      `payment/getStatus` (Flow confirms by token, pull-based — the current HMAC guess is wrong).
- [ ] **Subscribe UI** — wire the pricing/billing "Suscribirse" button →
      `POST /api/flow/create-subscription` → redirect to Flow checkout → return URL.
- [ ] **Confirmation/webhook route** (`/api/flow/confirm`) → verify → activate the row in
      `subscriptions` (status `active`, plan, period, `payment_provider_id`). Feature gating
      already reads from this row.
- [ ] **Cancel / downgrade** flow in the billing dashboard.
- [ ] **Multi plan extra branches** — bill the `$8.990/branch` add-on (`extra_branches`).
- [ ] **Annual billing** (×10/12, 2 months free) — decide how Flow charges annual.
- [ ] **Boletas (Bsale)** — issue a boleta on each successful charge (scaffolded).

Covers "credit card or other form in Chile": Flow = Webpay credit + Redcompra débito +
Servipag + MACH in one integration.

**Blocker to start:** founder creates the Flow sandbox account + provides the 3 env keys +
creates the plans in Flow.

---

## 🥉 Priority 3 — Automatic recurring monthly billing + testing

- [ ] **Recurring charge** — Flow subscriptions auto-charge the stored card monthly against
      the plan. Confirm Flow drives the recurrence (vs. us needing a cron).
- [ ] **Recurring webhook** — on each monthly charge, extend the period / mark paid, or mark
      `past_due` on failure.
- [ ] **Dunning / grace period** — failed payment → retry + notify + eventually suspend
      (feature gating already downgrades when the subscription isn't `active`).
- [ ] **Payment emails** — receipts + failed-payment alerts (⚠️ depends on Email transport — see below).
- [ ] **Test harness for the monthly cycle** (the founder specifically asked for this):
      use Flow **sandbox** to simulate card registration, a successful charge, a failed
      charge + retry, and cancellation — without waiting a real month. Add a dev-only
      "charge now / advance cycle" test path if Flow sandbox time controls aren't enough.

---

## 🔧 Supporting work (needed to make the above solid)

- [ ] **Email transport** — `lib/email.ts` only *builds* emails; no send transport is wired
      (Resend is referenced). Needed for: payment receipts + failed-payment alerts, review
      alerts, weekly analytics summary, contact/waitlist. **Unblocks several Pro features.**
- [ ] **Plan-limit enforcement** — `conversationsLimit` (1.500 / 5.000 / 15.000) is defined
      in `lib/plans.ts` but NOT enforced. Add usage metering per business + cap + an
      "upgrade to keep chatting" prompt near the limit.

---

## 📋 Backlog — plan features promised but not built

(Listed in `lib/plans.ts`; build as tiers demand.)

- [ ] AI description generator (Pro)
- [ ] Order capture (mesa → cocina en tiempo real) (Pro)
- [ ] Reservations by chat + auto-confirmation (Pro)
- [ ] Configurable upsell engine (Pro)
- [ ] Multi-branch central dashboard (Multi) — `branch_count`/`extra_branches` columns exist
- [ ] WhatsApp Business (same bot on the WA number) (Multi)
- [ ] CSV/PDF export of analytics & reviews (Multi)
- [ ] API + webhooks, SSO, POS/delivery integration, white-label (Enterprise)
- [ ] Public display of consented reviews on the diner menu (currently owner-only)
- [ ] Language breakdown in insights (`chat_sessions.lang` is captured, not yet surfaced)
- [ ] Menu "pre-translate" action for instant tourist demos (warm the EN/PT cache)

---

## 🧹 Quick wins / cleanup

- [ ] Production QA (P0.3) — full owner + diner end-to-end on prod.
- [ ] Pre-existing lint: `react-hooks` `Date.now` / `set-state-in-effect` flags in a few
      files (dashboard/page, ContactModal, etc.) — not build-breaking, but tidy up.
- [ ] Confirm the temporary `/api/diag/auth` endpoint (if still present) is removed.

---

## State at handoff

- Live on `main` / prod: multi-language (ES/EN/PT), reviews, 4-plan subscriptions + gating +
  pricing page + upgrade prompts + trials-preview-Pro, warm-light landing, QR preview modal,
  **dish availability ("Agotado")**. Migrations through **012** applied to the shared DB.
- Payments are still behind `MOCK_PAYMENTS` (not live).
- QA harness (`scripts/mint-session.ts`, `seed-qa.ts`) is local-only + gitignored; the
  `qa@menubot.local` account (business "QA Test", slug `qa-test`) exists for logged-in testing.
