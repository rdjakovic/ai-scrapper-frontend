/**
 * Environment configuration utility
 * Centralizes all environment variable access and provides type safety
 */

export interface AppConfig {
  apiBaseUrl: string;
  appTitle: string;
  appDescription: string;
  enableDevtools: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  cdnUrl?: string;
  assetsUrl?: string;
  version: string;
  buildTime: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
}

/**
 * Get environment variable with optional default value
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not defined`);
  }
  return value || defaultValue || '';
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Application configuration object
 */
export const config: AppConfig = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000'),
  
  // App Metadata
  appTitle: getEnvVar('VITE_APP_TITLE', 'Web Scraping Dashboard'),
  appDescription: getEnvVar('VITE_APP_DESCRIPTION', 'Professional web scraping management interface'),
  
  // Development Configuration
  enableDevtools: getBooleanEnvVar('VITE_ENABLE_DEVTOOLS', import.meta.env.DEV),
  logLevel: (getEnvVar('VITE_LOG_LEVEL', 'info') as AppConfig['logLevel']),
  
  // CDN Configuration (optional)
  cdnUrl: import.meta.env.VITE_CDN_URL,
  assetsUrl: import.meta.env.VITE_ASSETS_URL,
  
  // Build Information
  version: __APP_VERSION__ || '1.0.0',
  buildTime: __BUILD_TIME__ || new Date().toISOString(),
  
  // Environment Detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isStaging: import.meta.env.MODE === 'staging',
};

/**
 * Validate configuration on startup
 */
export function validateConfig(): void {
  const requiredVars = [
    'VITE_API_BASE_URL',
  ];
  
  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate API URL format
  try {
    new URL(config.apiBaseUrl);
  } catch {
    throw new Error(`Invalid API base URL: ${config.apiBaseUrl}`);
  }
  
  // Log configuration in development
  if (config.isDevelopment) {
    console.log('App Configuration:', {
      ...config,
      // Don't log sensitive information
    });
  }
}

/**
 * Get asset URL with CDN support
 */
export function getAssetUrl(path: string): string {
  if (config.assetsUrl) {
    return `${config.assetsUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path;
}

/**
 * Get API endpoint URL
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = config.apiBaseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

// Validate configuration on module load
validateConfig();