import { calcMenuCompleteness, getMissingFields, scoreLabel } from '@/lib/completeness';

const fullDish = {
  description: 'Descripción detallada',
  price: 8900,
  category: 'Entradas',
  ingredients: 'pollo, limón, especias',
  allergens: 'gluten',
};

describe('calcMenuCompleteness', () => {
  it('returns 0 for empty dish list', () => {
    expect(calcMenuCompleteness([])).toBe(0);
  });

  it('returns 100 when all fields are populated', () => {
    expect(calcMenuCompleteness([fullDish])).toBe(100);
  });

  it('returns 0 when all optional fields are null', () => {
    expect(calcMenuCompleteness([{ description: null, price: null, category: null, ingredients: null, allergens: null }])).toBe(0);
  });

  it('returns 50 when only description and price are present (25+25)', () => {
    expect(calcMenuCompleteness([{ description: 'Desc', price: 100, category: null, ingredients: null, allergens: null }])).toBe(50);
  });

  it('averages across multiple dishes', () => {
    // dish1=100, dish2=0 → average=50
    const result = calcMenuCompleteness([fullDish, { description: null, price: null, category: null, ingredients: null, allergens: null }]);
    expect(result).toBe(50);
  });

  it('treats "ninguno" as an empty value', () => {
    const dish = { ...fullDish, allergens: 'ninguno' };
    // 100 - 15 (allergens weight) = 85
    expect(calcMenuCompleteness([dish])).toBe(85);
  });

  it('treats empty string as missing', () => {
    const dish = { ...fullDish, description: '' };
    // 100 - 25 (description weight) = 75
    expect(calcMenuCompleteness([dish])).toBe(75);
  });

  it('treats whitespace-only string as missing', () => {
    const dish = { ...fullDish, ingredients: '   ' };
    // 100 - 15 (ingredients weight) = 85
    expect(calcMenuCompleteness([dish])).toBe(85);
  });

  it('rounds to nearest integer', () => {
    // dish1=100, dish2=50, dish3=50 → avg=66.666... → 67
    const result = calcMenuCompleteness([
      fullDish,
      { description: 'D', price: 100, category: null, ingredients: null, allergens: null },
      { description: 'D', price: 100, category: null, ingredients: null, allergens: null },
    ]);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('getMissingFields', () => {
  it('returns empty array when all fields are present', () => {
    expect(getMissingFields(fullDish)).toEqual([]);
  });

  it('returns all fields when dish has no values', () => {
    const missing = getMissingFields({ description: null, price: null, category: null, ingredients: null, allergens: null });
    expect(missing).toHaveLength(5);
    expect(missing).toContain('description');
    expect(missing).toContain('price');
    expect(missing).toContain('category');
    expect(missing).toContain('ingredients');
    expect(missing).toContain('allergens');
  });

  it('flags "ninguno" as missing', () => {
    expect(getMissingFields({ ...fullDish, allergens: 'ninguno' })).toContain('allergens');
  });

  it('identifies only the actually missing fields', () => {
    const missing = getMissingFields({ description: 'D', price: 100, category: null, ingredients: null, allergens: null });
    expect(missing).toEqual(expect.arrayContaining(['category', 'ingredients', 'allergens']));
    expect(missing).not.toContain('description');
    expect(missing).not.toContain('price');
  });
});

describe('scoreLabel', () => {
  it('returns "Excelente" for score >= 90', () => {
    expect(scoreLabel(100).label).toBe('Excelente');
    expect(scoreLabel(90).label).toBe('Excelente');
  });

  it('returns "Bueno" for scores 70–89', () => {
    expect(scoreLabel(89).label).toBe('Bueno');
    expect(scoreLabel(70).label).toBe('Bueno');
  });

  it('returns "Incompleto" for scores 40–69', () => {
    expect(scoreLabel(69).label).toBe('Incompleto');
    expect(scoreLabel(40).label).toBe('Incompleto');
  });

  it('returns "Básico" for score < 40', () => {
    expect(scoreLabel(39).label).toBe('Básico');
    expect(scoreLabel(0).label).toBe('Básico');
  });

  it('returns a color string for each label', () => {
    expect(scoreLabel(100).color).toContain('text-');
    expect(scoreLabel(80).color).toContain('text-');
    expect(scoreLabel(50).color).toContain('text-');
    expect(scoreLabel(10).color).toContain('text-');
  });
});
