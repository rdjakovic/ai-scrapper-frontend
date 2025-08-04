/**
 * Accessibility utilities for the web scraping UI
 * Provides helpers for ARIA attributes, keyboard navigation, and focus management
 */
import React from 'react';

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-required'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-pressed'?: boolean;
  role?: string;
}

/**
 * Generate unique IDs for form fields and ARIA relationships
 */
export const generateId = (prefix: string = 'field'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create ARIA attributes for form fields
 */
export const createFieldAria = (
  options: {
    required?: boolean;
    invalid?: boolean;
    describedBy?: string[];
    labelledBy?: string;
  } = {}
): AriaAttributes => {
  const { required, invalid, describedBy, labelledBy } = options;
  
  return {
    'aria-required': required,
    'aria-invalid': invalid,
    'aria-describedby': describedBy?.join(' '),
    'aria-labelledby': labelledBy,
  };
};

/**
 * Create ARIA attributes for buttons
 */
export const createButtonAria = (
  options: {
    expanded?: boolean;
    pressed?: boolean;
    disabled?: boolean;
    describedBy?: string;
  } = {}
): AriaAttributes => {
  const { expanded, pressed, disabled, describedBy } = options;
  
  return {
    'aria-expanded': expanded,
    'aria-pressed': pressed,
    'aria-disabled': disabled,
    'aria-describedby': describedBy,
  };
};

/**
 * Create ARIA attributes for status indicators
 */
export const createStatusAria = (
  status: 'success' | 'error' | 'warning' | 'info',
  message: string
): AriaAttributes => {
  return {
    role: status === 'error' ? 'alert' : 'status',
    'aria-live': status === 'error' ? 'assertive' : 'polite',
    'aria-atomic': true,
    'aria-label': `${status}: ${message}`,
  };
};

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  /**
   * Trap focus within a container (useful for modals)
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Move focus to the next/previous focusable element
   */
  static moveFocus(direction: 'next' | 'previous', container?: HTMLElement): void {
    const root = container || document.body;
    const focusableElements = this.getFocusableElements(root);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

    focusableElements[nextIndex]?.focus();
  }
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
  /**
   * Handle arrow key navigation for lists
   */
  handleArrowKeys: (
    event: React.KeyboardEvent | KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        onIndexChange((currentIndex + 1) % items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        onIndexChange((currentIndex - 1 + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        break;
      case 'End':
        event.preventDefault();
        onIndexChange(items.length - 1);
        break;
    }
  },

  /**
   * Handle Enter and Space key activation
   */
  handleActivation: (event: React.KeyboardEvent | KeyboardEvent, callback: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }
};

/**
 * Screen reader utilities
 */
export const ScreenReader = {
  /**
   * Announce a message to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Create visually hidden text for screen readers
   */
  createHiddenText: (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  }
};

/**
 * Color contrast utilities for WCAG AA compliance
 */
export const ColorContrast = {
  /**
   * Calculate relative luminance of a color
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]): number => {
    const lum1 = ColorContrast.getLuminance(...color1);
    const lum2 = ColorContrast.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAGAA: (color1: [number, number, number], color2: [number, number, number]): boolean => {
    return ColorContrast.getContrastRatio(color1, color2) >= 4.5;
  }
};