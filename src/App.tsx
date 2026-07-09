/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  Brain, 
  MessageSquare, 
  Calendar, 
  Settings as SettingsIcon, 
  Cpu, 
  Bell, 
  Search, 
  Menu, 
  X, 
  User, 
  Heart,
  LogOut,
  Sparkles,
  FileText,
  Activity,
  Stethoscope,
  Bookmark
} from "lucide-react";

import { SaheliAppIconSVG } from "./components/SaheliLogo";
import WelcomeScreen from "./components/WelcomeScreen";
import DashboardView from "./components/DashboardView";
import HealthBrainView from "./components/HealthBrainView";
import ConversationView from "./components/ConversationView";
import TimelineView from "./components/TimelineView";
import SettingsView from "./components/SettingsView";
import OrchestratorLogs from "./components/OrchestratorLogs";
import SymptomModal from "./components/SymptomModal";
import MedicalRecordsView from "./components/MedicalRecordsView";
import LabIntelligenceView from "./components/LabIntelligenceView";
import DoctorCompanionView from "./components/DoctorCompanionView";
import MedicationDashboardView from "./components/MedicationDashboardView";
import PreventiveCareView from "./components/PreventiveCareView";
import { orchestrator } from "./services/orchestrator";
import { OrchestratorEvent } from "./types";

export default function App() {
  // Navigation states
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem("saheli_onboarded") === "true";
  });
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);

  // Top Nav Notification Bell state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<OrchestratorEvent[]>([]);

  useEffect(() => {
    // Collect last 5 orchestrator events for the top nav notification center
    setNotifications(orchestrator.getSystemLogs().slice(0, 5));

    // Listen to live events on the orchestrator event bus
    const unsub = orchestrator.subscribeAll(() => {
      setNotifications(orchestrator.getSystemLogs().slice(0, 5));
    });

    return () => unsub();
  }, []);

  const handleStartApp = () => {
    localStorage.setItem("saheli_onboarded", "true");
    setIsOnboarded(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("saheli_onboarded");
    setIsOnboarded(false);
  };

  const getNotificationLabel = (event: OrchestratorEvent) => {
    switch (event.type) {
      case "profile_updated":
        return "Lifelong Health Brain profile edited successfully.";
      case "symptom_added":
        return `New symptom logged: "${event.payload.name}"`;
      case "timeline_updated":
        return `timeline_updated: "${event.payload.title}" added to timeline.`;
      case "conversation_completed":
        return "AI medical assessment completed and generated clinical brief.";
      case "appointment_created":
        return `Scheduled appointment with ${event.payload.doctorName || "Doctor"}`;
      case "health_summary_updated":
        return "AI updated home dashboard clinical summary metrics.";
      default:
        return "System state update event registered.";
    }
  };

  if (!isOnboarded) {
    return <WelcomeScreen onStart={handleStartApp} />;
  }

  // Sidebar Links config matching left navigation specs
  const navigationItems = [
    { name: "Dashboard", icon: Home },
    { name: "Personal Health Brain", icon: Brain },
    { name: "AI Health Conversation", icon: MessageSquare },
    { name: "Care Journey Timeline", icon: Calendar },
    { name: "Medical Records", icon: FileText },
    { name: "Lab Intelligence", icon: Activity },
    { name: "Doctor Companion", icon: Stethoscope },
    { name: "Medication Dashboard", icon: Bookmark },
    { name: "Preventive Care", icon: Heart },
    { name: "Orchestrator Logs", icon: Cpu },
    { name: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-bg-calm flex text-text-dark font-sans selection:bg-pastel-pink/30">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 flex-shrink-0 relative">
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-50 gap-2.5">
          <SaheliAppIconSVG className="w-8 h-8" />
          <span className="font-display font-bold text-lg text-text-dark tracking-wide">Saheli</span>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-display font-semibold rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? "bg-pastel-blue text-text-dark shadow-xs border border-blue-200/50" 
                    : "text-text-muted hover:bg-gray-50 hover:text-text-dark"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-text-dark" : "text-text-muted"}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-display font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout Profile
          </button>
        </div>
      </aside>

      {/* 2. Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950 z-40 lg:hidden"
            />
            {/* Side Drawer */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col lg:hidden shadow-xl"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50">
                <div className="flex items-center gap-2.5">
                  <SaheliAppIconSVG className="w-8 h-8" />
                  <span className="font-display font-bold text-lg text-text-dark">Saheli</span>
                </div>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => { setActiveTab(item.name); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-display font-semibold rounded-xl transition-all cursor-pointer ${
                        isActive 
                          ? "bg-pastel-blue text-text-dark border border-blue-200/50" 
                          : "text-text-muted hover:bg-gray-50 hover:text-text-dark"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-display font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Profile
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navigation Row */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-30 sticky top-0">
          
          {/* Mobile hamburger toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-text-muted hover:text-text-dark lg:hidden rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Top Bar Search indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-xs text-text-muted w-64">
              <Search className="w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="Search Health Brain metrics..." 
                disabled
                className="bg-transparent border-none outline-none flex-1 text-text-dark placeholder-gray-400"
              />
            </div>
          </div>

          {/* Action tools: notifications + quick status info */}
          <div className="flex items-center gap-4 relative">
            
            {/* Notification bell widget */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-text-muted hover:text-text-dark rounded-xl hover:bg-gray-50 relative transition-all cursor-pointer active:scale-95"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Notification Overlay Popover */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  {/* Invisible Dismissal Layer */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-display font-bold text-text-dark uppercase tracking-wider">Saheli Event Alerts</span>
                      <button 
                        onClick={() => setShowNotifications(false)} 
                        className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Dismiss All
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length > 0 ? (
                        notifications.map((notif, i) => (
                          <div key={i} className="p-3 hover:bg-gray-50 transition-colors text-xs font-sans">
                            <span className="font-bold text-indigo-600 text-[10px] uppercase block tracking-wider mb-0.5">{notif.type}</span>
                            <p className="text-text-dark font-medium leading-normal">{getNotificationLabel(notif)}</p>
                            <span className="text-[9px] text-text-muted mt-1 block">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-center text-xs text-text-muted">No recent notifications logged.</p>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Profile vitals badge */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-pastel-purple flex items-center justify-center font-display font-bold text-xs text-text-dark border border-purple-200 shadow-sm">
                PD
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-display font-bold text-text-dark block leading-none">Priya Devi</span>
                <span className="text-[10px] text-text-muted block mt-0.5">28 yrs | O+ Group</span>
              </div>
            </div>

          </div>

        </header>

        {/* 4. Active Component Router Mount */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {activeTab === "Dashboard" && (
                <DashboardView 
                  onNavigate={setActiveTab} 
                  onOpenSymptomModal={() => setIsSymptomModalOpen(true)} 
                />
              )}
              {activeTab === "Personal Health Brain" && <HealthBrainView />}
              {activeTab === "AI Health Conversation" && <ConversationView />}
              {activeTab === "Care Journey Timeline" && <TimelineView />}
              {activeTab === "Medical Records" && <MedicalRecordsView />}
              {activeTab === "Lab Intelligence" && <LabIntelligenceView />}
              {activeTab === "Doctor Companion" && <DoctorCompanionView />}
              {activeTab === "Medication Dashboard" && <MedicationDashboardView />}
              {activeTab === "Preventive Care" && <PreventiveCareView />}
              {activeTab === "Orchestrator Logs" && <OrchestratorLogs />}
              {activeTab === "Settings" && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Global Symptom logging Modal */}
      <SymptomModal 
        isOpen={isSymptomModalOpen} 
        onClose={() => setIsSymptomModalOpen(false)} 
      />

    </div>
  );
}
