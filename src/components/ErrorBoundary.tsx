/**
 * React Error Boundary for graceful error handling and recovery
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AlertTriangle, RefreshCw, Download, Trash2 } from 'lucide-react';
import { resetApp, getAppHealth } from '../lib/appInitialization';
import { exportTodosData, downloadDataAsFile } from '../lib/dataExport';
import { STORAGE_KEY } from '../lib/constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error details for debugging
    this.logErrorDetails(error, errorInfo);
  }

  private logErrorDetails = (error: Error, errorInfo: ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      appHealth: getAppHealth()
    };

    console.error('Detailed error information:', errorDetails);
    
    // In a production app, you might want to send this to an error reporting service
    // Example: errorReportingService.report(errorDetails);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = async () => {
    this.setState({ isRecovering: true });
    
    try {
      await resetApp();
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset app:', error);
      alert('Failed to reset the application. Please try refreshing the page.');
      this.setState({ isRecovering: false });
    }
  };

  private handleExportData = () => {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (rawData) {
        const parsedData = JSON.parse(rawData);
        const exportedData = exportTodosData(parsedData);
        
        // Create and download backup file
        const blob = new Blob([exportedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `focus-todo-backup-error-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully. You can import this file after fixing the issue.');
      } else {
        alert('No data found to export.');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. The data might be corrupted.');
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  The application encountered an unexpected error. Don't worry - your data is safe.
                </p>
              </div>

              {this.state.error && (
                <div className="bg-muted p-4 rounded-lg text-left">
                  <h3 className="font-semibold text-sm mb-2">Error Details:</h3>
                  <p className="text-sm font-mono text-muted-foreground break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={this.handleRetry}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={this.handleReload}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reload Page
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    If the problem persists, you can:
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={this.handleExportData}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={this.handleReset}
                      disabled={this.state.isRecovering}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {this.state.isRecovering ? 'Resetting...' : 'Reset App'}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    Resetting will clear all data and restore the app to its initial state.
                    Make sure to export your data first if you want to keep it.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;