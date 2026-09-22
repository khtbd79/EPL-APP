import React, { useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MatchRecord } from '../types';
import { generateBetSlipJpeg, downloadBetSlipJpeg } from '../utils/betSlipGenerator';
import { formatMoney } from '../utils/storage';
import { Download, X, Check, Share2, Ticket, PenSquare, Eye } from 'lucide-react';

interface BetSlipModalProps {
  match: MatchRecord;
  currency?: string;
  onClose: () => void;
  isNewEntry?: boolean;
  onUpdateMatch?: (match: MatchRecord) => void;
  initialEditing?: boolean;
}

export const BetSlipModal: React.FC<BetSlipModalProps> = ({
  match,
  currency = '$',
  onClose,
  isNewEntry = false,
  onUpdateMatch,
  initialEditing = false,
}) => {
  const [activeMatch, setActiveMatch] = useState<MatchRecord>(match);
  const [isEditing, setIsEditing] = useState<boolean>(initialEditing);
  const [editOdds, setEditOdds] = useState<string>(String(match.odds));
  const [editStake, setEditStake] = useState<string>(String(match.stake));
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    setActiveMatch(match);
    setEditOdds(String(match.odds));
    setEditStake(String(match.stake));
  }, [match]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Generate the JPEG Data URL synchronously on Canvas using activeMatch
  const jpegDataUrl = useMemo(() => {
    return generateBetSlipJpeg(activeMatch, currency);
  }, [activeMatch, currency]);

  const handleDownload = () => {
    downloadBetSlipJpeg(activeMatch, currency);
  };

  const handleSaveSlipEdits = (andDownload: boolean = false) => {
    const parsedOdds = parseFloat(editOdds);
    const parsedStake = parseFloat(editStake);

    if (isNaN(parsedOdds) || parsedOdds <= 1) {
      alert('Please enter valid odds greater than 1.00');
      return;
    }
    if (isNaN(parsedStake) || parsedStake <= 0) {
      alert('Please enter a valid stake amount');
      return;
    }

    const updated: MatchRecord = {
      ...activeMatch,
      odds: parsedOdds,
      stake: parsedStake,
      profit: activeMatch.result === 'WIN' ? parsedStake * (parsedOdds - 1) : 0,
      loss: activeMatch.result === 'LOSS' ? parsedStake : 0,
      netPnL:
        activeMatch.result === 'WIN'
          ? parsedStake * (parsedOdds - 1)
          : activeMatch.result === 'LOSS'
          ? -parsedStake
          : 0,
    };

    setActiveMatch(updated);
    if (onUpdateMatch) {
      onUpdateMatch(updated);
    }

    setSavedNotice('Slip Updated Successfully');
    setTimeout(() => setSavedNotice(null), 2500);

    if (andDownload) {
      downloadBetSlipJpeg(updated, currency);
    } else {
      setIsEditing(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && jpegDataUrl) {
      try {
        const parts = jpegDataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const file = new File([blob], `MatchSlip_${activeMatch.dayNumber}.jpg`, { type: 'image/jpeg' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Match Slip #${activeMatch.dayNumber} - ${activeMatch.homeTeam} vs ${activeMatch.awayTeam}`,
            text: `EPL Match Slip: ${activeMatch.homeTeam} vs ${activeMatch.awayTeam} (${activeMatch.market}) @ Odds ${activeMatch.odds}`,
            files: [file],
          });
          return;
        }
      } catch (err) {
        console.log('Share canceled or not supported:', err);
      }
    }
    handleDownload();
  };

  const numericOdds = parseFloat(editOdds) || activeMatch.odds;
  const numericStake = parseFloat(editStake) || activeMatch.stake;
  const projectedReturn = numericOdds * numericStake;
  const projectedProfit = numericStake * (numericOdds - 1);

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
                <span>{isEditing ? 'Edit Bet Slip' : isNewEntry ? 'Match Slip Ready' : 'Official Match Slip'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isEditing
                  ? 'Update Odds & Stake Amount'
                  : isNewEntry
                  ? 'Match successfully submitted. Download the slip below.'
                  : 'High-Quality Offline Slip'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {onUpdateMatch && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  isEditing
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
                title={isEditing ? 'View Slip Preview' : 'Edit Odds & Stake'}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </>
                ) : (
                  <>
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>Edit Slip</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center bg-slate-50 space-y-3">
          {savedNotice && (
            <div className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-bold animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{savedNotice}</span>
            </div>
          )}

          {isNewEntry && !savedNotice && (
            <div className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-bold">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Match entry saved! You can download or share the slip.</span>
            </div>
          )}

          {/* Quick Edit Panel */}
          {isEditing && (
            <div className="w-full bg-white p-4 rounded-xl border border-red-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="text-xs font-black text-slate-900 truncate">
                  {activeMatch.homeTeam} vs {activeMatch.awayTeam}
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                  {activeMatch.market}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ODDS
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    value={editOdds}
                    onChange={(e) => setEditOdds(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    STAKE ({currency})
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    value={editStake}
                    onChange={(e) => setEditStake(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-red-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Calculated projected returns */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    Total Return
                  </span>
                  <span className="font-mono font-black text-slate-900">
                    {formatMoney(projectedReturn, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    Projected Profit
                  </span>
                  <span className="font-mono font-black text-emerald-600">
                    +{formatMoney(projectedProfit, currency)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleSaveSlipEdits(false)}
                  className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => handleSaveSlipEdits(true)}
                  className="py-2 px-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save & Download</span>
                </button>
              </div>
            </div>
          )}

          {/* Ticket Canvas Preview */}
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
