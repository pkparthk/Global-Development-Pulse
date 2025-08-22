import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiService, ApiError } from "./api";
import { SeriesParams, LoginRequest, QUERY_KEYS } from "@/types";

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => apiService.login(credentials),
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.user.username}!`);
      // Invalidate and refetch user-dependent queries
      queryClient.invalidateQueries();
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Login failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      toast.success("Logged out successfully");
      // Clear all cached data
      queryClient.clear();
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Logout failed");
      // Clear cache anyway
      queryClient.clear();
    },
  });

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isAuthenticated: apiService.isAuthenticated(),
    currentUser: apiService.getCurrentUser(),
  };
}

export function useCountries() {
  return useQuery({
    queryKey: QUERY_KEYS.countries,
    queryFn: () => apiService.getCountries(),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useIndicators() {
  return useQuery({
    queryKey: QUERY_KEYS.indicators,
    queryFn: () => apiService.getIndicators(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useSeries(params: SeriesParams, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.series(params),
    queryFn: () => apiService.getSeriesData(params),
    enabled: enabled && !!params.indicator && !!params.countries,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 400)
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useSeriesData(params: SeriesParams, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.series(params),
    queryFn: () => apiService.getSeriesData(params),
    enabled: enabled && !!params.indicator && !!params.countries,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 400)
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => apiService.login(credentials),
    onSuccess: (data) => {
      // Store the access token
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Invalidate and refetch any queries that depend on authentication
      queryClient.invalidateQueries();

      toast.success("Login successful!");
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Login failed. Please try again."
      );
    },
  });
}
