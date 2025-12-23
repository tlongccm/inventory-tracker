/**
 * ShareLinkButton component - copies the current URL to clipboard with toast feedback.
 */

import { useState, useCallback } from 'react';

interface ShareLinkButtonProps {
  /** Optional custom URL to copy (defaults to current page URL) */
  url?: string;
  /** Optional button label */
  label?: string;
  /** Optional additional class name */
  className?: string;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
}

/**
 * Button that copies the current page URL to clipboard.
 * Shows a toast notification on success/failure.
 */
export default function ShareLinkButton({
  url,
  label = 'Copy Link',
  className = '',
}: ShareLinkButtonProps) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const handleCopy = useCallback(async () => {
    const urlToCopy = url || window.location.href;

    try {
      await navigator.clipboard.writeText(urlToCopy);
      showToast('Link copied to clipboard!', 'success');
    } catch (err) {
      // Fallback for browsers without clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = urlToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Link copied to clipboard!', 'success');
      } catch {
        showToast('Failed to copy link', 'error');
      }
    }
  }, [url, showToast]);

  return (
    <>
      <button
        type="button"
        className={`secondary share-link-btn ${className}`}
        onClick={handleCopy}
        title="Copy shareable link to clipboard"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {label}
      </button>

      {/* Toast notification */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
