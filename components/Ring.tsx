"use client";

import { useEffect, useState } from "react";

/** A pass-rate ring whose stroke and number animate to the target value. */
export default function Ring({ value, size = 84, label }: { value: number; size?: number; label?: string }) {
  const [shown, setShown] = useState(0);
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    let raf = 0;
    const from = shown;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const color = value >= 0.8 ? "var(--pass)" : value >= 0.5 ? "var(--warn)" : "var(--fail)";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
        />
      </svg>
      <span className="display absolute text-xl font-bold tabular-nums">{Math.round(shown * 100)}</span>
    </div>
  );
}
