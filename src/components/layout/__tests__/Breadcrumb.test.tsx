import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb';

const TestWrapper: React.FC<{ children: React.ReactNode; initialPath?: string }> = ({ 
  children
}) => (
  <BrowserRouter>
    <div>
      {children}
    </div>
  </BrowserRouter>
);

// Mock useLocation
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
};

import { vi } from 'vitest';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocation
  };
});

describe('Breadcrumb', () => {
  beforeEach(() => {
    mockLocation.pathname = '/';
  });

  it('renders custom breadcrumb items when provided', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current Page', current: true }
    ];

    render(
      <TestWrapper>
        <Breadcrumb items={items} />
      </TestWrapper>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('generates breadcrumbs for dashboard route', () => {
    mockLocation.pathname = '/';

    render(
      <TestWrapper>
        <Breadcrumb />
      </TestWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('generates breadcrumbs for create job route', () => {
    mockLocation.pathname = '/create';

    render(
      <TestWrapper>
        <Breadcrumb />
      </TestWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Create Job')).toBeInTheDocument();
  });

  it('generates breadcrumbs for job detail route', () => {
    mockLocation.pathname = '/jobs/123';

    render(
      <TestWrapper>
        <Breadcrumb />
      </TestWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('Job 123...')).toBeInTheDocument();
  });

  it('renders nothing when no breadcrumb items exist', () => {
    const { container } = render(
      <TestWrapper>
        <Breadcrumb items={[]} />
      </TestWrapper>
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});