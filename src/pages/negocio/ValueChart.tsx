import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { Initiative } from "../../types";
import { truncateName, getFulfillmentColor, formatCurrency } from "./negocio-utils";

interface ValueChartProps {
  initiatives: Initiative[];
}

interface ChartInitiativeData {
  name: string;
  fullName: string;
  projectedValue: number;
  actualValue: number;
  fulfillmentRatio: number;
  fulfillmentColor: string;
}

const PROMISE_COLOR = "#8884d8";

function transformData(initiatives: Initiative[]): ChartInitiativeData[] {
  return initiatives.map((initiative) => {
    const ratio =
      initiative.projectedValue === 0
        ? 0
        : (initiative.actualValue / initiative.projectedValue) * 100;

    return {
      name: truncateName(initiative.name),
      fullName: initiative.name,
      projectedValue: initiative.projectedValue,
      actualValue: initiative.actualValue,
      fulfillmentRatio: ratio,
      fulfillmentColor: getFulfillmentColor(initiative.projectedValue, initiative.actualValue),
    };
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartInitiativeData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "10px",
        fontSize: "12px",
      }}
    >
      <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{data.fullName}</p>
      <p style={{ color: PROMISE_COLOR }}>Promesa: {formatCurrency(data.projectedValue)}</p>
      <p style={{ color: data.fulfillmentColor }}>Realidad: {formatCurrency(data.actualValue)}</p>
      <p>Cumplimiento: {data.fulfillmentRatio.toFixed(1)}%</p>
    </div>
  );
}

function formatYAxis(value: number): string {
  const formatted = Math.round(value).toLocaleString("en-US");
  return `$${formatted}M`;
}

export function ValueChart({ initiatives }: ValueChartProps) {
  if (initiatives.length === 0) {
    return <p>No hay datos de iniciativas disponibles</p>;
  }

  const chartData = transformData(initiatives);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
        />
        <Bar dataKey="projectedValue" name="Promesa" fill={PROMISE_COLOR} />
        <Bar dataKey="actualValue" name="Realidad">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fulfillmentColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
