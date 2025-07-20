export interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'deepseek' | 'openrouter';
  endpoint?: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini'
  },
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
  partialContent?: string;
}

class AIService {
  private readonly GEMINI_API_KEY = "AIzaSyDK68voN4wRnCh95nrlu0m9vHbtJKOECqM";
  private readonly DEEPSEEK_API_KEY = "sk-c22d625ec2a046b9bed7cb583d615d48";
  private readonly OPENROUTER_API_KEY = "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";

  async generateCode(
    prompt: string, 
    model: AIModel, 
    onProgress?: (progress: GenerationProgress) => void,
    onLiveUpdate?: (partialContent: string) => void
  ): Promise<AIResponse> {
    onProgress?.({ status: 'generating', progress: 0, message: 'Initializing...' });

    try {
      switch (model.provider) {
        case 'gemini':
          return await this.callGemini(prompt, model, onProgress, onLiveUpdate);
        case 'deepseek':
          return await this.callDeepSeek(prompt, model, onProgress, onLiveUpdate);
        case 'openrouter':
          return await this.callOpenRouter(prompt, model, onProgress, onLiveUpdate);
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
    onProgress?: (progress: GenerationProgress) => void,
    onLiveUpdate?: (partialContent: string) => void
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
            maxOutputTokens: 32768,
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

      const extractedCode = this.extractCodeFromResponse(content);
      
      // Simulate live writing effect
      if (onLiveUpdate) {
        await this.simulateLiveWriting(extractedCode, onLiveUpdate, onProgress);
      }

      onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

      return {
        success: true,
        content: extractedCode,
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
    onProgress?: (progress: GenerationProgress) => void,
    onLiveUpdate?: (partialContent: string) => void
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
        max_tokens: 32768
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

    const extractedCode = this.extractCodeFromResponse(content);
    
    // Simulate live writing effect
    if (onLiveUpdate) {
      await this.simulateLiveWriting(extractedCode, onLiveUpdate, onProgress);
    }

    onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

    return {
      success: true,
      content: extractedCode,
      model: model.id
    };
  }

  private async callOpenRouter(
    prompt: string, 
    model: AIModel, 
    onProgress?: (progress: GenerationProgress) => void,
    onLiveUpdate?: (partialContent: string) => void
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
        max_tokens: 32768,
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

    const extractedCode = this.extractCodeFromResponse(content);
    
    // Simulate live writing effect
    if (onLiveUpdate) {
      await this.simulateLiveWriting(extractedCode, onLiveUpdate, onProgress);
    }

    onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

    return {
      success: true,
      content: extractedCode,
      model: model.id
    };
  }

  private enhancePromptForWebDev(prompt: string): string {
    return `
Create a stunning, production-ready web application based on this request: "${prompt}"

DESIGN REQUIREMENTS (Make it visually stunning):
1. Use a beautiful, modern color palette with gradients and subtle shadows
2. Implement elegant typography with proper font hierarchy
3. Add smooth animations and hover effects for interactivity
4. Use CSS Grid and Flexbox for perfect layouts
5. Include beautiful spacing, padding, and margins for visual breathing room
6. Add subtle background patterns, textures, or gradients for depth
7. Use modern CSS features like backdrop-filter, box-shadow, and border-radius creatively

TECHNICAL REQUIREMENTS (Make it professional):
1. Generate clean, semantic HTML5 structure with proper tags
2. Write responsive CSS that works perfectly on all devices (mobile-first approach)
3. Add interactive JavaScript functionality with smooth UX
4. Include proper meta tags, favicons, and SEO optimization
5. Implement accessibility features (ARIA labels, keyboard navigation, focus states)
6. Use modern CSS custom properties (variables) for maintainable styling
7. Add loading states, error handling, and form validation where needed
8. Include proper commenting and code organization

AESTHETIC REQUIREMENTS (Make it beautiful):
1. Choose a cohesive color scheme that evokes the right emotion for the content
2. Use whitespace effectively to create visual hierarchy
3. Add subtle micro-interactions and animations (CSS transitions/transforms)
4. Implement beautiful buttons, cards, and components with depth
5. Use consistent spacing scale (8px, 16px, 24px, 32px, etc.)
6. Add icons or visual elements that enhance the design
7. Create smooth scrolling and navigation experiences
8. Ensure perfect contrast ratios for readability

OUTPUT FORMAT:
Provide a complete, single HTML file with embedded CSS and JavaScript that demonstrates professional web development standards and creates a visually stunning user experience.
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

    // Look for <!DOCTYPE html> or <html> tags to extract HTML content
    const docTypeMatch = response.match(/(<!DOCTYPE[\s\S]*?<\/html>)/i);
    if (docTypeMatch) {
      return docTypeMatch[1];
    }

    const htmlTagMatch = response.match(/(<html[\s\S]*?<\/html>)/i);
    if (htmlTagMatch) {
      return htmlTagMatch[1];
    }

    // Look for complete HTML structure without DOCTYPE
    const bodyMatch = response.match(/(<html[\s\S]*)/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }

    // If no HTML found, return empty string instead of full response
    console.warn('No valid HTML code found in AI response');
    return '';
  }

  private async simulateLiveWriting(
    content: string, 
    onLiveUpdate: (partialContent: string) => void,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<void> {
    const words = content.split(' ');
    let currentContent = '';
    
    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      onLiveUpdate(currentContent);
      
      // Update progress
      const progress = Math.floor((i / words.length) * 90); // Leave 10% for completion
      onProgress?.({ 
        status: 'generating', 
        progress: 75 + (progress * 0.2), // Between 75% and 95%
        message: 'Writing code...', 
        partialContent: currentContent 
      });
      
      // Add delay to simulate typing
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
    }
  }

  async generateSuggestions(code: string): Promise<AIResponse> {
    const prompt = `
Analyze the following code and provide suggestions for improvement:

CURRENT CODE:
${code}

ANALYSIS REQUIREMENTS:
1. Identify areas for visual enhancement (colors, spacing, typography)
2. Suggest responsiveness improvements
3. Recommend performance optimizations
4. Point out accessibility issues
5. Suggest modern CSS/JS features to implement
6. Recommend UX improvements

OUTPUT: Provide detailed suggestions and recommendations (not code, just analysis and suggestions).
    `.trim();

    // Use Gemini for suggestions (fastest)
    return await this.callGemini(prompt, { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini' });
  }

  async generateEnhancedCode(code: string): Promise<AIResponse> {
    const prompt = `
Transform and improve the following code. Provide the complete enhanced version with these improvements:

CURRENT CODE:
${code}

ENHANCEMENT REQUIREMENTS:
1. Make it more responsive and mobile-friendly
2. Improve visual design with better colors, spacing, and typography
3. Add smooth animations and hover effects
4. Optimize performance and accessibility
5. Use modern CSS features (Grid, Flexbox, custom properties)
6. Add interactive elements where appropriate
7. Improve semantic HTML structure
8. Enhance user experience with better UX patterns

OUTPUT: Provide the complete improved HTML file with embedded CSS and JavaScript. Make it significantly better than the original while maintaining all existing functionality.
    `.trim();

    // Use Gemini for enhanced code generation
    return await this.callGemini(prompt, { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini' });
  }
}

export const aiService = new AIService();