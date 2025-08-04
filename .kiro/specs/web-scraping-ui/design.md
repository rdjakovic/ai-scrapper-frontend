# Design Document

## Overview

The Web Scraping UI is a modern React-based dashboard application built with Vite that provides an intuitive interface for managing web scraping operations. The application will consume the existing FastAPI backend and present a user-friendly way to create, monitor, and manage scraping jobs without requiring direct API interaction.

**Technology Stack:**
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite for fast development and optimized builds
- **Styling:** Tailwind CSS for utility-first styling
- **State Management:** React Query (TanStack Query) for server state management
- **Routing:** React Router v6 for client-side navigation
- **UI Components:** Headless UI + custom components for accessibility
- **HTTP Client:** Axios for API communication
- **Form Handling:** React Hook Form with Zod validation
- **Icons:** Lucide React for consistent iconography

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │ Components  │  │   Hooks     │         │
│  │             │  │             │  │             │         │
│  │ • Dashboard │  │ • JobCard   │  │ • useJobs   │         │
│  │ • JobDetail │  │ • JobForm   │  │ • useHealth │         │
│  │ • CreateJob │  │ • ResultsView│  │ • useResults│         │
│  │ • Results   │  │ • StatusBadge│  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Services  │  │    Utils    │  │   Types     │         │
│  │             │  │             │  │             │         │
│  │ • apiClient │  │ • formatters│  │ • Job       │         │
│  │ • jobService│  │ • validators│  │ • Result    │         │
│  │ • healthSvc │  │ • constants │  │ • Health    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                           │
│  • /api/v1/scrape (POST, GET, DELETE)                      │
│  • /api/v1/results/{job_id}                                │
│  • /api/v1/jobs                                            │
│  • /health                                                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

The application follows a component-based architecture with clear separation of concerns:

- **Pages:** Top-level route components that orchestrate data fetching and layout
- **Components:** Reusable UI components with single responsibilities
- **Hooks:** Custom hooks for data fetching and business logic
- **Services:** API communication layer with error handling
- **Utils:** Helper functions and utilities
- **Types:** TypeScript type definitions matching API schemas

## Components and Interfaces

### Core Components

#### 1. Layout Components
- **AppLayout:** Main application shell with navigation and header
- **Sidebar:** Navigation menu with active state management
- **Header:** Top bar with health status indicator and user actions
- **LoadingSpinner:** Reusable loading indicator component

#### 2. Job Management Components
- **JobCard:** Individual job display with status, actions, and metadata
- **JobList:** Paginated list of jobs with filtering and sorting
- **JobForm:** Form for creating new scraping jobs with validation
- **StatusBadge:** Visual status indicator with color coding
- **JobActions:** Action buttons for job operations (view, cancel, retry)

#### 3. Results Components
- **ResultsViewer:** Main results display with multiple view modes
- **DataTable:** Tabular view of scraped data with sorting and filtering
- **JsonViewer:** Formatted JSON display with syntax highlighting
- **ExportButton:** Data export functionality (JSON, CSV)
- **ScreenshotViewer:** Modal for displaying job screenshots

#### 4. Form Components
- **UrlInput:** URL input with validation and preview
- **SelectorBuilder:** Visual CSS selector builder interface
- **AdvancedOptions:** Collapsible advanced configuration options
- **ValidationMessage:** Form validation error display

### API Service Layer

#### ApiClient
```typescript
class ApiClient {
  private baseURL: string;
  private axiosInstance: AxiosInstance;
  
  // Core HTTP methods with error handling
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
}
```

#### Service Classes
- **JobService:** Job CRUD operations and status polling
- **ResultsService:** Results fetching with optional HTML/screenshot
- **HealthService:** API health monitoring
- **ExportService:** Data export functionality

### State Management Strategy

Using React Query for server state management provides:
- **Automatic caching** of API responses
- **Background refetching** for real-time updates
- **Optimistic updates** for better UX
- **Error handling** with retry logic
- **Loading states** management

Key queries:
- `useJobs()` - Paginated job list with real-time updates
- `useJob(jobId)` - Individual job details with polling
- `useResults(jobId)` - Job results with lazy loading
- `useHealth()` - API health status with periodic checks

## Data Models

### TypeScript Interfaces

```typescript
// Job Status Enum
enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Job Creation Request
interface CreateJobRequest {
  url: string;
  selectors?: Record<string, string>;
  wait_for?: string;
  timeout?: number;
  javascript?: boolean;
  user_agent?: string;
  headers?: Record<string, string>;
  job_metadata?: Record<string, any>;
}

// Job Response
interface Job {
  job_id: string;
  status: JobStatus;
  url: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
  job_metadata?: Record<string, any>;
}

// Job Results
interface JobResult {
  job_id: string;
  url: string;
  status: JobStatus;
  data?: Record<string, any>;
  raw_html?: string;
  screenshot?: string;
  scraped_at?: string;
  processing_time?: number;
  error_message?: string;
}

// Health Check
interface HealthStatus {
  status: string;
  timestamp: string;
  database: string;
  redis: string;
  version: string;
  uptime: number;
}
```

## Error Handling

### Error Handling Strategy

1. **API Level Errors:**
   - Network connectivity issues
   - HTTP status code errors (4xx, 5xx)
   - Timeout errors
   - Malformed response errors

2. **Application Level Errors:**
   - Form validation errors
   - Invalid job configurations
   - Missing or corrupted data

3. **User Experience:**
   - Toast notifications for transient errors
   - Inline error messages for form validation
   - Error boundaries for component crashes
   - Retry mechanisms for failed operations

### Error Components
- **ErrorBoundary:** React error boundary for component crashes
- **ErrorToast:** Toast notification system for errors
- **ErrorMessage:** Inline error display component
- **RetryButton:** Action button for retrying failed operations

## Testing Strategy

### Testing Approach

1. **Unit Tests (Jest + React Testing Library):**
   - Component rendering and behavior
   - Custom hooks functionality
   - Utility functions
   - Service layer methods

2. **Integration Tests:**
   - API service integration
   - Form submission workflows
   - Navigation and routing
   - State management integration

3. **End-to-End Tests (Playwright):**
   - Complete user workflows
   - Job creation and monitoring
   - Results viewing and export
   - Error scenarios

### Test Structure
```
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── components/
│   └── __tests__/
└── pages/
    └── __tests__/
```

### Testing Utilities
- **MockApiClient:** Mock API responses for testing
- **TestProviders:** Wrapper components for test setup
- **TestUtils:** Helper functions for common test operations

## User Interface Design

### Design System

#### Color Palette
- **Primary:** Blue (#3B82F6) for actions and links
- **Success:** Green (#10B981) for completed jobs
- **Warning:** Yellow (#F59E0B) for pending/in-progress jobs
- **Error:** Red (#EF4444) for failed jobs
- **Neutral:** Gray scale for text and backgrounds

#### Typography
- **Headings:** Inter font family, various weights
- **Body:** Inter font family, regular weight
- **Code:** JetBrains Mono for JSON and technical content

#### Spacing and Layout
- **Grid System:** CSS Grid and Flexbox for layouts
- **Spacing Scale:** Tailwind's spacing scale (4px base unit)
- **Responsive Breakpoints:** Mobile-first responsive design

### Page Layouts

#### 1. Dashboard Page
- Header with health status and quick actions
- Job statistics cards (total, pending, completed, failed)
- Recent jobs list with pagination
- Quick create job button

#### 2. Job Detail Page
- Job information panel with status and metadata
- Real-time status updates with polling
- Action buttons (cancel, retry, view results)
- Job configuration details

#### 3. Create Job Page
- Step-by-step job creation form
- URL input with validation
- Selector builder interface
- Advanced options panel
- Preview and submit actions

#### 4. Results Page
- Results viewer with multiple display modes
- Data export options
- Screenshot viewer (if available)
- Raw HTML viewer (optional)

### Responsive Design

The application will be fully responsive with:
- **Mobile (320px+):** Single column layout, touch-friendly interactions
- **Tablet (768px+):** Two-column layout, optimized for touch
- **Desktop (1024px+):** Full multi-column layout with sidebar navigation

### Accessibility Features

- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Reader Support:** Proper ARIA labels and roles
- **Color Contrast:** WCAG AA compliant color combinations
- **Focus Management:** Clear focus indicators and logical tab order
- **Alternative Text:** Descriptive alt text for images and icons

## Performance Considerations

### Optimization Strategies

1. **Code Splitting:** Route-based code splitting with React.lazy()
2. **Bundle Optimization:** Vite's built-in optimizations and tree shaking
3. **Image Optimization:** Lazy loading and responsive images
4. **Caching:** React Query caching for API responses
5. **Virtual Scrolling:** For large job lists and results

### Performance Monitoring

- **Core Web Vitals:** LCP, FID, CLS monitoring
- **Bundle Analysis:** Regular bundle size analysis
- **Performance Profiling:** React DevTools profiling
- **Error Tracking:** Integration with error monitoring service

## Security Considerations

### Client-Side Security

1. **Input Validation:** Client-side validation with server-side verification
2. **XSS Prevention:** Proper sanitization of user inputs and API responses
3. **HTTPS Only:** Enforce HTTPS in production
4. **Content Security Policy:** Implement CSP headers
5. **Dependency Security:** Regular security audits of dependencies

### API Integration Security

- **CORS Configuration:** Proper CORS setup for API communication
- **Authentication:** Ready for future authentication implementation
- **Rate Limiting:** Respect API rate limits
- **Error Information:** Avoid exposing sensitive error details

## Deployment Strategy

### Build Configuration

```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

### Environment Configuration

- **Development:** Local API proxy, hot reload, source maps
- **Production:** Optimized builds, CDN deployment, error tracking
- **Environment Variables:** API base URL, feature flags

### Deployment Options

1. **Static Hosting:** Netlify, Vercel, or AWS S3 + CloudFront
2. **Container Deployment:** Docker container with Nginx
3. **CI/CD Pipeline:** Automated testing and deployment

This design provides a comprehensive foundation for building a modern, scalable, and user-friendly web interface for the scraping API, with emphasis on performance, accessibility, and maintainability.