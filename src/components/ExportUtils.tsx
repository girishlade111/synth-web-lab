import JSZip from 'jszip';
import { toast } from '@/hooks/use-toast';

export interface ExportableCode {
  html: string;
  css?: string;
  js?: string;
}

export class ExportUtils {
  static async exportAsZip(code: string, filename: string = 'website'): Promise<void> {
    try {
      const zip = new JSZip();
      
      // Parse the code to extract separate files if possible
      const parsedCode = this.parseCode(code);
      
      if (parsedCode.html) {
        zip.file('index.html', parsedCode.html);
      }
      
      if (parsedCode.css) {
        zip.file('styles.css', parsedCode.css);
      }
      
      if (parsedCode.js) {
        zip.file('script.js', parsedCode.js);
      }
      
      // If no separate files, just export as single HTML
      if (!parsedCode.css && !parsedCode.js) {
        zip.file('index.html', code);
      }
      
      // Add a README file
      const readmeContent = `# ${filename}

This website was generated using AI Web IDE.

## Files:
- index.html - Main HTML file
${parsedCode.css ? '- styles.css - CSS styles' : ''}
${parsedCode.js ? '- script.js - JavaScript functionality' : ''}

## Usage:
Open index.html in your web browser to view the website.

Generated on: ${new Date().toLocaleDateString()}
`;
      
      zip.file('README.md', readmeContent);
      
      const blob = await zip.generateAsync({ type: 'blob' });
      this.downloadBlob(blob, `${filename}.zip`);
      
      toast({
        title: "Export successful!",
        description: `Website exported as ${filename}.zip`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }

  static parseCode(code: string): ExportableCode {
    const result: ExportableCode = { html: code };
    
    // Try to extract CSS from <style> tags
    const cssMatches = code.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (cssMatches) {
      const cssContent = cssMatches
        .map(match => match.replace(/<\/?style[^>]*>/gi, ''))
        .join('\n\n');
      
      if (cssContent.trim()) {
        result.css = cssContent.trim();
        // Remove CSS from HTML and add link to external CSS
        result.html = code
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<\/head>/i, '  <link rel="stylesheet" href="styles.css">\n</head>');
      }
    }
    
    // Try to extract JavaScript from <script> tags (but not external scripts)
    const jsMatches = code.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsMatches) {
      const jsContent = jsMatches
        .map(match => match.replace(/<\/?script[^>]*>/gi, ''))
        .join('\n\n');
      
      if (jsContent.trim()) {
        result.js = jsContent.trim();
        // Remove inline JS from HTML and add link to external JS
        result.html = result.html
          .replace(/<script(?![^>]*src)[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<\/body>/i, '  <script src="script.js"></script>\n</body>');
      }
    }
    
    return result;
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "Code has been copied to your clipboard.",
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Copied to clipboard!",
        description: "Code has been copied to your clipboard.",
      });
    }
  }

  static generateBoilerplate(title: string = 'Generated Website'): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            text-align: center;
        }
        
        h1 {
            color: #2563eb;
            margin-bottom: 1rem;
            font-size: 2.5rem;
        }
        
        p {
            font-size: 1.1rem;
            color: #64748b;
            margin-bottom: 2rem;
        }
        
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            transition: background 0.3s ease;
        }
        
        .btn:hover {
            background: #1d4ed8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Your Generated Website</h1>
        <p>This is a starter template. Use the AI prompt to generate your custom website!</p>
        <a href="#" class="btn">Get Started</a>
    </div>
    
    <script>
        console.log('Website generated with AI Web IDE');
        
        // Add your JavaScript here
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Website loaded successfully!');
        });
    </script>
</body>
</html>`;
  }
}