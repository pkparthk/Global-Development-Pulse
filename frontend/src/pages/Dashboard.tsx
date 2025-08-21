import { Navigate } from "react-router-dom";
import {
  useAuth,
  useIndicators,
  useSeries,
  useCountries,
} from "@/services/queries";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrendChart } from "@/components/charts/TrendChart";
import { ComparisonChart } from "@/components/charts/ComparisonChart";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { useFilters } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Globe, BarChart3, Activity } from "lucide-react";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const filters = useFilters();

  // Fetch real data based on current filters
  const { data: indicators } = useIndicators();
  const { data: countries } = useCountries();

  const {
    data: seriesData,
    isLoading: seriesLoading,
    error: seriesError,
  } = useSeries({
    indicator: filters.indicator,
    countries: filters.countries.join(","),
    start: filters.yearRange[0],
    end: filters.yearRange[1],
    per_capita: filters.perCapita,
    log: filters.logScale,
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Transform series data for charts
  const trendData =
    seriesData?.series?.reduce((acc: any[], countrySeries: any) => {
      countrySeries.data.forEach((point: any) => {
        const existingYear = acc.find((item) => item.year === point.year);
        if (existingYear) {
          existingYear[countrySeries.country] = point.value;
        } else {
          acc.push({
            year: point.year,
            [countrySeries.country]: point.value,
          });
        }
      });
      return acc;
    }, []) || [];

  const comparisonData =
    seriesData?.series?.map((countrySeries: any) => {
      const latestData = countrySeries.data[countrySeries.data.length - 1];
      const countryInfo = countries?.find(
        (c) => c.code === countrySeries.country
      );
      return {
        country: countrySeries.country,
        countryName: countryInfo?.name || countrySeries.country,
        value: latestData?.value || 0,
        year: latestData?.year || 0,
      };
    }) || [];

  const currentIndicator = indicators?.find(
    (ind) => ind.code === filters.indicator
  );
  const selectedCountryNames =
    countries
      ?.filter((c) => filters.countries.includes(c.code))
      .map((c) => c.name) || filters.countries;

  // Calculate summary stats
  const totalDataPoints = trendData.length * filters.countries.length;
  const latestYear = Math.max(
    ...(seriesData?.series?.[0]?.data?.map((d: any) => d.year) || [])
  );
  const availableCountries = countries?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Modern Header */}
        {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Global Development Analytics
              </h1>
              <p className="text-blue-100 text-lg">
                Explore World Bank data with interactive visualizations and
                insights
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <Activity className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div> */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Current Indicator
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {currentIndicator?.category || "Economy"}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Countries Selected
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {filters.countries.length}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Data Points
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalDataPoints}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Latest Year
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {latestYear || 2024}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Selection Info */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Current Analysis
                </h3>
                <p className="text-gray-700 font-medium">
                  {currentIndicator?.name || "GDP per capita (current US$)"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCountryNames.slice(0, 6).map((name, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {name}
                  </Badge>
                ))}
                {selectedCountryNames.length > 6 && (
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600"
                  >
                    +{selectedCountryNames.length - 6} more
                  </Badge>
                )}
              </div>
              <div className="ml-auto">
                <Badge variant="outline" className="text-sm">
                  {filters.yearRange[0]} - {filters.yearRange[1]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Enhanced Filters Sidebar */}
          <div className="xl:col-span-1">
            <Card className="border-0 shadow-lg sticky top-4">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <FilterPanel />
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Charts Area */}
          <div className="xl:col-span-3 space-y-8">
            {seriesError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="text-red-800 text-center">
                    <p className="font-medium">Unable to load data</p>
                    <p className="text-sm mt-1">{seriesError.message}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Trend Chart */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Trend Analysis
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  {currentIndicator?.name ||
                    "Time series analysis of selected indicator"}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {seriesLoading ? (
                  <div className="flex flex-col justify-center items-center h-80">
                    <LoadingSpinner />
                    <p className="text-gray-500 mt-4">Loading trend data...</p>
                  </div>
                ) : (
                  <TrendChart
                    data={trendData}
                    title={currentIndicator?.name || "Trend Analysis"}
                    loading={seriesLoading}
                  />
                )}
              </CardContent>
            </Card>

            {/* Enhanced Comparison Chart */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-purple-600" />
                  Country Comparison
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  Comparative analysis for{" "}
                  {latestYear || "latest available year"}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {seriesLoading ? (
                  <div className="flex flex-col justify-center items-center h-80">
                    <LoadingSpinner />
                    <p className="text-gray-500 mt-4">
                      Loading comparison data...
                    </p>
                  </div>
                ) : (
                  <ComparisonChart
                    data={comparisonData}
                    title={`${
                      currentIndicator?.name || "Indicator"
                    } by Country`}
                    loading={seriesLoading}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Source Footer */}
        <Card className="border-0 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Data source: World Bank Open Data</span>
              </div>
              <div className="flex items-center gap-4">
                <span>{availableCountries}+ countries available</span>
                <span>Updated regularly</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
