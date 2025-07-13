import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw, Smartphone, Tablet, Monitor } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LivePreviewProps {
  code: string;
  className?: string;
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export const LivePreview: React.FC<LivePreviewProps> = ({ code, className = '' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [isLoading, setIsLoading] = useState(false);

  const viewportSizes = {
    mobile: { width: '375px', height: '667px', icon: Smartphone },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    desktop: { width: '100%', height: '100%', icon: Monitor }
  };

  useEffect(() => {
    updatePreview();
  }, [code]);

  const updatePreview = () => {
    if (!iframeRef.current || !code.trim()) return;

    setIsLoading(true);

    try {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        // Create a complete HTML document if the code doesn't include doctype
        const completeCode = code.includes('<!DOCTYPE') 
          ? code 
          : `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
</head>
<body>
${code}
</body>
</html>`;

        doc.open();
        doc.write(completeCode);
        doc.close();

        // Add error handling to the iframe
        iframe.onload = () => {
          setIsLoading(false);
          
          // Inject error handling script
          const script = doc.createElement('script');
          script.textContent = `
            window.onerror = function(msg, url, line, col, error) {
              console.error('Preview Error:', msg, 'at line', line);
              window.parent.postMessage({
                type: 'preview-error',
                message: msg,
                line: line
              }, '*');
              return false;
            };
          `;
          doc.head?.appendChild(script);
        };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Preview update error:', error);
      toast({
        title: "Preview Error",
        description: "Failed to update preview. Check your code for syntax errors.",
        variant: "destructive",
      });
    }
  };

  const refreshPreview = () => {
    updatePreview();
    toast({
      title: "Preview refreshed!",
      description: "The preview has been updated with the latest code.",
    });
  };

  const openInNewTab = () => {
    if (!code.trim()) {
      toast({
        title: "No code to preview",
        description: "Please generate some code first.",
        variant: "destructive",
      });
      return;
    }

    const completeCode = code.includes('<!DOCTYPE') 
      ? code 
      : `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
</head>
<body>
${code}
</body>
</html>`;

    const blob = new Blob([completeCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Clean up the URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const ViewportIcon = viewportSizes[viewportSize].icon;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-2 bg-card border-b border-border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Live Preview</span>
          {isLoading && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Viewport size controls */}
          <div className="flex items-center space-x-1 border rounded-md">
            {Object.entries(viewportSizes).map(([size, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={size}
                  variant={viewportSize === size ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewportSize(size as ViewportSize)}
                  className="h-8 px-2"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPreview}
            className="h-8 px-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={openInNewTab}
            className="h-8 px-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </Button>
        </div>
      </div>
      
      <div className="flex-1 bg-preview-background flex items-center justify-center p-4">
        {!code.trim() ? (
          <div className="text-center text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No code to preview</p>
            <p className="text-sm">Generate some code to see the live preview</p>
          </div>
        ) : (
          <div 
            className="border border-border bg-white transition-all duration-300 ease-in-out"
            style={{
              width: viewportSizes[viewportSize].width,
              height: viewportSize === 'desktop' ? 'calc(100% - 1rem)' : viewportSizes[viewportSize].height,
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title="Live Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
};