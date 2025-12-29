import { useState, useRef, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { fetchProjects } from '../api';
import type { Project } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string, projectName?: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [projectName, setProjectName] = useState('');
  const [showProjectInput, setShowProjectInput] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch projects when component mounts
  useEffect(() => {
    const loadProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const response = await fetchProjects();
        setProjects(response.projects);
      } catch (error) {
        setProjectsError(error instanceof Error ? error.message : 'Failed to load projects');
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), projectName.trim() || undefined);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-slate-700/50 bg-slate-800/90 backdrop-blur-md shadow-lg">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-4">
        {showProjectInput && (
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {projectsLoading ? (
                <span className="flex-1 text-sm text-slate-400">Loading projects...</span>
              ) : projectsError ? (
                <span className="flex-1 text-sm text-red-400">{projectsError}</span>
              ) : (
                <select
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-slate-200 placeholder-slate-500"
                  disabled={disabled || projects.length === 0}
                >
                  <option value="" className="bg-slate-700">Select a project...</option>
                  {projects.map((project) => (
                    <option key={project.name} value={project.name} className="bg-slate-700">
                      {project.name} ({project.node_count} nodes)
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowProjectInput(false);
                setProjectName('');
              }}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {!showProjectInput && (
            <button
              type="button"
              onClick={() => setShowProjectInput(true)}
              disabled={disabled}
              className="shrink-0 p-3 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add project context"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
          )}

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-100 placeholder-slate-500 transition-all min-h-13 max-h-50"
              rows={1}
              disabled={disabled}
            />
            <div className="absolute bottom-2 right-2 text-xs text-slate-500">
              <kbd className="px-1.5 py-0.5 bg-slate-800/80 border border-slate-600/50 rounded text-xs">↵</kbd>
            </div>
          </div>

          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="shrink-0 p-3 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:shadow-none"
          >
            {disabled ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        <div className="mt-2 text-xs text-slate-500 px-1">
          Press <kbd className="px-1.5 py-0.5 bg-slate-700/50 border border-slate-600/50 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-700/50 border border-slate-600/50 rounded text-xs">Shift+Enter</kbd> for new line
        </div>
      </form>
    </div>
  );
}

