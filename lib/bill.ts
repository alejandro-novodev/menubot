// Deterministic bill math — used by both the calculator panel and the chat
// tool. The LLM never does arithmetic itself; it only supplies items and we
// compute here against real menu prices (CLP, integer pesos).

export interface BillItem { name: string; price: number; qty: number; }

export interface BillLine { name: string; price: number; qty: number; subtotal: number; }

export interface BillResult {
  lines: BillLine[];
  subtotal: number;
  tipPct: number;
  tip: number;
  total: number;
  people: number;
  perPerson: number;
}

export function calcBill(items: BillItem[], tipPct = 0, people = 1): BillResult {
  const safePeople = Math.max(1, Math.floor(people) || 1);
  const safeTip = Math.max(0, Number(tipPct) || 0);

  const lines: BillLine[] = items
    .filter((i) => i.qty > 0 && i.price >= 0)
    .map((i) => ({ name: i.name, price: i.price, qty: Math.floor(i.qty), subtotal: i.price * Math.floor(i.qty) }));

  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const tip = Math.round((subtotal * safeTip) / 100);
  const total = subtotal + tip;
  // Round each share up to the nearest peso so the collected amount never falls short.
  const perPerson = Math.ceil(total / safePeople);

  return { lines, subtotal, tipPct: safeTip, tip, total, people: safePeople, perPerson };
}

export interface MenuPrice { name: string; price: number | null; }

export interface BillFromNamesResult extends BillResult {
  /** Requested names we couldn't match to a priced menu item. */
  unmatched: string[];
}

const norm = (s: string) => s.toLowerCase().trim();

/**
 * Resolve diner-supplied item names to real menu prices, then compute the bill.
 * Matching is exact-first, then a loose contains() either direction. Items that
 * don't resolve to a priced dish are reported in `unmatched` so the assistant
 * can ask for clarification instead of inventing a price.
 */
export function computeBillFromNames(
  requested: { nombre: string; cantidad?: number }[],
  menu: MenuPrice[],
  tipPct = 0,
  people = 1
): BillFromNamesResult {
  const priced = menu.filter((d) => d.price != null);
  const matched: BillItem[] = [];
  const unmatched: string[] = [];

  for (const r of requested) {
    const q = norm(r.nombre ?? '');
    if (!q) continue;
    const dish =
      priced.find((d) => norm(d.name) === q) ??
      priced.find((d) => norm(d.name).includes(q) || q.includes(norm(d.name)));
    if (dish && dish.price != null) {
      matched.push({ name: dish.name, price: dish.price, qty: Math.max(1, Math.floor(r.cantidad ?? 1) || 1) });
    } else {
      unmatched.push(r.nombre);
    }
  }

  return { ...calcBill(matched, tipPct, people), unmatched };
}
