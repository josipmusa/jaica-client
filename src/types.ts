export interface RetrievedFile {
  path: string;
  content: string;
  relevance?: number;
}

export interface DependencyGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
  description?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  timestamp: Date;
  retrieved_files?: RetrievedFile[];
  dependency_graph?: DependencyGraph;
}

export interface ChatRequest {
  prompt: string;
  project_name?: string;
}

export interface ChatResponse {
  answer: string;
  intent: string;
  retrieved_files?: RetrievedFile[];
  dependency_graph?: DependencyGraph;
}

