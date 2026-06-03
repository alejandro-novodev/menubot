export function getDishEmoji(name: string, category: string): string {
  const n = name.toLowerCase();
  if (n.includes('karaage') || n.includes('pollo')) return '🍗';
  if (n.includes('takoyaki') || n.includes('pulpo')) return '🐙';
  if (n.includes('gyoza') || n.includes('dumpling') || n.includes('wantán')) return '🥟';
  if (n.includes('edamame') || n.includes('soya')) return '🫛';
  if (n.includes('ramen') || n.includes('sopa')) return '🍜';
  if (n.includes('sashimi') || n.includes('ceviche') || n.includes('tiradito')) return '🐟';
  if (n.includes('salmón') || n.includes('salmon')) return '🐠';
  if (n.includes('atún') || n.includes('atun')) return '🐟';
  if (n.includes('matcha') || n.includes('choco') || n.includes('volcán') || n.includes('brownie')) return '🍫';
  if (n.includes('causa') || n.includes('tacu')) return '🫔';
  if (n.includes('lomo') || n.includes('asado') || n.includes('plateada') || n.includes('entraña') || n.includes('costilla')) return '🥩';
  if (n.includes('camarón') || n.includes('camaron') || n.includes('macha')) return '🦐';
  if (n.includes('empanada')) return '🥐';
  if (n.includes('brocheta')) return '🍢';
  if (n.includes('mojito') || n.includes('pisco') || n.includes('sour') || n.includes('chilcano')) return '🍹';
  if (n.includes('cerveza') || n.includes('shop') || n.includes('cusqueña') || n.includes('corona')) return '🍺';
  if (n.includes('limonada') || n.includes('jugo') || n.includes('natural')) return '🥤';
  if (category === 'postres') return '🍮';
  if (category === 'bebidas' || category === 'cócteles' || category === 'piscos') return '🍹';
  if (category === 'cervezas') return '🍺';
  if (category === 'sin alcohol') return '🥤';
  if (category === 'kids') return '🧒';
  return '🍽️';
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CL')}`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const CATEGORY_GRADIENT: Record<string, string> = {
  'chef':       'from-amber-900/60 to-gray-900',
  'ceviches':   'from-cyan-900/60 to-gray-900',
  'tiraditos':  'from-teal-900/60 to-gray-900',
  'entradas':   'from-orange-900/60 to-gray-900',
  'carnes':     'from-red-900/60 to-gray-900',
  'pescados':   'from-blue-900/60 to-gray-900',
  'postres':    'from-pink-900/60 to-gray-900',
  'kids':       'from-yellow-900/60 to-gray-900',
  'cócteles':   'from-violet-900/60 to-gray-900',
  'piscos':     'from-indigo-900/60 to-gray-900',
  'cervezas':   'from-yellow-900/60 to-gray-900',
  'sin alcohol':'from-green-900/60 to-gray-900',
  'principales':'from-purple-900/60 to-gray-900',
};

export function getCategoryGradient(category: string): string {
  return CATEGORY_GRADIENT[category] ?? 'from-purple-900/60 to-gray-900';
}
