import { useState } from 'react';
import type { RetrievedFile, DependencyGraph } from '../types';
import DependencyGraphFlow from './DependencyGraphFlow';

interface SidePanelProps {
  retrievedFiles?: RetrievedFile[];
  dependencyGraph?: DependencyGraph;
  isOpen: boolean;
  onClose: () => void;
}

export default function SidePanel({ retrievedFiles, dependencyGraph, isOpen, onClose }: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<'files' | 'graph'>('files');
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const hasFiles = retrievedFiles && retrievedFiles.length > 0;
  const hasGraph = dependencyGraph && dependencyGraph.nodes.length > 0;
  const hasContent = hasFiles || hasGraph;

  const toggleFileExpansion = (path: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFiles(newExpanded);
  };

  if (!hasContent) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed lg:relative right-0 top-0 h-screen w-full lg:w-96 bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Context Info
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 bg-slate-800/30">
          {hasFiles && (
            <button
              onClick={() => setActiveTab('files')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'files'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Files ({retrievedFiles.length})
            </button>
          )}
          {hasGraph && (
            <button
              onClick={() => setActiveTab('graph')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'graph'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Dependencies
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'files' && hasFiles && (
            <div className="p-4 space-y-3">
              {retrievedFiles.map((file, index) => {
                const isExpanded = expandedFiles.has(file.path);
                return (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden"
                  >
                    {/* File Header */}
                    <button
                      onClick={() => toggleFileExpansion(file.path)}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg
                          className="w-4 h-4 text-blue-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-slate-200 truncate font-mono">
                          {file.path}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {file.relevance !== undefined && (
                          <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-700/50 rounded">
                            {Math.round(file.relevance * 100)}%
                          </span>
                        )}
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* File Content */}
                    {isExpanded && (
                      <div className="border-t border-slate-700/50">
                        <pre className="p-3 text-xs text-slate-300 overflow-x-auto font-mono bg-slate-900/50">
                          <code>{file.content}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'graph' && hasGraph && (
            <div className="flex flex-col h-full">
              {dependencyGraph.description && (
                <div className="text-sm text-slate-400 bg-slate-800/50 border-b border-slate-700/50 p-3">
                  {dependencyGraph.description}
                </div>
              )}
              <div className="flex-1 min-h-0">
                <DependencyGraphFlow dependencyGraph={dependencyGraph} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

