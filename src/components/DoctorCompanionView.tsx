/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Stethoscope, 
  Clipboard, 
  HelpCircle, 
  Plus, 
  Trash2, 
  FileText, 
  Calendar, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  Upload, 
  Check, 
  Bookmark,
  ChevronRight
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { DoctorCompanionState, MedicalRecord, Medication, Appointment } from "../types";

export default function DoctorCompanionView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [companion, setCompanion] = useState<DoctorCompanionState | null>(null);

  // Edit states for Pre-Appointment Prep
  const [newConcern, setNewConcern] = useState("");
  const [newQuestion, setNewQuestion] = useState("");

  // Post-Appointment Form states
  const [prescriptionText, setPrescriptionText] = useState("");
  const [doctorInstructions, setDoctorInstructions] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [newTestOrdered, setNewTestOrdered] = useState("");
  const [testsOrdered, setTestsOrdered] = useState<string[]>([]);
  const [visitNotes, setVisitNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setAppointments(orchestrator.getAppointments());
    setMedicalRecords(orchestrator.getMedicalRecords());
    setMedications(orchestrator.getMedications());
    setCompanion(orchestrator.getDoctorCompanion());

    const unsub = orchestrator.subscribe("record_uploaded", () => {
      setCompanion({ ...orchestrator.getDoctorCompanion() });
    });
    return () => unsub();
  }, []);

  const activeAppt = appointments.find(a => a.id === companion?.appointmentId);

  // Handles adding pre-visit concerns
  const handleAddConcern = () => {
    if (!newConcern || !companion) return;
    const updatedConcerns = [...companion.concerns, newConcern];
    orchestrator.updateDoctorCompanion({ concerns: updatedConcerns });
    setNewConcern("");
  };

  const handleRemoveConcern = (index: number) => {
    if (!companion) return;
    const updatedConcerns = companion.concerns.filter((_, i) => i !== index);
    orchestrator.updateDoctorCompanion({ concerns: updatedConcerns });
  };

  // Handles adding pre-visit questions
  const handleAddQuestion = () => {
    if (!newQuestion || !companion) return;
    const updatedQuestions = [...companion.questionsToAsk, newQuestion];
    orchestrator.updateDoctorCompanion({ questionsToAsk: updatedQuestions });
    setNewQuestion("");
  };

  const handleRemoveQuestion = (index: number) => {
    if (!companion) return;
    const updatedQuestions = companion.questionsToAsk.filter((_, i) => i !== index);
    orchestrator.updateDoctorCompanion({ questionsToAsk: updatedQuestions });
  };

  // Handle report selection toggle
  const handleToggleReport = (reportId: string) => {
    if (!companion) return;
    const isSelected = companion.selectedReportIds.includes(reportId);
    const updatedReports = isSelected
      ? companion.selectedReportIds.filter(id => id !== reportId)
      : [...companion.selectedReportIds, reportId];
    
    orchestrator.updateDoctorCompanion({ selectedReportIds: updatedReports });
  };

  // Add tests ordered
  const handleAddTest = () => {
    if (!newTestOrdered) return;
    setTestsOrdered([...testsOrdered, newTestOrdered]);
    setNewTestOrdered("");
  };

  const handleRemoveTest = (index: number) => {
    setTestsOrdered(testsOrdered.filter((_, i) => i !== index));
  };

  // Post-appointment prescription submission
  const handleSubmitPostVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptionText && !doctorInstructions) return;

    // Send to orchestrator which triggers clinical extraction and dashboard updates
    orchestrator.processAfterAppointmentPrescription(
      prescriptionText,
      visitNotes,
      doctorInstructions,
      followUpDate,
      testsOrdered
    );

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      // Reset post-visit forms
      setPrescriptionText("");
      setDoctorInstructions("");
      setFollowUpDate("");
      setTestsOrdered([]);
      setVisitNotes("");
    }, 4000);
  };

  // Print clinical brief
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="doctor-companion-view" className="space-y-8 max-w-6xl mx-auto p-1 animate-fade-in print:bg-white print:p-8">
      
      {/* 1. Header Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-dark tracking-tight leading-tight flex items-center gap-2.5">
            <Stethoscope className="w-8 h-8 text-indigo-600" />
            Doctor Companion
          </h1>
          <p className="text-text-muted mt-1 text-sm font-sans">
            Prepare clinical brief summaries before your appointment and process prescriptions automatically afterwards.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-text-dark font-display font-bold rounded-full shadow-sm hover:bg-gray-50 transition-all cursor-pointer text-xs"
        >
          <Printer className="w-4.5 h-4.5" />
          <span>Print Pre-Visit Brief</span>
        </button>
      </div>

      {activeAppt ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: Pre-Appointment Prep */}
          <div className="space-y-6 print:w-full print:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-gray-100/80 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50/40 to-transparent rounded-bl-full print:hidden"></div>
              
              {/* Brief Title */}
              <div className="pb-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    Clinic Briefing Guide
                  </span>
                  <h3 className="font-display font-bold text-text-dark text-lg mt-1">Pre-Appointment Clinical Prep</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono font-bold">
                  <Calendar className="w-4 h-4 text-[#E05B7C]" />
                  <span>{activeAppt.date} | {activeAppt.time}</span>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Doctor Specialist</span>
                    <strong className="text-text-dark mt-0.5 block">{activeAppt.doctorName}</strong>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Purpose of Visit</span>
                    <strong className="text-text-dark mt-0.5 block truncate">{activeAppt.purpose}</strong>
                  </div>
                </div>

                {/* 1. Chief Complaint & Summary */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-[10px] text-text-dark font-bold uppercase tracking-wider block">1. Primary Consultation Goal (Chief Complaint)</label>
                  <p className="p-3 bg-indigo-50/20 text-indigo-900 border border-indigo-100/30 rounded-xl text-xs font-semibold">
                    {companion?.chiefComplaint || "Plan for healthy second pregnancy."}
                  </p>
                </div>

                {/* 2. Specific Symptoms & Concerns */}
                <div className="space-y-2.5 font-sans">
                  <label className="text-[10px] text-text-dark font-bold uppercase tracking-wider block">2. Tracked Symptoms & Personal Concerns</label>
                  <ul className="space-y-1.5 text-xs">
                    {companion?.concerns.map((con, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-text-dark font-medium flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          {con}
                        </span>
                        <button
                          onClick={() => handleRemoveConcern(index)}
                          className="text-gray-400 hover:text-rose-500 transition-colors print:hidden cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Add concern */}
                  <div className="flex gap-2 print:hidden">
                    <input
                      type="text"
                      placeholder="e.g. Back stiffness after 3 hours of sitting"
                      value={newConcern}
                      onChange={(e) => setNewConcern(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-sans text-text-dark focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddConcern}
                      className="px-3.5 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3. Questions to Ask Gynaecologist */}
                <div className="space-y-2.5 font-sans">
                  <label className="text-[10px] text-text-dark font-bold uppercase tracking-wider block">3. Structured Questions for Doctor</label>
                  <ul className="space-y-1.5 text-xs">
                    {companion?.questionsToAsk.map((q, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-text-dark font-medium flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-[#E05B7C] shrink-0" />
                          {q}
                        </span>
                        <button
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-gray-400 hover:text-rose-500 transition-colors print:hidden cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Add question */}
                  <div className="flex gap-2 print:hidden">
                    <input
                      type="text"
                      placeholder="e.g. Can I take standard back-pain ointments if pregnant?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-sans text-text-dark focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddQuestion}
                      className="px-3.5 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4. Active Medications list */}
                <div className="space-y-2 font-sans">
                  <label className="text-[10px] text-text-dark font-bold uppercase tracking-wider block">4. Current Active Medication Adherence</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {medications.filter(m => m.status === "Active").map(med => (
                      <div key={med.id} className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/30 flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold text-emerald-900 truncate">{med.name} ({med.dose})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Select Records to Share */}
                <div className="space-y-2 font-sans print:hidden">
                  <label className="text-[10px] text-text-dark font-bold uppercase tracking-wider block">5. Select Medical Records for consultation</label>
                  <div className="space-y-1.5">
                    {medicalRecords.map(rec => {
                      const isSelected = companion?.selectedReportIds.includes(rec.id);
                      return (
                        <div
                          key={rec.id}
                          onClick={() => handleToggleReport(rec.id)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-sans transition-all ${
                            isSelected 
                              ? "border-indigo-400 bg-indigo-50/10 font-semibold" 
                              : "border-gray-100 bg-white"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200"}`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <FileText className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          <span className="truncate flex-1 text-text-dark">{rec.title} ({rec.date})</span>
                          <span className="text-[10px] text-text-muted font-mono">{rec.category}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Post-Appointment Prescription Processor */}
          <div className="space-y-6 print:hidden">
            <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-gray-100/80 space-y-5 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-50/40 to-transparent rounded-bl-full"></div>
              
              <div>
                <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Post-Visit Intelligence
                </span>
                <h3 className="font-display font-bold text-text-dark text-lg mt-1">Prescription & Advice Extraction</h3>
                <p className="text-text-muted mt-0.5 text-xs font-sans">
                  Add details from your doctor's visit. Saheli will automatically extract medicines & schedule follow-ups.
                </p>
              </div>

              {isSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 animate-scale-in">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="text-xs font-sans text-emerald-800">
                    <span className="font-bold block text-emerald-900">Success! AI Care Orchestration complete.</span>
                    <span>Medicines added to Dashboard, Lifelong Health Brain updated, and Care Timeline sync'd.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitPostVisit} className="space-y-4">
                
                {/* 1. Prescription Text Input */}
                <div className="space-y-1.5 font-sans">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-dark uppercase tracking-wider block">Paste Prescription / Medicines *</label>
                    <span className="text-[9px] font-bold text-indigo-500 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" />
                      AI Extractor Active
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="e.g. Paracetamol 650mg once daily for pain, Calcium tablet daily morning."
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-sans text-text-dark"
                  ></textarea>
                  <p className="text-[10px] text-text-muted italic leading-relaxed">
                    Saheli parses this text to find words like 'Calcium' or 'Paracetamol', automatically schedules check-ins, and places them onto your Medication Dashboard.
                  </p>
                </div>

                {/* 2. Doctor instructions */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-bold text-text-dark uppercase tracking-wider block">General Doctor Advice / Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Avoid heavy lifting in fields, sleep with leg elevated."
                    value={doctorInstructions}
                    onChange={(e) => setDoctorInstructions(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-sans text-text-dark"
                  />
                </div>

                {/* 3. Follow up date */}
                <div className="grid grid-cols-2 gap-4 font-sans">
                  <div>
                    <label className="text-xs font-bold text-text-dark uppercase tracking-wider block mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-sans text-text-dark"
                    />
                  </div>
                  
                  {/* Order medical tests */}
                  <div>
                    <label className="text-xs font-bold text-text-dark uppercase tracking-wider block mb-1">Ordered Test</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. CBC test, Scan"
                        value={newTestOrdered}
                        onChange={(e) => setNewTestOrdered(e.target.value)}
                        className="flex-1 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-sans text-text-dark"
                      />
                      <button
                        type="button"
                        onClick={handleAddTest}
                        className="px-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* List ordered tests */}
                {testsOrdered.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 font-sans">
                    {testsOrdered.map((test, i) => (
                      <span key={i} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                        {test}
                        <button type="button" onClick={() => handleRemoveTest(i)} className="text-indigo-400 hover:text-indigo-600 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* 4. Consultation Notes */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-bold text-text-dark uppercase tracking-wider block">Additional Visit Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Sunita accompanied me. The doctor was very reassuring and advised that planning a second pregnancy in 6 months is safe."
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-sans text-text-dark"
                  ></textarea>
                </div>

                {/* Safety Warning */}
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex gap-2 items-start text-[10px] font-sans text-rose-800 leading-normal">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="font-semibold">
                    Never modify, stop, or adjust prescription doses without consulting Dr. Anjali Mehta first. For educational support only.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-full font-display font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4.5 h-4.5 text-white/95" />
                  <span>Log Visit & Sync Health Operating System</span>
                </button>

              </form>

            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white p-12 rounded-[24px] border border-gray-100 text-center text-text-muted">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-sans font-medium">No active scheduled appointments found.</p>
          <p className="text-xs mt-1">Please schedule a follow-up appointment in your dashboard first!</p>
        </div>
      )}

    </div>
  );
}
