import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-br from-red-500 to-orange-500 rounded-full" />
            <div className="relative w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            An unexpected error occurred. Please try refreshing the page or navigating to a different section.
          </p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go to Dashboard
            </Button>
            <Button onClick={this.handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 p-4 bg-muted/50 rounded-lg text-left w-full max-w-lg">
              <summary className="text-sm font-medium cursor-pointer">
                Error Details (Dev Only)
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
