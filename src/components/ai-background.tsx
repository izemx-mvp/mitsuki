import { cn } from "@/lib/utils";

/**
 * Fond animé dédié à Mitsuki : écailles de poisson (logo) et flux de données
 * Odoo → IA → décision. Purement décoratif, très discret.
 */
export function AiBackground({ className }: { className?: string }) {
  const scales = [
    { cx: 12, cy: 18, r: 9, stroke: "var(--primary)" },
    { cx: 26, cy: 26, r: 12, stroke: "var(--petrol)" },
    { cx: 8, cy: 40, r: 7, stroke: "var(--orange)" },
    { cx: 84, cy: 22, r: 11, stroke: "var(--pink)" },
    { cx: 92, cy: 46, r: 14, stroke: "var(--primary)" },
    { cx: 74, cy: 58, r: 8, stroke: "var(--bordeaux)" },
    { cx: 46, cy: 86, r: 13, stroke: "var(--petrol)" },
    { cx: 62, cy: 94, r: 9, stroke: "var(--orange)" },
    { cx: 22, cy: 78, r: 10, stroke: "var(--primary)" },
  ];

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <div className="absolute -top-24 -left-16 size-[420px] rounded-full bg-primary/[0.08] blur-3xl [animation:var(--animate-drift)]" />
      <div className="absolute top-1/3 -right-24 size-[380px] rounded-full bg-pink/[0.07] blur-3xl [animation:var(--animate-drift-slow)]" />
      <div className="absolute -bottom-28 left-1/3 size-[340px] rounded-full bg-orange/[0.06] blur-3xl [animation:var(--animate-drift)]" />

      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mitsuki-flow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="55%" stopColor="var(--petrol)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--orange)" stopOpacity="0.16" />
          </linearGradient>
        </defs>

        {/* Écailles inspirées du logo */}
        {scales.map((s, i) => (
          <circle
            key={`${s.cx}-${s.cy}`}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="none"
            stroke={s.stroke}
            strokeOpacity="0.16"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            style={{ animation: `pulse-soft ${7 + i}s ease-in-out infinite` }}
          />
        ))}

        {/* Flux de données */}
        {[14, 36, 60, 80].map((y, i) => (
          <path
            key={y}
            d={`M -5 ${y} C 20 ${y - 8}, 45 ${y + 10}, 105 ${y - 4}`}
            fill="none"
            stroke="url(#mitsuki-flow)"
            strokeWidth="0.25"
            strokeDasharray="1.5 3.5"
            vectorEffect="non-scaling-stroke"
            style={{ animation: `dash ${16 + i * 5}s linear infinite` }}
          />
        ))}

        {[
          [14, 22],
          [38, 62],
          [63, 30],
          [82, 70],
          [50, 12],
        ].map(([x, y], i) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r="0.4"
            fill="var(--primary)"
            opacity="0.25"
            style={{ animation: `pulse-soft ${3 + i * 0.7}s ease-in-out infinite` }}
          />
        ))}
      </svg>
    </div>
  );
}
