/**
 * Global type declarations for build-time constants
 */

declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;

/**
 * Vite environment variables type augmentation
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_CDN_URL?: string;
  readonly VITE_ASSETS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}