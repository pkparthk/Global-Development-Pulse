import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
  value: number | null,
  options: {
    style?: "decimal" | "currency" | "percent";
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    notation?: "standard" | "scientific" | "engineering" | "compact";
  } = {}
): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  const defaultOptions = {
    style: "decimal" as const,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: "standard" as const,
  };

  const formatOptions = { ...defaultOptions, ...options };

  try {
    return new Intl.NumberFormat("en-US", formatOptions).format(value);
  } catch (error) {
    console.warn("Error formatting number:", error);
    return value.toString();
  }
}

export function formatPercent(
  value: number | null,
  decimals: number = 1
): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return formatNumber(value / 100, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "An unexpected error occurred";
}

export function validateEnv(): void {
  const requiredEnvVars = ["VITE_API_BASE_URL"];
  const missing = requiredEnvVars.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

export function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL environment variable is not set");
  }
  return baseUrl.replace(/\/$/, ""); // Remove trailing slash
}
