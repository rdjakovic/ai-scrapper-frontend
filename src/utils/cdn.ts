/**
 * CDN utilities for asset optimization and delivery
 */

import { config } from '../config/environment';

/**
 * Get optimized image URL with CDN support
 */
export function getImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string {
  if (!config.cdnUrl) {
    return src;
  }

  const url = new URL(src, config.cdnUrl);
  
  if (options.width) {
    url.searchParams.set('w', options.width.toString());
  }
  
  if (options.height) {
    url.searchParams.set('h', options.height.toString());
  }
  
  if (options.quality) {
    url.searchParams.set('q', options.quality.toString());
  }
  
  if (options.format) {
    url.searchParams.set('f', options.format);
  }

  return url.toString();
}

/**
 * Preload critical assets
 */
export function preloadAssets(assets: string[]): void {
  assets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = asset;
    
    // Determine resource type based on file extension
    const extension = asset.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'css':
        link.as = 'style';
        break;
      case 'js':
        link.as = 'script';
        break;
      case 'woff':
      case 'woff2':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'avif':
        link.as = 'image';
        break;
      default:
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  src: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
): string {
  if (!config.cdnUrl) {
    return src;
  }

  return sizes
    .map(size => `${getImageUrl(src, { width: size })} ${size}w`)
    .join(', ');
}

/**
 * Optimize font loading
 */
export function optimizeFontLoading(): void {
  // Preload critical fonts
  const criticalFonts = [
    '/assets/fonts/inter-regular.woff2',
    '/assets/fonts/inter-medium.woff2',
    '/assets/fonts/inter-semibold.woff2',
  ];

  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Service Worker registration for caching
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && config.isProduction) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}