import React, { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { JobFormData } from '../../schemas/jobSchema';

interface SelectorBuilderProps {
  setValue: UseFormSetValue<JobFormData>;
  watch: UseFormWatch<JobFormData>;
  error?: string;
}

interface SelectorItem {
  id: string;
  name: string;
  selector: string;
}

const SelectorBuilder: React.FC<SelectorBuilderProps> = ({
  setValue,
  watch,
  error,
}) => {
  const currentSelectors = watch('selectors') || {};
  const [selectors, setSelectors] = useState<SelectorItem[]>(() => {
    return Object.entries(currentSelectors).map(([name, selector], index) => ({
      id: `selector-${index}`,
      name,
      selector: String(selector),
    }));
  });

  const [newSelector, setNewSelector] = useState({ name: '', selector: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateSelector = (selector: string): boolean => {
    if (!selector.trim()) return false;
    try {
      document.querySelector(selector);
      return true;
    } catch {
      return false;
    }
  };

  const addSelector = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newSelector.name.trim()) {
      newErrors.name = 'Field name is required';
    }
    
    if (!newSelector.selector.trim()) {
      newErrors.selector = 'CSS selector is required';
    } else if (!validateSelector(newSelector.selector)) {
      newErrors.selector = 'Invalid CSS selector';
    }

    // Check for duplicate names
    if (selectors.some(s => s.name === newSelector.name.trim())) {
      newErrors.name = 'Field name must be unique';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const newItem: SelectorItem = {
        id: `selector-${Date.now()}`,
        name: newSelector.name.trim(),
        selector: newSelector.selector.trim(),
      };

      const updatedSelectors = [...selectors, newItem];
      setSelectors(updatedSelectors);
      
      // Update form value
      const selectorsObject = updatedSelectors.reduce((acc, item) => {
        acc[item.name] = item.selector;
        return acc;
      }, {} as Record<string, string>);
      
      setValue('selectors', selectorsObject);
      setNewSelector({ name: '', selector: '' });
      setErrors({});
    }
  };

  const removeSelector = (id: string) => {
    const updatedSelectors = selectors.filter(s => s.id !== id);
    setSelectors(updatedSelectors);
    
    // Update form value
    const selectorsObject = updatedSelectors.reduce((acc, item) => {
      acc[item.name] = item.selector;
      return acc;
    }, {} as Record<string, string>);
    
    setValue('selectors', Object.keys(selectorsObject).length > 0 ? selectorsObject : undefined);
  };

  const updateSelector = (id: string, field: 'name' | 'selector', value: string) => {
    const updatedSelectors = selectors.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    setSelectors(updatedSelectors);
    
    // Update form value
    const selectorsObject = updatedSelectors.reduce((acc, item) => {
      if (item.name.trim() && item.selector.trim()) {
        acc[item.name] = item.selector;
      }
      return acc;
    }, {} as Record<string, string>);
    
    setValue('selectors', Object.keys(selectorsObject).length > 0 ? selectorsObject : undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          CSS Selectors
        </label>
        <span className="text-xs text-gray-500">
          Define what data to extract from the page
        </span>
      </div>

      {/* Existing selectors */}
      {selectors.length > 0 && (
        <div className="space-y-3">
          {selectors.map((selector) => (
            <div key={selector.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Field name (e.g., title)"
                  value={selector.name}
                  onChange={(e) => updateSelector(selector.id, 'name', e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-2">
                <input
                  type="text"
                  placeholder="CSS selector (e.g., h1, .title, #main-content)"
                  value={selector.selector}
                  onChange={(e) => updateSelector(selector.id, 'selector', e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSelector(selector.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="Remove selector"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new selector */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="Field name (e.g., title, price, description)"
                value={newSelector.name}
                onChange={(e) => setNewSelector(prev => ({ ...prev, name: e.target.value }))}
                className={`
                  block w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.name ? 'border-red-300' : 'border-gray-300'}
                `}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="CSS selector (e.g., h1, .title, #main-content)"
                value={newSelector.selector}
                onChange={(e) => setNewSelector(prev => ({ ...prev, selector: e.target.value }))}
                className={`
                  block w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.selector ? 'border-red-300' : 'border-gray-300'}
                `}
              />
              {errors.selector && (
                <p className="mt-1 text-xs text-red-600">{errors.selector}</p>
              )}
            </div>
          </div>
          
          <button
            type="button"
            onClick={addSelector}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Selector
          </button>
        </div>
      </div>

      {/* Helpful tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">CSS Selector Tips</h4>
            <div className="mt-1 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-blue-100 px-1 rounded">h1</code> - Select by tag name</li>
                <li><code className="bg-blue-100 px-1 rounded">.class-name</code> - Select by class</li>
                <li><code className="bg-blue-100 px-1 rounded">#element-id</code> - Select by ID</li>
                <li><code className="bg-blue-100 px-1 rounded">[data-testid="value"]</code> - Select by attribute</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default SelectorBuilder;