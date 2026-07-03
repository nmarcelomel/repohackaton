import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Initiative } from "../../types";
import { calculateAlignmentIndex } from "./negocio-utils";

interface AlignmentChartProps {
  initiatives: Initiative[];
}

const COLOR_ALIGNED = "#1B3A8C";
const COLOR_NOT_ALIGNED = "#9CA3AF";

interface AlignmentSegment {
  name: string;
  value: number;
  color: string;
}

function buildSegments(initiatives: Initiative[]): AlignmentSegment[] {
  const alignedValue = initiatives
    .filter((i) => i.status === "completada" || i.status === "en_progreso")
    .reduce((sum, i) => sum + i.projectedValue, 0);

  const notAlignedValue = initiatives
    .filter((i) => i.status === "en_riesgo")
    .reduce((sum, i) => sum + i.projectedValue, 0);

  return [
    { name: "Esfuerzo alineado a OKRs", value: alignedValue, color: COLOR_ALIGNED },
    { name: "Esfuerzo no alineado", value: notAlignedValue, color: COLOR_NOT_ALIGNED },
  ];
}

function CenterLabel({ viewBox, percentage }: { viewBox?: { cx: number; cy: number }; percentage: number }) {
  if (!viewBox) return null;
  const { cx, cy } = viewBox;
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: "24px", fontWeight: "bold", fill: "#1F2937" }}
    >
      {`${percentage}%`}
    </text>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: AlignmentSegment }> }) {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  const total = payload.reduce((sum, p) => sum + p.value, 0);
  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";

  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "4px",
        padding: "8px 12px",
        fontSize: "12px",
      }}
    >
      <span>{`${entry.name}: ${pct}%`}</span>
    </div>
  );
}

export function AlignmentChart({ initiatives }: AlignmentChartProps) {
  const alignmentIndex = calculateAlignmentIndex(initiatives);
  const percentage = Math.round(alignmentIndex);

  const segments = buildSegments(initiatives);
  const isEmpty = initiatives.length === 0;

  // For empty state, show a full gray donut with 0%
  const chartData: AlignmentSegment[] = isEmpty
    ? [{ name: "Esfuerzo no alineado", value: 1, color: COLOR_NOT_ALIGNED }]
    : segments;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          startAngle={90}
          endAngle={-270}
        >
          {chartData.map((segment, index) => (
            <Cell key={`cell-${index}`} fill={segment.color} />
          ))}
        </Pie>
        <Pie
          data={[{ value: 1 }]}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius={0}
          fill="none"
          label={<CenterLabel percentage={isEmpty ? 0 : percentage} />}
          isAnimationActive={false}
        />
        {!isEmpty && <Tooltip content={<CustomTooltip />} />}
      </PieChart>
    </ResponsiveContainer>
  );
}
