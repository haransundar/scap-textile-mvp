import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class RiskErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('RiskErrorBoundary caught an error:', error, errorInfo);
    
    // Call the onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    if (this.props.resetOnRetry) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      // Use the provided fallback or render the default error UI
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function' 
          ? this.props.fallback(this.state.error, this.state.errorInfo, this.handleReset)
          : this.props.fallback;
      }

      // Default error UI
      return (
        <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h3 className="text-lg font-semibold">Something went wrong</h3>
          </div>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We're sorry, but an error occurred while loading the risk analysis data. 
              Our team has been notified and we're working to fix the issue.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-2 text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-auto max-h-40">
                <summary className="font-medium cursor-pointer mb-1">Error details</summary>
                <div className="font-mono text-xs">
                  <div className="font-semibold">{this.state.error.name}: {this.state.error.message}</div>
                  <pre className="whitespace-pre-wrap mt-1">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RiskErrorBoundary;
