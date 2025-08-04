import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultsViewer } from '../ResultsViewer';
import { JobResult, JobStatus } from '../../../types';

// Mock the child components
jest.mock('../DataTable', () => ({
  DataTable: ({ data }: { data: Record<string, unknown> }) => (
    <div data-testid="data-table">DataTable with {Object.keys(data).length} keys</div>
  ),
}));

jest.mock('../JsonViewer', () => ({
  JsonViewer: ({ data }: { data: Record<string, unknown> }) => (
    <div data-testid="json-viewer">JsonViewer with {Object.keys(data).length} keys</div>
  ),
}));

jest.mock('../ExportButton', () => ({
  ExportButton: () => <div data-testid="export-button">Export Button</div>,
}));

const mockJobResult: JobResult = {
  job_id: 'test-job-123',
  url: 'https://example.com',
  status: JobStatus.COMPLETED,
  data: {
    title: 'Test Page',
    description: 'A test page for scraping',
    links: ['https://example.com/link1', 'https://example.com/link2'],
  },
  scraped_at: '2024-01-01T12:00:00Z',
  processing_time: 1500,
};

describe('ResultsViewer', () => {
  it('renders loading state', () => {
    render(<ResultsViewer jobResult={mockJobResult} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<ResultsViewer jobResult={mockJobResult} error="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders no results state when data is empty', () => {
    const emptyResult = { ...mockJobResult, data: undefined };
    render(<ResultsViewer jobResult={emptyResult} />);
    expect(screen.getByText(/No Results Available/)).toBeInTheDocument();
  });

  it('renders results with data', () => {
    render(<ResultsViewer jobResult={mockJobResult} />);
    
    expect(screen.getByText('Scraped Results')).toBeInTheDocument();
    expect(screen.getByText(/Scraped from https:\/\/example\.com/)).toBeInTheDocument();
    expect(screen.getByText('Table View')).toBeInTheDocument();
    expect(screen.getByText('JSON View')).toBeInTheDocument();
    expect(screen.getByText('Raw Data')).toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByTestId('export-button')).toBeInTheDocument();
  });

  it('shows screenshot button when screenshot is available', () => {
    const resultWithScreenshot = { ...mockJobResult, screenshot: 'base64-screenshot-data' };
    render(<ResultsViewer jobResult={resultWithScreenshot} />);
    
    expect(screen.getByText('View Screenshot')).toBeInTheDocument();
  });

  it('shows processing time when available', () => {
    render(<ResultsViewer jobResult={mockJobResult} />);
    
    expect(screen.getByText('Processing time: 1500ms')).toBeInTheDocument();
  });
});