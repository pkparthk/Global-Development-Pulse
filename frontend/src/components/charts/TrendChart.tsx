import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartLoadingSkeleton } from "@/components/ui/loading";
import { CHART_COLORS } from "@/types";

interface TrendChartProps {
  data: any[];
  title?: string;
  loading?: boolean;
}

export function TrendChart({
  data,
  title = "Trend Chart",
  loading = false,
}: TrendChartProps) {
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

  // Merge data points by year
  const mergedData = data.reduce((acc: any[], curr: any) => {
    const existingEntry = acc.find((item) => item.year === curr.year);
    if (existingEntry) {
      Object.assign(existingEntry, curr);
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  // Sort by year
  mergedData.sort((a, b) => a.year - b.year);

  // Get all country keys (excluding 'year')
  const countryKeys =
    mergedData.length > 0
      ? Object.keys(mergedData[0]).filter((key) => key !== "year")
      : [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toString()}
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
            formatter={(value: any, name: string) => [
              typeof value === "number" ? value.toLocaleString() : value,
              name,
            ]}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend />
          {countryKeys.map((country, index) => (
            <Line
              key={country}
              type="monotone"
              dataKey={country}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
