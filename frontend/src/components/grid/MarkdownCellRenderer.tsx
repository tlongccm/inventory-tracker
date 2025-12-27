/**
 * MarkdownCellRenderer - AG Grid cell renderer for markdown content.
 * Renders markdown safely using ReactMarkdown.
 */

import type { ICellRendererParams } from 'ag-grid-community';
import ReactMarkdown from 'react-markdown';

export default function MarkdownCellRenderer(props: ICellRendererParams) {
  const value = props.value;
  if (!value) return <span>-</span>;

  return (
    <div className="markdown-content markdown-cell">
      <ReactMarkdown
        components={{
          // Open links in new tab with security attributes
          a: ({ node, ...linkProps }) => (
            <a {...linkProps} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} />
          ),
        }}
      >
        {String(value)}
      </ReactMarkdown>
    </div>
  );
}
