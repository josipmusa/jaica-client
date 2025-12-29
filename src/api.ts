import type { ChatRequest, ChatResponse, StreamChunk } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function* streamMessage(request: ChatRequest): AsyncGenerator<StreamChunk> {
  const response = await fetch(`${API_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body available');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines (assuming server sends line-delimited JSON)
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.substring(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const chunk: StreamChunk = JSON.parse(data);
            yield chunk;
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        } else if (trimmedLine) {
          // Try parsing as raw JSON if not SSE format
          try {
            const chunk: StreamChunk = JSON.parse(trimmedLine);
            yield chunk;
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

