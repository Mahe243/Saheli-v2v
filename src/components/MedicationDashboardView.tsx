/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Bookmark, 
  Calendar, 
  Check, 
  X, 
  AlertTriangle, 
  Activity, 
  Clock, 
  CheckCircle, 
  Percent,
  Play,
  Pause,
  Info,
  Heart
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { Medication, MedicationCheckIn } from "../types";
import { useTranslation } from "../utils/translation";

export default function MedicationDashboardView() {
  const { t } = useTranslation();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);

  // Check-in helper state
  const [sideEffectMap, setSideEffectMap] = useState<Record<string, string>>({});
  const [feelingMap, setFeelingMap] = useState<Record<string, "Yes" | "No" | "Same">>({});
  const [missedReasonMap, setMissedReasonMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setMedications(orchestrator.getMedications());
    const unsub = orchestrator.subscribe("medication_updated", () => {
      setMedications([...orchestrator.getMedications()]);
    });
    return () => unsub();
  }, []);

  // Adherence calculation helper
  const calculateAdherence = (med: Medication): number => {
    if (med.checkIns.length === 0) return 100; // default to perfect before any check-in
    const takenCount = med.checkIns.filter(c => c.taken).length;
    return Math.round((takenCount / med.checkIns.length) * 100);
  };

  // Perform daily taking check-in
  const handleCheckIn = (medId: string, taken: boolean) => {
    const checkIn: MedicationCheckIn = {
      date: todayDate,
      taken,
      sideEffects: sideEffectMap[medId] || undefined,
      feelingBetter: feelingMap[medId] || "Same",
      missedReason: !taken ? missedReasonMap[medId] || "Forgot" : undefined
    };

    orchestrator.logMedicationCheckIn(medId, checkIn);
    setMedications([...orchestrator.getMedications()]);

    // Clear maps
    setSideEffectMap(prev => {
      const copy = { ...prev };
      delete copy[medId];
      return copy;
    });
    setFeelingMap(prev => {
      const copy = { ...prev };
      delete copy[medId];
      return copy;
    });
    setMissedReasonMap(prev => {
      const copy = { ...prev };
      delete copy[medId];
      return copy;
    });
  };

  const handleToggleStatus = (medId: string, currentStatus: "Active" | "Completed" | "Paused") => {
    const newStatus: "Active" | "Completed" | "Paused" = currentStatus === "Active" ? "Paused" : "Active";
    orchestrator.updateMedicationStatus(medId, newStatus);
    setMedications([...orchestrator.getMedications()]);
  };

  return (
    <div id="medication-dashboard" className="space-y-8 max-w-6xl mx-auto p-1 animate-fade-in">
      
      {/* 1. Header with Warning Disclaimer Banner */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-dark tracking-tight leading-tight flex items-center gap-2.5">
              <Bookmark className="w-8 h-8 text-[#E05B7C]" />
              {t("Medication Dashboard")}
            </h1>
            <p className="text-text-muted mt-1 text-sm font-sans">
              {t("Track daily adherence compliance, monitor therapeutic cycles, and report side effects safely.")}
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 max-w-md">
            <Info className="w-5 h-5 text-indigo-500 shrink-0" />
            <p className="text-xs text-indigo-800 font-sans leading-relaxed">
              {t("To protect clinical safety, medications are prescribed and added by your doctor during consultations. You can prepare and sync them in Doctor Companion.")}
            </p>
          </div>
        </div>

        {/* Safety Warning Disclaimer Box */}
        <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs font-sans text-rose-800 space-y-1">
            <span className="font-bold block text-rose-950 uppercase tracking-wide">{t("Critical Medication Safety Policy")}</span>
            <p className="leading-relaxed">
              <strong>{t("Never recommend stopping medications, changing doses, or skipping schedules without explicit physician authorization.")}</strong> 
              {t("If you experience side effects, please consult Dr. Anjali Mehta immediately. This dashboard is strictly for personal reminders and adherence monitoring.")}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Daily Check-in & Reminders Checklist (Saves Lives!) */}
      <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-gray-100/80 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5.5 h-5.5 text-indigo-600" />
            <h3 className="font-display font-bold text-text-dark text-base">Daily Reminders & Logs ({todayDate})</h3>
          </div>
          <span className="text-[10px] text-text-muted font-bold font-sans">Double check-in log</span>
        </div>

        <div className="space-y-4">
          {medications.filter(m => m.status === "Active").map((med) => {
            const checkedToday = med.checkIns.find(c => c.date === todayDate);

            return (
              <div 
                key={med.id}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  checkedToday 
                    ? "bg-emerald-50/20 border-emerald-100/40 opacity-80" 
                    : "bg-white border-gray-100/80 hover:border-indigo-100/50"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                    checkedToday 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                      : "bg-indigo-50/50 border-indigo-100 text-indigo-600"
                  }`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-text-dark text-sm">{med.name}</h4>
                    <p className="text-xs text-text-muted font-sans mt-0.5">Dose: <strong>{med.dose}</strong> | Frequency: {med.frequency}</p>
                    {checkedToday && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold font-sans mt-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Took today: {checkedToday.taken ? "Yes" : "No, reason: " + checkedToday.missedReason}
                      </span>
                    )}
                  </div>
                </div>

                {/* Check-In Interactivity (Only if not checked today) */}
                {!checkedToday ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    
                    {/* Check-In fields (Feeling better, side effects) */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-sans w-full sm:w-auto">
                      <div>
                        <span className="text-[9px] font-bold text-text-muted block mb-0.5">Feeling Better?</span>
                        <select
                          value={feelingMap[med.id] || "Same"}
                          onChange={(e) => {
                            const val = e.target.value as "Yes" | "No" | "Same";
                            setFeelingMap(prev => ({ ...prev, [med.id]: val }));
                          }}
                          className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-text-dark focus:outline-none"
                        >
                          <option value="Yes">Yes</option>
                          <option value="Same">Same</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-text-muted block mb-0.5">Side Effects?</span>
                        <input
                          type="text"
                          placeholder="e.g. Nausea"
                          value={sideEffectMap[med.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSideEffectMap(prev => ({ ...prev, [med.id]: val }));
                          }}
                          className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-text-dark focus:outline-none w-full"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleCheckIn(med.id, true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-display font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Took Medicine
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Reason for missing dose?", "Forgot");
                          if (reason !== null) {
                            setMissedReasonMap(prev => ({ ...prev, [med.id]: reason }));
                            setTimeout(() => handleCheckIn(med.id, false), 10);
                          }
                        }}
                        className="px-3.5 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full font-display font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Missed
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-emerald-600 font-bold font-sans">Adherence Logged</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Medications Ledger list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ledger List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-lg text-text-dark">Medication Ledger ({medications.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => {
              const adherence = calculateAdherence(med);
              const isActive = med.status === "Active";

              return (
                <div 
                  key={med.id}
                  className={`p-5 bg-white border rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[180px] relative overflow-hidden group ${
                    isActive ? "border-gray-100" : "border-gray-100 bg-gray-50/40 opacity-75"
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-sans uppercase tracking-wider ${
                        isActive 
                          ? "bg-indigo-50 text-indigo-700" 
                          : med.status === "Completed" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-amber-50 text-amber-700"
                      }`}>
                        {med.status}
                      </span>
                      
                      <button
                        onClick={() => handleToggleStatus(med.id, med.status)}
                        className="p-1 rounded-full text-text-muted hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer print:hidden"
                        title={isActive ? "Pause Reminders" : "Resume Reminders"}
                      >
                        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-text-dark text-sm group-hover:text-indigo-600 transition-colors">
                        {med.name}
                      </h4>
                      <p className="text-[11px] text-text-muted font-sans mt-0.5 leading-normal">
                        Dose: <strong>{med.dose}</strong> | {med.duration} duration
                      </p>
                    </div>
                  </div>

                  <div className="pt-3.5 mt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Starts: {med.startDate}
                    </span>

                    {/* Circular adherence tracker */}
                    <div className="flex items-center gap-1.5 font-sans">
                      <span className="text-[10px] text-text-muted">Adherence:</span>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                        adherence >= 85 
                          ? "bg-emerald-50 text-emerald-600" 
                          : adherence >= 70 
                            ? "bg-amber-50 text-amber-600" 
                            : "bg-rose-50 text-rose-600"
                      }`}>
                        {adherence}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Adherence Science & Safety Sidebar */}
        <div className="space-y-4 font-sans">
          <h3 className="font-display font-bold text-lg text-text-dark">Compliance Insights</h3>
          
          <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100/80 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-50/50 to-transparent rounded-bl-full"></div>
            
            <div className="flex items-center gap-2.5">
              <Percent className="w-6 h-6 text-[#E05B7C]" />
              <h4 className="font-display font-bold text-text-dark text-sm">Adherence Science</h4>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Consistently taking supplements on time is crucial. For instance, skipping iron pills can delay recovery from nutritional anemia. 
              <strong> Keep up your 85%+ score to maintain safe cellular reserves!</strong>
            </p>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 space-y-2 flex items-start gap-2.5">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-800 leading-normal">
                <strong>Anemia Defense Tip:</strong> Take iron tablets on an empty stomach at night or with Vitamin C (lemon water) to enhance absorption.
              </div>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-2 flex items-start gap-2.5">
              <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-indigo-800 leading-normal">
                Need advice on medication times? Start an **AI Health Conversation** or review pre-visit notes inside **Doctor Companion**.
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
