import React, { useState, useCallback, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Moon, 
  Sun, 
  Download, 
  Settings, 
  Play,
  Code,
  Eye,
  TerminalIcon,
  Bug
} from 'lucide-react';
import { MonacoEditor } from './MonacoEditor';
import { LivePreview } from './LivePreview';
import { Terminal } from './Terminal';
import { Console, useConsole } from './Console';
import { PromptPanel } from './PromptPanel';
import { ExportUtils } from './ExportUtils';
import { aiService, AIModel, GenerationProgress } from '@/services/aiService';
import { toast } from '@/hooks/use-toast';

export const AIWebIDE: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Code state
  const [code, setCode] = useState(ExportUtils.generateBoilerplate('AI Web IDE Project'));
  const [activeTab, setActiveTab] = useState('preview');
  
  // AI Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>();
  
  // Panel state
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
  const [isConsoleMinimized, setIsConsoleMinimized] = useState(false);
  const [isPromptMinimized, setIsPromptMinimized] = useState(false);
  
  // Console hook
  const console = useConsole();

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Initialize with welcome message
  useEffect(() => {
    console.info('AI Web IDE initialized successfully!');
    console.log('Use the prompt panel to generate websites with AI');
    console.log('Available models: Gemini, DeepSeek R1, Qwen3 235B');
  }, []);

  const handleGenerate = useCallback(async (prompt: string, model: AIModel) => {
    setIsGenerating(true);
    setGenerationProgress({ status: 'generating', progress: 0 });
    
    console.info(`Starting generation with ${model.name}...`);
    console.log(`Prompt: "${prompt}"`);

    try {
      const response = await aiService.generateCode(prompt, model, (progress) => {
        setGenerationProgress(progress);
        console.log(`Generation progress: ${progress.progress}% - ${progress.message}`);
      });

      if (response.success && response.content) {
        setCode(response.content);
        
        // Auto-switch to live preview after successful generation
        setTimeout(() => {
          setActiveTab('preview');
          console.success('Code generated successfully! Switching to live preview...');
        }, 500);
        
        console.success('Code generated successfully!');
        console.log(`Generated ${response.content.length} characters of code`);
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Generation failed', errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
      setGenerationProgress(undefined);
    }
  }, [console]);

  const handleTerminalCommand = useCallback(async (command: string): Promise<string> => {
    console.log(`Terminal command: ${command}`);
    
    // Handle special commands
    switch (command.toLowerCase().trim()) {
      case 'generate':
        return 'Use the AI prompt panel to generate code';
      case 'export':
        await ExportUtils.exportAsZip(code, 'ai-generated-website');
        return 'Website exported successfully!';
      case 'theme':
        setIsDarkMode(!isDarkMode);
        return `Theme switched to ${!isDarkMode ? 'dark' : 'light'} mode`;
      case 'clear':
        return 'Terminal cleared';
      default:
        return `Unknown command: ${command}. Type 'help' for available commands.`;
    }
  }, [code, isDarkMode]);

  const handleTerminalQuickCommand = useCallback(async (command: string) => {
    await handleTerminalCommand(command);
  }, [handleTerminalCommand]);

  const handleExport = async () => {
    console.info('Exporting website...');
    await ExportUtils.exportAsZip(code, 'ai-generated-website');
    console.success('Website exported successfully!');
  };

  const handleRunCode = () => {
    console.info('Running code in preview...');
    setActiveTab('preview');
    toast({
      title: "Code executed!",
      description: "Check the live preview tab to see your website.",
    });
  };

  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-primary">AI Web IDE</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRunCode}
              className="h-8"
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="h-8 w-8 p-0"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="h-[calc(100vh-3rem)]">
        <PanelGroup direction="horizontal">
          {/* Left Side - 4 Quadrant Layout */}
          <Panel defaultSize={75} minSize={60}>
            <PanelGroup direction="vertical">
              {/* Top Half */}
              <Panel defaultSize={60} minSize={30}>
                <PanelGroup direction="horizontal">
                  {/* Live Preview */}
                  <Panel defaultSize={50} minSize={30}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                      <div className="bg-card border-b border-border px-4">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="preview" className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>Live Preview</span>
                          </TabsTrigger>
                          <TabsTrigger value="code" className="flex items-center space-x-2">
                            <Code className="h-4 w-4" />
                            <span>Code Editor</span>
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <div className="flex-1">
                        <TabsContent value="preview" className="h-full m-0">
                          <LivePreview code={code} />
                        </TabsContent>
                        <TabsContent value="code" className="h-full m-0">
                          <MonacoEditor
                            value={code}
                            onChange={setCode}
                            theme={isDarkMode ? 'vs-dark' : 'vs-light'}
                          />
                        </TabsContent>
                      </div>
                    </Tabs>
                  </Panel>
                  
                  <PanelResizeHandle className="w-2 bg-border hover:bg-primary/50 transition-colors" />
                  
                  {/* Code Editor (when preview is separate) - Hidden when using tabs */}
                  <Panel defaultSize={50} minSize={30} className="hidden">
                    <MonacoEditor
                      value={code}
                      onChange={setCode}
                      theme={isDarkMode ? 'vs-dark' : 'vs-light'}
                    />
                  </Panel>
                </PanelGroup>
              </Panel>
              
              <PanelResizeHandle className="h-2 bg-border hover:bg-primary/50 transition-colors" />
              
              {/* Bottom Half */}
              <Panel defaultSize={40} minSize={20}>
                <PanelGroup direction="horizontal">
                  {/* Terminal */}
                  <Panel defaultSize={50} minSize={25}>
                    <Terminal
                      onCommand={handleTerminalCommand}
                      onQuickCommand={handleTerminalQuickCommand}
                      isMinimized={isTerminalMinimized}
                      onToggleMinimize={() => setIsTerminalMinimized(!isTerminalMinimized)}
                      isActive={isGenerating}
                      className="h-full"
                    />
                  </Panel>
                  
                  <PanelResizeHandle className="w-2 bg-border hover:bg-primary/50 transition-colors" />
                  
                  {/* Console */}
                  <Panel defaultSize={50} minSize={25}>
                    <Console
                      messages={console.messages}
                      onClear={console.clear}
                      isMinimized={isConsoleMinimized}
                      onToggleMinimize={() => setIsConsoleMinimized(!isConsoleMinimized)}
                      isProcessing={isGenerating}
                      className="h-full"
                    />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>
          
          <PanelResizeHandle className="w-2 bg-border hover:bg-primary/50 transition-colors" />
          
          {/* Right Side - Prompt Panel */}
          <Panel defaultSize={25} minSize={20} maxSize={40}>
            <PromptPanel
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              progress={generationProgress}
              isMinimized={isPromptMinimized}
              onToggleMinimize={() => setIsPromptMinimized(!isPromptMinimized)}
              className="h-full"
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};