# menubot — Product Map & Early-Bird Launch Plan

> **Purpose of this document.** Single source of truth for what menubot is, what's
> built, what's next, and how we launch a free early-bird with 3 restaurants.
> It is written to be handed to a **business-strategy / pricing / marketing agent** —
> sections marked **`→ STRATEGY`** are explicit hooks/inputs for that work, and
> **`TODO(input)`** marks a number only the founder can provide.
>
> Owner: Novodev SPA · Market: Chile · Language: Spanish-first (this doc is in English to save tokens; all **product copy stays Spanish**).
> Last updated by the build agent during the v1 hardening session.

---

## 1. What it is (value proposition)

**menubot turns a restaurant's menu into a conversational AI assistant.** A diner
scans a QR (or opens a link) and chats in natural, Chilean Spanish with an assistant
that knows the full menu — recommendations, ingredients, allergens, prices — with no
app to download.

- **For diners:** "Tu carta, ahora conversacional. Pregunta lo que quieras."
  Recommendations, allergen/dietary checks, what's popular, what pairs with what.
- **For owners:** upload your menu in *any* format (photo, PDF, Word, Excel, text, or a
  link) → the AI digitizes it → you get a QR + shareable link → (soon) you see **what
  your diners ask most**.
- **One-liner:** *"Sube tu carta, comparte un QR, y tus clientes conversan con un asistente que la conoce de memoria."*

**Why now / why it wins:** static PDF/QR menus are dead ends — diners can't ask
questions. menubot answers them, and turns those questions into insight the restaurant
never had before.

---

## 2. How it works

### Diner flow (no login)
1. Scan QR or open link → `/r/{slug}` redirects to `/chat/{slug}`.
2. See the menu (categories, dishes, prices, allergen badges) **and** a chat panel.
3. Tap any dish to ask about it, type a question, or tap a suggested question
   ("¿Qué me recomiendas?", "Opciones vegetarianas", "Sin gluten").
4. The AI answers grounded in that restaurant's menu.

### Owner flow (login)
1. Sign up — Google or email/password.
2. **Onboarding wizard:** create business (name, slug, type) → **import menu** (AI
   extraction) → fill any gaps.
3. **Dashboard:** manage menu, see completeness %, get the QR + link, (soon) analytics.
4. Print the QR for tables / entrance and share the link on socials.

---

## 3. Module map (current status)

Legend: ✅ built · ◐ partial / needs work · ○ planned (not built)

### Customer-facing
| Module | Status | Notes |
|---|---|---|
| Public chat + menu (`/chat/[slug]`) | ✅ | Themed (light/dark), mobile + desktop, suggested questions, markdown answers, emoji menu rows, tap-to-ask |
| QR + short link (`/r/[slug]`) | ✅ | QR PNG download + copy link from dashboard |
| AI chat answers | ◐ | Works, but reads only the legacy `restaurants` table → **Blocker #1** |
| Restaurant picker (`/chat`) | ✅ | Demo index of available restaurants |
| **Chat capture + most-asked questions** | ○ | **Not built** — the chat route saves nothing. **Early-bird priority** |

### Owner-facing
| Module | Status | Notes |
|---|---|---|
| Auth (Google + email/password) | ✅ | Auth.js v5, JWT. Prod needs `AUTH_URL`/`AUTH_SECRET` set on Railway |
| Dashboard | ✅ | Business card, completeness, QR/link, trial banner |
| Onboarding wizard (3 steps) | ✅ | Create business → import menu → complete fields |
| Menu editor (dish CRUD) | ✅ | Add/edit/delete dishes; "Importar carta" panel |
| **AI menu importer** | ✅ | image / PDF / Word `.docx` / Excel `.xlsx` / CSV / TXT / pasted text / URL → structured extraction (Claude structured outputs) |
| Billing (Flow.cl + Bsale) | ◐ | Scaffolding present; behind `MOCK_PAYMENTS` / `MOCK_BILLING` — **not live** |
| Plan limits / usage metering | ○ | **Not enforced** (e.g. "500 chats/mes" is cosmetic) |
| Analytics dashboard | ○ | **Not built** (pricing promises "Analytics") |
| White label ("Marca blanca") | ○ | **Not built** (promised on Multi plan) |

### Platform / growth
| Module | Status | Notes |
|---|---|---|
| Admin panel | ✅ | Businesses, stats, waitlist management |
| Landing + pricing + contact/waitlist | ✅ | Rebranded; pricing tiers + contact modal |
| Deploy (Railway, auto from `main`) | ✅ | `menubot-production.up.railway.app`; **build SHA shown in footer** to verify deploys |

---

## 4. Tech & architecture (brief)

- **Frontend/Backend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4. (Note: this fork renames `middleware.ts` → `proxy.ts`.)
- **DB:** PostgreSQL (`pg`). Tables: `users`, `oauth_accounts`, `businesses`, `restaurants` (legacy), `dishes`, `subscriptions`, `menu_uploads`, `waitlist`.
- **AI:** Anthropic **Claude Sonnet 4.6** for both the diner chat and menu extraction (extraction uses **structured outputs** for guaranteed-valid JSON).
- **Auth:** Auth.js v5 (JWT, `trustHost`).
- **Payments / invoicing:** Flow.cl (Chilean gateway) + Bsale (boletas/facturas) — behind mock flags.
- **Other:** uploadthing (uploads), Resend (email), qrcode.
- **Deploy:** Railway from `main`.

> **⚠️ Data-model note (the big one):** there are **two** parallel tables — `restaurants`
> (legacy/demo, **read by the public chat**) and `businesses` (real accounts,
> **written by onboarding/editor/importer**). They are not linked, so a real owner's
> menu never reaches their chat. See Blocker #1.

---

## 5. Current status & known blockers

| # | Severity | Issue | Impact |
|---|---|---|---|
| **1** | 🔴 Critical | Chat reads `restaurants.restaurant_id`; importer/editor write `businesses.business_id` | A real restaurant's menu **does not appear in its chat**. The product doesn't work end-to-end for a real signup. **Must fix before any restaurant uses it.** |
| **2** | 🟠 High | No chat logging | Can't measure diner engagement or surface "most-asked questions" — both are explicit early-bird goals and a key sales hook. |
| **3** | 🟡 Medium | Payments mock; plan limits unenforced | Can't charge or cap usage yet. **OK for the free early-bird**, required to monetize. |
| 4 | 🟡 Medium | Analytics + white-label not built | Promised in pricing; needed for paid Pro/Multi. |
| 5 | 🟢 Low | Pre-existing lint issues (`Date.now`/`setState` in a few pages) | Cleanup. |

**Recently fixed this session:** brand unified to official terracotta + logo; multi-format
AI menu importer; QR SSR crash; Auth.js `trustHost` for Railway; build-version footer.
**Pending ops:** set `AUTH_URL` + `AUTH_SECRET` on Railway (production login redirect).

---

## 6. Running costs `→ STRATEGY`

Per-restaurant economics the strategy agent needs to set margin:

| Cost | Notes | Value |
|---|---|---|
| Railway hosting | Single service + Postgres | `TODO(input)` |
| Claude API — diner chat | Sonnet 4.6 ($3/$15 per M tokens); menu (~few k tokens) sent per message | ~variable; **prompt caching is planned to cut ~70%** (see roadmap P1.3) |
| Claude API — menu extraction | One-off per imported file | low |
| Flow.cl fees | Per transaction | `TODO(input)` |
| Bsale | Invoicing | `TODO(input)` |
| Domain + Resend | | `TODO(input)` |

`→ STRATEGY:` compute **cost per restaurant per month** at, say, 500 and 2,000 chats/mo,
factoring prompt caching, to validate the price points below.

---

## 7. Pricing today `→ STRATEGY` (validate / revise)

Current tiers (CLP/month), as shown on the live landing:

| Plan | Price | Includes | Reality check |
|---|---|---|---|
| **Starter** | $9.990 | 1 restaurante · 500 chats/mes · extracción PDF+imágenes · QR/link | chat cap **not enforced**; importer now does more than PDF/images |
| **Pro** | $24.990 | chats ilimitados · analytics básico | analytics **not built** |
| **Multi** | $59.990 | hasta 5 locales · analytics avanzado · marca blanca | analytics + white-label **not built** |

- A **7-day free trial** exists today (dashboard shows "días restantes de prueba").
- `→ STRATEGY:` validate price points vs Chilean restaurant SMB willingness-to-pay and the
  per-unit cost from §6; decide trial length, whether a card is required, and a
  **founder/early-bird discount** for the first cohort.

---

## 8. Early-bird plan — 3 restaurants, free, ASAP (1–2 weeks)

**Leads:** warm, not yet confirmed → plan includes a short pitch.
**What we want to prove:**
1. **Capture chats & surface the most-asked questions** (the data product). 
2. Restaurants keep using it (retention).
3. Diners actually chat (engagement).
4. Get testimonials / case studies.
5. Gauge willingness to pay after the free period.

### 8.1 Must ship *before* onboarding them — **Phase 0 (this week)**
> Free trial ⇒ we do **not** need live payments or full analytics to launch. Minimum bar:
1. **Fix chat↔businesses link (Blocker #1)** — non-negotiable; without it nothing works.
2. **Chat capture** — log every diner Q&A per restaurant to a new table (the measurement
   engine + "most-asked" source).
3. **Production QA** — set `AUTH_URL`/`AUTH_SECRET`; test the full owner→diner flow on prod.

*(Deferred to during/after the trial: analytics UI, live payments, plan limits.)*

### 8.2 The offer / pitch (for warm leads)
> *"Te ofrezco menubot **gratis por 60 días, sin tarjeta**. Yo subo tu carta en minutos,
> te entrego un QR para las mesas, y tus clientes le preguntan al asistente lo que quieran.
> A cambio: tu feedback y permiso para usarte como caso de éxito. Además te muestro **qué
> preguntan más tus clientes** — algo que hoy nadie te da."*

- **Done-for-you onboarding** removes all friction: we import the menu, generate the QR,
  set it up. The owner does nothing but say yes.

### 8.3 Onboarding steps (per restaurant)
1. Collect their current menu (any format) → import via the tool.
2. Verify/clean dishes (allergens, prices, categories).
3. Generate QR + print **table tents / stickers** ("Pregúntale a nuestra carta 📱").
4. Brief the staff on how to point diners to it.
5. Schedule a **weekly check-in**.

### 8.4 Success metrics (2–4 week trial)
| Dimension | Metric | Source |
|---|---|---|
| Activation | menu imported + QR live at tables | manual |
| Engagement | # scans, # chats, chats/table/day, unique diners | **chat capture (P0.2)** |
| **Insight** | **top-10 most-asked questions per restaurant** | **chat capture (P0.2)** |
| Retention | owner logins / menu edits per week; QR still up | logs |
| Sentiment | ≥1 testimonial + a willingness-to-pay answer each | interview |

### 8.5 Timeline (1–2 weeks)
- **Days 1–4:** Blocker #1 + chat capture + prod QA.
- **Days 5–7:** onboard restaurant **#1** (done-for-you), deploy QR.
- **Week 2:** onboard **#2** and **#3**; begin weekly check-ins; start collecting "most-asked".

---

## 9. Roadmap to a sellable v1 (module by module)

Build order. **P0 = before early-bird · P1 = during trial / before charging · P2 = scale.**
Each module is implemented and verified one at a time.

| ID | Module | Why | Phase |
|---|---|---|---|
| **P0.1** | **Unify menu data** — chat reads `businesses` (link or migrate `restaurants`→`businesses`) | Fixes Blocker #1; makes real signups work | 🔴 P0 |
| **P0.2** | **Chat capture** — `chat_sessions` + `chat_messages` tables; log every Q&A per restaurant | Measurement + "most-asked" data | 🔴 P0 |
| **P0.3** | **Production QA** — `AUTH_URL`, end-to-end owner+diner on prod | Trustworthy demo | 🔴 P0 |
| **P1.1** | **Analytics dashboard** — scans, chats, **most-asked questions**, popular dishes | Turns captured data into the owner "wow"; backs Pro plan | 🟠 P1 |
| **P1.2** | **Live payments + plan enforcement** — real Flow.cl checkout; enforce chat caps & business count | Convert trial → paid | 🟠 P1 |
| **P1.3** | **Prompt caching for chat** — cache the menu in the system prompt | Cuts Claude cost ~70%, protects margin (plan already drafted) | 🟠 P1 |
| **P2.1** | White-label (Multi), multi-location polish | Higher tiers | 🟢 P2 |
| **P2.2** | Growth entry points — WhatsApp/Instagram links, QR analytics, table-tent kit | Acquisition | 🟢 P2 |
| **P2.3** | Menu i18n (English for tourists) | Differentiator | 🟢 P2 |

---

## 10. Open inputs for the business-strategy / marketing agent `→ STRATEGY`

1. **Profitability target** — define "automatically profitable": target # of paying
   restaurants / target MRR / break-even point; max acceptable CAC. `TODO(input)`
2. **Unit economics** — using §6 costs, compute cost-per-restaurant and gross margin per
   plan; confirm the §7 prices clear it.
3. **Pricing & trial mechanics** — final tiers, trial length, card-required?, early-bird
   "founder" discount or lifetime deal for the first 3.
4. **GTM channels** — direct sales to restaurants, gastronomy associations/guilds,
   Instagram, referrals from the early-bird cohort.
5. **Trial → paid conversion** — the moment and message that converts a free trial.
6. **Positioning** — vs static PDF/QR menus, QR-ordering apps, WhatsApp menus. Lead with the
   unique hook: **"descubre qué preguntan tus clientes"** (the most-asked-questions report).
7. **Sales assets** — landing copy, a one-pager, table-tent design, demo video using a real
   early-bird menu.

---

## 11. Appendix — key paths (for the build agent)

- Diner chat: `app/chat/[slug]/page.tsx`, `app/api/chat/route.ts`, `components/customer/MenuScreen.tsx`, `components/ChatBubble.tsx`
- Menu data: `app/api/menu/[slug]/route.ts`, `app/api/restaurant/[slug]/route.ts`, `db/schema.sql`
- Importer: `app/api/menu/extract/route.ts`, `components/dashboard/MenuImport.tsx`
- Owner: `app/dashboard/**`, `app/api/dishes/**`, `app/api/businesses/**`
- Auth: `auth.ts`, `auth.config.ts`, `proxy.ts`
- Billing: `app/api/flow/**`, `app/dashboard/billing/**`
- Admin: `app/admin/**`, `app/api/admin/**`
