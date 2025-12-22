/**
 * MarkdownRenderer component - renders markdown content safely.
 * ReactMarkdown safely converts markdown to React elements without
 * executing arbitrary HTML/JS, so no pre-sanitization needed.
 */

import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          // Open links in new tab with security attributes
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
