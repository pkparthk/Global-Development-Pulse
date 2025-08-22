import {
  User,
  LoginRequest,
  RegisterRequest,
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
    this.accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken");
  }
  
  setAccessToken(token: string | null): void {
    this.accessToken = token;
    if (token) {
      // Store in both keys for compatibility
      localStorage.setItem("access_token", token);
      localStorage.setItem("accessToken", token);
    } else {
      // Remove both keys
      localStorage.removeItem("access_token");
      localStorage.removeItem("accessToken");
    }
  }
  
  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

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

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      const data = await response.json();

      if (!response.ok) {
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


    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      const data = await response.json();

      if (!response.ok) {
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

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Store tokens (auto-login after registration)
    this.setAccessToken(response.access);
    localStorage.setItem("refreshToken", response.refresh);

    return response;
  }

  async logout(): Promise<void> {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      localStorage.getItem("refresh_token");

    try {
      if (refreshToken) {
        await this.request("/api/auth/logout/", {
          method: "POST",
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {

      console.warn("Logout API call failed:", error);
    } finally {      
      this.setAccessToken(null);
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("refreshToken");
    }
  }
  
  async refreshToken(): Promise<string> {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      localStorage.getItem("refresh_token");

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
      this.setAccessToken(null);
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("refreshToken");
      throw error;
    }
  }

  async getCountries(): Promise<Country[]> {
    return this.publicRequest<Country[]>("/api/meta/countries/");
  }

  async getIndicators(): Promise<Indicator[]> {
    return this.publicRequest<Indicator[]>("/api/meta/indicators/");
  }

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

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  
  getCurrentUser(): User | null {
    if (!this.accessToken) {
      return null;
    }

    try {
      const payload = this.accessToken.split(".")[1];
      const decoded = JSON.parse(atob(payload));

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
  
  async getUserProfile(): Promise<User> {
    if (!this.accessToken) {
      console.warn("No access token available for profile request");
      throw new ApiError("No authentication token", "NO_TOKEN", 401);
    }

    // console.log(
    //   "Fetching user profile with token:",
    //   this.accessToken?.substring(0, 20) + "..."
    // );
    const response = await this.request<{ user: User }>("/api/auth/profile/");
    return response.user;
  }
}

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

export const apiService = new ApiService();
export default apiService;
