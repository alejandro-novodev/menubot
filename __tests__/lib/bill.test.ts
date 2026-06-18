import { calcBill, computeBillFromNames } from '@/lib/bill';

describe('calcBill', () => {
  it('sums line items with quantities', () => {
    const r = calcBill([
      { name: 'Lomo', price: 15990, qty: 2 },
      { name: 'Pisco Sour', price: 6500, qty: 3 },
    ]);
    expect(r.subtotal).toBe(15990 * 2 + 6500 * 3); // 51480
    expect(r.tip).toBe(0);
    expect(r.total).toBe(51480);
    expect(r.perPerson).toBe(51480); // people defaults to 1
  });

  it('applies a tip percentage (rounded) and splits, rounding the share up', () => {
    const r = calcBill([{ name: 'Plato', price: 10000, qty: 1 }], 10, 3);
    expect(r.subtotal).toBe(10000);
    expect(r.tip).toBe(1000);
    expect(r.total).toBe(11000);
    expect(r.perPerson).toBe(Math.ceil(11000 / 3)); // 3667
  });

  it('ignores zero/negative quantities and clamps people to >= 1', () => {
    const r = calcBill([
      { name: 'A', price: 5000, qty: 0 },
      { name: 'B', price: 5000, qty: 2 },
    ], 0, 0);
    expect(r.subtotal).toBe(10000);
    expect(r.people).toBe(1);
    expect(r.lines).toHaveLength(1);
  });
});

describe('computeBillFromNames', () => {
  const menu = [
    { name: 'Lomo Saltado', price: 15990 },
    { name: 'Ceviche Mixto', price: 12000 },
    { name: 'Agua', price: null }, // unpriced — should not match
  ];

  it('matches names (exact + loose) to real prices', () => {
    const r = computeBillFromNames(
      [{ nombre: 'lomo saltado', cantidad: 1 }, { nombre: 'ceviche', cantidad: 2 }],
      menu, 10, 2
    );
    expect(r.subtotal).toBe(15990 + 12000 * 2); // 39990
    expect(r.tip).toBe(Math.round(39990 * 0.1)); // 3999
    expect(r.total).toBe(43989);
    expect(r.perPerson).toBe(Math.ceil(43989 / 2)); // 21995
    expect(r.unmatched).toEqual([]);
  });

  it('reports unmatched items instead of inventing a price', () => {
    const r = computeBillFromNames(
      [{ nombre: 'Lomo Saltado' }, { nombre: 'Sushi' }, { nombre: 'Agua' }],
      menu
    );
    expect(r.subtotal).toBe(15990); // only the matched, priced dish
    expect(r.unmatched).toContain('Sushi');
    expect(r.unmatched).toContain('Agua'); // present but unpriced -> unmatched
  });
});
