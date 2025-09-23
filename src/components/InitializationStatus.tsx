/**
 * Component to display initialization status, warnings, and errors
 */

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface InitializationStatusProps {
  errors: string[];
  warnings: string[];
  onDismiss?: () => void;
}

export const InitializationStatus: React.FC<InitializationStatusProps> = ({
  errors,
  warnings,
  onDismiss
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <Card className={`mb-4 border-l-4 ${
      hasErrors 
        ? 'border-l-destructive bg-destructive/5' 
        : 'border-l-warning bg-warning/5'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {hasErrors ? (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            )}
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                {hasErrors ? 'Initialization Issues' : 'Initialization Warnings'}
              </h3>
              
              <p className="text-sm text-muted-foreground mt-1">
                {hasErrors 
                  ? 'Some issues occurred during app initialization'
                  : 'The app initialized successfully with some warnings'
                }
              </p>

              {!isExpanded && (
                <p className="text-xs text-muted-foreground mt-2">
                  {errors.length > 0 && `${errors.length} error${errors.length > 1 ? 's' : ''}`}
                  {errors.length > 0 && warnings.length > 0 && ', '}
                  {warnings.length > 0 && `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`}
                </p>
              )}

              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {errors.map((error, index) => (
                    <div key={`error-${index}`} className="text-sm">
                      <span className="font-medium text-destructive">Error:</span>
                      <span className="ml-2 text-foreground">{error}</span>
                    </div>
                  ))}
                  
                  {warnings.map((warning, index) => (
                    <div key={`warning-${index}`} className="text-sm">
                      <span className="font-medium text-warning">Warning:</span>
                      <span className="ml-2 text-foreground">{warning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InitializationStatus;