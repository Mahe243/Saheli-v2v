/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Heart, 
  BookOpen, 
  Stethoscope, 
  ArrowLeft, 
  ChevronRight, 
  MessageSquare,
  Sparkles,
  Info
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { MedicalRecord, LabMetric } from "../types";

export default function LabIntelligenceView() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [selectedMetric, setSelectedMetric] = useState<LabMetric | null>(null);

  useEffect(() => {
    const allRecords = orchestrator.getMedicalRecords();
    setRecords(allRecords);
    
    // Default to the first record with a lab report
    const withReport = allRecords.find(r => r.labReport);
    if (withReport) {
      setSelectedRecordId(withReport.id);
    }
  }, []);

  const activeRecord = records.find(r => r.id === selectedRecordId);
  const activeReport = activeRecord?.labReport;

  // Auto select first metric when report changes
  useEffect(() => {
    if (activeReport && activeReport.metrics.length > 0) {
      setSelectedMetric(activeReport.metrics[0]);
    } else {
      setSelectedMetric(null);
    }
  }, [selectedRecordId, records]);

  const recordsWithReports = records.filter(r => r.labReport);

  return (
    <div id="lab-intelligence-view" className="space-y-8 max-w-6xl mx-auto p-1 animate-fade-in">
      {/* 1. Header with Warning Disclaimer Banner */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-dark tracking-tight leading-tight flex items-center gap-2.5">
            <Activity className="w-8 h-8 text-indigo-600 animate-pulse" />
            Lab Report Intelligence
          </h1>
          <p className="text-text-muted mt-1 text-sm font-sans">
            AI-powered plain language explanations of blood biomarkers to support your understanding.
          </p>
        </div>

        {/* Warning Disclaimer Box */}
        <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs font-sans text-amber-800 space-y-1">
            <span className="font-bold block text-amber-900 uppercase tracking-wide">Important Educational Disclaimer</span>
            <p className="leading-relaxed">
              Saheli provides plain-language educational explanations to help you understand your laboratory reports. 
              <strong> Saheli does not diagnose medical conditions, prescribe treatment, or claim clinical certainty. </strong> 
              Please share this dashboard and discuss your results with your doctor, such as <strong>Dr. Anjali Mehta</strong>, before making any changes.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Select Report Dropdown */}
      {recordsWithReports.length > 0 ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 bg-white p-4 rounded-2xl border border-gray-100/80">
          <label className="text-xs font-bold text-text-dark uppercase tracking-wider block font-sans">Select Blood Report:</label>
          <select
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans text-xs text-text-dark font-semibold"
          >
            {recordsWithReports.map(rec => (
              <option key={rec.id} value={rec.id}>
                {rec.title} ({rec.date}) - {rec.hospital}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-gray-100/80 text-center text-text-muted">
          <p className="text-sm font-sans font-medium">No extracted blood reports found.</p>
          <p className="text-xs mt-1">Please upload a "Blood Tests" or "Hormone Reports" file in Smart Medical Records first!</p>
        </div>
      )}

      {activeReport && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List of Metrics (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-gray-100/80 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                <h3 className="font-display font-bold text-text-dark text-base">Extracted Biomarkers ({activeReport.metrics.length})</h3>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Auto Extracted
                </span>
              </div>

              {/* Grid of Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeReport.metrics.map((metric) => {
                  const isLow = metric.status === "Low";
                  const isHigh = metric.status === "High";
                  const isNormal = metric.status === "Normal";

                  return (
                    <div
                      key={metric.name}
                      onClick={() => setSelectedMetric(metric)}
                      className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[140px] hover:-translate-y-0.5 ${
                        selectedMetric?.name === metric.name
                          ? "border-indigo-400 bg-indigo-50/10 ring-2 ring-indigo-50"
                          : "border-gray-100 bg-white hover:border-indigo-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display font-bold text-text-dark text-sm">{metric.name}</h4>
                          <span className="text-[10px] text-text-muted font-mono">Range: {metric.referenceRange}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans uppercase tracking-wide ${
                          isLow 
                            ? "bg-rose-50 text-rose-600" 
                            : isHigh 
                              ? "bg-amber-50 text-amber-600" 
                              : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {metric.status}
                        </span>
                      </div>

                      {/* Display metric slider/progress bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono font-bold text-text-dark">{metric.value} <span className="text-text-muted font-normal text-[10px]">{metric.unit}</span></span>
                          <span className="text-[10px] text-text-muted">Standard Marker</span>
                        </div>
                        
                        {/* Custom visual progress bar */}
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                          <div className={`h-full rounded-l-full ${isLow ? "bg-rose-400 w-1/3" : "bg-gray-200 w-1/3"}`}></div>
                          <div className={`h-full ${isNormal ? "bg-emerald-400 w-1/3" : "bg-gray-200 w-1/3"}`}></div>
                          <div className={`h-full rounded-r-full ${isHigh ? "bg-amber-400 w-1/3" : "bg-gray-200 w-1/3"}`}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Report Summary section */}
              <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/20 space-y-2.5">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Report Assessment Overview
                </span>
                <p className="text-xs text-indigo-900 font-sans leading-relaxed">
                  {activeReport.summaryExplanation}
                </p>
              </div>

            </div>
          </div>

          {/* Educational Sidebar explanation (Right 1 column) */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-text-dark">Educational Counselor</h3>
            
            {selectedMetric ? (
              <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100/80 space-y-6 relative overflow-hidden animate-scale-in">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-50/50 to-transparent rounded-bl-full"></div>
                
                <div className="space-y-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                    selectedMetric.status === "Low" 
                      ? "bg-rose-50 text-rose-600" 
                      : selectedMetric.status === "High" 
                        ? "bg-amber-50 text-amber-600" 
                        : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {selectedMetric.status} Range
                  </span>
                  <h4 className="font-display font-bold text-text-dark text-lg">{selectedMetric.name}</h4>
                  <p className="text-xs text-text-muted font-sans">Current: <strong>{selectedMetric.value} {selectedMetric.unit}</strong> | Reference Range: {selectedMetric.referenceRange}</p>
                </div>

                <div className="h-[1px] bg-gray-100" />

                {/* Plain-Language Explanation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <BookOpen className="w-4.5 h-4.5" />
                    <span>What does {selectedMetric.name} do?</span>
                  </div>
                  <p className="text-xs text-text-dark font-sans leading-relaxed bg-indigo-50/20 p-4 rounded-xl border border-indigo-100/30">
                    {selectedMetric.explanation}
                  </p>
                </div>

                <div className="h-[1px] bg-gray-100" />

                {/* Cultural/Empathetic Action Steps (Nutrition, daily habits) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <Heart className="w-4.5 h-4.5" />
                    <span>Supportive Care & Counseling</span>
                  </div>
                  <ul className="text-[11px] text-text-muted font-sans space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Continue taking active nutrients like your daily <strong>Iron & Folic Acid tablet</strong> at bedtime.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Include local vegetarian sources like spinach (palak), lentils, and jaggery in your diet.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Maintain standard routine walks in the fields for gentle exercise and morning solar light.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-2.5 items-start">
                  <Info className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                  <span className="text-[10px] text-text-muted leading-relaxed font-sans">
                    Need further detail? Log this into the **Doctor Companion** or ask your health AI during your active conversation.
                  </span>
                </div>

              </div>
            ) : (
              <div className="bg-white p-8 rounded-[24px] border border-dashed border-gray-200 text-center text-text-muted">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-sans font-medium">Select any biomarker card on the left to see educational plain-language explanations.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
