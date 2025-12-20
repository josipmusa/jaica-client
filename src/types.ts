export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  timestamp: Date;
}

export interface ChatRequest {
  prompt: string;
  project_name?: string;
}

export interface ChatResponse {
  answer: string;
  intent: string;
}

