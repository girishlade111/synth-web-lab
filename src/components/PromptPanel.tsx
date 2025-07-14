import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Bot, Clock, FileText, RotateCcw, Trash2, Tag, X } from 'lucide-react';
import { AIModel, AI_MODELS, GenerationProgress } from '../services/aiService';
import { CodeVersion } from '../hooks/useCodeVersions';
import { CodeFile } from '../hooks/useFileManager';

interface PromptPanelProps {
  onGenerate: (prompt: string, model: AIModel, targetFileId?: string) => Promise<void>;
  generationProgress: GenerationProgress;
  codeVersions: CodeVersion[];
  onVersionSelect: (version: CodeVersion) => void;
  onVersionDelete: (versionId: string) => void;
  selectedFile: CodeFile | null;
  onFileUntag: () => void;
  promptHistory: string[];
}

export const PromptPanel: React.FC<PromptPanelProps> = ({
  onGenerate,
  generationProgress,
  codeVersions,
  onVersionSelect,
  onVersionDelete,
  selectedFile,
  onFileUntag,
  promptHistory
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);

  const handleSubmit = async () => {
    if (!prompt.trim() || !selectedModel || generationProgress.status === 'generating') return;
    
    await onGenerate(prompt, selectedModel, selectedFile?.id);
    setPrompt('');
  };

  const isGenerating = generationProgress.status === 'generating';

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant
        </h2>
      </div>

      <Tabs defaultValue="prompt" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="prompt">Generate</TabsTrigger>
          <TabsTrigger value="versions">
            Versions ({codeVersions.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({promptHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="flex-1 p-4 space-y-4">
          {selectedFile && (
            <div className="mb-3 p-2 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Target File: {selectedFile.name}</span>
                  <Badge variant="outline" className="text-xs">{selectedFile.language}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFileUntag}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                AI will modify this specific file
              </p>
            </div>
          )}
          
          <Textarea
            placeholder={selectedFile 
              ? `Describe changes to make in ${selectedFile.name}...`
              : "Describe the website you want to create..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <div className="space-y-2">
            <Select
              value={selectedModel.id}
              onValueChange={(value) => {
                const model = AI_MODELS.find(m => m.id === value);
                if (model) setSelectedModel(model);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI Model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {model.provider}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Generating...</span>
                <span className="text-sm text-muted-foreground">
                  {generationProgress.progress || 0}%
                </span>
              </div>
              <Progress value={generationProgress.progress || 0} />
              {generationProgress.message && (
                <p className="text-xs text-muted-foreground">
                  {generationProgress.message}
                </p>
              )}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="versions" className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Code Versions
              </h3>
              {codeVersions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No versions yet</p>
              ) : (
                codeVersions.map((version) => (
                  <div
                    key={version.id}
                    className="p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => onVersionSelect(version)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">{version.model}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {version.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {version.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVersionDelete(version.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Prompt History
              </h3>
              {promptHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No prompts yet</p>
              ) : (
                promptHistory.slice().reverse().map((historyPrompt, index) => (
                  <div
                    key={index}
                    className="p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => setPrompt(historyPrompt)}
                  >
                    <p className="text-sm line-clamp-3">{historyPrompt}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to reuse this prompt
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};