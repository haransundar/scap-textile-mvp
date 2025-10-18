import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { RiskAnalysisProvider, useRiskAnalysisContext } from '../RiskAnalysisContext';
import { api } from '@/lib/api';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the API module
jest.mock('@/lib/api');

// Mock the AuthContext
const mockAuthContext = {
  token: 'test-token',
  user: { id: '123', email: 'test@example.com' },
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  refreshUser: jest.fn(),
};

// Mock the AuthProvider
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => mockAuthContext,
}));

// Test component that uses the context
const TestComponent = () => {
  const { 
    riskScore, 
    riskHistory, 
    riskBenchmark, 
    riskMitigations, 
    loading, 
    error,
    fetchRiskScore,
    fetchRiskHistory,
    fetchRiskBenchmark,
    fetchRiskMitigations,
    fetchAllRiskData,
    getTopRiskDrivers,
    getRiskTrend,
    getRiskLevel,
  } = useRiskAnalysisContext();

  return (
    <div>
      <div data-testid="riskScore">{JSON.stringify(riskScore)}</div>
      <div data-testid="riskHistory">{JSON.stringify(riskHistory)}</div>
      <div data-testid="riskBenchmark">{JSON.stringify(riskBenchmark)}</div>
      <div data-testid="riskMitigations">{JSON.stringify(riskMitigations)}</div>
      <div data-testid="loading">{JSON.stringify(loading)}</div>
      <div data-testid="error">{error?.message || 'null'}</div>
      <button onClick={() => fetchRiskScore()}>Fetch Risk Score</button>
      <button onClick={() => fetchRiskHistory()}>Fetch Risk History</button>
      <button onClick={() => fetchRiskBenchmark()}>Fetch Benchmark</button>
      <button onClick={() => fetchRiskMitigations()}>Fetch Mitigations</button>
      <button onClick={() => fetchAllRiskData()}>Fetch All Data</button>
    </div>
  );
};

describe('RiskAnalysisContext', () => {
  const mockRiskScore = {
    risk_score: 5.5,
    risk_level: 'medium',
    last_updated: '2023-01-01T00:00:00Z',
    drivers: [
      { 
        rank: 1, 
        factor: 'Certificate Expiry', 
        weight: 0.8, 
        description: 'Certificates expiring soon', 
        impact: 'high',
        action: 'Renew certificates',
        action_url: '/certificates'
      }
    ],
    sub_scores: {
      certificate_health: 4.5,
      audit_performance: 6.0,
      financial_stability: 5.5,
      regulatory_compliance: 6.5,
    },
    trend: 'decreasing',
    change_from_last_month: -0.5,
    industry_benchmark: 5.0,
  };

  const mockRiskHistory = [
    { date: '2023-01-01', risk_score: 5.0 },
    { date: '2023-01-02', risk_score: 5.2 },
    { date: '2023-01-03', risk_score: 5.1 },
  ];

  const mockRiskBenchmark = {
    supplier_score: 5.5,
    industry_average: 5.0,
    top_percentile: 8.5,
    bottom_percentile: 3.5,
    comparison_metrics: [
      { metric: 'certificate_health', supplier: 4.5, industry: 5.0 },
      { metric: 'audit_performance', supplier: 6.0, industry: 5.5 },
    ],
  };

  const mockRiskMitigations = [
    {
      risk_factor: 'Certificate Expiry',
      current_value: '30 days',
      recommendation: 'Renew certificates before expiry',
      priority: 'high',
      action_url: '/certificates/renew',
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock API responses
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/risk/calculate/')) {
        return Promise.resolve({ data: mockRiskScore });
      }
      if (url.includes('/risk/history/')) {
        return Promise.resolve({ data: { history: mockRiskHistory } });
      }
      if (url.includes('/risk/benchmark/')) {
        return Promise.resolve({ data: mockRiskBenchmark });
      }
      if (url.includes('/risk/mitigations/')) {
        return Promise.resolve({ data: mockRiskMitigations });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });
  });

  const renderTestComponent = () => {
    return render(
      <AuthProvider>
        <RiskAnalysisProvider>
          <TestComponent />
        </RiskAnalysisProvider>
      </AuthProvider>
    );
  };

  it('should render with initial state', () => {
    renderTestComponent();
    
    expect(screen.getByTestId('riskScore').textContent).toBe('null');
    expect(screen.getByTestId('riskHistory').textContent).toBe('[]');
    expect(screen.getByTestId('riskBenchmark').textContent).toBe('null');
    expect(screen.getByTestId('riskMitigations').textContent).toBe('[]');
    expect(screen.getByTestId('error').textContent).toBe('null');
  });

  it('should fetch risk score', async () => {
    renderTestComponent();
    
    // Click the fetch risk score button
    act(() => {
      screen.getByText('Fetch Risk Score').click();
    });

    // Check loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toContain('"riskScore":true');
    });

    // Check that the risk score was updated
    await waitFor(() => {
      expect(screen.getByTestId('riskScore').textContent).toContain('5.5');
      expect(screen.getByTestId('riskScore').textContent).toContain('medium');
    });
  });

  it('should fetch risk history', async () => {
    renderTestComponent();
    
    // Click the fetch risk history button
    act(() => {
      screen.getByText('Fetch Risk History').click();
    });

    // Check that the risk history was updated
    await waitFor(() => {
      expect(screen.getByTestId('riskHistory').textContent).toContain('5.0');
      expect(screen.getByTestId('riskHistory').textContent).toContain('5.2');
      expect(screen.getByTestId('riskHistory').textContent).toContain('5.1');
    });
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Failed to fetch data';
    (api.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    renderTestComponent();
    
    // Click the fetch risk score button
    act(() => {
      screen.getByText('Fetch Risk Score').click();
    });

    // Check that the error was set
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toContain(errorMessage);
    });
  });

  it('should fetch all risk data', async () => {
    renderTestComponent();
    
    // Click the fetch all data button
    act(() => {
      screen.getByText('Fetch All Data').click();
    });

    // Check that all data was fetched
    await waitFor(() => {
      expect(screen.getByTestId('riskScore').textContent).toContain('5.5');
      expect(screen.getByTestId('riskHistory').textContent).toContain('5.0');
      expect(screen.getByTestId('riskBenchmark').textContent).toContain('5.5');
      expect(screen.getByTestId('riskMitigations').textContent).toContain('Certificate Expiry');
    });
  });

  it('should clear errors', async () => {
    const errorMessage = 'Failed to fetch data';
    (api.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    const TestComponentWithClear = () => {
      const { error, fetchRiskScore, clearError } = useRiskAnalysisContext();
      
      const handleFetchClick = () => {
        fetchRiskScore();
      };
      
      const handleClearClick = () => {
        clearError();
      };
      
      return (
        <div>
          <div data-testid="error">{error?.message || 'null'}</div>
          <button onClick={handleFetchClick}>Fetch Risk Score</button>
          <button onClick={handleClearClick}>Clear Error</button>
        </div>
      );
    };
    
    render(
      <AuthProvider>
        <RiskAnalysisProvider>
          <TestComponentWithClear />
        </RiskAnalysisProvider>
      </AuthProvider>
    );
    
    // Trigger error
    act(() => {
      screen.getByText('Fetch Risk Score').click();
    });
    
    // Verify error is shown
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toContain(errorMessage);
    });
    
    // Clear error
    act(() => {
      screen.getByText('Clear Error').click();
    });
    
    // Verify error is cleared
    expect(screen.getByTestId('error').textContent).toBe('null');
  });

  it('should handle concurrent requests', async () => {
    // Mock API to delay response
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    (api.get as jest.Mock).mockImplementationOnce(() => promise);
    
    renderTestComponent();
    
    // Start first request
    act(() => {
      screen.getByText('Fetch Risk Score').click();
    });
    
    // Start second request before first completes
    act(() => {
      screen.getByText('Fetch Risk History').click();
    });
    
    // Resolve first request
    await act(async () => {
      resolvePromise({ data: mockRiskScore });
      await promise;
    });
    
    // Verify both requests completed successfully
    await waitFor(() => {
      expect(screen.getByTestId('riskScore').textContent).toContain('5.5');
      expect(screen.getByTestId('riskHistory').textContent).toContain('5.0');
    });
  });

  it('should get top risk drivers', async () => {
    const TestDrivers = () => {
      const { getTopRiskDrivers } = useRiskAnalysisContext();
      const drivers = getTopRiskDrivers(2);
      return <div data-testid="topDrivers">{JSON.stringify(drivers)}</div>;
    };
    
    // Mock the risk drivers data
    const mockRiskDrivers = [
      { id: 'driver1', name: 'Supply Chain Risk', score: 7.5, trend: 'increasing' },
      { id: 'driver2', name: 'Financial Risk', score: 6.8, trend: 'decreasing' },
      { id: 'driver3', name: 'Compliance Risk', score: 5.2, trend: 'stable' },
    ];
    
    // Mock the API response for risk drivers
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { drivers: mockRiskDrivers },
    });
    
    render(
      <AuthProvider>
        <RiskAnalysisProvider>
          <TestDrivers />
        </RiskAnalysisProvider>
      </AuthProvider>
    );

    // The initial state should return an empty array
    expect(screen.getByTestId('topDrivers').textContent).toBe('[]');
  });
});
