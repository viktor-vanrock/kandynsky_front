import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('An error occurred:', error, errorInfo);
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    // if (this.state.hasError) {
    //   return (
    //     <div>
    //       <h3>Что-то пошло не так.</h3>
    //       <details style={{ whiteSpace: 'pre-wrap' }}>
    //         {this.state.error && this.state.error.toString()}
    //         <br />
    //         {this.state.errorInfo && this.state.errorInfo.componentStack}
    //       </details>
    //     </div>
    //   );
    // }

    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
