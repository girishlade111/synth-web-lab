import React, { useState, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { MonacoEditor } from './MonacoEditor';
import { LivePreview } from './LivePreview';
import { PromptPanel } from './PromptPanel';
import { Console } from './Console';
import { ExportUtils } from './ExportUtils';
import { FileManager } from './FileManager';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ThemeToggle } from './ThemeToggle';
import { AISuggestionButton } from './AISuggestionButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Code2, 
  Eye, 
  MessageSquare, 
  MonitorSpeaker,
  Download,
  Minimize2,
  Maximize2,
  FolderOpen
} from 'lucide-react';
import { aiService, AIModel, GenerationProgress } from '../services/aiService';
import { useCodeVersions } from '../hooks/useCodeVersions';
import { useFileManager } from '../hooks/useFileManager';
import { toast } from 'sonner';

export const AIWebIDE: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [isConsoleMinimized, setIsConsoleMinimized] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({ status: 'idle' });
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [pendingChanges, setPendingChanges] = useState<{
    content: string;
    prompt: string;
    targetFileId?: string;
  } | null>(null);
  const [isLiveWriting, setIsLiveWriting] = useState(false);
  const [liveContent, setLiveContent] = useState('');
  
  const {
    versions,
    addVersion,
    switchToVersion,
    deleteVersion,
    getCurrentVersion
  } = useCodeVersions();

  const {
    files,
    activeFileId,
    selectedFileId,
    addFile,
    updateFile,
    deleteFile,
    setActiveFile,
    setSelectedFile,
    renameFile,
    getActiveFile,
    getSelectedFile,
    loadLocalFile
  } = useFileManager();

  const handleCodeGeneration = async (prompt: string, model: AIModel, targetFileId?: string) => {
    try {
      setGenerationProgress({ status: 'generating', progress: 0 });
      
      // Add to prompt history (avoid duplicates)
      setPromptHistory(prev => {
        const newHistory = [prompt, ...prev.filter(p => p !== prompt)];
        return newHistory.slice(0, 20); // Keep only last 20 prompts
      });

      // For follow-up prompts, use existing code as context
      let contextCode = '';
      let enhancedPrompt = prompt;

      if (targetFileId) {
        const targetFile = files.find(f => f.id === targetFileId);
        contextCode = targetFile?.content || '';
      } else if (files.length > 0) {
        // Use the currently active file or the most recent file
        const activeFile = getActiveFile();
        contextCode = activeFile?.content || files[0].content || '';
      }

      // Enhance prompt with context for follow-up changes
      if (contextCode && files.length > 0) {
        enhancedPrompt = `Based on the existing code below, please modify or enhance it according to the user's request.

EXISTING CODE:
${contextCode}

USER REQUEST: ${prompt}

Please provide the complete updated code that incorporates the requested changes while maintaining the existing functionality.`;
      }
      
      // Enable live writing mode
      setIsLiveWriting(true);
      setLiveContent('');
      
      const response = await aiService.generateCode(
        enhancedPrompt, 
        model, 
        setGenerationProgress,
        (partialContent: string) => {
          setLiveContent(partialContent);
        }
      );
      
      if (response.success && response.content) {
        // Store pending changes for user approval
        setPendingChanges({
          content: response.content,
          prompt,
          targetFileId: targetFileId || (files.length > 0 ? getActiveFile()?.id : undefined)
        });
        
        // Disable live writing mode
        setIsLiveWriting(false);
        toast.success(`Code generated successfully with ${model.name}! Please review and approve changes.`);
      } else {
        setIsLiveWriting(false);
        toast.error(`Generation failed: ${response.error}`);
        setGenerationProgress({ status: 'error', message: response.error });
      }
    } catch (error) {
      setIsLiveWriting(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Generation failed: ${errorMessage}`);
      setGenerationProgress({ status: 'error', message: errorMessage });
    }
  };

  const applyPendingChanges = () => {
    if (!pendingChanges) return;

    if (pendingChanges.targetFileId) {
      // Update specific file
      updateFile(pendingChanges.targetFileId, pendingChanges.content);
      setActiveFile(pendingChanges.targetFileId);
      toast.success('File updated successfully!');
    } else {
      // Create new version
      const newVersion = addVersion(pendingChanges.content, pendingChanges.prompt, 'AI Generated');
      
      // Also create a new file
      const fileName = `generated-${Date.now()}.html`;
      const fileId = addFile(fileName, pendingChanges.content);
      setActiveFile(fileId);
      
      toast.success('New code version and file created!');
    }

    // Auto-switch to live preview after successful generation
    setTimeout(() => {
      setActiveTab('preview');
    }, 500);

    setPendingChanges(null);
  };

  const cancelPendingChanges = () => {
    setPendingChanges(null);
    setGenerationProgress({ status: 'idle' });
  };

  const handleVersionSelect = (version: any) => {
    switchToVersion(version.id);
    
    // Create a new file from the version
    const fileName = `version-${version.id}-${Date.now()}.html`;
    const fileId = addFile(fileName, version.content);
    setActiveFile(fileId);
    
    toast.success(`Switched to version: ${version.prompt.substring(0, 50)}...`);
  };

  const handleCodeChange = (newCode: string) => {
    // Update the active file
    if (activeFileId) {
      updateFile(activeFileId, newCode);
    }
  };

  const getCurrentCode = () => {
    const activeFile = getActiveFile();
    if (activeFile) {
      return activeFile.content;
    }
    
    return getCurrentVersion()?.code || `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Girish IDE</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 2.5rem;
        }
        p {
            color: #666;
            font-size: 1.2rem;
            line-height: 1.6;
        }
        .highlight {
            color: #667eea;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to <span class="highlight">Girish IDE</span></h1>
        <p>Your AI-powered web development environment.</p>
        <p>Start by describing what you want to build in the prompt panel!</p>
    </div>
</body>
</html>`;
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="h-12 bg-card border-b px-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Girish IDE</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Clear all state for new project
              window.location.reload();
            }}
          >
            New Project
          </Button>
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => ExportUtils.exportAsZip(getCurrentCode(), 'website')}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Files
              {files.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {files.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 m-4">
            <PanelGroup direction="horizontal" className="h-full">
              <Panel defaultSize={75} minSize={50}>
                <TabsContent value="editor" className="h-full p-0 m-0 relative">
                  <MonacoEditor
                    value={getCurrentCode()}
                    onChange={handleCodeChange}
                    language={getActiveFile()?.language || "html"}
                    isLiveWriting={isLiveWriting}
                    liveContent={liveContent}
                  />
                  
                  {/* AI Suggestion Button - Only show when not live writing and has code */}
                  {!isLiveWriting && getCurrentCode().trim() && (
                    <AISuggestionButton
                      code={getCurrentCode()}
                      onSuggestionApply={(suggestions) => {
                        // Apply suggestions by updating the current file/code
                        if (activeFileId) {
                          updateFile(activeFileId, suggestions);
                          toast.success('AI suggestions applied successfully!');
                        } else {
                          // Create new file with suggestions if no active file
                          const fileName = `improved-${Date.now()}.html`;
                          const fileId = addFile(fileName, suggestions);
                          setActiveFile(fileId);
                          toast.success('New improved file created with AI suggestions!');
                        }
                      }}
                    />
                  )}
                </TabsContent>

                <TabsContent value="preview" className="h-full p-0 m-0">
                  <LivePreview code={getCurrentCode()} />
                </TabsContent>

                <TabsContent value="files" className="h-full p-0 m-0">
                  <FileManager
                    files={files}
                    activeFileId={activeFileId}
                    selectedFileId={selectedFileId}
                    onFileSelect={setActiveFile}
                    onFileDelete={deleteFile}
                    onFileRename={renameFile}
                    onFileCreate={addFile}
                    onLocalFileLoad={loadLocalFile}
                    onFileTag={setSelectedFile}
                  />
                </TabsContent>

              </Panel>

              <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors" />

              <Panel defaultSize={25} minSize={20}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={60} minSize={30}>
                    <PromptPanel
                      onGenerate={handleCodeGeneration}
                      generationProgress={generationProgress}
                      codeVersions={versions}
                      onVersionSelect={handleVersionSelect}
                      onVersionDelete={deleteVersion}
                      selectedFile={getSelectedFile()}
                      onFileUntag={() => setSelectedFile(null)}
                      promptHistory={promptHistory}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-border hover:bg-primary/20 transition-colors" />

                  <Panel defaultSize={40} minSize={20}>
                    <Console
                      isMinimized={isConsoleMinimized}
                      onToggleMinimize={() => setIsConsoleMinimized(!isConsoleMinimized)}
                      messages={[]}
                      onClear={() => {}}
                      isProcessing={generationProgress.status === 'generating'}
                    />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </div>
        </Tabs>
      </div>

      <ConfirmationDialog
        isOpen={!!pendingChanges}
        title="Apply Generated Code?"
        description={
          pendingChanges?.targetFileId
            ? `Do you want to apply the generated code to ${getSelectedFile()?.name}? This will replace the current content.`
            : "Do you want to apply the generated code? This will create a new version and file."
        }
        onConfirm={applyPendingChanges}
        onCancel={cancelPendingChanges}
        confirmText="Apply Changes"
        cancelText="Cancel"
      />
    </div>
  );
};