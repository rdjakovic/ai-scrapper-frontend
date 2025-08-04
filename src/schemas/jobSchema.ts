import { z } from 'zod';

// URL validation schema
const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .url('Please enter a valid URL')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    'URL must use HTTP or HTTPS protocol'
  );

// Selectors validation schema
const selectorsSchema = z
  .record(z.string(), z.string().min(1, 'Selector cannot be empty'))
  .optional()
  .refine(
    (selectors) => {
      if (!selectors) return true;
      return Object.keys(selectors).length > 0;
    },
    'At least one selector must be provided if selectors are specified'
  );

// Headers validation schema
const headersSchema = z
  .record(z.string(), z.string())
  .optional()
  .refine(
    (headers) => {
      if (!headers) return true;
      // Validate header names (basic validation)
      return Object.keys(headers).every(key => 
        /^[a-zA-Z0-9\-_]+$/.test(key) && key.length > 0
      );
    },
    'Header names must contain only alphanumeric characters, hyphens, and underscores'
  );

// Job metadata validation schema
const metadataSchema = z
  .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
  .optional();

// Main job creation form schema
export const jobFormSchema = z.object({
  url: urlSchema,
  selectors: selectorsSchema,
  wait_for: z
    .string()
    .optional()
    .refine(
      (selector) => {
        if (!selector) return true;
        // Basic CSS selector validation
        try {
          document.querySelector(selector);
          return true;
        } catch {
          return false;
        }
      },
      'Please enter a valid CSS selector'
    ),
  timeout: z
    .number()
    .min(1, 'Timeout must be at least 1 second')
    .max(300, 'Timeout cannot exceed 300 seconds')
    .optional(),
  javascript: z.boolean().optional(),
  user_agent: z.string().optional(),
  headers: headersSchema,
  job_metadata: metadataSchema,
});

export type JobFormData = z.infer<typeof jobFormSchema>;

// Explicit type for form handling
export interface JobFormFields {
  url: string;
  selectors?: Record<string, string>;
  wait_for?: string;
  timeout: number;
  javascript: boolean;
  user_agent?: string;
  headers?: Record<string, string>;
  job_metadata?: Record<string, string | number | boolean>;
}

// Individual field schemas for component-level validation
export const selectorSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  selector: z.string().min(1, 'CSS selector is required'),
});

export type SelectorData = z.infer<typeof selectorSchema>;

export const headerSchema = z.object({
  name: z.string().min(1, 'Header name is required'),
  value: z.string().min(1, 'Header value is required'),
});

export type HeaderData = z.infer<typeof headerSchema>;