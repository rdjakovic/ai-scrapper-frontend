# Web Scraping UI

A modern React TypeScript frontend for the web scraping dashboard.

## Features

- **Modern Stack**: Built with Vite, React 18, and TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Code Quality**: ESLint, Prettier, and TypeScript for code quality
- **Development**: Hot reload, fast builds, and optimized development experience
- **API Integration**: Configured proxy for local API development
- **Job Management**: Create, monitor, and clone scraping jobs
- **Form Validation**: Comprehensive form validation with real-time feedback
- **Clone Functionality**: Duplicate existing jobs with pre-filled form data

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building

Build for production:

```bash
npm run build
```

### Code Quality

Run linting:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services and external integrations
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── styles/        # Global styles and Tailwind CSS
```

## API Integration

The frontend is configured to proxy API requests to `http://localhost:8000` during development. Make sure your backend API is running on port 8000.

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Key Features

### Job Cloning Workflow

The application supports cloning existing jobs to create new ones with pre-filled form data:

1. **Access Clone Function**: Click the "Clone" button on any completed job
2. **Pre-filled Form**: The clone form automatically populates with:
   - Original URL
   - CSS selectors configuration
   - Advanced options (timeout, JavaScript settings, headers, etc.)
3. **Edit and Customize**: Modify any fields as needed before creating the new job
4. **Submit**: Click "Clone Job" to create a new job with the customized settings
5. **Navigation**: Automatically redirect to the new job's detail page

### Form Validation

- Real-time URL validation with HTTPS indicators
- CSS selector syntax validation
- Required field enforcement
- Error messaging with contextual help

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

The test suite includes:
- Unit tests for utility functions like `mapJobToFormData`
- Integration tests for the complete clone workflow
- Form validation and error handling tests
- Accessibility and UX tests

## Development Guidelines

- Use TypeScript for all new files
- Follow the established component structure
- Use Tailwind CSS classes for styling
- Write meaningful commit messages
- Run linting and formatting before committing
- Write tests for new functionality
- Follow React best practices and hooks patterns
