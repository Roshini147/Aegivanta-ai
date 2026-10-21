import React, { useState } from 'react';
import { Camera, Check, ShieldCheck, X } from 'lucide-react';
import { TaskItem } from '../types';
import { api } from '../services/api';

interface EvidenceModalProps {
  task: TaskItem;
  onClose: () => void;
  onEvidenceRecorded: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ task, onClose, onEvidenceRecorded }) => {
  const [evidenceType, setEvidenceType] = useState('PHOTO_REFERENCE');
  const [source, setSource] = useState('Mobile Camera Inspection');
  const [description, setDescription] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a specific verification description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.recordEvidence({
        task_id: task.id,
        evidence_type: evidenceType,
        source,
        description,
        is_simulated: isSimulated
      });
      onEvidenceRecorded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record evidence');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#141e33] border border-[#24324f] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#24324f] pb-3">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Attach Verification Evidence</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Target Task:</span>
          <h4 className="text-sm font-semibold text-slate-200">{task.title}</h4>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Evidence Type:</label>
            <select
              value={evidenceType}
              onChange={(e) => {
                setEvidenceType(e.target.value);
                if (e.target.value === 'PHOTO_REFERENCE') {
                  setSource('Mobile Camera Inspection');
                  setDescription('Timestamped smartphone photo showing secure physical engagement.');
                } else if (e.target.value === 'USER_ATTESTATION') {
                  setSource('Homeowner Direct Check');
                  setDescription('Physical double-check conducted directly before locking house.');
                } else if (e.target.value === 'SIMULATED_SENSOR_TELEMETRY') {
                  setSource('Simulated IoT Sensor Telemetry');
                  setDescription('Contact closure telemetry verified via smart device mesh.');
                  setIsSimulated(true);
                }
              }}
              className="w-full bg-[#090d16] border border-[#24324f] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="PHOTO_REFERENCE">Photographic Reference (Direct Evidence)</option>
              <option value="USER_ATTESTATION">Physical User Attestation (Corroborative)</option>
              <option value="DOUBLE_CHECK_NOTE">Two-Party Double Check (Corroborative)</option>
              <option value="SIMULATED_SENSOR_TELEMETRY">Simulated Telemetry Reading (Demo Simulation)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Evidence Source:</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="E.g. Mobile Camera, Neighbor Attestation, Sensor #104"
              className="w-full bg-[#090d16] border border-[#24324f] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Observation / Proof Description:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe observation (e.g. Photo taken of closed quarter-turn brass valve, locked deadbolt throw engaged)..."
              className="w-full bg-[#090d16] border border-[#24324f] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <label className="flex items-center space-x-2 cursor-pointer bg-[#090d16] p-2.5 rounded-lg border border-[#24324f]">
            <input
              type="checkbox"
              checked={isSimulated}
              onChange={(e) => setIsSimulated(e.target.checked)}
              className="rounded accent-cyan-500"
            />
            <span className="text-slate-300">
              Flag as Demo Simulation (<code className="text-cyan-400">is_simulated = True</code>)
            </span>
          </label>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex justify-end space-x-2 pt-2 border-t border-[#1c2942]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#090d16] hover:bg-[#1a2742] text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Attach & Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
