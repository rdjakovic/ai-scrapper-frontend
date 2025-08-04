import { AppConfig } from '../types';

// Environment configuration with defaults
const getConfig = (): AppConfig => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  // Default to development API URL if not specified
  const defaultApiUrl = isDevelopment ? 'http://localhost:8000' : '';
  
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || defaultApiUrl,
    environment: isProduction ? 'production' : isDevelopment ? 'development' : 'test'
  };
};

export const config = getConfig();

// Validate required configuration
if (!config.apiBaseUrl) {
  throw new Error('API base URL is required. Set VITE_API_BASE_URL environment variable.');
}