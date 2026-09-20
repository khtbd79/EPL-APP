import React, { useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MatchRecord } from '../types';
import { generateBetSlipJpeg, downloadBetSlipJpeg } from '../utils/betSlipGenerator';
import { Download, X, Check, Share2, Ticket } from 'lucide-react';

interface BetSlipModalProps {
  match: MatchRecord;
  currency?: string;
  onClose: () => void;
  isNewEntry?: boolean;
}

export const BetSlipModal: React.FC<BetSlipModalProps> = ({
  match,
  currency = '$',
  onClose,
  isNewEntry = false,
}) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Generate the JPEG Data URL synchronously on Canvas
  const jpegDataUrl = useMemo(() => {
    return generateBetSlipJpeg(match, currency);
  }, [match, currency]);

  const handleDownload = () => {
    downloadBetSlipJpeg(match, currency);
  };

  const handleShare = async () => {
    if (navigator.share && jpegDataUrl) {
      try {
        // Convert dataUrl to blob without fetch for 100% offline & WebView safety
        const parts = jpegDataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const file = new File([blob], `MatchSlip_${match.dayNumber}.jpg`, { type: 'image/jpeg' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Match Slip #${match.dayNumber} - ${match.homeTeam} vs ${match.awayTeam}`,
            text: `EPL Match Slip: ${match.homeTeam} vs ${match.awayTeam} (${match.market}) @ Odds ${match.odds}`,
            files: [file],
          });
          return;
        }
      } catch (err) {
        console.log('Share canceled or not supported:', err);
      }
    }
    // Fallback: trigger download
    handleDownload();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border-2 border-red-200 overflow-hidden rounded-2xl shadow-2xl flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-red-100 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>{isNewEntry ? 'Match Slip Ready' : 'Official Match Slip'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isNewEntry ? 'Match successfully submitted. Download the slip below.' : 'High-Quality Offline Slip'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Image Preview */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-50">
          {isNewEntry && (
            <div className="w-full mb-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-bold">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Match entry saved! You can download or share the slip.</span>
            </div>
          )}

          {jpegDataUrl ? (
            <div className="relative group w-full max-w-[380px] my-auto">
              <img
                src={jpegDataUrl}
                alt="Match Slip Ticket"
                className="w-full h-auto rounded-xl border border-slate-200 shadow-md"
              />
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Generating slip...
            </div>
          )}
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0 space-y-2">
          <button
            onClick={handleDownload}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-sm shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
            <span>Download Slip (JPEG)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4 text-red-600" />
              <span>Share / Save</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-300 shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
