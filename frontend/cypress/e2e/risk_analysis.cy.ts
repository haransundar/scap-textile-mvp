/// <reference types="cypress" />

describe('Risk Analysis', () => {
  // Test data
  const supplierId = 'test-supplier-123';
  const testRiskData = {
    riskScore: 6.5,
    riskLevel: 'medium',
    trend: 'decreasing',
    lastUpdated: new Date().toISOString(),
    history: [
      { date: '2023-10-01', score: 7.0 },
      { date: '2023-10-08', score: 6.5 },
    ],
    benchmark: {
      supplierScore: 6.5,
      industryAverage: 5.8,
      topPercentile: 8.5,
    },
    mitigations: [
      {
        id: 'mit-1',
        title: 'Update Security Certificates',
        priority: 'high',
        status: 'pending',
        dueDate: '2023-12-31',
      },
    ],
  };

  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', `/api/risk/calculate/${supplierId}`, {
      statusCode: 200,
      body: {
        risk_score: testRiskData.riskScore,
        risk_level: testRiskData.riskLevel,
        trend: testRiskData.trend,
        last_updated: testRiskData.lastUpdated,
      },
    }).as('getRiskScore');

    cy.intercept('GET', `/api/risk/history/${supplierId}`, {
      statusCode: 200,
      body: { history: testRiskData.history },
    }).as('getRiskHistory');

    cy.intercept('GET', `/api/risk/benchmark/${supplierId}`, {
      statusCode: 200,
      body: testRiskData.benchmark,
    }).as('getRiskBenchmark');

    cy.intercept('GET', `/api/risk/mitigations/${supplierId}`, {
      statusCode: 200,
      body: testRiskData.mitigations,
    }).as('getRiskMitigations');

    // Login and navigate to risk analysis page
    cy.login(); // Assumes a custom login command is set up
    cy.visit(`/dashboard/suppliers/${supplierId}/risk`);
  });

  it('should display loading states while fetching data', () => {
    // Check for loading skeletons
    cy.get('[data-testid="risk-gauge-skeleton"]').should('be.visible');
    cy.get('[data-testid="risk-history-skeleton"]').should('be.visible');
    cy.get('[data-testid="risk-mitigations-skeleton"]').should('be.visible');
  });

  it('should display risk score and level correctly', () => {
    // Wait for API calls to complete
    cy.wait(['@getRiskScore', '@getRiskHistory', '@getRiskBenchmark', '@getRiskMitigations']);

    // Check risk score display
    cy.get('[data-testid="risk-score"]').should('contain', testRiskData.riskScore.toFixed(1));
    cy.get('[data-testid="risk-level"]').should('contain', 'Medium Risk');
    
    // Check trend indicator
    cy.get('[data-testid="risk-trend"]').should('contain', 'Decreasing');
  });

  it('should display risk history chart', () => {
    cy.wait('@getRiskHistory');
    
    // Check if chart container is rendered with data points
    cy.get('[data-testid="risk-history-chart"]').should('be.visible');
    
    // Check if correct number of data points are displayed
    cy.get('[data-testid="risk-history-point"]').should('have.length', testRiskData.history.length);
  });

  it('should display risk benchmark comparison', () => {
    cy.wait('@getRiskBenchmark');
    
    // Check benchmark values
    cy.get('[data-testid="supplier-score"]').should('contain', testRiskData.benchmark.supplierScore);
    cy.get('[data-testid="industry-average"]').should('contain', testRiskData.benchmark.industryAverage);
    cy.get('[data-testid="top-percentile"]').should('contain', testRiskData.benchmark.topPercentile);
  });

  it('should display risk mitigations', () => {
    cy.wait('@getRiskMitigations');
    
    // Check if mitigations are displayed
    cy.get('[data-testid="risk-mitigation"]').should('have.length', testRiskData.mitigations.length);
    
    // Check first mitigation details
    const firstMitigation = testRiskData.mitigations[0];
    cy.get('[data-testid="mitigation-title"]').first().should('contain', firstMitigation.title);
    cy.get('[data-testid="mitigation-priority"]').first().should('contain', firstMitigation.priority);
    cy.get('[data-testid="mitigation-status"]').first().should('contain', firstMitigation.status);
  });

  it('should handle API errors gracefully', () => {
    // Override the risk score API to return an error
    cy.intercept('GET', `/api/risk/calculate/${supplierId}`, {
      statusCode: 500,
      body: { message: 'Internal server error' },
    }).as('getRiskScoreError');

    // Reload the page to trigger the error
    cy.reload();
    
    // Check if error message is displayed
    cy.get('[data-testid="error-message"]').should('be.visible');
    
    // Test retry functionality
    cy.intercept('GET', `/api/risk/calculate/${supplierId}`, {
      statusCode: 200,
      body: {
        risk_score: testRiskData.riskScore,
        risk_level: testRiskData.riskLevel,
        trend: testRiskData.trend,
        last_updated: testRiskData.lastUpdated,
      },
    }).as('getRiskScoreRetry');
    
    cy.get('[data-testid="retry-button"]').click();
    cy.wait('@getRiskScoreRetry');
    cy.get('[data-testid="risk-score"]').should('be.visible');
  });

  it('should allow manual refresh of risk data', () => {
    // Wait for initial load
    cy.wait(['@getRiskScore', '@getRiskHistory', '@getRiskBenchmark', '@getRiskMitigations']);
    
    // Stub the recalculate endpoint
    cy.intercept('POST', `/api/risk/recalculate/${supplierId}`, {
      statusCode: 200,
      body: {
        risk_score: 6.8,
        risk_level: 'medium',
        trend: 'increasing',
        last_updated: new Date().toISOString(),
      },
    }).as('recalculateRiskScore');
    
    // Click refresh button
    cy.get('[data-testid="refresh-risk-data"]').click();
    
    // Check if loading state is shown
    cy.get('[data-testid="refreshing-indicator"]').should('be.visible');
    
    // Wait for recalculation to complete
    cy.wait('@recalculateRiskScore');
    
    // Verify the score was updated
    cy.get('[data-testid="risk-score"]').should('contain', '6.8');
  });
});
