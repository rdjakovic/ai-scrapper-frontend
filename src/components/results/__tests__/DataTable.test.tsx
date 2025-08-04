import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../DataTable';

const mockData = {
  title: 'Test Page',
  description: 'A test page for scraping',
  count: 42,
  active: true,
  tags: ['web', 'scraping', 'test'],
  metadata: {
    author: 'Test Author',
    date: '2024-01-01',
  },
};

describe('DataTable', () => {
  it('renders table with data', () => {
    render(<DataTable data={mockData} />);
    
    expect(screen.getByText('Key')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('"Test Page"')).toBeInTheDocument();
    expect(screen.getByText('string')).toBeInTheDocument();
  });

  it('handles nested objects correctly', () => {
    render(<DataTable data={mockData} />);
    
    expect(screen.getByText('metadata.author')).toBeInTheDocument();
    expect(screen.getByText('"Test Author"')).toBeInTheDocument();
  });

  it('handles arrays correctly', () => {
    render(<DataTable data={mockData} />);
    
    expect(screen.getByText('tags[0]')).toBeInTheDocument();
    expect(screen.getByText('"web"')).toBeInTheDocument();
  });

  it('filters data based on search term', () => {
    render(<DataTable data={mockData} />);
    
    const searchInput = screen.getByPlaceholderText('Search keys and values...');
    fireEvent.change(searchInput, { target: { value: 'title' } });
    
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.queryByText('description')).not.toBeInTheDocument();
  });

  it('sorts data when column headers are clicked', () => {
    render(<DataTable data={mockData} />);
    
    const keyHeader = screen.getByText('Key');
    fireEvent.click(keyHeader);
    
    // Should show sort icon
    expect(keyHeader.parentElement).toContainHTML('svg');
  });

  it('shows empty state when no data', () => {
    render(<DataTable data={{}} />);
    
    expect(screen.getByText('No data available to display in table format')).toBeInTheDocument();
  });

  it('shows correct entry count', () => {
    render(<DataTable data={mockData} />);
    
    // Should show the number of flattened entries
    expect(screen.getByText(/Showing \d+ of \d+ entries/)).toBeInTheDocument();
  });
});