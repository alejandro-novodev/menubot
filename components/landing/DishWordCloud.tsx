'use client';

const WORDS = [
  { text: 'Karaage', top: '8%', left: '5%', size: 'text-5xl', opacity: 0.07, delay: '0s', weight: 'font-bold' },
  { text: 'Gyoza', top: '15%', left: '72%', size: 'text-4xl', opacity: 0.06, delay: '0.8s', weight: 'font-normal' },
  { text: 'Pad Thai', top: '72%', left: '8%', size: 'text-3xl', opacity: 0.08, delay: '1.6s', weight: 'font-bold' },
  { text: 'Tonkotsu Ramen', top: '82%', left: '58%', size: 'text-4xl', opacity: 0.05, delay: '2.4s', weight: 'font-normal' },
  { text: 'Ceviche', top: '5%', left: '42%', size: 'text-3xl', opacity: 0.09, delay: '3.2s', weight: 'font-bold' },
  { text: 'Takoyaki', top: '88%', left: '30%', size: 'text-5xl', opacity: 0.06, delay: '4s', weight: 'font-normal' },
  { text: 'Bibimbap', top: '25%', left: '82%', size: 'text-3xl', opacity: 0.07, delay: '0.4s', weight: 'font-bold' },
  { text: 'Sashimi', top: '60%', left: '78%', size: 'text-4xl', opacity: 0.05, delay: '1.2s', weight: 'font-normal' },
  { text: 'Tiradito', top: '48%', left: '3%', size: 'text-3xl', opacity: 0.08, delay: '2s', weight: 'font-bold' },
  { text: 'Edamame', top: '35%', left: '68%', size: 'text-2xl', opacity: 0.1, delay: '2.8s', weight: 'font-normal' },
  { text: 'Pho', top: '92%', left: '2%', size: 'text-6xl', opacity: 0.05, delay: '3.6s', weight: 'font-bold' },
  { text: 'Mole', top: '18%', left: '18%', size: 'text-2xl', opacity: 0.09, delay: '0.2s', weight: 'font-normal' },
  { text: 'Dim Sum', top: '55%', left: '60%', size: 'text-3xl', opacity: 0.06, delay: '1.8s', weight: 'font-bold' },
  { text: 'Tempura', top: '38%', left: '88%', size: 'text-2xl', opacity: 0.08, delay: '4.4s', weight: 'font-normal' },
  { text: 'Shawarma', top: '78%', left: '45%', size: 'text-3xl', opacity: 0.06, delay: '0.6s', weight: 'font-bold' },
  { text: 'Laksa', top: '10%', left: '88%', size: 'text-2xl', opacity: 0.07, delay: '2.2s', weight: 'font-normal' },
  { text: 'Kimchi', top: '65%', left: '22%', size: 'text-4xl', opacity: 0.05, delay: '3.8s', weight: 'font-bold' },
  { text: 'Falafel', top: '42%', left: '48%', size: 'text-2xl', opacity: 0.04, delay: '1.4s', weight: 'font-normal' },
];

export function DishWordCloud() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {WORDS.map((word) => (
        <span
          key={word.text}
          className={`absolute ${word.size} ${word.weight} text-white italic tracking-tight`}
          style={{
            top: word.top,
            left: word.left,
            opacity: 0,
            animation: `dishFloat 7s ease-in-out ${word.delay} infinite alternate`,
            '--word-opacity': word.opacity,
          } as React.CSSProperties}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}
