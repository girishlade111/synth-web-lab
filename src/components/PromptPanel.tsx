import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Sparkles, 
  History, 
  RefreshCw, 
  ChevronRight,
  ChevronLeft,
  Clock,
  Zap,
  Brain,
  Cpu,
  FileText,
  GitBranch,
  ArrowRight
} from 'lucide-react';
import { AI_MODELS, AIModel, GenerationProgress } from '@/services/aiService';
import { toast } from '@/hooks/use-toast';
import { CodeVersion } from '@/hooks/useCodeVersions';

interface PromptHistoryItem {
  id: string;
  prompt: string;
  model: AIModel;
  timestamp: Date;
  success: boolean;
  response?: string;
}

interface PromptPanelProps {
  onGenerate: (prompt: string, model: AIModel) => Promise<void>;
  isGenerating: boolean;
  progress?: GenerationProgress;
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  codeVersions?: CodeVersion[];
  currentVersionId?: string | null;
  onSwitchVersion?: (versionId: string) => void;
}

export const PromptPanel: React.FC<PromptPanelProps> = ({
  onGenerate,
  isGenerating,
  progress,
  className = '',
  isMinimized = false,
  onToggleMinimize,
  codeVersions = [],
  currentVersionId,
  onSwitchVersion
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const historyItem: PromptHistoryItem = {
      id: `${Date.now()}-${Math.random()}`,
      prompt: prompt.trim(),
      model: selectedModel,
      timestamp: new Date(),
      success: false
    };

    try {
      await onGenerate(prompt.trim(), selectedModel);
      historyItem.success = true;
      toast({
        title: "Code generated successfully!",
        description: `Generated with ${selectedModel.name}`,
      });
    } catch (error) {
      historyItem.success = false;
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }

    setHistory(prev => [historyItem, ...prev.slice(0, 19)]); // Keep last 20 items
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const useHistoryPrompt = (historyItem: PromptHistoryItem) => {
    setPrompt(historyItem.prompt);
    setSelectedModel(historyItem.model);
    setShowHistory(false);
    textareaRef.current?.focus();
  };

  const regenerateLastPrompt = () => {
    const lastSuccessful = history.find(item => item.success);
    if (lastSuccessful) {
      setPrompt(lastSuccessful.prompt);
      setSelectedModel(lastSuccessful.model);
    }
  };

  const getModelIcon = (model: AIModel) => {
    switch (model.provider) {
      case 'gemini':
        return <Sparkles className="h-4 w-4" />;
      case 'deepseek':
        return <Brain className="h-4 w-4" />;
      case 'openrouter':
        return <Cpu className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getModelBadgeColor = (model: AIModel) => {
    switch (model.provider) {
      case 'gemini':
        return 'bg-blue-500';
      case 'deepseek':
        return 'bg-purple-500';
      case 'openrouter':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isMinimized) {
    return (
      <div className={`bg-card border border-border rounded-lg ${className}`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Prompt</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
            className="h-6 w-6 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold">AI Code Generator</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVersions(!showVersions)}
            className="h-8 px-2"
            title="Code Versions"
          >
            <GitBranch className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="h-8 px-2"
            title="Prompt History"
          >
            <History className="h-4 w-4" />
          </Button>
          {onToggleMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">AI Model</label>
          <Select
            value={selectedModel.id}
            onValueChange={(value) => {
              const model = AI_MODELS.find(m => m.id === value);
              if (model) setSelectedModel(model);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center space-x-2">
                    {getModelIcon(model)}
                    <span>{model.name}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-white ${getModelBadgeColor(model)}`}
                    >
                      {model.provider}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe what you want to build</label>
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Create a modern landing page for a tech startup with hero section, features, and contact form..."
            className="min-h-[120px] resize-none"
            disabled={isGenerating}
          />
          <div className="text-xs text-muted-foreground">
            Press Ctrl+Enter (Cmd+Enter on Mac) to generate
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Generating...</span>
              <span className="text-xs text-muted-foreground">
                {progress.progress}%
              </span>
            </div>
            <Progress value={progress.progress || 0} className="w-full" />
            <div className="text-xs text-muted-foreground">
              {progress.message}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
          
          {history.length > 0 && (
            <Button
              variant="outline"
              onClick={regenerateLastPrompt}
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Code Versions */}
        {showVersions && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Code Versions</span>
                <Badge variant="secondary">{codeVersions.length}</Badge>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2 ide-scrollbar">
                {codeVersions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No code versions yet</p>
                  </div>
                ) : (
                  codeVersions.map((version) => (
                    <Card 
                      key={version.id} 
                      className={`cursor-pointer transition-colors ${
                        currentVersionId === version.id 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => onSwitchVersion?.(version.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between space-x-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <FileText className="h-3 w-3" />
                              <p className="text-sm font-medium truncate">{version.title}</p>
                              {currentVersionId === version.id && (
                                <Badge variant="default" className="text-xs">Current</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mb-1">
                              {version.prompt}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {version.model}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {version.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Prompt History */}
        {showHistory && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recent Prompts</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistory([])}
                  className="h-6 text-xs"
                >
                  Clear
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2 ide-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No prompts yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <Card 
                      key={item.id} 
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => useHistoryPrompt(item)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between space-x-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.prompt}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {getModelIcon(item.model)}
                              <span className="text-xs text-muted-foreground">
                                {item.model.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {item.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            item.success ? 'bg-success' : 'bg-destructive'
                          }`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};