'use client';

import { useState } from 'react';

// Monday-first, matching how Chilean restaurants list hours.
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface Shift { from: string; to: string; }
interface Day { open: boolean; shifts: Shift[]; }

function defaultWeek(): Day[] {
  // All closed by default — the owner opens the days they operate, so we never
  // save a guessed schedule they didn't set.
  return Array.from({ length: 7 }, () => ({ open: false, shifts: [{ from: '12:00', to: '23:00' }] }));
}

function parseWeek(json: string | null): Day[] {
  if (!json) return defaultWeek();
  try {
    const arr = JSON.parse(json) as Day[];
    if (Array.isArray(arr) && arr.length === 7) {
      return arr.map((d) => ({
        open: !!d.open,
        shifts: Array.isArray(d.shifts) && d.shifts.length > 0 ? d.shifts : [{ from: '12:00', to: '23:00' }],
      }));
    }
  } catch { /* fall through */ }
  return defaultWeek();
}

function fmtDay(d: Day): string {
  if (!d.open || d.shifts.length === 0) return 'cerrado';
  return d.shifts.filter((s) => s.from && s.to).map((s) => `${s.from}–${s.to}`).join(', ');
}

/** Structured week → human string, grouping consecutive identical days into ranges. */
export function serializeWeek(week: Day[]): string {
  if (!week.some((d) => d.open)) return ''; // nothing open → treat as unset
  const groups: { start: number; end: number; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const label = fmtDay(week[i]);
    const last = groups[groups.length - 1];
    if (last && last.label === label && last.end === i - 1) last.end = i;
    else groups.push({ start: i, end: i, label });
  }
  return groups
    .map((g) => {
      const days = g.start === g.end ? DAYS[g.start] : `${DAYS[g.start]}–${DAYS[g.end]}`;
      return g.label === 'cerrado' ? `${days} cerrado` : `${days} ${g.label}`;
    })
    .join(' · ');
}

const timeInput = 'app-surface2 border app-line rounded-lg px-2 py-1.5 text-sm app-ink outline-none focus:border-accent/60 transition';

export function HoursEditor({
  hours,
  hoursJson,
  onChange,
}: {
  hours: string | null;
  hoursJson: string | null;
  onChange: (hours: string, hoursJson: string | null) => void;
}) {
  // Free-text mode preserves any legacy hours that predate the structured editor.
  const [mode, setMode] = useState<'struct' | 'text'>(
    () => (!hoursJson && hours && hours.trim() ? 'text' : 'struct')
  );
  const [week, setWeek] = useState<Day[]>(() => parseWeek(hoursJson));
  const [freeText, setFreeText] = useState(hours ?? '');

  function commit(next: Day[]) {
    setWeek(next);
    onChange(serializeWeek(next), JSON.stringify(next));
  }

  function setDay(i: number, patch: Partial<Day>) {
    commit(week.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }
  function setShift(i: number, si: number, patch: Partial<Shift>) {
    commit(week.map((d, idx) => idx === i
      ? { ...d, shifts: d.shifts.map((s, sj) => (sj === si ? { ...s, ...patch } : s)) }
      : d));
  }
  function addShift(i: number) {
    commit(week.map((d, idx) => idx === i ? { ...d, shifts: [...d.shifts, { from: '19:00', to: '23:00' }] } : d));
  }
  function removeShift(i: number, si: number) {
    commit(week.map((d, idx) => idx === i ? { ...d, shifts: d.shifts.filter((_, sj) => sj !== si) } : d));
  }
  function applyFirstToAll() {
    const first = week[0];
    commit(week.map(() => ({ open: first.open, shifts: first.shifts.map((s) => ({ ...s })) })));
  }

  const preview = serializeWeek(week);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs app-mut">Horario de atención</label>
        <button
          type="button"
          onClick={() => {
            if (mode === 'struct') { setMode('text'); onChange(freeText, null); }
            else { setMode('struct'); onChange(serializeWeek(week), JSON.stringify(week)); }
          }}
          className="text-xs text-accent hover:text-accent-lite transition"
        >
          {mode === 'struct' ? 'Usar texto libre' : 'Usar editor por día'}
        </button>
      </div>

      {mode === 'text' ? (
        <input
          value={freeText}
          onChange={(e) => { setFreeText(e.target.value); onChange(e.target.value, null); }}
          className="w-full app-surface2 border app-line rounded-xl px-3 py-2 text-sm app-ink outline-none focus:border-accent/60 transition"
          placeholder="Lun a Sáb, 12:00–23:00"
        />
      ) : (
        <div className="app-soft border app-line rounded-xl p-2">
          {week.map((d, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 px-1 border-b app-line last:border-0 flex-wrap">
              <span className="w-9 text-xs font-semibold app-ink shrink-0">{DAYS[i]}</span>

              <button
                type="button"
                onClick={() => setDay(i, { open: !d.open })}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition shrink-0 ${d.open ? 'bg-accent/15 border-accent/30 text-accent' : 'app-surface2 app-line app-mut'}`}
              >
                {d.open ? 'Abierto' : 'Cerrado'}
              </button>

              {d.open ? (
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  {d.shifts.map((s, si) => (
                    <div key={si} className="flex items-center gap-1.5 flex-wrap">
                      <input type="time" value={s.from} onChange={(e) => setShift(i, si, { from: e.target.value })} className={timeInput} />
                      <span className="app-mut2 text-xs">a</span>
                      <input type="time" value={s.to} onChange={(e) => setShift(i, si, { to: e.target.value })} className={timeInput} />
                      {d.shifts.length > 1 && (
                        <button type="button" onClick={() => removeShift(i, si)} aria-label="Quitar turno" className="app-mut2 hover:text-red-400 transition text-sm px-1">✕</button>
                      )}
                      {si === d.shifts.length - 1 && d.shifts.length < 3 && (
                        <button type="button" onClick={() => addShift(i)} className="text-xs text-accent hover:text-accent-lite transition">+ turno</button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs app-mut2 flex-1">—</span>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 px-1">
            <button type="button" onClick={applyFirstToAll} className="text-xs text-accent hover:text-accent-lite transition">
              Aplicar {DAYS[0]} a todos los días
            </button>
          </div>
        </div>
      )}

      {mode === 'struct' && (
        <p className="text-xs app-mut2 mt-1.5">
          {preview ? <>Vista previa: <span className="app-mut">{preview}</span></> : 'Marca como “Abierto” los días que atiendes.'}
        </p>
      )}
    </div>
  );
}
