/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Heart, 
  ShieldAlert, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Info, 
  Sparkles, 
  Activity, 
  BookOpen, 
  UserCheck, 
  Bell, 
  Filter, 
  Check, 
  EyeOff 
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { PreventiveReminder, HealthBrain } from "../types";
import { useTranslation } from "../utils/translation";

export default function PreventiveCareView() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<PreventiveReminder[]>([]);
  const [brain, setBrain] = useState<HealthBrain | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    setReminders(orchestrator.getPreventiveReminders());
    setBrain(orchestrator.getHealthBrain());

    const unsub = orchestrator.subscribe("preventive_added", () => {
      setReminders([...orchestrator.getPreventiveReminders()]);
    });
    return () => unsub();
  }, []);

  const categories = ["All", "Screening", "Vaccination", "Checkup", "Lifestyle"];

  const handleStatusChange = (id: string, newStatus: "Pending" | "Done" | "Dismissed") => {
    orchestrator.updatePreventiveReminderStatus(id, newStatus);
    setReminders([...orchestrator.getPreventiveReminders()]);
  };

  const filteredReminders = reminders.filter(rem => {
    return selectedCategory === "All" || rem.category === selectedCategory;
  });

  return (
    <div id="preventive-care" className="space-y-8 max-w-6xl mx-auto p-1 animate-fade-in">
      
      {/* 1. Header with Info Banner */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-dark tracking-tight leading-tight flex items-center gap-2.5">
            <Heart className="w-8 h-8 text-[#E05B7C]" />
            {t("Preventive Care Engine")}
          </h1>
          <p className="text-text-muted mt-1 text-sm font-sans">
            {t("Personalized diagnostic-free screenings, boosters, and wellness guidelines customized for your demographic and lineage.")}
          </p>
        </div>

        {/* Warning Educational Disclaimer Box */}
        <div className="bg-indigo-50 border border-indigo-200/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs font-sans text-indigo-800 space-y-1">
            <span className="font-bold block text-indigo-950 uppercase tracking-wide">{t("Preventive & Educational Guidelines Only")}</span>
            <p className="leading-relaxed">
              {t("Guidelines provided are compiled from general WHO & Indian Council of Medical Research (ICMR) standards for age 28 and specific family histories (such as grandma's Type-2 diabetes and mother's hypertension).")} 
              <strong> {t("Saheli never diagnoses, treats, or replaces professional medical advice. Always discuss screenings with Dr. Anjali Mehta.")}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Demographic Metadata Summary card */}
      {brain && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-[#E05B7C] font-display font-black text-sm">
              PD
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider font-sans">{t("Preventive Demographics Verified")}</h3>
              <p className="text-xs text-text-muted font-sans mt-0.5">
                {t("Age:")} <strong>{brain.profile.age} {t("years")}</strong> | {t("Pregnancy History:")} <strong>{t(brain.medicalHistory.pregnancyHistory)}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-sans">
            <div className="bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-100">
              <span className="text-[10px] text-text-muted block">{t("Lineage Risk Profile")}</span>
              <strong className="text-[#E05B7C]">{t("Hypertension & Diabetes (Maternal)")}</strong>
            </div>
            <div className="bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-100">
              <span className="text-[10px] text-text-muted block">{t("Active Lifestyle Class")}</span>
              <strong className="text-emerald-600">{t("Moderate Active Farmer")}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider mr-2 font-mono flex items-center gap-1 shrink-0">
          <Filter className="w-4 h-4" />
          {t("Filter:")}
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-display font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? "bg-text-dark text-white border-text-dark shadow-sm"
                : "bg-white text-text-muted border-gray-100 hover:bg-gray-50 hover:text-text-dark"
            }`}
          >
            {t(cat)}
          </button>
        ))}
      </div>

      {/* 4. Active Reminders Grid and Educational Science */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Reminders Column (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-lg text-text-dark">{t("Reminders & Tasks")} ({filteredReminders.length})</h3>
          
          <div className="space-y-4">
            {filteredReminders.map((rem) => {
              const isPending = rem.status === "Pending";
              const isDone = rem.status === "Done";
              
              return (
                <div 
                  key={rem.id}
                  className={`p-5 bg-white border rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all duration-300 relative overflow-hidden ${
                    isDone 
                      ? "border-emerald-100 bg-emerald-50/10 opacity-75" 
                      : rem.status === "Dismissed"
                        ? "border-gray-100 opacity-50"
                        : "border-gray-100 hover:border-indigo-100/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                      isDone 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                        : "bg-indigo-50/50 border-indigo-100 text-indigo-600"
                    }`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 font-sans">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-50 text-text-muted text-[9px] font-bold border rounded font-mono uppercase">
                          {t(rem.category)}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono font-bold">
                          {t("Interval:")} {t(rem.recommendedInterval)}
                        </span>
                      </div>
                      <h4 className={`font-display font-bold text-sm ${isDone ? "text-emerald-950 line-through" : "text-text-dark"}`}>
                        {t(rem.title)}
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {t(rem.description)}
                      </p>
                      
                      {/* Dynamic AI Reason */}
                      <div className="pt-2 flex items-start gap-1.5 text-[10px] text-indigo-600/90 font-semibold leading-relaxed">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{t("Why this?")} {t(rem.triggerReason)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  {isPending ? (
                    <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-start print:hidden">
                      <button
                        onClick={() => handleStatusChange(rem.id, "Done")}
                        className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-display font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>{t("Done")}</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(rem.id, "Dismissed")}
                        className="px-3.5 py-1.5 border border-gray-100 hover:bg-gray-50 text-text-muted rounded-lg transition-all font-display font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>{t("Mute")}</span>
                      </button>
                    </div>
                  ) : (
                    <span className={`text-[10px] font-bold font-sans uppercase shrink-0 py-1 px-2.5 rounded-lg border ${
                      isDone 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                        : "bg-gray-50 border-gray-100 text-text-muted"
                    }`}>
                      {t(rem.status)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Guideline Standards Science block (Right 1 col) */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-text-dark">{t("Guidelines & Standards")}</h3>
          
          <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100/80 space-y-6 relative overflow-hidden font-sans text-xs">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-50/50 to-transparent rounded-bl-full"></div>
            
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <h4 className="font-display font-bold text-text-dark text-sm">{t("Preventive Standards")}</h4>
            </div>

            <p className="text-text-muted leading-relaxed">
              {t("Standard clinical checklists play a vital role in protecting health before issues escalate. For instance:")}
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <strong className="text-text-dark block font-semibold">{t("1. Cervical Screenings")}</strong>
                <span className="text-text-muted block leading-relaxed">
                  {t("Pap smear screenings once every 3 years for women aged 21-65 allow fully pre-symptomatic detection. Recommended for all rural demographics.")}
                </span>
              </div>

              <div className="space-y-1">
                <strong className="text-text-dark block font-semibold">{t("2. Diabetes screening")}</strong>
                <span className="text-text-muted block leading-relaxed">
                  {t("Since Priya's maternal grandmother had Type 2 Diabetes, testing HbA1c or fasting blood sugar once every 2 years starting from age 25 helps detect insulin resistance decades early.")}
                </span>
              </div>

              <div className="space-y-1">
                <strong className="text-text-dark block font-semibold">{t("3. Maternal Boosters")}</strong>
                <span className="text-text-muted block leading-relaxed">
                  {t("Keeping vaccine records active protects both mother and future child during planned pregnancies.")}
                </span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100/40 flex gap-2.5 items-start">
              <UserCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span className="text-[10px] text-indigo-900 leading-relaxed">
                {t("Want to schedule a custom test suggested by your doctor? Update the records in **Doctor Companion** or ask Sunita (ANM Health worker) to log the schedule.")}
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
