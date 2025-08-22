import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FilterState, DEFAULT_FILTERS } from "@/types";

interface AppState {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Filter State
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Chart State
  chartType: "line" | "bar";
  setChartType: (type: "line" | "bar") => void;

  // Loading States
  isExporting: boolean;
  setIsExporting: (exporting: boolean) => void;

  // Error State
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // UI State
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Filter State
      filters: DEFAULT_FILTERS,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      // Chart State
      chartType: "line",
      setChartType: (type) => set({ chartType: type }),

      // Loading States
      isExporting: false,
      setIsExporting: (exporting) => set({ isExporting: exporting }),

      // Error State
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "gdp-app-store",
      version: 1,
      partialize: (state) => ({
        filters: state.filters,
        chartType: state.chartType,
      }),
    }
  )
);

// Selectors for better performance
export const useFilters = () => useAppStore((state) => state.filters);
export const useSetFilters = () => useAppStore((state) => state.setFilters);
export const useChartType = () => useAppStore((state) => state.chartType);
export const useSetChartType = () => useAppStore((state) => state.setChartType);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useSetSidebarOpen = () =>
  useAppStore((state) => state.setSidebarOpen);
export const useError = () => useAppStore((state) => state.error);
export const useSetError = () => useAppStore((state) => state.setError);
export const useClearError = () => useAppStore((state) => state.clearError);
