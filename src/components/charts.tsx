import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: 12,
  },
} as const;

const short = (v: number) =>
  v >= 1000000
    ? `${(v / 1000000).toFixed(1)} M`
    : v >= 1000
      ? `${Math.round(v / 1000)} k`
      : String(v);

export function AreaTrend({
  data,
  xKey = "date",
  yKey = "revenue",
  height = 260,
}: {
  data: Record<string, string | number>[];
  xKey?: string;
  yKey?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey={xKey} {...axis} tickFormatter={(v: string) => v.slice(5)} />
        <YAxis {...axis} tickFormatter={short} width={44} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => v.toLocaleString("fr-FR")} />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#areaFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarsCompare({
  data,
  xKey,
  bars,
  height = 260,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  bars: { key: string; label: string; color: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis {...axis} tickFormatter={short} width={44} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => v.toLocaleString("fr-FR")} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {bars.map((b) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.label}
            fill={b.color}
            radius={[6, 6, 0, 0]}
            maxBarSize={46}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LinesCompare({
  data,
  xKey,
  lines,
  height = 260,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  lines: { key: string; label: string; color: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey={xKey} {...axis} tickFormatter={(v: string) => String(v).slice(5)} />
        <YAxis {...axis} tickFormatter={short} width={44} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => v.toLocaleString("fr-FR")} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function HBars({
  data,
  height = 240,
}: {
  data: { name: string; value: number; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis type="number" {...axis} tickFormatter={short} />
        <YAxis type="category" dataKey="name" {...axis} width={130} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => v.toLocaleString("fr-FR")} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={26}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? "var(--chart-1)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
