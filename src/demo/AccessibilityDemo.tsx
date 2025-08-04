import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { FocusManager, ScreenReader, KeyboardNavigation } from '../utils/accessibility';

/**
 * Accessibility Demo Component
 * Demonstrates and tests accessibility features implemented in the application
 */
const AccessibilityDemo: React.FC = () => {
  const [focusDemo, setFocusDemo] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const { register, formState: { errors } } = useForm();

  const handleFocusDemo = () => {
    setFocusDemo(true);
    const container = document.getElementById('focus-demo-container');
    if (container) {
      const cleanup = FocusManager.trapFocus(container);
      setTimeout(() => {
        cleanup();
        setFocusDemo(false);
      }, 5000);
    }
  };

  const handleScreenReaderAnnouncement = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    ScreenReader.announce(message, priority);
    setAnnouncements(prev => [...prev, `${priority.toUpperCase()}: ${message}`]);
  };

  const handleKeyboardNavigation = (event: React.KeyboardEvent) => {
    const container = event.currentTarget as HTMLElement;
    const buttons = Array.from(container.querySelectorAll('button')) as HTMLElement[];
    const currentIndex = buttons.findIndex(btn => btn === document.activeElement);
    
    if (currentIndex !== -1) {
      KeyboardNavigation.handleArrowKeys(event, buttons, currentIndex, (newIndex) => {
        buttons[newIndex]?.focus();
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Accessibility Features Demo
        </h1>
        
        {/* Skip Link Demo */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Skip Links
          </h2>
          <p className="text-gray-600 mb-4">
            Press Tab to see the skip link appear. This allows keyboard users to skip to main content.
          </p>
          <a
            href="#main-demo-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:shadow-lg"
          >
            Skip to demo content
          </a>
        </section>

        {/* Form Accessibility Demo */}
        <section className="mb-8" id="main-demo-content">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Form Accessibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Email Address"
              required
              error={errors.email?.message as string}
              helpText="We'll never share your email with anyone else."
            >
              <input
                type="email"
                className="input"
                placeholder="Enter your email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </FormField>

            <FormField
              label="Password"
              required
              error={errors.password?.message as string}
            >
              <input
                type="password"
                className="input"
                placeholder="Enter your password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
              />
            </FormField>
          </div>
        </section>

        {/* Status Badge Demo */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Status Indicators with ARIA
          </h2>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="completed" />
            <StatusBadge status="failed" />
            <StatusBadge status="pending" />
            <StatusBadge status="in_progress" />
            <StatusBadge status="cancelled" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Each status badge includes proper ARIA attributes and screen reader announcements.
          </p>
        </section>

        {/* Focus Management Demo */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Focus Management
          </h2>
          <div className="space-y-4">
            <button
              onClick={handleFocusDemo}
              className="btn btn-primary"
              disabled={focusDemo}
            >
              {focusDemo ? 'Focus Trapped (5s)' : 'Demo Focus Trap'}
            </button>
            
            {focusDemo && (
              <div
                id="focus-demo-container"
                className="p-4 border-2 border-primary-500 rounded-lg bg-primary-50"
                role="dialog"
                aria-label="Focus trap demonstration"
              >
                <h3 className="font-semibold mb-2">Focus is trapped in this area</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Try pressing Tab or Shift+Tab. Focus will cycle within this container.
                </p>
                <div className="space-x-2">
                  <button className="btn btn-secondary">Button 1</button>
                  <button className="btn btn-secondary">Button 2</button>
                  <button className="btn btn-secondary">Button 3</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Keyboard Navigation Demo */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Keyboard Navigation
          </h2>
          <p className="text-gray-600 mb-4">
            Focus on the first button below and use arrow keys to navigate.
          </p>
          <div
            className="flex flex-wrap gap-2 p-4 border border-gray-300 rounded-lg"
            onKeyDown={handleKeyboardNavigation}
            role="toolbar"
            aria-label="Navigation demo toolbar"
          >
            <button className="btn btn-secondary" tabIndex={0}>First</button>
            <button className="btn btn-secondary" tabIndex={-1}>Second</button>
            <button className="btn btn-secondary" tabIndex={-1}>Third</button>
            <button className="btn btn-secondary" tabIndex={-1}>Fourth</button>
          </div>
        </section>

        {/* Screen Reader Demo */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Screen Reader Announcements
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleScreenReaderAnnouncement('This is a polite announcement')}
                className="btn btn-secondary"
              >
                Polite Announcement
              </button>
              <button
                onClick={() => handleScreenReaderAnnouncement('This is an assertive announcement', 'assertive')}
                className="btn btn-danger"
              >
                Assertive Announcement
              </button>
            </div>
            
            {announcements.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Recent Announcements:</h3>
                <ul className="text-sm space-y-1">
                  {announcements.slice(-5).map((announcement, index) => (
                    <li key={index} className="text-gray-600">
                      {announcement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Responsive Design Demo */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Responsive Design
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-primary-100 p-4 rounded-lg">
              <h3 className="font-semibold">Mobile First</h3>
              <p className="text-sm text-gray-600">
                Single column on mobile
              </p>
            </div>
            <div className="bg-success-100 p-4 rounded-lg">
              <h3 className="font-semibold">Tablet</h3>
              <p className="text-sm text-gray-600">
                Two columns on tablet
              </p>
            </div>
            <div className="bg-warning-100 p-4 rounded-lg">
              <h3 className="font-semibold">Desktop</h3>
              <p className="text-sm text-gray-600">
                Three columns on desktop
              </p>
            </div>
          </div>
        </section>

        {/* Color Contrast Demo */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            WCAG AA Color Contrast
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="bg-primary-600 text-white p-3 rounded">
                Primary on White (AA Compliant)
              </div>
              <div className="bg-success-600 text-white p-3 rounded">
                Success on White (AA Compliant)
              </div>
              <div className="bg-error-600 text-white p-3 rounded">
                Error on White (AA Compliant)
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-100 text-gray-900 p-3 rounded border">
                Gray Text on Light Background
              </div>
              <div className="bg-gray-800 text-gray-100 p-3 rounded">
                Light Text on Dark Background
              </div>
              <div className="bg-warning-100 text-warning-800 p-3 rounded border border-warning-200">
                Warning Colors (AA Compliant)
              </div>
            </div>
          </div>
        </section>

        {/* Touch Target Demo */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Touch Targets (44px minimum)
          </h2>
          <div className="flex flex-wrap gap-2">
            <button className="touch-target btn btn-primary">
              Touch Target
            </button>
            <button className="touch-target btn btn-secondary">
              44px Min
            </button>
            <button className="touch-target btn btn-danger">
              Mobile Ready
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            All interactive elements meet the 44px minimum touch target size for mobile accessibility.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AccessibilityDemo;