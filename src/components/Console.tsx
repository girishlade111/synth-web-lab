import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Bug, Trash2, Info, AlertTriangle, XCircle, CheckCircle, Activity, Filter } from 'lucide-react';

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info' | 'success';
  message: string;
  timestamp: Date;
  details?: string;
}

interface ConsoleProps {
  messages: ConsoleMessage[];
  onClear?: () => void;
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  isProcessing?: boolean;
}

export const Console: React.FC<ConsoleProps> = ({
  messages,
  onClear,
  className = '',
  isMinimized = false,
  onToggleMinimize,
  isProcessing = false
}) => {
  const [filter, setFilter] = useState<string>('all');
  const consoleRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    return message.type === filter;
  });

  const getMessageIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'info':
        return <Info className="h-4 w-4 text-info" />;
      default:
        return <Bug className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-destructive';
      case 'warn':
        return 'text-warning';
      case 'success':
        return 'text-success';
      case 'info':
        return 'text-info';
      default:
        return 'text-console-foreground';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const messageTypeCounts = {
    all: messages.length,
    log: messages.filter(m => m.type === 'log').length,
    info: messages.filter(m => m.type === 'info').length,
    warn: messages.filter(m => m.type === 'warn').length,
    error: messages.filter(m => m.type === 'error').length,
    success: messages.filter(m => m.type === 'success').length,
  };

  const quickFilterButtons = [
    { name: 'All', filter: 'all', icon: <Bug className="h-3 w-3" /> },
    { name: 'Errors', filter: 'error', icon: <XCircle className="h-3 w-3" /> },
    { name: 'Warnings', filter: 'warn', icon: <AlertTriangle className="h-3 w-3" /> },
    { name: 'Info', filter: 'info', icon: <Info className="h-3 w-3" /> }
  ];

  const hasRecentErrors = messages.filter(m => m.type === 'error').length > 0;
  const hasRecentWarnings = messages.filter(m => m.type === 'warn').length > 0;

  if (isMinimized) {
    return (
      <div className={`console-container ${className} transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-2 bg-card border-b border-border hover:bg-muted/50 cursor-pointer transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <Bug className={`h-4 w-4 ${isProcessing ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium">Console</span>
            {messages.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {messages.length}
                </span>
                {hasRecentErrors && (
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                )}
                {hasRecentWarnings && (
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                )}
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs text-primary">Processing</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {/* Quick filter buttons */}
            {quickFilterButtons.slice(1, 4).map((btn) => (
              <Button
                key={btn.filter}
                variant="ghost"
                size="sm"
                onClick={() => setFilter(btn.filter)}
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                title={btn.name}
              >
                {btn.icon}
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
    <div className={`console-container ${className} flex flex-col h-full transition-all duration-300 ease-in-out animate-fade-in`}>
      <div className="flex items-center justify-between p-2 bg-card border-b border-border">
        <div className="flex items-center space-x-2">
          <Bug className={`h-4 w-4 ${isProcessing ? 'text-primary animate-pulse' : 'text-foreground'}`} />
          <span className="text-sm font-medium">Console</span>
          {messages.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {filteredMessages.length} of {messages.length}
              </span>
              {hasRecentErrors && (
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
              )}
              {hasRecentWarnings && (
                <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
              )}
            </div>
          )}
          {isProcessing && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs text-primary">Processing</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {/* Quick filter buttons */}
          {quickFilterButtons.map((btn) => (
            <Button
              key={btn.filter}
              variant={filter === btn.filter ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(btn.filter)}
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity duration-200"
              title={btn.name}
            >
              {btn.icon}
            </Button>
          ))}
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-6 w-6 p-0"
              title="Clear console"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          {onToggleMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0"
              title="Minimize console"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center space-x-1 p-2 border-b border-border">
        {Object.entries(messageTypeCounts).map(([type, count]) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(type)}
            className="h-7 px-2 text-xs"
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            {count > 0 && (
              <span className="ml-1 bg-background/20 px-1 rounded">
                {count}
              </span>
            )}
          </Button>
        ))}
      </div>

      <div
        ref={consoleRef}
        className="flex-1 p-3 font-mono text-sm overflow-y-auto ide-scrollbar"
      >
        {filteredMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No messages</p>
            <p className="text-xs">Console output will appear here</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} className="mb-2 group">
              <div className="flex items-start space-x-2">
                <span className="text-xs text-muted-foreground mt-1 w-16 flex-shrink-0">
                  {formatTimestamp(message.timestamp)}
                </span>
                <div className="flex-shrink-0 mt-0.5">
                  {getMessageIcon(message.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`${getMessageColor(message.type)} break-words`}>
                    {message.message}
                  </div>
                  {message.details && (
                    <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                      {message.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Console hook for easy message management
export const useConsole = () => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);

  const addMessage = (type: ConsoleMessage['type'], message: string, details?: string) => {
    const newMessage: ConsoleMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date(),
      details
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const log = (message: string, details?: string) => addMessage('log', message, details);
  const info = (message: string, details?: string) => addMessage('info', message, details);
  const warn = (message: string, details?: string) => addMessage('warn', message, details);
  const error = (message: string, details?: string) => addMessage('error', message, details);
  const success = (message: string, details?: string) => addMessage('success', message, details);

  const clear = () => setMessages([]);

  return {
    messages,
    log,
    info,
    warn,
    error,
    success,
    clear
  };
};