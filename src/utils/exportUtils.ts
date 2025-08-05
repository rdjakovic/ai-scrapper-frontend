import { JobResult } from '../types';

export type ExportFormat = 'json' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  flattenObjects?: boolean;
  customFileName?: string;
}

export interface ExportProgress {
  stage: 'preparing' | 'transforming' | 'generating' | 'downloading' | 'complete';
  progress: number; // 0-100
  message: string;
}

/**
 * Generates a standardized filename for exports
 */
export const generateExportFileName = (
  jobId: string, 
  format: ExportFormat, 
  customName?: string
): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const baseName = customName || `scraped-data-${jobId}`;
  return `${baseName}-${timestamp}.${format}`;
};

/**
 * Flattens nested objects into a flat structure with dot notation keys
 */
export const flattenObject = (
  obj: any, 
  prefix = '', 
  maxDepth = 10, 
  currentDepth = 0
): Record<string, any> => {
  const flattened: Record<string, any> = {};
  
  if (currentDepth >= maxDepth) {
    flattened[prefix || 'data'] = '[Max depth reached]';
    return flattened;
  }
  
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    
    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (value === null || value === undefined) {
      flattened[newKey] = value;
    } else if (Array.isArray(value)) {
      // Handle arrays by creating indexed keys
      if (value.length === 0) {
        flattened[newKey] = '[]';
      } else {
        value.forEach((item: any, index: number) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(
              flattened, 
              flattenObject(item, `${newKey}[${index}]`, maxDepth, currentDepth + 1)
            );
          } else {
            flattened[`${newKey}[${index}]`] = item;
          }
        });
      }
    } else if (typeof value === 'object') {
      Object.assign(
        flattened, 
        flattenObject(value, newKey, maxDepth, currentDepth + 1)
      );
    } else {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
};

/**
 * Converts data to CSV format with improved handling of complex structures
 */
export const convertToCSV = (
  data: Record<string, unknown>, 
  options: { flattenObjects?: boolean; includeMetadata?: boolean } = {}
): string => {
  const { flattenObjects = true, includeMetadata = false } = options;
  
  let processedData = data;
  
  if (flattenObjects) {
    processedData = flattenObject(data);
  }
  
  const entries = Object.entries(processedData);
  
  if (entries.length === 0) {
    return 'No data available';
  }

  // Create CSV with Key, Value, Type columns (and optionally metadata)
  const headers = ['Key', 'Value', 'Type'];
  if (includeMetadata) {
    headers.push('Length', 'Is_Array', 'Is_Object');
  }
  
  const rows = entries.map(([key, value]) => {
    const type = value === null ? 'null' : 
                 value === undefined ? 'undefined' : 
                 Array.isArray(value) ? 'array' : 
                 typeof value;
    
    const stringValue = value === null || value === undefined ? 
                       String(value) : 
                       JSON.stringify(value);
    
    const row = [
      escapeCSVValue(key),
      escapeCSVValue(stringValue),
      escapeCSVValue(type)
    ];
    
    if (includeMetadata) {
      const length = Array.isArray(value) ? value.length : 
                    typeof value === 'string' ? value.length : 
                    typeof value === 'object' && value !== null ? Object.keys(value).length : 
                    0;
      
      row.push(
        String(length),
        String(Array.isArray(value)),
        String(typeof value === 'object' && value !== null && !Array.isArray(value))
      );
    }
    
    return row;
  });

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

/**
 * Converts data to tabular CSV format when data contains arrays of objects
 */
export const convertToTabularCSV = (data: Record<string, unknown>): string => {
  // Find arrays of objects that can be converted to tabular format
  const arrays = Object.entries(data).filter(([_, value]) => 
    Array.isArray(value) && 
    value.length > 0 && 
    value.every(item => typeof item === 'object' && item !== null)
  );
  
  if (arrays.length === 0) {
    return convertToCSV(data);
  }
  
  // Use the first suitable array for tabular conversion
  const [arrayKey, arrayValue] = arrays[0];
  const items = arrayValue as Record<string, unknown>[];
  
  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  items.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  
  const headers = Array.from(allKeys);
  const rows = items.map(item => 
    headers.map(header => escapeCSVValue(String(item[header] ?? '')))
  );
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

/**
 * Escapes CSV values properly
 */
export const escapeCSVValue = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Converts data to formatted JSON string
 */
export const convertToJSON = (
  data: Record<string, unknown>, 
  options: { pretty?: boolean; includeMetadata?: boolean } = {}
): string => {
  const { pretty = true, includeMetadata = false } = options;
  
  let exportData = data;
  
  if (includeMetadata) {
    exportData = {
      data,
      metadata: {
        exportedAt: new Date().toISOString(),
        dataType: Array.isArray(data) ? 'array' : typeof data,
        itemCount: Array.isArray(data) ? data.length : Object.keys(data).length
      }
    };
  }
  
  return JSON.stringify(exportData, null, pretty ? 2 : 0);
};

/**
 * Estimates the size of the export data for progress calculation
 */
export const estimateExportSize = (data: Record<string, unknown>): number => {
  const jsonString = JSON.stringify(data);
  return jsonString.length;
};

/**
 * Creates a download blob and triggers download
 */
export const downloadFile = (
  content: string, 
  filename: string, 
  mimeType: string
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Simulates progress for export operations
 */
export const createProgressSimulator = (
  onProgress: (progress: ExportProgress) => void,
  totalDuration = 2000
): Promise<void> => {
  return new Promise((resolve) => {
    const stages: Array<{ stage: ExportProgress['stage']; message: string; duration: number }> = [
      { stage: 'preparing', message: 'Preparing data for export...', duration: 0.2 },
      { stage: 'transforming', message: 'Transforming data format...', duration: 0.4 },
      { stage: 'generating', message: 'Generating export file...', duration: 0.3 },
      { stage: 'downloading', message: 'Starting download...', duration: 0.1 }
    ];
    
    let currentProgress = 0;
    let stageIndex = 0;
    
    const updateProgress = () => {
      if (stageIndex >= stages.length) {
        onProgress({
          stage: 'complete',
          progress: 100,
          message: 'Export completed successfully!'
        });
        resolve();
        return;
      }
      
      const stage = stages[stageIndex];
      const stageProgress = Math.min(currentProgress + (stage.duration * 100), (stageIndex + 1) * (100 / stages.length));
      
      onProgress({
        stage: stage.stage,
        progress: Math.round(stageProgress),
        message: stage.message
      });
      
      if (stageProgress >= (stageIndex + 1) * (100 / stages.length)) {
        stageIndex++;
        currentProgress = stageProgress;
      } else {
        currentProgress = stageProgress;
      }
      
      setTimeout(updateProgress, totalDuration / 20);
    };
    
    updateProgress();
  });
};

/**
 * Main export function that handles the complete export process
 */
export const exportJobResult = async (
  jobResult: JobResult,
  options: ExportOptions,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> => {
  if (!jobResult.data) {
    throw new Error('No data available for export');
  }
  
  const dataSize = estimateExportSize(jobResult.data);
  const isLargeDataset = dataSize > 100000; // 100KB threshold
  
  if (isLargeDataset && onProgress) {
    // Show progress for large datasets
    await createProgressSimulator(onProgress);
  } else if (onProgress) {
    // Quick progress for small datasets
    onProgress({ stage: 'preparing', progress: 50, message: 'Preparing export...' });
  }
  
  try {
    let content: string;
    let mimeType: string;
    
    if (options.format === 'json') {
      content = convertToJSON(jobResult.data, {
        pretty: true,
        includeMetadata: options.includeMetadata
      });
      mimeType = 'application/json';
    } else if (options.format === 'csv') {
      // Try tabular format first, fall back to key-value format
      try {
        content = convertToTabularCSV(jobResult.data);
      } catch {
        content = convertToCSV(jobResult.data, {
          flattenObjects: options.flattenObjects,
          includeMetadata: options.includeMetadata
        });
      }
      mimeType = 'text/csv';
    } else {
      throw new Error(`Unsupported export format: ${options.format}`);
    }
    
    const filename = generateExportFileName(
      jobResult.job_id,
      options.format,
      options.customFileName
    );
    
    downloadFile(content, filename, mimeType);
    
    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: 'Export completed successfully!'
      });
    }
  } catch (error) {
    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 0,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    throw error;
  }
};

/**
 * Simple CSV export function for tests
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (!Array.isArray(data)) {
    data = [data];
  }
  
  let content: string;
  if (data.length === 0) {
    content = 'No data available';
  } else {
    // Convert array of objects to CSV
    const headers = Object.keys(data[0] || {});
    const rows = data.map(item => 
      headers.map(header => escapeCSVValue(String(item[header] ?? '')))
    );
    content = [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  downloadFile(content, `${filename}.csv`, 'text/csv');
};

/**
 * Simple JSON export function for tests
 */
export const exportToJSON = (data: any[], filename: string): void => {
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, `${filename}.json`, 'application/json');
};