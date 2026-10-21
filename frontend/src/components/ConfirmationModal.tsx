import React, { useState } from 'react';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';
import { ActionConfirmation } from '../types';
import { api } from '../services/api';

interface ConfirmationModalProps {
  confirmations: ActionConfirmation[];
  onClose: () => void;
  onResolved: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  confirmations,
  onClose,
  onResolved
}) => {
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolve = async (id: string, approved: boolean) => {
    setResolvingId(id);
    try {
      const res = await api.resolveConfirmation(id, approved);
      alert(res.outcome_message);
      onResolved();
      if (confirmations.length <= 1) {
        onClose();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#141e33] border border-amber-800/60 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#24324f] pb-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-100">
              Consequential Action Authorization Required
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          In compliance with safety boundaries, consequential operations (such as arming perimeter security or locking away routines) require explicit human consent.
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {confirmations.map((conf) => (
            <div
              key={conf.id}
              className="p-4 rounded-xl bg-[#090d16] border border-amber-900/40 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-400 font-bold">{conf.action_type}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Target: {conf.target_id}
                </span>
              </div>

              <p className="text-slate-200 leading-relaxed font-medium">
                {conf.rationale}
              </p>

              {conf.parameters && (
                <div className="font-mono text-[10px] bg-[#141e33] p-2 rounded text-slate-400">
                  Params: {conf.parameters}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => handleResolve(conf.id, false)}
                  disabled={resolvingId === conf.id}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-800 text-red-300 text-xs font-semibold"
                >
                  Reject & Halt
                </button>
                <button
                  onClick={() => handleResolve(conf.id, true)}
                  disabled={resolvingId === conf.id}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
                >
                  Approve Action
                </button>
              </div>
            </div>
          ))}

          {confirmations.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No pending confirmation requests.</p>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1c2942]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#090d16] hover:bg-[#1a2742] text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
