/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Search, 
  Filter, 
  Activity, 
  FileText, 
  Pill, 
  CheckCircle, 
  BookOpen, 
  PlusCircle, 
  User, 
  Plus, 
  Clock, 
  Heart, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { TimelineEvent } from "../types";

// Category configuration with associated color maps & icons
const CATEGORIES: Record<TimelineEvent["category"], { bg: string; text: string; border: string; icon: any }> = {
  Symptoms: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", icon: Activity },
  "Doctor Visits": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: User },
  Reports: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-100", icon: FileText },
  Medicines: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: Pill },
  Appointments: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: Clock },
  Goals: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100", icon: CheckCircle },
  "Life Events": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", icon: BookOpen },
  "Health Updates": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100", icon: Sparkles }
};

export default function TimelineView() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>(orchestrator.getTimeline());
  
  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom event manual entry state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TimelineEvent["category"]>("Symptoms");
  const [newDescription, setNewDescription] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    // Sync with event-driven Orchestrator
    const unsub = orchestrator.subscribe("timeline_updated", () => {
      setTimeline([...orchestrator.getTimeline()]);
    });
    return () => unsub();
  }, []);

  const handleCreateTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    orchestrator.addDirectTimelineEvent({
      date: newDate,
      category: newCategory,
      title: newTitle.trim(),
      description: newDescription.trim(),
      notes: newNotes.trim() || undefined
    });

    // Reset Form
    setNewTitle("");
    setNewDescription("");
    setNewNotes("");
    setNewDate(new Date().toISOString().split("T")[0]);
    setShowAddForm(false);
  };

  // Process and filter timeline items
  const filteredEvents = timeline.filter((event) => {
    const categoryMatches = selectedCategory === "All" || event.category === selectedCategory;
    const searchMatches = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.notes && event.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatches && searchMatches;
  });

  return (
    <div id="timeline-view" className="space-y-8 max-w-5xl mx-auto p-1 animate-fade-in">
      
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-dark flex items-center gap-2.5 tracking-tight">
            <Calendar className="w-8 h-8 text-indigo-500" />
            Care Journey Timeline
          </h1>
          <p className="text-text-muted mt-1.5 text-sm md:text-base font-sans">
            Your continuous chronological healthcare trail. Every symptom logged and checkup scheduled binds here forever.
          </p>
        </div>
        <button
          id="toggle-add-timeline-form"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-[#D8C4F1] text-white font-display font-bold text-sm rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.15)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.25)] hover:scale-102 active:scale-98 transition-all flex items-center gap-2 border border-purple-200/20 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Log Care Milestone
        </button>
      </div>

      {/* Manual Timeline Event Entry form */}
      {showAddForm && (
        <form 
          onSubmit={handleCreateTimelineEvent}
          className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100/80 shadow-[0_10px_35px_rgba(0,0,0,0.015)] space-y-5 animate-fade-in"
        >
          <div className="flex items-center gap-3 text-indigo-600 font-display font-bold border-b border-gray-100 pb-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100/50">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-lg tracking-tight">Record a New Health Milestone Directly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Milestone Name / Title</label>
              <input 
                type="text" 
                placeholder="e.g., Started taking iron tablets after breakfast"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full p-3 bg-gray-50/60 border border-gray-200/80 rounded-[16px] text-sm text-text-dark outline-none focus:border-indigo-400 focus:bg-white focus:shadow-xs transition-all font-sans"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Date</label>
              <input 
                type="date" 
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full p-3 bg-gray-50/60 border border-gray-200/80 rounded-[16px] text-sm text-text-dark outline-none focus:border-indigo-400 focus:bg-white focus:shadow-xs transition-all font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Milestone Category</label>
              <select 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full p-3 bg-gray-50/60 border border-gray-200/80 rounded-[16px] text-sm text-text-dark outline-none focus:border-indigo-400 focus:bg-white focus:shadow-xs transition-all font-sans cursor-pointer"
              >
                {Object.keys(CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Short Description</label>
              <input 
                type="text" 
                placeholder="e.g., Doctor advised standard daily iron tablet intake for postpartum recovery."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
                className="w-full p-3 bg-gray-50/60 border border-gray-200/80 rounded-[16px] text-sm text-text-dark outline-none focus:border-indigo-400 focus:bg-white focus:shadow-xs transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Personal Clinical Notes (Optional)</label>
            <textarea 
              rows={2}
              placeholder="e.g., Feels much better after starting this schedule. Drink with orange juice."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full p-3.5 bg-gray-50/60 border border-gray-200/80 rounded-[16px] text-sm text-text-dark outline-none focus:border-indigo-400 focus:bg-white focus:shadow-xs transition-all font-sans resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-6 py-3 border border-gray-200 rounded-full text-xs font-bold text-text-dark hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-[#A7D8F2] hover:bg-opacity-95 border border-[#A7D8F2]/40 rounded-full font-display font-bold text-xs text-text-dark cursor-pointer transition-all"
            >
              Commit to Timeline
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar Row */}
      <div className="bg-white p-4.5 rounded-[22px] border border-gray-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none max-w-full">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap border ${
              selectedCategory === "All" 
                ? "bg-indigo-600 text-white border-indigo-600 shadow-[0_4px_12px_rgba(79,70,229,0.15)]" 
                : "bg-gray-50/50 text-text-muted hover:bg-gray-50 border-gray-100"
            }`}
          >
            All Milestones
          </button>
          {Object.keys(CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap border ${
                selectedCategory === cat 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-[0_4px_12px_rgba(79,70,229,0.15)]" 
                  : "bg-gray-50/50 text-text-muted hover:bg-gray-50 border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200/80 rounded-full text-xs text-text-dark outline-none focus:border-indigo-400 focus:bg-white focus:shadow-xs transition-all font-sans"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
        </div>

      </div>

      {/* Main Historical List Axis */}
      {filteredEvents.length > 0 ? (
        <div className="relative pl-6 md:pl-12 space-y-6">
          {/* Vertical central dotted timeline axis bar */}
          <div className="absolute left-[13px] md:left-[23px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-[#D8C4F1] pointer-events-none opacity-80"></div>

          {filteredEvents.map((evt) => {
            const config = CATEGORIES[evt.category];
            const CatIcon = config.icon;
            return (
              <div key={evt.id} className="relative group animate-slide-in">
                
                {/* Visual Anchor Node */}
                <div className={`absolute -left-[30px] md:-left-[46px] top-1.5 p-1 rounded-full bg-white border-2 border-dashed ${
                  evt.category === "Symptoms" ? "border-rose-300" :
                  evt.category === "Doctor Visits" ? "border-blue-300" :
                  evt.category === "Reports" ? "border-cyan-300" :
                  evt.category === "Medicines" ? "border-emerald-300" : 
                  evt.category === "Appointments" ? "border-amber-300" :
                  evt.category === "Goals" ? "border-purple-300" :
                  evt.category === "Life Events" ? "border-indigo-300" : "border-teal-300"
                } z-10 shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`p-1.5 rounded-full ${config.bg} ${config.text}`}>
                    <CatIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="bg-white p-6 rounded-[22px] border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-indigo-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 space-y-4">
                  
                  {/* Card Header metadata */}
                  <div className="flex flex-wrap items-center gap-2 justify-between border-b border-gray-50 pb-2">
                    <span className="text-xs font-bold text-text-muted font-mono">{evt.date}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} border ${config.border}`}>
                      {evt.category}
                    </span>
                  </div>

                  {/* Core Event information */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-display font-bold text-text-dark group-hover:text-indigo-600 transition-colors tracking-tight">
                      {evt.title}
                    </h3>
                    <p className="text-sm text-text-dark leading-relaxed font-sans opacity-95">
                      {evt.description}
                    </p>
                  </div>

                  {/* Supplemental Personal clinical notes */}
                  {evt.notes && (
                    <div className="p-4 border-l-4 border-[#F8C8DC] bg-pink-50/10 rounded-[12px] text-xs text-text-muted font-sans leading-relaxed relative">
                      <span className="font-bold block text-text-dark mb-1">Clinical Note:</span>
                      {evt.notes}
                    </div>
                  )}

                </div>

              </div>
            );
          })}

        </div>
      ) : (
        /* Empty Search/Filter State */
        <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100/80 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 border border-gray-100">
            <Calendar className="w-7 h-7" />
          </div>
          <p className="text-sm font-display font-bold text-text-muted max-w-xs mx-auto leading-relaxed">No timeline milestones match your active search or filters.</p>
        </div>
      )}

    </div>
  );
}
