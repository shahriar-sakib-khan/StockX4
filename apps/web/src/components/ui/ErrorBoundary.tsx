import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-8 m-4 border-2 border-red-500 rounded bg-red-50 text-red-900">
          <h2 className="text-xl font-bold mb-2">Something went wrong.</h2>
          <details className="whitespace-pre-wrap font-mono text-sm">
            {this.state.error && this.state.error.toString()}
          </details>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => {
                localStorage.removeItem('pos-storage'); // Auto-attempt fix
                window.location.reload();
            }}
          >
            Clear Cache & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
