export interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'deepseek' | 'openrouter';
  endpoint?: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek'
  },
  {
    id: 'qwen/qwen3-235b-a22b:free',
    name: 'Qwen3 235B A22B',
    provider: 'openrouter'
  }
];

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  model: string;
}

export interface GenerationProgress {
  status: 'idle' | 'generating' | 'complete' | 'error';
  progress?: number;
  message?: string;
}

class AIService {
  private readonly GEMINI_API_KEY = "AIzaSyDK68voN4wRnCh95nrlu0m9vHbtJKOECqM";
  private readonly DEEPSEEK_API_KEY = "sk-c22d625ec2a046b9bed7cb583d615d48";
  private readonly OPENROUTER_API_KEY = "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";

  async generateCode(
    prompt: string, 
    model: AIModel, 
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<AIResponse> {
    onProgress?.({ status: 'generating', progress: 0, message: 'Initializing...' });

    try {
      switch (model.provider) {
        case 'gemini':
          return await this.callGemini(prompt, model, onProgress);
        case 'deepseek':
          return await this.callDeepSeek(prompt, model, onProgress);
        case 'openrouter':
          return await this.callOpenRouter(prompt, model, onProgress);
        default:
          throw new Error(`Unsupported provider: ${model.provider}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onProgress?.({ status: 'error', message: errorMessage });
      return {
        success: false,
        error: errorMessage,
        model: model.id
      };
    }
  }

  private async callGemini(
    prompt: string, 
    model: AIModel, 
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<AIResponse> {
    onProgress?.({ status: 'generating', progress: 25, message: 'Connecting to Gemini...' });

    const enhancedPrompt = this.enhancePromptForWebDev(prompt);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: enhancedPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      onProgress?.({ status: 'generating', progress: 75, message: 'Processing response...' });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 503) {
          throw new Error('Gemini API is temporarily overloaded. Please try again in a few moments.');
        }
        throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No content received from Gemini API');
      }

      onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

      return {
        success: true,
        content: this.extractCodeFromResponse(content),
        model: model.id
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini API error';
      onProgress?.({ status: 'error', message: errorMessage });
      throw error;
    }
  }

  private async callDeepSeek(
    prompt: string, 
    model: AIModel, 
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<AIResponse> {
    onProgress?.({ status: 'generating', progress: 25, message: 'Connecting to DeepSeek...' });

    const enhancedPrompt = this.enhancePromptForWebDev(prompt);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer. Generate clean, responsive HTML/CSS/JavaScript code based on user requirements. Always include complete, functional code that can be run directly in a browser.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8192
      })
    });

    onProgress?.({ status: 'generating', progress: 75, message: 'Processing response...' });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from DeepSeek');
    }

    onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

    return {
      success: true,
      content: this.extractCodeFromResponse(content),
      model: model.id
    };
  }

  private async callOpenRouter(
    prompt: string, 
    model: AIModel, 
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<AIResponse> {
    onProgress?.({ status: 'generating', progress: 25, message: 'Connecting to OpenRouter...' });

    const enhancedPrompt = this.enhancePromptForWebDev(prompt);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Girish IDE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model.id,
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer. Generate clean, responsive HTML/CSS/JavaScript code based on user requirements. Always include complete, functional code that can be run directly in a browser.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8192,
        stream: false
      })
    });

    onProgress?.({ status: 'generating', progress: 75, message: 'Processing response...' });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Check for reasoning field first (for reasoning models)
    let content = data.choices?.[0]?.message?.reasoning || data.choices?.[0]?.message?.content;

    if (!content || content.trim() === '') {
      throw new Error('Empty response received from OpenRouter API');
    }

    onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

    return {
      success: true,
      content: this.extractCodeFromResponse(content),
      model: model.id
    };
  }

  private enhancePromptForWebDev(prompt: string): string {
    return `
Create a complete, production-ready web application based on this request: "${prompt}"

Requirements:
1. Generate clean, semantic HTML structure
2. Include responsive CSS with modern styling
3. Add interactive JavaScript functionality where appropriate
4. Use modern web standards and best practices
5. Ensure the code is complete and can run directly in a browser
6. Include proper error handling and accessibility features
7. Use a modern color scheme and typography
8. Make it mobile-responsive

Please provide the complete HTML file with embedded CSS and JavaScript, ready to run in a browser.
    `.trim();
  }

  private extractCodeFromResponse(response: string): string {
    // Try to extract HTML code block first
    const htmlMatch = response.match(/```html\n([\s\S]*?)\n```/);
    if (htmlMatch) {
      return htmlMatch[1];
    }

    // Try to extract any code block
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeMatch) {
      return codeMatch[1];
    }

    // If no code blocks found, return the whole response
    return response;
  }
}

export const aiService = new AIService();