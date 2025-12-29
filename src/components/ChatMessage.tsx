import type { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/vs2015.css';
import type { Components } from 'react-markdown';
interface ChatMessageProps {
  message: Message;
}
export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const markdownComponents: Components = {
    code: ({ className, children, ...props }: any) => {
      const isInline = !className;
      return isInline ? (
        <code className="bg-slate-900/50 px-1.5 py-0.5 rounded text-sm text-purple-300" {...props}>
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }: any) => (
      <pre className="bg-slate-900/70 border border-slate-700/50 rounded-lg p-4 overflow-x-auto my-3" {...props}>
        {children}
      </pre>
    ),
    a: ({ children, ...props }: any) => (
      <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside space-y-1 my-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside space-y-1 my-2" {...props}>
        {children}
      </ol>
    ),
    h1: ({ children, ...props }: any) => (
      <h1 className="text-2xl font-bold mt-4 mb-2 text-white" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-bold mt-3 mb-2 text-white" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-bold mt-2 mb-1 text-white" {...props}>
        {children}
      </h3>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-purple-500 pl-4 italic my-2 text-slate-300" {...props}>
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border border-slate-700" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }: any) => (
      <th className="border border-slate-700 px-3 py-2 bg-slate-800/50 font-semibold text-left" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-slate-700 px-3 py-2" {...props}>
        {children}
      </td>
    ),
    p: ({ children, ...props }: any) => (
      <p className="my-2 leading-relaxed" {...props}>
        {children}
      </p>
    ),
  };
  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className={`shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30 ${message.isStreaming && !message.content ? 'animate-pulse' : ''}`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        <div
          className={`rounded-2xl px-5 py-3 shadow-lg ${
            isUser
              ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-br-md shadow-blue-500/20'
              : 'bg-slate-800/80 border border-slate-700/50 text-slate-100 rounded-bl-md'
          }`}
        >
          <div className="text-[15px] leading-relaxed prose prose-invert prose-slate max-w-none">
            {isUser ? (
              <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
            ) : message.isStreaming && !message.content ? (
              // Show "thinking" indicator when streaming but no content yet
              <div className="flex items-center gap-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-slate-400 italic">Thinking...</span>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          {message.intent && !isUser && (
            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              <span className="text-xs font-medium text-slate-400">{message.intent}</span>
            </div>
          )}
        </div>
        <div className={`mt-1 px-2 text-xs text-slate-500 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}
