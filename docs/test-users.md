# Test users (one per plan)

Seeded with `npm run seed:test-users` (idempotent — re-running refreshes plan, password, and menu; run manually only, never in deploy).

**Password for all accounts:** `MenubotTest123!`

| Email | Plan | Business | Public chat |
|---|---|---|---|
| `test-admin@menubot.local` | — (rol admin, sin negocio) | — | — |
| `test-free@menubot.local` | free (100 conv/mes, se bloquea al 100%) | Test Free Café | `/chat/test-free` |
| `test-starter@menubot.local` | starter (1.500 conv/mes) | Test Starter Bistró | `/chat/test-starter` |
| `test-pro@menubot.local` | pro (5.000 conv/mes) | Test Pro Restaurant | `/chat/test-pro` |
| `test-multi@menubot.local` | multi (15.000 conv/mes) | Test Multi Grupo | `/chat/test-multi` |
| `test-enterprise@menubot.local` | enterprise (ilimitado) | Test Enterprise Hotel | `/chat/test-enterprise` |

Notes:
- Paid accounts get `ends_at = NOW() + 1 month`; free/enterprise have no expiry.
- Only the **free** plan hard-blocks chat at its monthly limit; paid plans and trial only warn (owner sees it in `/dashboard/usage`, admin in `/admin/usage`).
- The paid test businesses appear in `/admin/keys` as "pendientes de aprovisionar" until you paste an Anthropic API key for them; until then their traffic uses the platform key.
