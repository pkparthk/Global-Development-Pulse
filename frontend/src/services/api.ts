import {
  User,
  LoginRequest,
  LoginResponse,
  Country,
  Indicator,
  SeriesResponse,
  SnapshotResponse,
  SeriesParams,
  SnapshotParams,
} from "@/types";
import { getApiBaseUrl } from "@/utils";

class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseURL = getApiBaseUrl();
    this.accessToken = localStorage.getItem("accessToken");
  }

  /**
   * Set the access token for authenticated requests
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      defaultHeaders.Authorization = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle API error responses
        if (data.error) {
          throw new ApiError(
            data.error.message,
            data.error.code,
            response.status
          );
        }
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          "HTTP_ERROR",
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiError(
          "Network error - please check your connection",
          "NETWORK_ERROR",
          0
        );
      }

      throw new ApiError("An unexpected error occurred", "UNKNOWN_ERROR", 0);
    }
  }

  private async publicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Don't add authorization header for public requests

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle API error responses
        if (data.error) {
          throw new ApiError(
            data.error.message,
            data.error.code,
            response.status
          );
        }
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          "HTTP_ERROR",
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiError(
          "Network error - please check your connection",
          "NETWORK_ERROR",
          0
        );
      }

      throw new ApiError("An unexpected error occurred", "UNKNOWN_ERROR", 0);
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store tokens
    this.setAccessToken(response.access);
    localStorage.setItem("refreshToken", response.refresh);

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      await this.request("/api/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken }),
      });
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      // Clear tokens regardless of API call result
      this.setAccessToken(null);
      localStorage.removeItem("refreshToken");
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new ApiError("No refresh token available", "NO_REFRESH_TOKEN", 401);
    }

    try {
      const response = await this.request<{ access: string }>(
        "/api/auth/refresh/",
        {
          method: "POST",
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      this.setAccessToken(response.access);
      return response.access;
    } catch (error) {
      // If refresh fails, clear all tokens
      this.setAccessToken(null);
      localStorage.removeItem("refreshToken");
      throw error;
    }
  }

  /**
   * Get list of countries
   */
  async getCountries(): Promise<Country[]> {
    return this.publicRequest<Country[]>("/api/meta/countries/");
  }

  /**
   * Get list of indicators
   */
  async getIndicators(): Promise<Indicator[]> {
    return this.publicRequest<Indicator[]>("/api/meta/indicators/");
  }

  /**
   * Get time series data
   */
  async getSeriesData(params: SeriesParams): Promise<SeriesResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });

    return this.publicRequest<SeriesResponse>(
      `/api/data/series/?${searchParams.toString()}`
    );
  }

  /**
   * Get snapshot data
   */
  async getSnapshotData(params: SnapshotParams): Promise<SnapshotResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });

    return this.request<SnapshotResponse>(
      `/api/data/snapshot/?${searchParams.toString()}`
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get current user info (if available from token)
   */
  getCurrentUser(): User | null {
    if (!this.accessToken) {
      return null;
    }

    try {
      // Decode JWT payload (simple base64 decode)
      const payload = this.accessToken.split(".")[1];
      const decoded = JSON.parse(atob(payload));

      // Return user info if available in token
      if (decoded.user_id) {
        return {
          id: decoded.user_id,
          username: decoded.username || "",
          email: decoded.email || "",
          first_name: decoded.first_name || "",
          last_name: decoded.last_name || "",
        };
      }
    } catch (error) {
      console.warn("Error decoding token:", error);
    }

    return null;
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
