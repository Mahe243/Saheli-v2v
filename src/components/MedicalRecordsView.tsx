/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Shield, 
  Eye, 
  Share2, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  Plus, 
  Calendar, 
  Tag, 
  User, 
  Home 
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { MedicalRecord, MedicalRecordCategory } from "../types";

export default function MedicalRecordsView() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Form states for manual simulated file upload
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newHospital, setNewHospital] = useState("");
  const [newDoctor, setNewDoctor] = useState("");
  const [newCategory, setNewCategory] = useState<MedicalRecordCategory>("Blood Tests");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Load records
  useEffect(() => {
    setRecords(orchestrator.getMedicalRecords());
    const unsub = orchestrator.subscribe("record_uploaded", () => {
      setRecords([...orchestrator.getMedicalRecords()]);
    });
    return () => unsub();
  }, []);

  const categories: string[] = [
    "All",
    "Blood Tests",
    "Hormone Reports",
    "Scans",
    "Prescriptions",
    "Doctor Notes",
    "Vaccinations",
    "Other"
  ];

  // Filter records based on query and category
  const filteredRecords = records.filter(rec => {
    const matchesCategory = selectedCategory === "All" || rec.category === selectedCategory;
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      rec.title.toLowerCase().includes(query) ||
      rec.hospital.toLowerCase().includes(query) ||
      rec.doctor.toLowerCase().includes(query) ||
      rec.category.toLowerCase().includes(query) ||
      (rec.previewText && rec.previewText.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  // Simulated drag-and-drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB"
      });
      // Suggest title
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB"
      });
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !uploadedFile) return;

    orchestrator.addMedicalRecord({
      title: newTitle,
      date: newDate,
      hospital: newHospital || "Local Community Sub-center",
      doctor: newDoctor || "Dr. Sunita Sen (ANM Worker)",
      category: newCategory,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      previewText: newCategory === "Blood Tests" ? "Hemoglobin: 10.8 L, Vitamin D3: 22.5 L, Ferritin: 12.0 L, HbA1c: 5.4 N" : "Secure document catalogued."
    });

    // Reset Form
    setNewTitle("");
    setNewHospital("");
    setNewDoctor("");
    setNewCategory("Blood Tests");
    setNewDate(new Date().toISOString().split("T")[0]);
    setUploadedFile(null);
    setShowUploadForm(false);
  };

  return (
    <div id="medical-records-view" className="space-y-8 max-w-6xl mx-auto p-1 animate-fade-in">
      {/* 1. Header Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-dark tracking-tight leading-tight">
            Smart Medical Records
          </h1>
          <p className="text-text-muted mt-1 text-sm font-sans">
            Store and organize your healthcare records with military-grade encryption & safe sharing consents.
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-[#D8C4F1] text-white font-display font-bold rounded-full shadow-[0_4px_15px_rgba(79,70,229,0.15)] hover:scale-102 active:scale-98 transition-all cursor-pointer border border-purple-200/50"
        >
          <Plus className="w-5 h-5" />
          <span>Upload New Record</span>
        </button>
      </div>

      {/* 2. Upload Expansion Panel (Animated/Toggleable) */}
      {showUploadForm && (
        <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-pink-100 relative overflow-hidden animate-scale-in">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-50 to-transparent rounded-bl-full"></div>
          <h3 className="font-display font-bold text-lg text-text-dark mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Upload Healthcare Document
          </h3>

          <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-dark uppercase tracking-wider block mb-1.5">Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. CBC Blood Report, Eye Prescription"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans text-sm text-text-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-dark uppercase tracking-wider block mb-1.5">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MedicalRecordCategory)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans text-sm text-text-dark"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-dark uppercase tracking-wider block mb-1.5">Record Date *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans text-sm text-text-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-dark uppercase tracking-wider block mb-1.5">Hospital / Clinic</label>
                  <input
                    type="text"
                    placeholder="e.g. PHC Village Clinic"
                    value={newHospital}
                    onChange={(e) => setNewHospital(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans text-sm text-text-dark"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-dark uppercase tracking-wider block mb-1.5">Doctor / Counselor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Anjali Mehta"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans text-sm text-text-dark"
                  />
                </div>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-text-dark uppercase tracking-wider block mb-1.5">Attach File *</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[160px] ${
                    dragActive ? "border-indigo-500 bg-indigo-50/20" : "border-gray-200 bg-gray-50/50 hover:bg-gray-50"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,image/*"
                  />
                  <Upload className="w-8 h-8 text-indigo-500 mb-2.5" />
                  <p className="text-xs text-text-dark font-semibold font-sans">Drag & drop your medical record, or click to browse</p>
                  <p className="text-[10px] text-text-muted mt-1">Supports PDF, Images (Max 10MB)</p>
                  
                  {uploadedFile && (
                    <div className="mt-3 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center gap-2 text-xs text-indigo-700 font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[180px]">{uploadedFile.name}</span>
                      <span className="text-[10px] text-indigo-400">({uploadedFile.size})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-full font-display font-bold text-xs text-text-muted hover:bg-gray-50 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle || !uploadedFile}
                  className={`flex-1 py-3 text-white font-display font-bold text-xs rounded-full shadow-md text-center transition-all cursor-pointer ${
                    !newTitle || !uploadedFile 
                      ? "bg-gray-300 cursor-not-allowed shadow-none" 
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  Process with AI Engine
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 3. Search and Quick Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search reports by Doctor, Hospital, test name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.01)] focus:outline-none focus:border-indigo-500 font-sans text-xs text-text-dark placeholder-gray-400"
          />
        </div>

        {/* Categories filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
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
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Document Grid & Preview Panel split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Document Cards List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-lg text-text-dark">All Encrypted Records ({filteredRecords.length})</h3>
          
          {filteredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-5 bg-white border rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 relative overflow-hidden group flex flex-col justify-between min-h-[175px] ${
                    selectedRecord?.id === rec.id ? "border-indigo-400 ring-2 ring-indigo-50" : "border-gray-100/80 hover:border-indigo-100"
                  }`}
                >
                  <div>
                    {/* Top indicator bar */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 bg-pastel-blue text-indigo-700 text-[10px] font-bold rounded-full font-mono uppercase">
                        {rec.category}
                      </span>
                      <span className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        Encrypted
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-text-dark text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-text-muted font-sans mt-1 leading-normal block">
                      {rec.hospital}
                    </p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-gray-50 flex items-center justify-between text-[11px] text-text-muted">
                    <span className="flex items-center gap-1.5 font-sans font-medium">
                      <User className="w-3.5 h-3.5" />
                      {rec.doctor}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {rec.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white py-12 px-6 rounded-[24px] border border-gray-100 text-center text-text-muted">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-sans font-medium">No medical records found matching your selection.</p>
              <p className="text-xs mt-1">Try resetting the search filter or upload a new record above!</p>
            </div>
          )}
        </div>

        {/* Smart Preview Panel */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-text-dark">Security & Quick Preview</h3>
          
          {selectedRecord ? (
            <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100/80 space-y-6 relative overflow-hidden animate-scale-in">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-50/50 to-transparent rounded-bl-full"></div>
              
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded-full font-mono uppercase">
                  {selectedRecord.category}
                </span>
                <h4 className="font-display font-bold text-text-dark text-base">{selectedRecord.title}</h4>
                <p className="text-xs text-text-muted font-sans">{selectedRecord.hospital} | {selectedRecord.doctor}</p>
              </div>

              {/* Secure Credentials card */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Secure Patient Privacy Details</span>
                </div>
                <ul className="text-[11px] text-emerald-800/90 font-sans space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Double Encrypted SHA-256 Storage</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Consented Doctors: <strong>{selectedRecord.consentSharedWith.join(", ")}</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Role-based credentials verified</span>
                  </li>
                </ul>
              </div>

              {/* File Info */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Attached File</span>
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-semibold text-text-dark truncate max-w-[150px]">{selectedRecord.fileName}</span>
                  <span className="text-text-muted font-mono">{selectedRecord.fileSize}</span>
                </div>
              </div>

              {/* Lab extraction preview if blood report */}
              {selectedRecord.labReport && (
                <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      Lab Metrics Found
                    </span>
                    <span className="text-[10px] font-bold text-indigo-500">{selectedRecord.labReport.metrics.length} Biomarkers</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
                    {selectedRecord.labReport.metrics.map(m => (
                      <div key={m.name} className="bg-white/80 p-2 rounded-lg border border-indigo-100/30 flex items-center justify-between">
                        <span className="font-medium text-text-dark">{m.name}</span>
                        <span className={`font-bold ${m.status === "Low" ? "text-rose-500" : m.status === "High" ? "text-amber-500" : "text-emerald-500"}`}>
                          {m.value} {m.status === "Low" ? "L" : m.status === "High" ? "H" : "N"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => alert(`Reviewing document: ${selectedRecord.title} with full credentials in a secure clinical sandboxed environment.`)}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  View Original File
                </button>
                <button
                  onClick={() => alert(`Consented access credentials successfully compiled for Dr. Anjali Mehta and local worker Sunita.`)}
                  className="px-3.5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all cursor-pointer flex items-center justify-center"
                  title="Share Consented Access Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-[24px] border border-dashed border-gray-200 text-center text-text-muted">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-sans font-medium">Select any health record card on the left to see private credentials and preview contents.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
