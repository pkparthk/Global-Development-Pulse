export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshRequest {
  refresh: string;
}

export interface RefreshResponse {
  access: string;
}

export interface Country {
  code: string;
  name: string;
  region: string;
}

export interface Indicator {
  code: string;
  name: string;
  category: string;
}

export interface DataPoint {
  year: number;
  value: number | null;
}

export interface CountrySeries {
  country: string;
  data: DataPoint[];
}

export interface SeriesResponse {
  indicator: string;
  series: CountrySeries[];
  source: string;
}

export interface CountryValue {
  country: string;
  value: number | null;
}

export interface SnapshotResponse {
  indicator: string;
  year: number;
  values: CountryValue[];
  source: string;
}

export interface SeriesParams {
  indicator: string;
  countries: string; // Comma-separated ISO3 codes
  start?: number;
  end?: number;
  per_capita?: boolean;
  log?: boolean;
}

export interface SnapshotParams {
  indicator: string;
  year: number;
  countries: string; // Comma-separated ISO3 codes
}

export interface FilterState {
  indicator: string;
  countries: string[];
  yearRange: [number, number];
  perCapita: boolean;
  logScale: boolean;
}

export interface DashboardState {
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  chartType: "line" | "bar";
}

export interface ChartDataPoint {
  year: number;
  [countryCode: string]: number | null;
}

export interface BarChartDataPoint {
  country: string;
  value: number | null;
  name: string; // Country name for display
}

export interface URLParams {
  indicator?: string;
  countries?: string;
  start?: string;
  end?: string;
  per_capita?: string;
  log?: string;
  view?: "trend" | "compare";
}

export interface ChartProps {
  data: ChartDataPoint[] | BarChartDataPoint[];
  title: string;
  indicator: Indicator;
  isLoading?: boolean;
  error?: string | null;
  onExport?: (format: "csv" | "png") => void;
}

export interface FilterProps {
  countries: Country[];
  indicators: Indicator[];
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  isLoading?: boolean;
}

export type ExportFormat = "csv" | "png";

export type ErrorType =
  | "network"
  | "authentication"
  | "validation"
  | "server"
  | "unknown";

export interface AppError {
  type: ErrorType;
  message: string;
  details?: unknown;
}

export const QUERY_KEYS = {
  countries: ["countries"] as const,
  indicators: ["indicators"] as const,
  userProfile: ["userProfile"] as const,
  series: (params: SeriesParams) => ["series", params] as const,
  snapshot: (params: SnapshotParams) => ["snapshot", params] as const,
} as const;

export const DEFAULT_FILTERS: FilterState = {
  indicator: "NY.GDP.PCAP.CD",
  countries: ["IND"],
  yearRange: [2000, 2024],
  perCapita: false,
  logScale: false,
};

export const DEFAULT_INDICATORS: Indicator[] = [
  {
    code: "NY.GDP.PCAP.CD",
    name: "GDP per capita (current US$)",
    category: "Economy",
  },
  {
    code: "EG.USE.ELEC.KH.PC",
    name: "Electric power consumption (kWh per capita)",
    category: "Environment",
  },
  {
    code: "SP.POP.TOTL",
    name: "Population, total",
    category: "Demography",
  },
];

export const CHART_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#6b7280",
] as const;
