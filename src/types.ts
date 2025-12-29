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
  retrievedFiles?: RetrievedFile[];
  dependencyGraph?: DependencyGraph;
  isStreaming?: boolean;
}

export interface ChatRequest {
  prompt: string;
  project_name?: string;
}

export interface StreamChunk {
  type: 'content' | 'metadata' | 'done';
  content?: string;
  intent?: string;
  retrievedFiles?: RetrievedFile[];
  dependencyGraph?: DependencyGraph;
}

export interface Project {
  name: string;
  node_count: number;
}

export interface ProjectsResponse {
  projects: Project[];
  count: number;
}

