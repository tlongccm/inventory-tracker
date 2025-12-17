/**
 * ErrorBoundary component - catches JavaScript errors in child components.
 */

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ textAlign: 'center', marginTop: 40 }}>
          <h1>Something went wrong</h1>
          <p className="error" style={{ marginBottom: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button className="primary" onClick={this.handleReset}>
            Try Again
          </button>
          <p style={{ marginTop: 20, color: '#666' }}>
            If the problem persists, please refresh the page or contact support.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
