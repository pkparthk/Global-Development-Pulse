import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartLoadingSkeleton } from "@/components/ui/loading";
import { CHART_COLORS } from "@/types";

interface ComparisonChartProps {
  data: any[];
  title?: string;
  loading?: boolean;
}

export function ComparisonChart({
  data,
  title = "Comparison Chart",
  loading = false,
}: ComparisonChartProps) {
  if (loading) {
    return <ChartLoadingSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Sort data by value descending
  const sortedData = [...data].sort((a, b) => (b.value || 0) - (a.value || 0));

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="country"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
              if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
              if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
              return value.toFixed(0);
            }}
          />
          <Tooltip
            formatter={(value: any) => [
              typeof value === "number" ? value.toLocaleString() : value,
              "Value",
            ]}
            labelFormatter={(label) => `Country: ${label}`}
          />
          <Legend />
          <Bar
            dataKey="value"
            fill={CHART_COLORS[0]}
            radius={[4, 4, 0, 0]}
            name="Value"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
