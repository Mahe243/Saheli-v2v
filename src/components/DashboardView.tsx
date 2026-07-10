/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Heart, 
  Calendar, 
  Clock, 
  Brain, 
  ArrowRight, 
  Activity, 
  Plus, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles,
  FileText,
  Stethoscope,
  Bookmark
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { HealthBrain, HealthSummary, TimelineEvent, Appointment } from "../types";
import { useTranslation } from "../utils/translation";

// Phase 3 Modular Sub-Views
import EmotionalHealthView from "./EmotionalHealthView";
import LifeStageView from "./LifeStageView";
import WeeklyCheckInView from "./WeeklyCheckInView";
import HealthJournalView from "./HealthJournalView";
import HealthGoalsView from "./HealthGoalsView";
import SisterhoodView from "./SisterhoodView";
import AppointmentModal from "./AppointmentModal";

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenSymptomModal: () => void;
}

export default function DashboardView({ onNavigate, onOpenSymptomModal }: DashboardViewProps) {
  const { t } = useTranslation();
  const [brain, setBrain] = useState<HealthBrain>(orchestrator.getHealthBrain());
  const [summary, setSummary] = useState<HealthSummary>(orchestrator.getHealthSummary());
  const [timeline, setTimeline] = useState<TimelineEvent[]>(orchestrator.getTimeline());
  const [appointments, setAppointments] = useState<Appointment[]>(orchestrator.getAppointments());
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);

  // Phase 3 active companion sub-tab state
  const [activeCompanionTab, setActiveCompanionTab] = useState<"care" | "emotion" | "lifestage" | "checkin" | "journal" | "goals" | "sisterhood">("sisterhood");

  useEffect(() => {
    // Listen to changes in the orchestrator event bus
    const unsubAll = orchestrator.subscribeAll(() => {
      setBrain({ ...orchestrator.getHealthBrain() });
      setSummary({ ...orchestrator.getHealthSummary() });
      setTimeline([...orchestrator.getTimeline()]);
      setAppointments([...orchestrator.getAppointments()]);
    });

    return () => unsubAll();
  }, []);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div id="dashboard-view" className="space-y-8 max-w-6xl mx-auto p-1 animate-fade-in">
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-dark tracking-tight leading-tight">
            {t(getGreeting())}, <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">{brain.profile.name}</span>
          </h1>
          <p className="text-text-muted mt-1 text-sm md:text-base font-sans">
            {t("Your lifelong healthcare memory is completely secure and up to date.")}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-emerald-100 text-xs md:text-sm font-semibold text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>{t("Saheli Verified Care")}</span>
        </div>
      </div>

      {/* 2. Main Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Health Snapshot & Brain Summary */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Health Summary Card */}
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100/80 relative overflow-hidden group">
            {/* Soft decorative background glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#A7D8F2]/30 to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-to-tr from-[#F8C8DC]/20 to-transparent rounded-full blur-xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center gap-3 text-indigo-600 font-display font-bold mb-5">
              <div className="p-2.5 bg-gradient-to-tr from-[#D8C4F1]/30 to-[#D8C4F1]/10 rounded-xl text-indigo-600 border border-[#D8C4F1]/40">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-lg tracking-tight">{t("Personalized Health Summary")}</span>
              <span className="ml-auto text-[11px] font-mono font-bold text-text-muted bg-gray-100/80 px-2.5 py-1 rounded-full border border-gray-200/50">
                Updated {summary.updatedAt}
              </span>
            </div>
            
            <p className="text-text-dark text-base md:text-lg leading-relaxed font-sans mt-3 font-medium italic opacity-95">
              "{summary.summaryText}"
            </p>

            <div className="mt-6 space-y-3 pt-5 border-t border-gray-100/80">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                Key Focus Actions:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {summary.keyActionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-text-dark bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 hover:bg-white hover:border-[#F8C8DC]/40 hover:shadow-xs transition-all duration-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#F8C8DC] to-[#D8C4F1] mt-1 flex-shrink-0"></span>
                    <span className="leading-snug font-medium text-text-dark/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Phase 3 Health Companion Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
            {[
              { id: "sisterhood" as const, label: "Sisterhood & Wisdom", icon: "👭" },
              { id: "care" as const, label: "Care Suite", icon: "🌸" },
              { id: "emotion" as const, label: "Emotional Health", icon: "🧘‍♀️" },
              { id: "lifestage" as const, label: "Life Stage", icon: "⏳" },
              { id: "checkin" as const, label: "Continuous Vitals", icon: "📊" },
              { id: "journal" as const, label: "Health Journal", icon: "📝" },
              { id: "goals" as const, label: "Goals & Wins", icon: "🎯" }
            ].map((tab) => {
              const isActive = activeCompanionTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveCompanionTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-display font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#A7D8F2] via-[#F8C8DC] to-[#D8C4F1] text-text-dark border-transparent shadow-sm"
                      : "bg-white text-text-muted hover:text-text-dark hover:bg-gray-50/50 border border-gray-100"
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{t(tab.label)}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="transition-all duration-300">
            {activeCompanionTab === "care" && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xl text-text-dark tracking-tight">{t("Your Care Suite")}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* QA 1 */}
                  <motion.button
                    id="qa-update-symptom"
                    onClick={onOpenSymptomModal}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-[#F8C8DC]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#F8C8DC]/30 to-[#F8C8DC]/10 text-pink-600 border border-[#F8C8DC]/50">
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-text-dark text-base">{t("Update Symptoms")}</h4>
                        <p className="text-xs text-text-muted mt-0.5 font-sans">{t("Quickly record how you feel today")}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* QA 2 */}
                  <motion.button
                    id="qa-start-interview"
                    onClick={() => onNavigate("AI Health Conversation")}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-[#A7D8F2]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#A7D8F2]/30 to-[#A7D8F2]/10 text-blue-600 border border-[#A7D8F2]/50">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-text-dark text-base">{t("AI Consultation")}</h4>
                        <p className="text-xs text-text-muted mt-0.5 font-sans">{t("Continuous health checks")}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* QA 3 */}
                  <motion.button
                    id="qa-view-brain"
                    onClick={() => onNavigate("Personal Health Brain")}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-[#D8C4F1]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#D8C4F1]/30 to-[#D8C4F1]/10 text-purple-600 border border-[#D8C4F1]/50">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-text-dark text-base">{t("Health Brain Dossier")}</h4>
                        <p className="text-xs text-text-muted mt-0.5 font-sans">{t("Review medical archives")}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* QA 4 */}
                  <motion.button
                    id="qa-view-timeline"
                    onClick={() => onNavigate("Care Journey Timeline")}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-[#A7D8F2]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#A7D8F2]/30 to-[#A7D8F2]/10 text-indigo-600 border border-[#A7D8F2]/50">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-text-dark text-base">{t("Care Journey Timeline")}</h4>
                        <p className="text-xs text-text-muted mt-0.5 font-sans">{t("View chronological timeline")}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* QA 5: Medical Records */}
                  <motion.button
                    id="qa-medical-records"
                    onClick={() => onNavigate("Medical Records")}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-indigo-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-50 to-indigo-100/50 text-indigo-600 border border-indigo-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-text-dark text-base">{t("Medical Records")}</h4>
                        <p className="text-xs text-text-muted mt-0.5 font-sans">{t("Securely store encrypted PDFs/scans")}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* QA 6: Lab Intelligence */}
                  <motion.button
                    id="qa-lab-intelligence"
                    onClick={() => onNavigate("Lab Intelligence")}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-blue-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-50 to-blue-100/50 text-blue-600 border border-blue-100">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-text-dark text-base">{t("Lab Intelligence")}</h4>
                        <p className="text-xs text-text-muted mt-0.5 font-sans">{t("Biomarker explanations & ranges")}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* QA 7: Doctor Companion */}
                  <motion.button
                    id="qa-doctor-companion"
                    onClick={() => onNavigate("Doctor Companion")}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-pink-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-pink-50 to-pink-100/50 text-pink-600 border border-pink-100">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-text-dark text-base">{t("Doctor Companion")}</h4>
                        <p className="text-xs text-text-muted mt-0.5 font-sans">{t("Pre-visit brief & post-visit sync")}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* QA 8: Medication Dashboard */}
                  <motion.button
                    id="qa-medication-dashboard"
                    onClick={() => onNavigate("Medication Dashboard")}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-[#E05B7C]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-pink-50 to-[#E05B7C]/10 text-[#E05B7C] border border-[#E05B7C]/20">
                        <Bookmark className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-text-dark text-base">{t("Medication Dashboard")}</h4>
                        <p className="text-xs text-text-muted mt-0.5 font-sans">{t("Daily adherence checks & logs")}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* QA 9: Preventive Care */}
                  <motion.button
                    id="qa-preventive-care"
                    onClick={() => onNavigate("Preventive Care")}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-[#D8C4F1]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-50 to-[#D8C4F1]/20 text-purple-600 border border-purple-100">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-text-dark text-base">{t("Preventive Care Engine")}</h4>
                        <p className="text-xs text-text-muted mt-0.5 font-sans">{t("ICMR guidelines & screenings")}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </div>
            )}

            {activeCompanionTab === "emotion" && <EmotionalHealthView />}
            {activeCompanionTab === "lifestage" && <LifeStageView />}
            {activeCompanionTab === "checkin" && <WeeklyCheckInView />}
            {activeCompanionTab === "journal" && <HealthJournalView />}
            {activeCompanionTab === "goals" && <HealthGoalsView />}
            {activeCompanionTab === "sisterhood" && <SisterhoodView />}
          </div>
        </div>

        {/* Sidebar Panel for Snapshot & Appointments */}
        <div className="space-y-8">
          {/* Today's Health Snapshot */}
          <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100/80 space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2.5">
              <div className="p-2 bg-pink-50 rounded-lg text-[#F8C8DC] border border-pink-100/50">
                <Activity className="w-4.5 h-4.5 text-pink-500" />
              </div>
              {t("Today's Snapshot")}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 p-3.5 bg-gray-50/60 rounded-[16px] text-sm hover:bg-gray-50 transition-colors border border-gray-100/50">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
                <span className="text-text-dark font-semibold font-sans">{t("No acute symptoms reported today")}</span>
              </div>
              <div className="flex items-center gap-3.5 p-3.5 bg-gray-50/60 rounded-[16px] text-sm hover:bg-gray-50 transition-colors border border-gray-100/50">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                <span className="text-text-dark font-semibold font-sans">{t("Iron tablet supplement expected at 8:00 PM")}</span>
              </div>
              <div className="flex items-center gap-3.5 p-3.5 bg-gray-50/60 rounded-[16px] text-sm hover:bg-gray-50 transition-colors border border-gray-100/50">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                <span className="text-text-dark font-semibold font-sans">{t("Vitals synced with village counselor Sunita")}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Events/Appointments */}
          <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100/80 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 rounded-lg text-indigo-500 border border-blue-100/50">
                  <Calendar className="w-4.5 h-4.5 text-indigo-500" />
                </div>
                {t("Upcoming Appointments")}
              </h3>
              <button
                onClick={() => setIsApptModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 rounded-full text-xs font-bold font-sans transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("Book")}</span>
              </button>
            </div>
            
            {appointments.length > 0 ? (
              appointments.map((appt) => (
                <div key={appt.id} className="p-4.5 border-l-4 border-[#A7D8F2] bg-gradient-to-r from-[#A7D8F2]/5 to-transparent rounded-[16px] space-y-2 hover:bg-gray-50/50 transition-all duration-300">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted font-bold font-mono">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{appt.date} • {appt.time}</span>
                  </div>
                  <h4 className="font-display font-bold text-text-dark text-sm">{appt.doctorName}</h4>
                  <p className="text-xs text-text-muted font-sans font-medium">{appt.purpose}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted py-2 font-sans">{t("No upcoming clinical appointments logged.")}</p>
            )}
          </div>

          {/* Micro Recent Timeline Snippet */}
          <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100/80 space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600 border border-purple-100/50">
                <Brain className="w-4.5 h-4.5 text-purple-500" />
              </div>
              {t("Recent Milestones")}
            </h3>
            
            <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[1.5px] before:bg-gray-100">
              {timeline.slice(0, 2).map((evt) => (
                <div key={evt.id} className="flex items-start gap-4 text-sm relative z-10 hover:translate-x-1 transition-transform duration-300">
                  <div className={`p-1 rounded-full mt-1.5 flex-shrink-0 ${
                    evt.category === "Symptoms" ? "bg-pastel-pink text-pink-600" : 
                    evt.category === "Doctor Visits" ? "bg-[#A7D8F2] text-blue-600" : "bg-[#D8C4F1] text-purple-600"
                  }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-xs text-text-dark leading-tight">{evt.title}</h5>
                    <p className="text-xs text-text-muted font-sans mt-0.5 line-clamp-2 leading-relaxed">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Appointment Booking Modal overlay */}
      <AppointmentModal 
        isOpen={isApptModalOpen} 
        onClose={() => setIsApptModalOpen(false)} 
      />
    </div>
  );
}

// ChevronRight reusable icon loader
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
