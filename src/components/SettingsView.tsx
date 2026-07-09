/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Settings, 
  Bell, 
  Languages, 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  Check, 
  FileText, 
  Smartphone, 
  AlertTriangle,
  Lock,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";

export default function SettingsView() {
  const [theme, setTheme] = useState("Calm Pastel Light");
  const [language, setLanguage] = useState("English");
  
  // Notification States
  const [smsReminders, setSmsReminders] = useState(true);
  const [ashaWorkerReminders, setAshaWorkerReminders] = useState(true);
  const [weeklyStatus, setWeeklyStatus] = useState(false);
  
  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleExportData = () => {
    const data = {
      brain: orchestrator.getHealthBrain(),
      symptoms: orchestrator.getSymptomLog(),
      timeline: orchestrator.getTimeline(),
      appointments: orchestrator.getAppointments(),
      summary: orchestrator.getHealthSummary()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Saheli_Health_Brain_Export_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessMsg("Health Brain Exported Successfully to JSON format.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleResetSystem = () => {
    orchestrator.resetToDefault();
    setShowResetConfirm(false);
    setSuccessMsg("System successfully reset to rural default seed data (Priya Devi's health brain).");
    setTimeout(() => {
      setSuccessMsg(null);
      window.location.reload();
    }, 2500);
  };

  return (
    <div id="settings-view" className="space-y-8 max-w-4xl mx-auto p-1 animate-fade-in">
      
      {/* Title */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-display font-bold text-text-dark flex items-center gap-2.5 tracking-tight">
          <Settings className="w-8 h-8 text-indigo-500" />
          Settings & Preferences
        </h1>
        <p className="text-text-muted mt-1.5 text-sm md:text-base font-sans">
          Adjust alerts, toggle local dialects, and manage the data encryption key for your Health Brain.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-[16px] text-sm font-semibold flex items-center gap-2 animate-fade-in shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Visual Customization & Alerts */}
        <div className="space-y-6">
          
          {/* Notification Alerts */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-pink-50 rounded-lg text-pink-600 border border-pink-100/50">
                <Bell className="w-4.5 h-4.5" />
              </div>
              Healthcare Alerts & SMS
            </h3>
            
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Stay reminded about crucial iron supplements or upcoming prenatal village visits.
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-start justify-between p-4 bg-gray-50/60 rounded-[18px] cursor-pointer hover:bg-gray-100/30 transition-all border border-gray-150/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-text-dark block">Saheli SMS Reminders</span>
                    <span className="text-xs text-text-muted block mt-0.5 font-sans">Receive free vaccine alerts via village SMS</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={smsReminders} 
                  onChange={(e) => setSmsReminders(e.target.checked)}
                  className="w-4.5 h-4.5 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                />
              </label>

              <label className="flex items-start justify-between p-4 bg-gray-50/60 rounded-[18px] cursor-pointer hover:bg-gray-100/30 transition-all border border-gray-150/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-text-dark block">ASHA Worker Coordination</span>
                    <span className="text-xs text-text-muted block mt-0.5 font-sans">Let local health worker (Sunita) see update timeline</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={ashaWorkerReminders} 
                  onChange={(e) => setAshaWorkerReminders(e.target.checked)}
                  className="w-4.5 h-4.5 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                />
              </label>

              <label className="flex items-start justify-between p-4 bg-gray-50/60 rounded-[18px] cursor-pointer hover:bg-gray-100/30 transition-all border border-gray-150/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-text-dark block">Weekly Progress Digest</span>
                    <span className="text-xs text-text-muted block mt-0.5 font-sans">Receive an automated health summary report</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={weeklyStatus} 
                  onChange={(e) => setWeeklyStatus(e.target.checked)}
                  className="w-4.5 h-4.5 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Regional Languages Dialect (Accessibility) */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100/50">
                <Languages className="w-4.5 h-4.5" />
              </div>
              Language & Dialects
            </h3>
            
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Choose your preferred regional dialect. Saheli rephrases complex clinical words into easy mother tongue explanations.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {["English", "Hindi (हिन्दी)", "Bengali (বাংলা)", "Telugu (తెలుగు)", "Tamil (தமிழ்)", "Marathi (मराठी)"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`p-3.5 rounded-[14px] text-xs font-bold border transition-all cursor-pointer text-left ${
                    language === lang 
                      ? "bg-[#D8C4F1]/20 border-[#D8C4F1] text-text-dark shadow-2xs" 
                      : "bg-gray-50/60 border-gray-200 text-text-muted hover:bg-gray-50"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Privacy, Exports & System reset */}
        <div className="space-y-6">
          
          {/* Privacy & Encryption Shield */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100/50">
                <Lock className="w-4.5 h-4.5" />
              </div>
              Permanent Encrypted Security
            </h3>
            
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              All personal, obstetric, and lifestyle information registered on Saheli is kept in AES-256 local-first encrypted silos. Absolutely no medical telemetry or log is shared with commercial agencies.
            </p>

            <div className="p-4.5 bg-emerald-50/40 border border-emerald-100/85 rounded-[18px] text-xs text-emerald-800 space-y-1.5 leading-relaxed font-sans">
              <div className="flex items-center gap-1 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>HIPAA & Digital Personal Data Protection (DPDP) aligned</span>
              </div>
              <p className="text-emerald-800/90 font-medium">
                The device is coupled with a unique cryptographic patient ID. Even during shared rural sub-center consultations, your information requires your fingerprint or consent.
              </p>
            </div>
          </div>

          {/* Data Portability/Export */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100/50">
                <Download className="w-4.5 h-4.5" />
              </div>
              Data Portability
            </h3>
            
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Take complete ownership of your healthcare history. Export your Health Brain instantly.
            </p>

            <button
              onClick={handleExportData}
              className="w-full py-4 bg-[#D8C4F1]/30 hover:bg-[#D8C4F1]/50 text-text-dark font-display font-bold text-xs rounded-full transition-all border border-[#D8C4F1]/50 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4.5 h-4.5 stroke-[2.5]" /> Export Complete Health Brain (JSON)
            </button>
          </div>

          {/* Master Reset Module */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600 border border-rose-100/50">
                <RefreshCw className="w-4.5 h-4.5" />
              </div>
              Database Operations
            </h3>

            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Re-seed the local environment. This is useful for clearing logs or returning the dashboard to the starting patient template.
            </p>

            {showResetConfirm ? (
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-[18px] space-y-3">
                <p className="text-xs text-rose-800 font-bold flex items-center gap-2 leading-relaxed">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>Are you absolutely sure? This will wipe your custom logged symptoms!</span>
                </p>
                <div className="flex gap-2 justify-end pt-1">
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 text-xs bg-white border border-gray-200 text-text-dark rounded-full cursor-pointer font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleResetSystem}
                    className="px-4 py-2 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold cursor-pointer transition-colors"
                  >
                    Yes, Reset Data
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-4 border border-gray-200 hover:border-rose-200 text-text-dark hover:bg-rose-50/30 hover:text-rose-600 font-display font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-4.5 h-4.5" /> Reset Patient Data to Default
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
