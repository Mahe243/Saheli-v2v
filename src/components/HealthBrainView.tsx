/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, 
  Heart, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Edit3, 
  Check, 
  X, 
  Info, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  Trash2,
  Lock,
  FileCheck
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { HealthBrain } from "../types";

export default function HealthBrainView() {
  const [brain, setBrain] = useState<HealthBrain>(orchestrator.getHealthBrain());
  
  // Track which sections are expanded (Progressive Disclosure)
  const [expandedSection, setExpandedSection] = useState<string | null>("basic");
  
  // Track edit states
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Form states matching types
  const [basicForm, setBasicForm] = useState(brain.profile);
  const [lifestyleForm, setLifestyleForm] = useState(brain.lifestyle);
  const [medHistoryForm, setMedHistoryForm] = useState(brain.medicalHistory);
  const [familyForm, setFamilyForm] = useState(brain.familyHistory);
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    // Keep local component state in sync with orchestrator
    const unsub = orchestrator.subscribe("profile_updated", () => {
      const updatedBrain = orchestrator.getHealthBrain();
      setBrain({ ...updatedBrain });
      setBasicForm({ ...updatedBrain.profile });
      setLifestyleForm({ ...updatedBrain.lifestyle });
      setMedHistoryForm({ ...updatedBrain.medicalHistory });
      setFamilyForm({ ...updatedBrain.familyHistory });
    });
    return () => unsub();
  }, []);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleSaveBasic = () => {
    orchestrator.updateProfile({ profile: basicForm });
    setEditingSection(null);
  };

  const handleSaveLifestyle = () => {
    orchestrator.updateProfile({ lifestyle: lifestyleForm });
    setEditingSection(null);
  };

  const handleSaveMedHistory = () => {
    orchestrator.updateProfile({ medicalHistory: medHistoryForm });
    setEditingSection(null);
  };

  const handleSaveFamily = () => {
    orchestrator.updateProfile({ familyHistory: familyForm });
    setEditingSection(null);
  };

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    const updatedGoals = [...brain.healthGoals, newGoal.trim()];
    orchestrator.updateProfile({ healthGoals: updatedGoals });
    setNewGoal("");
  };

  const handleRemoveGoal = (idx: number) => {
    const updatedGoals = brain.healthGoals.filter((_, i) => i !== idx);
    orchestrator.updateProfile({ healthGoals: updatedGoals });
  };

  return (
    <div id="health-brain-view" className="space-y-8 max-w-5xl mx-auto p-1 animate-fade-in">
      
      {/* Title & Concept Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-display font-bold text-text-dark flex items-center gap-2.5 tracking-tight">
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500/10" />
          Lifelong Personal Health Brain
        </h1>
        <p className="text-text-muted mt-1.5 text-sm md:text-base font-sans">
          This is your permanent, secure digital medical archive. Every conversation, symptom logged, and diagnosis aggregates inside this brain to make future healthcare seamless.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Informative card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100/80 space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600 border border-purple-100/50">
                <Info className="w-4.5 h-4.5" />
              </div>
              How it works
            </h3>
            
            <p className="text-xs leading-relaxed text-text-muted font-sans">
              As you interact with our AI, the operating system registers lifestyle changes, condition updates, and symptoms automatically, allowing you to walk into any clinic or health center with complete medical clarity.
            </p>

            <div className="bg-[#D8C4F1]/10 p-5 rounded-[18px] border border-[#D8C4F1]/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-wide">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>Secure Sharing</span>
              </div>
              <p className="text-xs text-indigo-950/80 leading-relaxed font-sans font-medium">
                You can export this entire clinical dossier to share with community health center (ASHA) doctors with one touch.
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-text-muted font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>AES-256 Encrypted Patient Vault</span>
            </div>
          </div>
        </div>

        {/* Right Progressive Disclosure Cards (Main Dossier) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-[22px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100/80 overflow-hidden hover:border-gray-200 transition-all">
            <div 
              onClick={() => toggleSection("basic")}
              className="p-5 md:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#A7D8F2]/30 to-[#A7D8F2]/10 text-blue-600 border border-[#A7D8F2]/50">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-text-dark">Basic Information</h3>
                  <p className="text-xs text-text-muted mt-0.5">Personal vitals, blood type, and emergency contacts</p>
                </div>
              </div>
              {expandedSection === "basic" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>

            {expandedSection === "basic" && (
              <div className="p-6 md:p-8 border-t border-gray-100/80 bg-gradient-to-b from-white to-gray-50/30 space-y-4">
                {editingSection === "basic" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={basicForm.name} 
                        onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#A7D8F2] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Age</label>
                      <input 
                        type="number" 
                        value={basicForm.age} 
                        onChange={(e) => setBasicForm({ ...basicForm, age: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#A7D8F2] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Height</label>
                      <input 
                        type="text" 
                        value={basicForm.height} 
                        onChange={(e) => setBasicForm({ ...basicForm, height: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#A7D8F2] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Weight</label>
                      <input 
                        type="text" 
                        value={basicForm.weight} 
                        onChange={(e) => setBasicForm({ ...basicForm, weight: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#A7D8F2] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Blood Group</label>
                      <input 
                        type="text" 
                        value={basicForm.bloodGroup} 
                        onChange={(e) => setBasicForm({ ...basicForm, bloodGroup: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#A7D8F2] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Emergency Contact</label>
                      <input 
                        type="text" 
                        value={basicForm.emergencyContact} 
                        onChange={(e) => setBasicForm({ ...basicForm, emergencyContact: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#A7D8F2] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-2.5 pt-3">
                      <button onClick={() => setEditingSection(null)} className="px-5 py-2.5 text-xs border border-gray-200 rounded-full font-bold text-text-dark hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer">
                        <X className="w-4 h-4 text-rose-500" /> Cancel
                      </button>
                      <button onClick={handleSaveBasic} className="px-5 py-2.5 text-xs bg-[#A7D8F2] border border-[#A7D8F2]/40 rounded-full font-bold text-text-dark flex items-center gap-1.5 cursor-pointer">
                        <Check className="w-4 h-4 text-emerald-600" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-y-5 gap-x-3 text-sm">
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Full Name</span>
                      <span className="font-semibold text-text-dark block mt-1">{brain.profile.name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Age</span>
                      <span className="font-semibold text-text-dark block mt-1">{brain.profile.age} years</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Height & Weight</span>
                      <span className="font-semibold text-text-dark block mt-1">{brain.profile.height} / {brain.profile.weight}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Blood Group</span>
                      <span className="font-semibold text-text-dark block mt-1">{brain.profile.bloodGroup}</span>
                    </div>
                    <div className="col-span-2 p-4 bg-rose-50/40 border border-rose-100 rounded-[16px]">
                      <span className="text-xs text-rose-600 font-bold uppercase tracking-wider">Emergency Contact</span>
                      <span className="font-bold text-text-dark block mt-1 text-base">{brain.profile.emergencyContact}</span>
                    </div>
                    <div className="col-span-2 flex justify-end pt-2">
                      <button 
                        onClick={() => { setBasicForm(brain.profile); setEditingSection("basic"); }}
                        className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Basic Info
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Lifestyle */}
          <div className="bg-white rounded-[22px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100/80 overflow-hidden hover:border-gray-200 transition-all">
            <div 
              onClick={() => toggleSection("lifestyle")}
              className="p-5 md:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#F8C8DC]/30 to-[#F8C8DC]/10 text-pink-600 border border-[#F8C8DC]/50">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-text-dark">Lifestyle & Habits</h3>
                  <p className="text-xs text-text-muted mt-0.5">Sleep pattern, nutrition, and physical activities</p>
                </div>
              </div>
              {expandedSection === "lifestyle" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>

            {expandedSection === "lifestyle" && (
              <div className="p-6 md:p-8 border-t border-gray-100/80 bg-gradient-to-b from-white to-gray-50/30 space-y-4">
                {editingSection === "lifestyle" ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Exercise & Activities</label>
                      <input 
                        type="text" 
                        value={lifestyleForm.exercise} 
                        onChange={(e) => setLifestyleForm({ ...lifestyleForm, exercise: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#F8C8DC] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Sleep Quality</label>
                      <input 
                        type="text" 
                        value={lifestyleForm.sleep} 
                        onChange={(e) => setLifestyleForm({ ...lifestyleForm, sleep: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#F8C8DC] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Diet Routine</label>
                      <input 
                        type="text" 
                        value={lifestyleForm.diet} 
                        onChange={(e) => setLifestyleForm({ ...lifestyleForm, diet: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#F8C8DC] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Smoking</label>
                        <input 
                          type="text" 
                          value={lifestyleForm.smoking} 
                          onChange={(e) => setLifestyleForm({ ...lifestyleForm, smoking: e.target.value })}
                          className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#F8C8DC] focus:shadow-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Alcohol</label>
                        <input 
                          type="text" 
                          value={lifestyleForm.alcohol} 
                          onChange={(e) => setLifestyleForm({ ...lifestyleForm, alcohol: e.target.value })}
                          className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#F8C8DC] focus:shadow-xs font-sans"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2.5 pt-3">
                      <button onClick={() => setEditingSection(null)} className="px-5 py-2.5 text-xs border border-gray-200 rounded-full font-bold text-text-dark hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer">
                        <X className="w-4 h-4 text-rose-500" /> Cancel
                      </button>
                      <button onClick={handleSaveLifestyle} className="px-5 py-2.5 text-xs bg-[#F8C8DC] border border-[#F8C8DC]/40 rounded-full font-bold text-text-dark flex items-center gap-1.5 cursor-pointer">
                        <Check className="w-4 h-4 text-emerald-600" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-3 text-sm">
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Exercise</span>
                      <span className="font-semibold text-text-dark block mt-1">{brain.lifestyle.exercise}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Sleep</span>
                      <span className="font-semibold text-text-dark block mt-1">{brain.lifestyle.sleep}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Diet / Nutrition</span>
                      <span className="font-semibold text-text-dark block mt-1">{brain.lifestyle.diet}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Smoking</span>
                      <span className="font-semibold text-text-dark block mt-1">{brain.lifestyle.smoking}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Alcohol Intake</span>
                      <span className="font-semibold text-text-dark block mt-1">{brain.lifestyle.alcohol}</span>
                    </div>
                    <div className="sm:col-span-2 flex justify-end pt-2">
                      <button 
                        onClick={() => { setLifestyleForm(brain.lifestyle); setEditingSection("lifestyle"); }}
                        className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Lifestyle
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 3: Medical History */}
          <div className="bg-white rounded-[22px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100/80 overflow-hidden hover:border-gray-200 transition-all">
            <div 
              onClick={() => toggleSection("medical")}
              className="p-5 md:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#D8C4F1]/30 to-[#D8C4F1]/10 text-purple-600 border border-[#D8C4F1]/50">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-text-dark">Medical & Pregnancy History</h3>
                  <p className="text-xs text-text-muted mt-0.5">Current conditions, past surgeries, vaccinations, and medications</p>
                </div>
              </div>
              {expandedSection === "medical" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>

            {expandedSection === "medical" && (
              <div className="p-6 md:p-8 border-t border-gray-100/80 bg-gradient-to-b from-white to-gray-50/30 space-y-4">
                {editingSection === "medical" ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Pregnancy History</label>
                      <input 
                        type="text" 
                        value={medHistoryForm.pregnancyHistory} 
                        onChange={(e) => setMedHistoryForm({ ...medHistoryForm, pregnancyHistory: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#D8C4F1] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Current Medications (Comma separated)</label>
                      <input 
                        type="text" 
                        value={medHistoryForm.currentMedicines.join(", ")} 
                        onChange={(e) => setMedHistoryForm({ ...medHistoryForm, currentMedicines: e.target.value.split(",").map(m => m.trim()).filter(Boolean) })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#D8C4F1] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Allergies (Comma separated)</label>
                      <input 
                        type="text" 
                        value={medHistoryForm.allergies.join(", ")} 
                        onChange={(e) => setMedHistoryForm({ ...medHistoryForm, allergies: e.target.value.split(",").map(m => m.trim()).filter(Boolean) })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#D8C4F1] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Current Chronic Conditions (Comma separated)</label>
                      <input 
                        type="text" 
                        value={medHistoryForm.currentConditions.join(", ")} 
                        onChange={(e) => setMedHistoryForm({ ...medHistoryForm, currentConditions: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#D8C4F1] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Previous Illnesses (Comma separated)</label>
                      <input 
                        type="text" 
                        value={medHistoryForm.previousIllnesses.join(", ")} 
                        onChange={(e) => setMedHistoryForm({ ...medHistoryForm, previousIllnesses: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#D8C4F1] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Surgeries (Comma separated)</label>
                      <input 
                        type="text" 
                        value={medHistoryForm.surgeries.join(", ")} 
                        onChange={(e) => setMedHistoryForm({ ...medHistoryForm, surgeries: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#D8C4F1] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="flex justify-end gap-2.5 pt-3">
                      <button onClick={() => setEditingSection(null)} className="px-5 py-2.5 text-xs border border-gray-200 rounded-full font-bold text-text-dark hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer">
                        <X className="w-4 h-4 text-rose-500" /> Cancel
                      </button>
                      <button onClick={handleSaveMedHistory} className="px-5 py-2.5 text-xs bg-[#D8C4F1] border border-[#D8C4F1]/40 rounded-full font-bold text-text-dark flex items-center gap-1.5 cursor-pointer">
                        <Check className="w-4 h-4 text-emerald-600" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 text-sm">
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Pregnancy History</span>
                      <span className="font-semibold text-text-dark block mt-1">{brain.medicalHistory.pregnancyHistory}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Current Medicines</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {brain.medicalHistory.currentMedicines.map((m, i) => (
                            <span key={i} className="px-2.5 py-1 text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg font-sans font-medium">{m}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Known Allergies</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {brain.medicalHistory.allergies.map((a, i) => (
                            <span key={i} className="px-2.5 py-1 text-xs bg-rose-50 border border-rose-100 text-rose-800 rounded-lg font-sans font-medium">{a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-50">
                      <div>
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Current Diagnoses/Conditions</span>
                        <p className="text-text-dark font-semibold mt-1">{brain.medicalHistory.currentConditions.join(", ") || "None"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Previous Key Illnesses</span>
                        <p className="text-text-dark font-semibold mt-1">{brain.medicalHistory.previousIllnesses.join(", ") || "None"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Surgeries</span>
                        <p className="text-text-dark font-semibold mt-1">{brain.medicalHistory.surgeries.join(", ") || "None"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Vaccination Shield</span>
                        <p className="text-text-dark font-semibold mt-1">{brain.medicalHistory.vaccinations.join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={() => { setMedHistoryForm(brain.medicalHistory); setEditingSection("medical"); }}
                        className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Medical dossier
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 4: Family History */}
          <div className="bg-white rounded-[22px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100/80 overflow-hidden hover:border-gray-200 transition-all">
            <div 
              onClick={() => toggleSection("family")}
              className="p-5 md:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#A7D8F2]/30 to-[#A7D8F2]/10 text-indigo-600 border border-[#A7D8F2]/50">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-text-dark">Family Medical Roots</h3>
                  <p className="text-xs text-text-muted mt-0.5">Maternal, paternal, and hereditary health risk indicators</p>
                </div>
              </div>
              {expandedSection === "family" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>

            {expandedSection === "family" && (
              <div className="p-6 md:p-8 border-t border-gray-100/80 bg-gradient-to-b from-white to-gray-50/30 space-y-4">
                {editingSection === "family" ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Mother's Side History</label>
                      <input 
                        type="text" 
                        value={familyForm.mother} 
                        onChange={(e) => setFamilyForm({ ...familyForm, mother: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#A7D8F2] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Father's Side History</label>
                      <input 
                        type="text" 
                        value={familyForm.father} 
                        onChange={(e) => setFamilyForm({ ...familyForm, father: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#A7D8F2] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Grandparents Roots</label>
                      <input 
                        type="text" 
                        value={familyForm.grandparents} 
                        onChange={(e) => setFamilyForm({ ...familyForm, grandparents: e.target.value })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#A7D8F2] focus:shadow-xs font-sans"
                      />
                    </div>
                    <div className="flex justify-end gap-2.5 pt-3">
                      <button onClick={() => setEditingSection(null)} className="px-5 py-2.5 text-xs border border-gray-200 rounded-full font-bold text-text-dark hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer">
                        <X className="w-4 h-4 text-rose-500" /> Cancel
                      </button>
                      <button onClick={handleSaveFamily} className="px-5 py-2.5 text-xs bg-[#A7D8F2] border border-[#A7D8F2]/40 rounded-full font-bold text-text-dark flex items-center gap-1.5 cursor-pointer">
                        <Check className="w-4 h-4 text-emerald-600" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Mother's Side Health</span>
                      <p className="font-semibold text-text-dark mt-1">{brain.familyHistory.mother}</p>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Father's Side Health</span>
                      <p className="font-semibold text-text-dark mt-1">{brain.familyHistory.father}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Grandparents (Hereditary Risks)</span>
                      <p className="font-semibold text-text-dark mt-1">{brain.familyHistory.grandparents}</p>
                    </div>
                    <div className="sm:col-span-2 flex justify-end pt-2">
                      <button 
                        onClick={() => { setFamilyForm(brain.familyHistory); setEditingSection("family"); }}
                        className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Family History
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 5: Health Goals */}
          <div className="bg-white rounded-[22px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100/80 overflow-hidden hover:border-gray-200 transition-all">
            <div 
              onClick={() => toggleSection("goals")}
              className="p-5 md:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#F8C8DC]/30 to-[#F8C8DC]/10 text-purple-600 border border-[#F8C8DC]/50">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-text-dark">Active Health Goals</h3>
                  <p className="text-xs text-text-muted mt-0.5">Proactive objectives Priya is pacing toward</p>
                </div>
              </div>
              {expandedSection === "goals" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>

            {expandedSection === "goals" && (
              <div className="p-6 md:p-8 border-t border-gray-100/80 bg-gradient-to-b from-white to-gray-50/30 space-y-4">
                <div className="space-y-3">
                  {brain.healthGoals.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between p-3.5 bg-gray-50/60 rounded-[16px] text-sm border border-gray-100/50 hover:bg-gray-50 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <Check className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 stroke-[2.5]" />
                        <span className="font-semibold text-text-dark font-sans">{goal}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveGoal(index)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5 pt-3">
                  <input 
                    type="text" 
                    placeholder="e.g., Do warm stretching every evening for postpartum core" 
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                    className="flex-1 p-3 bg-white border border-gray-200 rounded-[12px] text-sm text-text-dark outline-none focus:border-[#F8C8DC] focus:shadow-xs font-sans"
                  />
                  <button 
                    onClick={handleAddGoal}
                    className="px-5 bg-[#F8C8DC] border border-[#F8C8DC]/40 text-text-dark font-display font-bold text-xs rounded-full hover:bg-opacity-90 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Goal
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
