import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, Terminal as TerminalIcon, Trash2, Play, Download, Zap, Activity } from 'lucide-react';

interface TerminalCommand {
  command: string;
  output: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
}

interface TerminalProps {
  onCommand?: (command: string) => Promise<string>;
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  isActive?: boolean;
  onQuickCommand?: (command: string) => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  onCommand,
  className = '',
  isMinimized = false,
  onToggleMinimize,
  isActive = false,
  onQuickCommand
}) => {
  const [history, setHistory] = useState<TerminalCommand[]>([
    {
      command: 'help',
      output: `Available commands:
  help          - Show this help message
  clear         - Clear terminal history
  generate      - Generate code with AI
  export        - Export current code
  theme         - Toggle editor theme
  version       - Show version info`,
      timestamp: new Date(),
      type: 'info'
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const executeCommand = async (command: string) => {
    const cmd = command.trim().toLowerCase();
    let output = '';
    let type: 'success' | 'error' | 'info' = 'info';

    // Add to command history
    if (command.trim()) {
      setCommandHistory(prev => [...prev.slice(-9), command.trim()]);
    }

    switch (cmd) {
      case 'help':
        output = `Available commands:
  help          - Show this help message
  clear         - Clear terminal history
  generate      - Generate code with AI
  export        - Export current code
  theme         - Toggle editor theme
  version       - Show version info
  reload        - Reload the preview
  models        - List available AI models`;
        type = 'info';
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'version':
        output = 'AI Web IDE v1.0.0 - Build with AI, Preview in Real-time';
        type = 'info';
        break;

      case 'generate':
        output = 'Use the prompt panel on the right to generate code with AI models.';
        type = 'info';
        break;

      case 'export':
        output = 'Use the export button in the code editor to download your code.';
        type = 'info';
        break;

      case 'theme':
        output = 'Use the theme toggle in the top bar to switch between light and dark themes.';
        type = 'info';
        break;

      case 'reload':
        output = 'Preview will be reloaded automatically when code changes.';
        type = 'info';
        break;

      case 'models':
        output = `Available AI Models:
  • Gemini 1.5 Flash - Fast and efficient
  • DeepSeek R1 - Advanced reasoning
  • Qwen3 235B A22B - Large context window`;
        type = 'info';
        break;

      case '':
        return;

      default:
        if (onCommand) {
          try {
            output = await onCommand(command);
            type = 'success';
          } catch (error) {
            output = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            type = 'error';
          }
        } else {
          output = `Command not found: ${command}. Type 'help' for available commands.`;
          type = 'error';
        }
    }

    setHistory(prev => [...prev, {
      command,
      output,
      timestamp: new Date(),
      type
    }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
      setCurrentCommand('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex === commandHistory.length - 1 ? -1 : historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(newIndex === -1 ? '' : commandHistory[newIndex]);
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const quickCommands = [
    { name: 'help', icon: <TerminalIcon className="h-3 w-3" />, command: 'help' },
    { name: 'clear', icon: <Trash2 className="h-3 w-3" />, command: 'clear' },
    { name: 'version', icon: <Activity className="h-3 w-3" />, command: 'version' },
    { name: 'models', icon: <Zap className="h-3 w-3" />, command: 'models' }
  ];

  if (isMinimized) {
    return (
      <div className={`terminal-container ${className} transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-2 bg-card border-b border-border hover:bg-muted/50 cursor-pointer transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <TerminalIcon className={`h-4 w-4 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium">Terminal</span>
            {isActive && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs text-primary">Active</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {/* Quick command buttons */}
            {quickCommands.map((cmd) => (
              <Button
                key={cmd.name}
                variant="ghost"
                size="sm"
                onClick={() => onQuickCommand?.(cmd.command)}
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                title={cmd.name}
              >
                {cmd.icon}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`terminal-container ${className} flex flex-col h-full transition-all duration-300 ease-in-out animate-fade-in`}>
      <div className="flex items-center justify-between p-2 bg-card border-b border-border">
        <div className="flex items-center space-x-2">
          <TerminalIcon className={`h-4 w-4 ${isActive ? 'text-primary animate-pulse' : 'text-foreground'}`} />
          <span className="text-sm font-medium">Terminal</span>
          {isActive && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs text-primary">Running</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {/* Quick command buttons */}
          {quickCommands.map((cmd) => (
            <Button
              key={cmd.name}
              variant="ghost"
              size="sm"
              onClick={() => onQuickCommand?.(cmd.command)}
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity duration-200"
              title={cmd.name}
            >
              {cmd.icon}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="h-6 w-6 p-0"
            title="Clear terminal"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          {onToggleMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0"
              title="Minimize terminal"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div
        ref={terminalRef}
        className="flex-1 p-3 font-mono text-sm overflow-y-auto ide-scrollbar"
        style={{ maxHeight: 'calc(100% - 100px)' }}
      >
        {history.map((entry, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center space-x-2 text-terminal-foreground">
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(entry.timestamp)}
              </span>
              <span className="text-success">$</span>
              <span>{entry.command}</span>
            </div>
            <div 
              className={`mt-1 whitespace-pre-wrap ${
                entry.type === 'error' 
                  ? 'text-destructive' 
                  : entry.type === 'success' 
                  ? 'text-success' 
                  : 'text-muted-foreground'
              }`}
            >
              {entry.output}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center space-x-2">
          <span className="text-success text-sm">$</span>
          <Input
            ref={inputRef}
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-mono"
            autoFocus
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Press ↑/↓ for command history, Enter to execute
        </div>
      </div>
    </div>
  );
};