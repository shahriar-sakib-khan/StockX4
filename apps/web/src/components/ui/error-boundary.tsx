import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';

interface Props {
  children?: ReactNode;
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
      return (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-foreground shadow-sm max-w-lg mx-auto mt-10">
            <h2 className="flex items-center text-xl font-bold text-destructive mb-2">
                <AlertCircle className="w-6 h-6 mr-2" />
                Something went wrong
            </h2>
            <pre className="bg-destructive/5 p-4 rounded overflow-auto text-sm text-destructive-foreground/80 border border-destructive/10">
                {this.state.error?.message}
            </pre>
            <div className="mt-4">
                <Button
                    variant="destructive"
                    onClick={() => window.location.reload()}
                >
                    Reload Page
                </Button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}
