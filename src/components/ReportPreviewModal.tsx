import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, Download, Copy, Check, X, FileText, Smartphone } from 'lucide-react';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  htmlContent: string;
  downloadFilename: string;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  htmlContent,
  downloadFilename,
}) => {
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Safe In-App Print Handler
  const handlePrint = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      }
    } catch (e) {
      console.warn('Iframe print error:', e);
    }

    // Fallback: try window.print directly
    try {
      window.print();
    } catch (e) {
      console.warn('Window print error:', e);
    }
  };

  // Safe Download Handler
  const handleDownload = () => {
    try {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename.endsWith('.html') ? downloadFilename : `${downloadFilename}.html`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 500);
    } catch (e) {
      console.error('Failed to download report:', e);
    }
  };

  // Copy Plaintext Report
  const handleCopyText = async () => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const text = tempDiv.innerText || tempDiv.textContent || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy text:', e);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/30 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[94vh] bg-white border-2 border-red-500 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-red-600 border-b border-red-700 shrink-0 text-white">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 bg-red-700 text-white rounded-xl border border-red-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white truncate">{title}</h3>
              <p className="text-[11px] text-red-100 flex items-center gap-1 font-medium">
                <Smartphone className="w-3 h-3 text-white" />
                <span>Offline Report Viewer</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 active:scale-95 text-red-700 font-black text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Print / PDF</span>
              <span className="sm:hidden">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-900 active:scale-95 text-white font-black text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer border border-red-700"
              title="Download offline HTML file"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Download (.html)</span>
              <span className="sm:hidden">HTML</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 active:scale-95 text-white font-bold text-xs flex items-center space-x-1 border border-red-500 transition-all cursor-pointer"
              title="Copy report text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-red-700 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded Sandboxed HTML Document */}
        <div className="flex-1 w-full bg-white relative overflow-hidden">
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            title="Report Document"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-modals"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};
