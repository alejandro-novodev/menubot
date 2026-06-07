export interface DishForScore {
  description?: string | null;
  price?: number | null;
  category?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
}

const WEIGHTS: Record<keyof DishForScore, number> = {
  description: 25,
  price: 25,
  category: 20,
  ingredients: 15,
  allergens: 15,
};

function scoreDish(dish: DishForScore): number {
  let score = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const val = dish[key as keyof DishForScore];
    if (val !== null && val !== undefined && String(val).trim() !== '' && String(val).trim() !== 'ninguno') {
      score += weight;
    }
  }
  return score;
}

export function calcMenuCompleteness(dishes: DishForScore[]): number {
  if (dishes.length === 0) return 0;
  const total = dishes.reduce((sum, d) => sum + scoreDish(d), 0);
  return Math.round(total / dishes.length);
}

export function getMissingFields(dish: DishForScore): (keyof DishForScore)[] {
  return (Object.keys(WEIGHTS) as (keyof DishForScore)[]).filter(key => {
    const val = dish[key];
    return val === null || val === undefined || String(val).trim() === '' || String(val).trim() === 'ninguno';
  });
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excelente', color: 'text-emerald-400' };
  if (score >= 70) return { label: 'Bueno', color: 'text-yellow-400' };
  if (score >= 40) return { label: 'Incompleto', color: 'text-orange-400' };
  return { label: 'Básico', color: 'text-red-400' };
}
