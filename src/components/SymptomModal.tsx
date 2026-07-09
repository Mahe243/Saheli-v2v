/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Activity, Check, Heart, ShieldCheck } from "lucide-react";
import { orchestrator } from "../services/orchestrator";

interface SymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SymptomModal({ isOpen, onClose }: SymptomModalProps) {
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState<"Mild" | "Moderate" | "Severe">("Mild");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Dispatch symptom_added cascade inside orchestrator
    orchestrator.addSymptom({
      name: name.trim(),
      severity,
      notes: notes.trim() || undefined
    });

    setSuccess(true);
    setTimeout(() => {
      // Clean up modal state and close
      setName("");
      setSeverity("Mild");
      setNotes("");
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white max-w-lg w-full rounded-[24px] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/80 relative space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          /* Success Screen Cascade feedback */
          <div className="text-center py-8 space-y-5 animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-100 to-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200/50 shadow-xs">
              <Check className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-2xl text-text-dark tracking-tight">Symptom Logged!</h3>
              <p className="text-sm text-text-muted max-w-sm mx-auto font-sans leading-relaxed">
                Your Lifelong Health Brain has securely registered this symptom. Saheli will incorporate this into your next clinical brief automatically.
              </p>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/50">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                symptom_added Cascade Fired
              </div>
            </div>
          </div>
        ) : (
          /* Normal Input Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
              <div className="p-3 bg-[#F8C8DC]/20 text-pink-600 rounded-2xl border border-[#F8C8DC]/30">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-text-dark tracking-tight">Update Symptoms</h2>
                <p className="text-xs text-text-muted mt-0.5 font-sans leading-normal">Quickly record how your body is experiencing discomfort.</p>
              </div>
            </div>

            {/* Symptom name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">What discomfort are you feeling?</label>
              <input
                type="text"
                placeholder="e.g., lower back stiffness, seasonal cough"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3.5 bg-gray-50/60 border border-gray-200/80 rounded-[16px] text-sm text-text-dark outline-none focus:border-[#F8C8DC] focus:bg-white focus:shadow-xs transition-all font-sans"
              />
            </div>

            {/* Severity selector (Large targets for easy click) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">How severe is it?</label>
              <div className="grid grid-cols-3 gap-3">
                {(["Mild", "Moderate", "Severe"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`py-3.5 rounded-[16px] text-sm font-bold border transition-all cursor-pointer ${
                      severity === level 
                        ? level === "Mild" ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs scale-102"
                          : level === "Moderate" ? "bg-amber-50 border-amber-300 text-amber-800 shadow-xs scale-102"
                          : "bg-rose-50 border-rose-300 text-rose-800 shadow-xs scale-102"
                        : "bg-gray-50/50 border-gray-200/80 text-text-muted hover:bg-gray-50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Supplemental details */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Any personal notes or triggers?</label>
              <textarea
                rows={3}
                placeholder="e.g., Felt tightening after lifting water containers, relieved after resting."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3.5 bg-gray-50/60 border border-gray-200/80 rounded-[16px] text-sm text-text-dark outline-none focus:border-[#F8C8DC] focus:bg-white focus:shadow-xs transition-all font-sans resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 border border-gray-200 rounded-full text-xs font-bold text-text-dark hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-7 py-3.5 bg-gradient-to-r from-pink-500 to-[#F8C8DC] text-white hover:shadow-md font-display font-bold text-sm rounded-full border border-pink-400/40 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent transition-all"
              >
                Commit to Health Brain
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
