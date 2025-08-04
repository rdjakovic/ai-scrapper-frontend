# Web Scraping UI

A modern React TypeScript frontend for the web scraping dashboard.

## Features

- **Modern Stack**: Built with Vite, React 18, and TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Code Quality**: ESLint, Prettier, and TypeScript for code quality
- **Development**: Hot reload, fast builds, and optimized development experience
- **API Integration**: Configured proxy for local API development

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

## Development Guidelines

- Use TypeScript for all new files
- Follow the established component structure
- Use Tailwind CSS classes for styling
- Write meaningful commit messages
- Run linting and formatting before committing