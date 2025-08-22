# Global Development Pulse - Frontend 🎨

A modern React TypeScript frontend application for visualizing World Bank development indicators with interactive charts and comprehensive user interface.

<div align="center">

![React](https://img.shields.io/badge/React-18.2+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Vite](https://img.shields.io/badge/Vite-5.0+-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3+-blue)

</div>


## 🌟 Features

### 🎯 User Experience

- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Intuitive Interface**: Clean, modern design with smooth animations
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Progressive Loading**: Skeleton screens and lazy loading

### 📊 Data Visualization

- **Interactive Charts**: Line charts, bar charts with zoom and pan
- **Real-time Updates**: Live data fetching with loading states
- **Export Capabilities**: Download charts as PNG, data as CSV/JSON
- **Comparison Tools**: Multi-country and multi-indicator analysis
- **Custom Filters**: Date ranges, countries, indicators, scales

### ⚡ Performance

- **Code Splitting**: Optimized bundle size with lazy loading
- **Caching Strategy**: Smart cache management with React Query
- **Virtual Scrolling**: Efficient rendering for large datasets
- **Service Worker**: Offline capabilities and cache management

## 🛠️ Technology Stack

| Technology          | Purpose                            |
| ------------------- | ---------------------------------- |
| **React**           | Core UI Framework                  |
| **TypeScript**      | Type Safety & Developer Experience |
| **Vite**            | Build Tool & Development Server    |
| **TailwindCSS**     | Utility-first CSS Framework        |
| **React Query**     | Data Fetching & Server State       |
| **React Hook Form** | Form Management & Validation       |
| **Zod**             | Schema Validation                  |
| **Recharts**        | Chart Library                      |
| **Zustand**         | Client State Management            |
| **React Router**    | Client-side Routing                |
| **Framer Motion**   | Animations & Transitions           |
| **Radix UI**        | Accessible UI Primitives           |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/pkparthk/Global-Development-Pulse.git
   cd Global-Development-Pulse/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_APP_NAME=Global Development Pulse
   VITE_APP_VERSION=1.1.0
   VITE_NODE_ENV=development
   VITE_ENABLE_REACT_QUERY_DEVTOOLS=true
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to http://localhost:3000

## 📁 Project Structure

```
frontend/
├── 📁 public/                   # Static assets
│   ├── 📄 vite.svg             # App icon
│   └── 📄 index.html           # HTML template
├── 📁 src/
│   ├── 📁 components/          # Reusable UI components
│   │   ├── 📁 ui/              # Base UI components
│   │   │   ├── 📄 button.tsx   # Button component
│   │   │   ├── 📄 card.tsx     # Card component
│   │   │   ├── 📄 input.tsx    # Input component
│   │   │   └── 📄 loading.tsx  # Loading components
│   │   ├── 📁 charts/          # Chart components
│   │   │   ├── 📄 TrendChart.tsx       # Time series charts
│   │   │   └── 📄 ComparisonChart.tsx  # Comparison charts
│   │   ├── 📁 filters/         # Filter components
│   │   │   └── 📄 FilterPanel.tsx      # Main filter panel
│   │   └── 📁 layout/          # Layout components
│   │       └── 📄 DashboardLayout.tsx  # Main layout
│   ├── 📁 pages/               # Route-level pages
│   │   ├── 📄 Dashboard.tsx    # Main dashboard page
│   │   ├── 📄 Login.tsx        # Login page
│   │   └── 📄 Register.tsx     # Registration page
│   ├── 📁 services/            # API services
│   │   ├── 📄 api.ts           # API client
│   │   └── 📄 queries.ts       # React Query hooks
│   ├── 📁 store/               # State management
│   │   └── 📄 index.ts         # Zustand store
│   ├── 📁 types/               # TypeScript definitions
│   │   └── 📄 index.ts         # Type definitions
│   ├── 📁 utils/               # Utility functions
│   │   └── 📄 index.ts         # Helper functions
│   ├── 📄 App.tsx              # Root component
│   ├── 📄 main.tsx             # Application entry point
│   ├── 📄 index.css            # Global styles
│   └── 📄 vite-env.d.ts        # Vite type definitions
├── 📄 package.json             # Dependencies & scripts
├── 📄 vite.config.ts           # Vite configuration
├── 📄 tailwind.config.js       # TailwindCSS configuration
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 postcss.config.js        # PostCSS configuration
└── 📄 README.md                # This file
```

## 🎨 Component Architecture

### UI Components (`src/components/ui/`)

Base components built with Radix UI primitives:

```tsx
// Example: Button component
import { Button } from "@/components/ui/button";

<Button variant="primary" size="md">
  Click me
</Button>;
```

### Chart Components (`src/components/charts/`)

Recharts-based visualization components:

```tsx
// Example: TrendChart component
import { TrendChart } from "@/components/charts/TrendChart";

<TrendChart
  data={timeSeriesData}
  indicator="GDP per capita"
  countries={["USA", "CHN", "DEU"]}
/>;
```

### Filter Components (`src/components/filters/`)

Advanced filtering interface:

```tsx
// Example: FilterPanel component
import { FilterPanel } from "@/components/filters/FilterPanel";

<FilterPanel
  onFiltersChange={handleFiltersChange}
  initialFilters={defaultFilters}
/>;
```

## 🔧 Configuration

### Environment Variables

| Variable                           | Description         | Default                  |
| ---------------------------------- | ------------------- | ------------------------ |
| `VITE_API_BASE_URL`                | Backend API URL     | http://localhost:8000    |
| `VITE_APP_NAME`                    | Application name    | Global Development Pulse |
| `VITE_APP_VERSION`                 | Application version | 1.1.0                    |
| `VITE_NODE_ENV`                    | Environment         | development              |
| `VITE_ENABLE_REACT_QUERY_DEVTOOLS` | Enable dev tools    | true                     |

### Vite Configuration

Key configurations in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: "esnext",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          charts: ["recharts"],
          ui: ["@radix-ui/react-slot"],
        },
      },
    },
  },
});
```

### TailwindCSS Configuration

Custom design system in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        // ... custom color palette
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
};
```

## 📡 API Integration

### React Query Setup

Centralized API state management:

```typescript
// services/queries.ts
export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () => apiService.getCountries(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSeries = (params: SeriesParams) => {
  return useQuery({
    queryKey: ["series", params],
    queryFn: () => apiService.getSeries(params),
    enabled: !!params.indicator && !!params.countries,
  });
};
```

### API Client

Type-safe API client:

```typescript
// services/api.ts
class ApiService {
  private baseURL: string;

  async getSeries(params: SeriesParams): Promise<SeriesResponse> {
    const response = await fetch(`${this.baseURL}/api/series/`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }

    return response.json();
  }
}
```

## 🧪 Testing

### Unit Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Component Testing

```bash
# Test specific component
npm test -- Button.test.tsx

# Test with UI
npm run test:ui
```

### E2E Testing

```bash
# Run end-to-end tests
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e:headless
```

### Testing Structure

```typescript
// Example: Component test
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🚀 Build & Deployment

### Development Build

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build for development
npm run build:dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build:analyze
```

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

#### Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

## 🎯 Performance Optimization

### Bundle Optimization

- **Code Splitting**: Lazy load components and routes
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Compress images and fonts
- **CDN Integration**: Serve static assets from CDN

### Runtime Performance

- **Virtual Scrolling**: Handle large datasets efficiently
- **Memoization**: Prevent unnecessary re-renders
- **Debounced Inputs**: Optimize search and filters
- **Image Lazy Loading**: Load images on demand

### Monitoring

```typescript
// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🔐 Security Best Practices

### Authentication

- **JWT Token Storage**: Secure token management
- **Automatic Refresh**: Token renewal strategy
- **Route Protection**: Private route guards

### XSS Prevention

- **Input Sanitization**: Clean user inputs
- **CSP Headers**: Content Security Policy
- **HTTPS Only**: Secure communication

### Environment Security

- **Environment Variables**: No secrets in code
- **Build-time Checks**: Validate configuration
- **Error Boundaries**: Graceful error handling

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run linting: `npm run lint`
5. Run tests: `npm test`
6. Commit changes: `git commit -m 'feat: add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open Pull Request

### Development Standards

- **Code Style**: ESLint + Prettier configuration
- **Naming Conventions**: PascalCase for components, camelCase for functions
- **File Organization**: Feature-based structure
- **Type Safety**: Strict TypeScript configuration

### Component Guidelines

```typescript
// Component template
interface ComponentProps {
  // Props with documentation
  title: string;
  optional?: boolean;
}

export const Component: React.FC<ComponentProps> = ({
  title,
  optional = false,
}) => {
  // Implementation
  return <div className="component-class">{title}</div>;
};
```

## 📚 Resources

### Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

### Tools & Extensions

- **VS Code Extensions**:
  - TypeScript Hero
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Auto Rename Tag

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview build
npm run type-check      # Check types
npm run lint           # Lint code
npm test               # Run tests

# Maintenance
npm run update         # Update dependencies
npm run clean          # Clean build files
npm audit              # Security audit
```

## 🐛 Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Type errors
npm run type-check
```

#### Development Server Issues

```bash
# Port already in use
lsof -ti:3000 | xargs kill -9

# Clear Vite cache
rm -rf node_modules/.vite
```

#### Environment Variables

```bash
# Check environment loading
console.log(import.meta.env)

# Verify .env file exists
ls -la .env*
```


<div align="center">

**Part of Global Development Pulse ecosystem**

[Backend](../backend/README.md) • [Main Documentation](../README.md)

</div>
