import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Copy, Download, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: 'vs-dark' | 'vs-light';
  readOnly?: boolean;
  className?: string;
  isLiveWriting?: boolean;
  liveContent?: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language = 'html',
  theme = 'vs-dark',
  readOnly = false,
  className = '',
  isLiveWriting = false,
  liveContent = ''
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor settings
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.5,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      minimap: { enabled: true },
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      tabSize: 2,
    });

    // Add custom themes
    monaco.editor.defineTheme('ai-ide-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      }
    });

    monaco.editor.defineTheme('ai-ide-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000' },
        { token: 'keyword', foreground: '0000FF' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editorLineNumber.foreground': '#237893',
        'editor.selectionBackground': '#add6ff',
      }
    });

    // Apply custom theme
    monaco.editor.setTheme(theme === 'vs-dark' ? 'ai-ide-dark' : 'ai-ide-light');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && !isLiveWriting) {
      onChange(value);
    }
  };

  const displayValue = isLiveWriting ? liveContent : value;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Code copied!",
        description: "Code has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
      toast({
        title: "Code formatted!",
        description: "Code has been formatted successfully.",
      });
    }
  };

  const downloadCode = () => {
    const blob = new Blob([value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-code.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Code downloaded!",
      description: "Code has been downloaded as generated-code.html.",
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-2 bg-editor-background border-b border-editor-border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-editor-foreground">
            {language.toUpperCase()} Editor
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 px-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={formatCode}
            className="h-8 px-2"
          >
            <RotateCcw className="h-4 w-4" />
            Format
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadCode}
            className="h-8 px-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="flex-1 monaco-editor-container">
        <Editor
          height="100%"
          language={language}
          theme={theme === 'vs-dark' ? 'ai-ide-dark' : 'ai-ide-light'}
          value={displayValue}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly: readOnly || isLiveWriting,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            minimap: { enabled: true },
            fontSize: 14,
            lineHeight: 1.5,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          }}
        />
      </div>
    </div>
  );
};