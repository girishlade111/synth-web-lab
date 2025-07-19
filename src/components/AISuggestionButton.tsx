import React, { useState } from 'react';
import { Button } from './ui/button';
import { Lightbulb, X, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { toast } from 'sonner';

interface AISuggestionButtonProps {
  code: string;
  onSuggestionApply?: (suggestion: string) => void;
}

export const AISuggestionButton: React.FC<AISuggestionButtonProps> = ({
  code,
  onSuggestionApply
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = async () => {
    if (!code || code.trim() === '') {
      toast.error('No code to analyze. Please write some code first.');
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const response = await aiService.generateSuggestions(code);
      
      if (response.success && response.content) {
        setSuggestions(response.content);
        toast.success('AI suggestions generated successfully!');
      } else {
        toast.error(`Failed to generate suggestions: ${response.error}`);
        setSuggestions('Failed to generate suggestions. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error: ${errorMessage}`);
      setSuggestions('An error occurred while generating suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeSuggestions = () => {
    setIsOpen(false);
    setSuggestions('');
  };

  return (
    <>
      {/* Floating AI Suggestion Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={generateSuggestions}
          className="h-12 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Lightbulb className="h-5 w-5" />
          )}
          <span className="font-medium">AI Suggestions</span>
        </Button>
      </div>

      {/* Suggestions Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-h-96 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">AI Suggestions</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSuggestions}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-80">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing your code...</span>
                </div>
              </div>
            ) : suggestions ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {suggestions}
                </div>
                {onSuggestionApply && (
                  <Button
                    onClick={() => onSuggestionApply(suggestions)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                  >
                    Apply Suggestions
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Click the button to get AI suggestions for your code.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};