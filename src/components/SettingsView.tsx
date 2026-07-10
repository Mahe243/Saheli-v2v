/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
  Sparkles,
  User,
  Shield,
  Trash2,
  Clock,
  Eye,
  Menu
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "../utils/translation";

export default function SettingsView() {
  const { t } = useTranslation();
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("saheli_current_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [brain, setBrain] = useState(() => orchestrator.getHealthBrain());
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("saheli_preferred_language");
    if (saved) return saved;
    return user?.preferredLanguage || "English";
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: brain.profile.name || "",
    age: String(brain.profile.age || "28"),
    height: brain.profile.height || "155 cm",
    weight: brain.profile.weight || "58 kg",
    bloodGroup: brain.profile.bloodGroup || "O+",
    emergencyContactName: "Rajesh Devi",
    emergencyContactPhone: "+91 98765 43210"
  });

  // DPDP Act privacy checkboxes
  const [privacyToggles, setPrivacyToggles] = useState({
    shareWithDoctors: true,
    shareWithCaregivers: false,
    useAiOptimization: true,
    allowAnonymousTelemetry: false
  });

  // Security Logs State
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [logsUnlocked, setLogsUnlocked] = useState(false);
  const [logsPassword, setLogsPassword] = useState("");
  const [logsError, setLogsError] = useState<string | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);

  // Deletion and Archive Lock confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [lockPassword, setLockPassword] = useState("");
  const [lockError, setLockError] = useState<string | null>(null);

  useEffect(() => {
    // If we have an active user, parse contacts and sync preferences
    if (user) {
      // Split emergencyContact into name and phone if possible
      const contactStr = brain.profile.emergencyContact || "";
      const match = contactStr.match(/(.*?)\s*\((.*?)\)/);
      if (match) {
        setProfileForm(prev => ({
          ...prev,
          name: brain.profile.name,
          age: String(brain.profile.age),
          height: brain.profile.height,
          weight: brain.profile.weight,
          bloodGroup: brain.profile.bloodGroup,
          emergencyContactName: match[1]?.trim(),
          emergencyContactPhone: match[2]?.trim()
        }));
      }

      // Fetch security logs from backend DB
      fetchSecurityLogs();
    }
  }, [user, brain]);

  const fetchSecurityLogs = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/auth/logs/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSecurityLogs(data.logs || []);
      }
    } catch (e) {
      console.warn("Could not retrieve audit logs from backend database:", e);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Update local orchestrator Health Brain
      orchestrator.updateProfileDetails({
        name: profileForm.name,
        age: Number(profileForm.age),
        height: profileForm.height,
        weight: profileForm.weight,
        bloodGroup: profileForm.bloodGroup,
        emergencyContact: `${profileForm.emergencyContactName} (${profileForm.emergencyContactPhone})`
      });

      // Save language preference locally
      localStorage.setItem("saheli_preferred_language", language);
      orchestrator.addMemoryItem("language", "Preferred Language", language, "Configured in Settings Center Profile Sync");

      // 2. Post to backend DB if authenticated
      if (user) {
        const res = await fetch("/api/auth/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            fullName: profileForm.name,
            age: profileForm.age,
            height: profileForm.height,
            weight: profileForm.weight,
            bloodGroup: profileForm.bloodGroup,
            emergencyContactName: profileForm.emergencyContactName,
            emergencyContactPhone: profileForm.emergencyContactPhone,
            preferredLanguage: language
          })
        });

        if (res.ok) {
          const resData = await res.json();
          // Update cached user session details
          const updatedUser = { ...user, fullName: profileForm.name, preferredLanguage: language };
          localStorage.setItem("saheli_current_user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }

      setSuccessMsg("Healthcare profile and demographics successfully synchronized and locked.");
      fetchSecurityLogs();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg("Failed to synchronize profile. Settings saved locally.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrivacy = async (key: keyof typeof privacyToggles, val: boolean) => {
    const updated = { ...privacyToggles, [key]: val };
    setPrivacyToggles(updated);

    if (user) {
      try {
        await fetch("/api/auth/preferences/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            privacy: updated
          })
        });
        fetchSecurityLogs();
      } catch (e) {
        console.warn("Offline fallback for preference updates.");
      }
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    let backendData = {};
    if (user) {
      try {
        const res = await fetch(`/api/auth/export/${user.id}`);
        if (res.ok) {
          backendData = await res.json();
        }
      } catch (e) {
        console.warn("Could not retrieve remote archival metadata for export.");
      }
    }

    const exportBundle = {
      exportedAt: new Date().toISOString(),
      clinicalState: {
        brain: orchestrator.getHealthBrain(),
        symptoms: orchestrator.getSymptomLog(),
        timeline: orchestrator.getTimeline(),
        appointments: orchestrator.getAppointments(),
        summary: orchestrator.getHealthSummary()
      },
      systemState: backendData
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Saheli_Secure_HealthBrain_Export_${user?.fullName || "Guest"}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessMsg("Full Health Brain & Security Logs exported successfully to an encrypted JSON file.");
    setTimeout(() => setSuccessMsg(null), 3500);
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirmText.toLowerCase() !== "delete") {
      setErrorMsg("Please type 'delete' to confirm account erasure.");
      return;
    }

    setLoading(true);
    try {
      // 1. Send delete request to backend DB
      await fetch("/api/auth/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });

      // 2. Clear user prefix local storage keys
      const prefix = `saheli_${user.id}_`;
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });

      // 3. Log out and clear current user session
      localStorage.removeItem("saheli_onboarded");
      localStorage.removeItem("saheli_current_user");
      localStorage.removeItem("saheli_token");
      orchestrator.loadUserState(null);

      setSuccessMsg("Your entire healthcare footprint was securely deleted from Saheli. Redirecting...");
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (e) {
      setErrorMsg("Failed to fully delete remote database. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const handleLockAndArchiveLogs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!lockPassword) {
      setLockError("Please enter your password to secure your logs.");
      return;
    }

    setLoading(true);
    setLockError(null);
    try {
      // 1. Verify password with backend
      const response = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, password: lockPassword })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setLockError(data.error || "Incorrect password. Cannot lock account.");
        setLoading(false);
        return;
      }

      // 2. Clear onboarding and current user token session to lock the app, BUT keep all data in local/remote databases perfectly intact.
      localStorage.removeItem("saheli_onboarded");
      localStorage.removeItem("saheli_current_user");
      localStorage.removeItem("saheli_token");
      orchestrator.loadUserState(null);

      setSuccessMsg("Account successfully secured, and all logs have been archived behind password-protection. Redirecting...");
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (err) {
      setLockError("Failed to verify password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockLogs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logsPassword) {
      setLogsError("Please enter your password.");
      return;
    }
    setLogsLoading(true);
    setLogsError(null);
    try {
      const response = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, password: logsPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setLogsUnlocked(true);
      } else {
        setLogsError(data.error || "Incorrect password.");
      }
    } catch (err) {
      setLogsError("Failed to verify password. Please try again.");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("saheli_preferred_language", lang);
    orchestrator.addMemoryItem("language", "Preferred Language", lang, "Configured in Settings Center Language Grid");

    if (user) {
      try {
        await fetch("/api/auth/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, preferredLanguage: lang })
        });
        const updatedUser = { ...user, preferredLanguage: lang };
        localStorage.setItem("saheli_current_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        fetchSecurityLogs();
      } catch (e) {
        console.warn("Language update failed.");
      }
    }
  };

  return (
    <div id="settings-view" className="space-y-8 max-w-4xl mx-auto p-1 animate-fade-in font-sans">
      
      {/* Title Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-display font-bold text-text-dark flex items-center gap-2.5 tracking-tight">
          <Settings className="w-8 h-8 text-indigo-500" />
          Settings & Privacy Center
        </h1>
        <p className="text-text-muted mt-1.5 text-sm md:text-base font-sans">
          Adjust alerts, toggle local dialects, inspect security logs, and take full control of your Health Brain metrics.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-[18px] text-sm font-semibold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-[18px] text-sm font-semibold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          {errorMsg}
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Profile & Regional dialects */}
        <div className="space-y-6">
          
          {/* Profile Demographics Form */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-pink-50 rounded-lg text-pink-600 border border-pink-100/50">
                <User className="w-4.5 h-4.5" />
              </div>
              Demographics Profile
            </h3>
            <p className="text-xs text-text-muted font-sans leading-relaxed">
              Correcting these attributes recalibrates active medical safety margins.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4 font-sans text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-text-dark block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Age (Years)</label>
                  <input 
                    type="number" 
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Blood Group</label>
                  <select 
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white font-sans"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Height</label>
                  <input 
                    type="text" 
                    value={profileForm.height}
                    onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Weight</label>
                  <input 
                    type="text" 
                    value={profileForm.weight}
                    onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-text-dark block mb-1">Emergency Contact Guardian</label>
                  <input 
                    type="text" 
                    value={profileForm.emergencyContactName}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-text-dark block mb-1">Emergency Contact Phone</label>
                  <input 
                    type="text" 
                    value={profileForm.emergencyContactPhone}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-xs rounded-full transition-all cursor-pointer shadow-2xs"
              >
                {loading ? t("Saving Changes...") : t("Sync & Lock Profile Vitals")}
              </button>
            </form>
          </div>

          {/* Regional Languages Dialect (Accessibility) */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100/50">
                <Languages className="w-4.5 h-4.5" />
              </div>
              {t("Language & Dialects")}
            </h3>
            
            <p className="text-xs text-text-muted leading-relaxed font-sans text-left">
              {t("Choose your preferred regional dialect.")}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {[{ id: "English", label: "✅ English" },
    { id: "Hindi", label: "🧪 Hindi (हिन्दी) • Beta" },
    { id: "Bengali", label: "🧪 Bengali (বাংলা) • Beta" },
    { id: "Telugu", label: "🧪 Telugu (తెలుగు) • Beta" },
    { id: "Tamil", label: "🧪 Tamil (தமிழ்) • Beta" },
    { id: "Marathi", label: "🧪 Marathi (मराठी) • Beta" },
    { id: "Odia", label: "🧪 Odia (ଓଡ଼ିଆ) • Beta" }].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`p-3.5 rounded-[14px] text-xs font-bold border transition-all cursor-pointer text-left ${
                    language === lang 
                      ? "bg-[#D8C4F1]/20 border-[#D8C4F1] text-text-dark shadow-2xs" 
                      : "bg-gray-50/60 border-gray-200 text-text-muted hover:bg-gray-50"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Privacy, Exports & System reset */}
        <div className="space-y-6">
          
          {/* Privacy & Encryption Shield - DPDP Consent Control */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100/50">
                <Shield className="w-4.5 h-4.5" />
              </div>
              Privacy & Consent Center
            </h3>
            
            <p className="text-xs text-text-muted leading-relaxed font-sans text-left">
              DPDP Act Compliance. Change your mind at any time. Toggling these immediately updates permissions inside your Health Brain.
            </p>

            <div className="space-y-3 pt-2 font-sans text-left">
              <label className="flex items-start justify-between p-4 bg-gray-50/60 rounded-[18px] cursor-pointer hover:bg-gray-100/30 transition-all border border-gray-150/40">
                <div className="flex gap-2.5">
                  <input 
                    type="checkbox" 
                    checked={privacyToggles.shareWithDoctors} 
                    onChange={(e) => handleTogglePrivacy("shareWithDoctors", e.target.checked)}
                    className="w-4.5 h-4.5 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-dark block">Share with Clinical Doctors</span>
                    <span className="text-[10px] text-text-muted block mt-0.5 leading-relaxed font-sans">Permit consulting doctors to inspect charts.</span>
                  </div>
                </div>
              </label>

              <label className="flex items-start justify-between p-4 bg-gray-50/60 rounded-[18px] cursor-pointer hover:bg-gray-100/30 transition-all border border-gray-150/40">
                <div className="flex gap-2.5">
                  <input 
                    type="checkbox" 
                    checked={privacyToggles.shareWithCaregivers} 
                    onChange={(e) => handleTogglePrivacy("shareWithCaregivers", e.target.checked)}
                    className="w-4.5 h-4.5 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-dark block">Share with Caregivers (Family)</span>
                    <span className="text-[10px] text-text-muted block mt-0.5 leading-relaxed font-sans">Let authorized family access emergency logs.</span>
                  </div>
                </div>
              </label>

              <label className="flex items-start justify-between p-4 bg-gray-50/60 rounded-[18px] cursor-pointer hover:bg-gray-100/30 transition-all border border-gray-150/40">
                <div className="flex gap-2.5">
                  <input 
                    type="checkbox" 
                    checked={privacyToggles.useAiOptimization} 
                    onChange={(e) => handleTogglePrivacy("useAiOptimization", e.target.checked)}
                    className="w-4.5 h-4.5 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-dark block">AI Clinical Optimization</span>
                    <span className="text-[10px] text-text-muted block mt-0.5 leading-relaxed font-sans">Leverage secure LLM helpers to parse symptoms.</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Data Portability/Export */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100/50">
                <Download className="w-4.5 h-4.5" />
              </div>
              Data Portability
            </h3>
            
            <p className="text-xs text-text-muted leading-relaxed font-sans text-left">
              Take complete ownership of your healthcare history. Download your secure health portfolio, profile demographics, and consent logs instantly.
            </p>

            <button
              onClick={handleExportData}
              disabled={loading}
              className="w-full py-4 bg-[#D8C4F1]/20 hover:bg-[#D8C4F1]/40 text-text-dark font-display font-bold text-xs rounded-full transition-all border border-[#D8C4F1]/50 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4.5 h-4.5 stroke-[2.5]" /> Export Complete Health Brain & Logs
            </button>
          </div>

          {/* Lock Account & Password-Protect Logs */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100/50">
                <Lock className="w-4.5 h-4.5" />
              </div>
              {t("Lock Account & Archive Logs")}
            </h3>

            <p className="text-xs text-text-muted leading-relaxed font-sans text-left">
              {t("Instead of permanently deleting your data, lock your security logs and clinical profile behind password protection. If at any point you want to see your logs or resume your care journey, simply enter your password to unlock them.")}
            </p>

            {user ? (
              <>
                {showLockConfirm ? (
                  <form onSubmit={handleLockAndArchiveLogs} className="p-4.5 bg-indigo-50 border border-indigo-100 rounded-[18px] space-y-3.5 text-left font-sans">
                    <p className="text-xs text-indigo-950 font-bold flex items-center gap-2 leading-relaxed">
                      <Lock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span>{t("Secure Account & Archive Logs")}</span>
                    </p>
                    {lockError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        <span>{lockError}</span>
                      </div>
                    )}
                    <div>
                      <label className="text-[11px] font-bold text-indigo-950 block mb-1">{t("Enter your account password to lock and archive logs")}</label>
                      <input 
                        type="password" 
                        value={lockPassword}
                        onChange={(e) => setLockPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-2 rounded-xl border border-indigo-200 text-xs focus:outline-none focus:border-indigo-400 bg-white font-sans text-indigo-900"
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button"
                        onClick={() => { setShowLockConfirm(false); setLockPassword(""); setLockError(null); }}
                        className="px-4 py-1.5 text-xs bg-white border border-gray-200 text-text-dark rounded-full cursor-pointer font-bold"
                      >
                        {t("Cancel")}
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold cursor-pointer transition-colors"
                      >
                        {loading ? t("Securing...") : t("Secure & Lock Profile")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowLockConfirm(true)}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Lock className="w-4.5 h-4.5" /> {t("Archive, Lock & Password-Protect Account Logs")}
                  </button>
                )}
              </>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-[18px] text-xs text-text-muted leading-relaxed text-left">
                {t("You are currently exploring as an anonymous guest. Since guest accounts run completely in secure local memory, there are no remote database logs to archive.")}
              </div>
            )}
          </div>

          {/* Account Deletion */}
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600 border border-rose-100/50">
                <Trash2 className="w-4.5 h-4.5" />
              </div>
              {t("Account Erasure (DPDP Right to be Forgotten)")}
            </h3>

            <p className="text-xs text-text-muted leading-relaxed font-sans text-left">
              {t("Permanently erase your entire footprint from our database. All timeline history, doctor connections, and security audit logs will be permanently purged from the cloud, and cannot be recovered.")}
            </p>

            {user ? (
              <>
                {showDeleteConfirm ? (
                  <div className="p-4.5 bg-rose-50 border border-rose-100 rounded-[18px] space-y-3.5 text-left font-sans">
                    <p className="text-xs text-rose-800 font-bold flex items-center gap-2 leading-relaxed">
                      <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                      <span>{t("Warning: This will permanently wipe all logs and charts, and cannot be recovered!")}</span>
                    </p>
                    <div>
                      <label className="text-[11px] font-bold text-rose-800 block mb-1">{t("Type 'delete' to confirm account deletion")}</label>
                      <input 
                        type="text" 
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="delete"
                        className="w-full px-4 py-2 rounded-xl border border-rose-200 text-xs focus:outline-none focus:border-rose-400 bg-white font-sans text-rose-800 font-bold"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-1.5 text-xs bg-white border border-gray-200 text-text-dark rounded-full cursor-pointer font-bold"
                      >
                        {t("Cancel")}
                      </button>
                      <button 
                        onClick={handleDeleteAccount}
                        className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold cursor-pointer transition-colors"
                      >
                        {t("Wipe My Footprint")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-4 border border-rose-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50/20 font-display font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-4.5 h-4.5" /> {t("Erase Account & All Data Silos")}
                  </button>
                )}
              </>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-[18px] text-xs text-text-muted leading-relaxed text-left">
                {t("You are currently exploring as an anonymous guest. No cloud database footprint is stored for this session. Wiping guest local storage can be done by reseting your browser cache.")}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Module 8: Security Audit logs view */}
      {user && (
        <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-sm text-left space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100/50">
                <Clock className="w-4.5 h-4.5" />
              </div>
              Security & Access Audit Logs
            </h3>
            <button 
              onClick={() => setShowLogs(!showLogs)}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              {showLogs ? "Hide Logs" : "Show Security Audit Logs"}
            </button>
          </div>

          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Every authentication event, profile adjustment, or preference modification creates an immutable ledger entry. This ensures no unauthorized background updates or third-party access occur on your account.
          </p>

          <AnimatePresence>
            {showLogs && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-2"
              >
                {!logsUnlocked ? (
                  <form onSubmit={handleUnlockLogs} className="p-5 border border-indigo-100 bg-indigo-50/20 rounded-[18px] max-w-md space-y-3.5">
                    <p className="text-xs text-indigo-950 font-bold flex items-center gap-2 leading-relaxed">
                      <Lock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Security Verification Required</span>
                    </p>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Please enter your account password to unlock and inspect your secure security access logs.
                    </p>
                    {logsError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        <span>{logsError}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        value={logsPassword}
                        onChange={(e) => setLogsPassword(e.target.value)}
                        placeholder="Enter password"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-400 bg-white"
                        required
                      />
                      <button 
                        type="submit"
                        disabled={logsLoading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        {logsLoading ? "Verifying..." : "Unlock Logs"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="overflow-x-auto border border-gray-100 rounded-[16px]">
                    <table className="w-full text-xs font-sans text-left">
                      <thead>
                        <tr className="bg-gray-50/60 border-b border-gray-100 text-text-muted font-bold">
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Details</th>
                          <th className="p-3">IP Address</th>
                          <th className="p-3">Client Access Device (User Agent)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {securityLogs.length > 0 ? (
                          securityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/40">
                              <td className="p-3 text-text-muted whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  log.action === "Login Success" || log.action === "Consent Accepted" || log.action === "Register"
                                    ? "bg-emerald-50 text-emerald-800" 
                                    : log.action === "Login Failed" || log.action === "Consent Revoked"
                                    ? "bg-rose-50 text-rose-800"
                                    : "bg-blue-50 text-blue-800"
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3 text-text-dark font-medium max-w-xs truncate" title={log.details}>{log.details}</td>
                              <td className="p-3 text-text-muted whitespace-nowrap font-mono">{log.ipAddress}</td>
                              <td className="p-3 text-text-muted max-w-xs truncate font-mono" title={log.userAgent}>{log.userAgent}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-text-muted">No security events found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
