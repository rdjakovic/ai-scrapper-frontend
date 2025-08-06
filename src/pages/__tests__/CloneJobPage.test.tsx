import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import { CloneJobPage } from '../CloneJobPage';
import * as hooks from '../../hooks/useJob';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// Mock the hooks
vi.mock('../../hooks/useJob');

describe('CloneJobPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockUseParams.mockReturnValue({ jobId: '123' });
    (hooks.useJob as any).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<CloneJobPage />);

    expect(screen.getByText('Loading job details...')).toBeInTheDocument();
  });

  it('renders error when job ID is missing', () => {
    mockUseParams.mockReturnValue({});
    (hooks.useJob as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<CloneJobPage />);

    expect(screen.getByText('Job ID is required')).toBeInTheDocument();
  });

  it('renders error when job fetch fails', () => {
    mockUseParams.mockReturnValue({ jobId: '123' });
    (hooks.useJob as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch job'),
    });

    render(<CloneJobPage />);

    expect(screen.getByText(/Failed to load job details:/)).toBeInTheDocument();
  });

  it('renders error when job is not found', () => {
    mockUseParams.mockReturnValue({ jobId: '123' });
    (hooks.useJob as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<CloneJobPage />);

    expect(screen.getByText('Job not found')).toBeInTheDocument();
  });

  it('renders clone form when job is loaded successfully', async () => {
    const mockJob = {
      job_id: '123',
      url: 'https://example.com',
      status: 'completed',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      job_metadata: {
        selectors: { title: 'h1' },
        timeout: 60,
        javascript: true,
      },
    };

    mockUseParams.mockReturnValue({ jobId: '123' });
    (hooks.useJob as any).mockReturnValue({
      data: mockJob,
      isLoading: false,
      error: null,
    });

    render(<CloneJobPage />);

    expect(screen.getByText('Clone Job')).toBeInTheDocument();
    expect(screen.getByText(/Create a new job based on the configuration from job 123/)).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('navigates back to jobs when back button is clicked', () => {
    mockUseParams.mockReturnValue({ jobId: '123' });
    (hooks.useJob as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Job not found'),
    });

    render(<CloneJobPage />);

    const backButton = screen.getByText('Back to Jobs');
    backButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/jobs');
  });

  it('has proper accessibility attributes', () => {
    const mockJob = {
      job_id: '123',
      url: 'https://example.com',
      status: 'completed',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      job_metadata: {},
    };

    mockUseParams.mockReturnValue({ jobId: '123' });
    (hooks.useJob as any).mockReturnValue({
      data: mockJob,
      isLoading: false,
      error: null,
    });

    render(<CloneJobPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Clone Job');
  });
});
