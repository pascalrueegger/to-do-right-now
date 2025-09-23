/**
 * Loading state component for app initialization
 */

import React from 'react';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading your tasks...', 
  showSpinner = true 
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center space-y-4">
          {showSpinner && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              {message}
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we set up your workspace
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoadingState;