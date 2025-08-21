import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useFilters, useSetFilters, useAppStore } from "@/store";
import { useCountries, useIndicators } from "@/services/queries";
import { LoadingSpinner } from "@/components/ui/loading";

export function FilterPanel() {
  const filters = useFilters();
  const setFilters = useSetFilters();
  const clearError = useAppStore((state) => state.clearError);

  const {
    data: countries,
    isLoading: countriesLoading,
    error: countriesError,
  } = useCountries();
  const {
    data: indicators,
    isLoading: indicatorsLoading,
    error: indicatorsError,
  } = useIndicators();

  const [yearStart, setYearStart] = useState(filters.yearRange[0].toString());
  const [yearEnd, setYearEnd] = useState(filters.yearRange[1].toString());

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleApplyYearRange = () => {
    const start = parseInt(yearStart);
    const end = parseInt(yearEnd);
    if (
      !isNaN(start) &&
      !isNaN(end) &&
      start <= end &&
      start >= 1960 &&
      end <= 2024
    ) {
      setFilters({
        yearRange: [start, end],
      });
    }
  };

  const handleTogglePerCapita = () => {
    setFilters({
      perCapita: !filters.perCapita,
    });
  };

  const handleToggleLogScale = () => {
    setFilters({
      logScale: !filters.logScale,
    });
  };

  const handleReset = () => {
    setFilters({
      indicator: "NY.GDP.PCAP.CD",
      countries: ["IND"],
      yearRange: [2000, 2024],
      perCapita: false,
      logScale: false,
    });
    setYearStart("2000");
    setYearEnd("2024");
  };

  if (countriesLoading || indicatorsLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
        <span className="ml-2 text-sm text-gray-600">Loading filters...</span>
      </div>
    );
  }

  if (countriesError || indicatorsError) {
    return (
      <div className="p-4 text-red-600 text-sm">
        <p>Error loading filter options:</p>
        <p>{countriesError?.message || indicatorsError?.message}</p>
      </div>
    );
  }

  const handleCountriesChange = (countryValues: string[]) => {
    setFilters({
      countries: countryValues,
    });
  };

  const handleIndicatorChange = (indicatorValues: string[]) => {
    if (indicatorValues.length > 0) {
      setFilters({
        indicator: indicatorValues[0], // Only allow single selection for indicators
      });
    }
  };

  // Prepare country options for the searchable select
  const countryOptions =
    countries?.map((country) => ({
      value: country.code,
      label: `${country.name} (${country.code})`,
      searchText: `${country.name} ${country.code}`,
    })) || [];

  // Prepare indicator options for the searchable select
  const indicatorOptions =
    indicators?.map((indicator) => ({
      value: indicator.code,
      label: indicator.name,
      searchText: `${indicator.name} ${indicator.code} ${indicator.category}`,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Countries Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Countries</h4>
        <p className="text-xs text-gray-500 mb-2">
          Search by country name or code (e.g., "India" or "IND")
        </p>
        <SearchableSelect
          options={countryOptions}
          value={filters.countries}
          onChange={handleCountriesChange}
          placeholder="Search for countries..."
          multiple={true}
          className="w-full"
        />
      </div>

      {/* Indicators Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Indicator</h4>
        <p className="text-xs text-gray-500 mb-2">
          Search by indicator name or category
        </p>
        <SearchableSelect
          options={indicatorOptions}
          value={filters.indicator ? [filters.indicator] : []}
          onChange={handleIndicatorChange}
          placeholder="Search for indicators..."
          multiple={false}
          className="w-full"
        />
      </div>

      {/* Year Range Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Year Range</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">Start Year</label>
              <Input
                type="number"
                min="1960"
                max="2024"
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">End Year</label>
              <Input
                type="number"
                min="1960"
                max="2024"
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <Button onClick={handleApplyYearRange} size="sm" className="w-full">
            Apply Year Range
          </Button>
          <div className="text-xs text-gray-600">
            Current: {filters.yearRange[0]} - {filters.yearRange[1]}
          </div>
        </div>
      </div>

      {/* Data Visualization Options */}
      <div>
        <h4 className="text-sm font-medium mb-3">Display Options</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.perCapita}
              onChange={handleTogglePerCapita}
              className="rounded"
            />
            <span className="text-sm">Per Capita View</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.logScale}
              onChange={handleToggleLogScale}
              className="rounded"
            />
            <span className="text-sm">Logarithmic Scale</span>
          </label>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t">
        <Button
          onClick={handleReset}
          size="sm"
          variant="outline"
          className="w-full"
        >
          Reset All Filters
        </Button>
      </div>

      {/* Current Filter Summary */}
      {/* <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-md">
        <p>
          <strong>Active Filters:</strong>
        </p>
        <p>Countries: {filters.countries.join(", ") || "None"}</p>
        <p>Indicator: {filters.indicator || "None"}</p>
        <p>
          Years: {filters.yearRange[0]} - {filters.yearRange[1]}
        </p>
        <p>
          Options: {filters.perCapita ? "Per Capita" : ""}{" "}
          {filters.logScale ? "Log Scale" : ""}
        </p>
      </div> */}
    </div>
  );
}
