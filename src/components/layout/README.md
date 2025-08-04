# Layout Components

This directory contains the core layout components for the Web Scraping UI application.

## Components

### AppLayout
The main layout wrapper that provides the overall structure for the application.

**Features:**
- Responsive design with header, sidebar, and main content area
- Supports both children prop and React Router Outlet
- Sticky header with health status indicator
- Collapsible sidebar navigation

**Usage:**
```tsx
import { AppLayout } from '../components';

// With children
<AppLayout>
  <YourPageContent />
</AppLayout>

// With React Router (uses Outlet)
<AppLayout />
```

### Header
The application header component with branding and health status.

**Features:**
- Application title/branding
- Real-time health status indicator with visual feedback
- Sticky positioning for consistent visibility
- Responsive design

**Health Status Indicators:**
- Green dot: API is healthy
- Red dot: API is unavailable
- Gray dot (pulsing): Checking API status

### Sidebar
The navigation sidebar with route-based active states.

**Features:**
- Navigation menu with icons and descriptions
- Active state management using React Router
- Hover effects and smooth transitions
- Accessible navigation with proper ARIA attributes
- Version information in footer

**Navigation Items:**
- Dashboard: Overview and statistics
- Create Job: Start new scraping jobs
- Jobs: View and manage all jobs
- Results: Browse job results
- Health: System health monitoring

## Styling

All components use Tailwind CSS for styling with:
- Consistent color scheme (grays, blues for primary actions)
- Responsive breakpoints
- Smooth transitions and hover effects
- Accessibility-compliant contrast ratios

## Dependencies

- React Router DOM for navigation
- Custom hooks for health status monitoring
- Tailwind CSS for styling

## Testing

Basic tests are included to verify:
- Component rendering
- Navigation functionality
- Health status display
- Content rendering

Run tests with:
```bash
npm test
```