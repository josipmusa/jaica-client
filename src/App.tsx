import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import SidePanel from './components/SidePanel';
import { streamMessage } from './api';
import type { Message, RetrievedFile, DependencyGraph } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if any message is currently streaming
  const isLoading = messages.some(msg => msg.isStreaming);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, projectName?: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setError(null);

    // Create placeholder for assistant message
    const assistantId = uuidv4();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const stream = streamMessage({
        prompt: content,
        project_name: projectName,
      });

      let accumulatedContent = '';
      let intent: string | undefined;
      let retrievedFiles: RetrievedFile[] | undefined = undefined;
      let dependencyGraph: DependencyGraph | undefined = undefined;
      let hasOpenedPanel = false;

      for await (const chunk of stream) {
        if (chunk.type === 'content' && chunk.content) {
          accumulatedContent += chunk.content;

          // Update the message with accumulated content (and any metadata we have)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: accumulatedContent,
                    intent,
                    retrievedFiles,
                    dependencyGraph,
                  }
                : msg
            )
          );
        } else if (chunk.type === 'metadata') {
          // Update metadata immediately when received
          if (chunk.intent) intent = chunk.intent;
          if (chunk.retrievedFiles) retrievedFiles = chunk.retrievedFiles;
          if (chunk.dependencyGraph) dependencyGraph = chunk.dependencyGraph;

          // Update the message with metadata
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: accumulatedContent,
                    intent,
                    retrievedFiles,
                    dependencyGraph,
                    isStreaming: true,
                  }
                : msg
            )
          );

          // Auto-open panel when metadata arrives (usually first chunk)
          if (!hasOpenedPanel && (retrievedFiles || dependencyGraph)) {
            const currentMessage: Message = {
              id: assistantId,
              role: 'assistant',
              content: accumulatedContent,
              intent,
              timestamp: new Date(),
              retrievedFiles,
              dependencyGraph,
            };
            setSelectedMessage(currentMessage);
            setIsPanelOpen(true);
            hasOpenedPanel = true;
          }
        } else if (chunk.type === 'done') {
          // Final update (mark streaming as complete)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: accumulatedContent,
                    intent,
                    retrievedFiles,
                    dependencyGraph,
                    isStreaming: false,
                  }
                : msg
            )
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error sending message:', err);

      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
    }
  };

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700/50 shadow-lg z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Coding Assistant</h1>
                <p className="text-xs text-slate-400">Powered by JAICA</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                <span className="text-xs font-medium text-emerald-400">Online</span>
              </div>

              {/* Toggle Panel Button (Mobile) */}
              {selectedMessage && (selectedMessage.retrievedFiles || selectedMessage.dependencyGraph) && (
                <button
                  onClick={() => setIsPanelOpen(!isPanelOpen)}
                  className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all"
                  title="Toggle context panel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}

              <button
                onClick={() => {
                  setMessages([]);
                  setSelectedMessage(null);
                  setIsPanelOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all"
                title="Clear chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="text-center">
                  <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/30">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Start a conversation</h2>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">Ask me anything about coding, debugging, or software development. I'm here to help!</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {[
                      { icon: '💡', title: 'Get help with code', desc: 'Debug errors and optimize solutions' },
                      { icon: '🔍', title: 'Explain concepts', desc: 'Understand complex topics easily' },
                      { icon: '🎨', title: 'Design patterns', desc: 'Learn best practices and patterns' },
                      { icon: '🚀', title: 'Project guidance', desc: 'Get advice on architecture' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl hover:bg-slate-700/50 hover:border-slate-600/50 hover:shadow-lg transition-all text-left">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <h3 className="font-semibold text-slate-200 text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id}>
                    <ChatMessage message={message} />
                    {/* Context Indicator */}
                    {message.role === 'assistant' && (message.retrievedFiles || message.dependencyGraph) && (
                      <div className="flex gap-2 mb-4 ml-13">
                        {message.retrievedFiles && message.retrievedFiles.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedMessage(message);
                              setIsPanelOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {message.retrievedFiles.length} file{message.retrievedFiles.length !== 1 ? 's' : ''}
                          </button>
                        )}
                        {message.dependencyGraph && (
                          <button
                            onClick={() => {
                              setSelectedMessage(message);
                              setIsPanelOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Dependencies
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/20">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-300 flex-1">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>

      {/* Side Panel */}
      <SidePanel
        retrievedFiles={selectedMessage?.retrievedFiles}
        dependencyGraph={selectedMessage?.dependencyGraph}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}

export default App;

