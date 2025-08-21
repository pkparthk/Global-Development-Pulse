import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { validateEnv } from "@/utils";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/index.css";

// Validate environment variables on app start
try {
  validateEnv();
} catch (error) {
  console.error("Environment validation failed:", error);
}

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>

        {/* React Query DevTools in development */}
        {import.meta.env.VITE_ENABLE_REACT_QUERY_DEVTOOLS === "true" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
