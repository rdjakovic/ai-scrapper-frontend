import React, { useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface DataTableProps {
  data: Record<string, unknown>;
  className?: string;
  maxHeight?: number;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface TableRow {
  key: string;
  value: unknown;
  type: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  className = '',
  maxHeight = 600,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  const [searchTerm, setSearchTerm] = useState('');

  // Convert data to table rows
  const tableRows = useMemo((): TableRow[] => {
    const rows: TableRow[] = [];
    
    const processValue = (key: string, value: unknown, prefix = ''): void => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || value === undefined) {
        rows.push({ key: fullKey, value: value, type: 'null' });
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          rows.push({ key: fullKey, value: '[]', type: 'array' });
        } else {
          value.forEach((item, index) => {
            processValue(`[${index}]`, item, fullKey);
          });
        }
      } else if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        if (Object.keys(obj).length === 0) {
          rows.push({ key: fullKey, value: '{}', type: 'object' });
        } else {
          Object.entries(obj).forEach(([nestedKey, nestedValue]) => {
            processValue(nestedKey, nestedValue, fullKey);
          });
        }
      } else {
        rows.push({ 
          key: fullKey, 
          value: value, 
          type: typeof value 
        });
      }
    };

    Object.entries(data).forEach(([key, value]) => {
      processValue(key, value);
    });

    return rows;
  }, [data]);

  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return tableRows;
    
    const term = searchTerm.toLowerCase();
    return tableRows.filter(row => 
      row.key.toLowerCase().includes(term) ||
      String(row.value).toLowerCase().includes(term)
    );
  }, [tableRows, searchTerm]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredRows;
    }

    return [...filteredRows].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortConfig.key === 'key') {
        aValue = a.key;
        bValue = b.key;
      } else if (sortConfig.key === 'value') {
        aValue = String(a.value);
        bValue = String(b.value);
      } else if (sortConfig.key === 'type') {
        aValue = a.type;
        bValue = b.type;
      } else {
        return 0;
      }

      // Try to parse as numbers for numeric sorting
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        aValue = aNum;
        bValue = bNum;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredRows, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        // Cycle through: asc -> desc -> null
        const direction = prevConfig.direction === 'asc' ? 'desc' : 
                         prevConfig.direction === 'desc' ? null : 'asc';
        return { key: direction ? key : '', direction };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else if (sortConfig.direction === 'desc') {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }

    return null;
  };

  const formatValue = (value: unknown, type: string): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (type === 'string') return `"${value}"`;
    if (type === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'string': return 'text-green-600 bg-green-50';
      case 'number': return 'text-blue-600 bg-blue-50';
      case 'boolean': return 'text-purple-600 bg-purple-50';
      case 'null': return 'text-gray-600 bg-gray-50';
      case 'array': return 'text-orange-600 bg-orange-50';
      case 'object': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Virtual scrolling setup
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Estimated row height
    overscan: 10,
  });

  if (tableRows.length === 0) {
    return (
      <div className={`p-6 text-center text-gray-500 ${className}`}>
        No data available to display in table format
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search keys and values..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredRows.length} of {tableRows.length} entries
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 px-4 py-3">
            <div className="col-span-5">
              <button
                onClick={() => handleSort('key')}
                className="flex items-center space-x-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
              >
                <span>Key</span>
                {getSortIcon('key')}
              </button>
            </div>
            <div className="col-span-5">
              <button
                onClick={() => handleSort('value')}
                className="flex items-center space-x-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
              >
                <span>Value</span>
                {getSortIcon('value')}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('type')}
                className="flex items-center space-x-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
              >
                <span>Type</span>
                {getSortIcon('type')}
              </button>
            </div>
          </div>
        </div>

        {/* Virtual scrolling container */}
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: `${Math.min(maxHeight, sortedRows.length * 48 + 100)}px` }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = sortedRows[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 h-full items-center">
                    <div className="col-span-5">
                      <span className="text-sm font-mono text-gray-900 break-all">
                        {row.key}
                      </span>
                    </div>
                    <div className="col-span-5">
                      <span className="text-sm text-gray-900 break-all">
                        {formatValue(row.value, row.type)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(row.type)}`}>
                        {row.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};