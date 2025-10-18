// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// Add type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      mockRiskData(supplierId: string, data: any): Chainable<void>;
    }
  }
}

// Custom login command
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  // Mock authentication token
  const user = {
    id: 'user-123',
    email,
    name: 'Test User',
    role: 'admin',
    token: 'test-jwt-token',
  };

  // Set token in localStorage
  window.localStorage.setItem('authToken', user.token);
  window.localStorage.setItem('user', JSON.stringify(user));

  // Mock the user API response
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: user,
  }).as('getUser');

  // Visit the dashboard which will trigger the auth check
  cy.visit('/dashboard');
  
  // Wait for the user data to be loaded
  cy.wait('@getUser');
});

// Custom command to clear auth state
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('authToken');
  window.localStorage.removeItem('user');
  cy.visit('/login');
});

// Command to mock API responses for risk analysis
Cypress.Commands.add('mockRiskData', (supplierId, data) => {
  cy.intercept('GET', `/api/risk/calculate/${supplierId}`, {
    statusCode: 200,
    body: {
      risk_score: data.riskScore,
      risk_level: data.riskLevel,
      trend: data.trend,
      last_updated: data.lastUpdated,
    },
  }).as('getRiskScore');

  cy.intercept('GET', `/api/risk/history/${supplierId}`, {
    statusCode: 200,
    body: { history: data.history },
  }).as('getRiskHistory');

  cy.intercept('GET', `/api/risk/benchmark/${supplierId}`, {
    statusCode: 200,
    body: data.benchmark,
  }).as('getRiskBenchmark');

  cy.intercept('GET', `/api/risk/mitigations/${supplierId}`, {
    statusCode: 200,
    body: data.mitigations,
  }).as('getRiskMitigations');
});

// Export an empty object to make this file a module
export {};
