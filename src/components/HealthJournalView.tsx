/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Mic, Image as ImageIcon, Check, History, Lock, MessageSquare } from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { JournalEntry } from "../types";
import { motion, AnimatePresence } from "motion/react";

export default function HealthJournalView() {
  const [entries, setEntries] = useState<JournalEntry[]>(orchestrator.getJournalEntries());
  const [text, setText] = useState("");
  const [hasVoice, setHasVoice] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const unsub = orchestrator.subscribe("journal_entry_added", () => {
      setEntries([...orchestrator.getJournalEntries()]);
    });
    return () => unsub();
  }, []);

  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasVoice(true);
    } else {
      setIsRecording(true);
      // Simulate automatic recording completion in 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        setHasVoice(true);
      }, 3000);
    }
  };

  const handleTogglePhoto = () => {
    setIsPhotoUploading(true);
    setTimeout(() => {
      setIsPhotoUploading(false);
      setHasPhoto(true);
    }, 1500);
  };

  const handleSaveEntry = () => {
    if (!text && !hasVoice && !hasPhoto) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      let finalNotesText = text;
      if (!finalNotesText) {
        if (hasVoice) finalNotesText = "[Voice Memo Logged] Spoke about farm work fatigue.";
        if (hasPhoto) finalNotesText = "[Photo Uploaded] Logged dietary iron rich local dish.";
      }
      
      orchestrator.addJournalEntry(finalNotesText, hasVoice, hasPhoto);
      
      setText("");
      setHasVoice(false);
      setHasPhoto(false);
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }, 800);
  };

  return (
    <div id="personal-health-journal" className="space-y-8">
      {/* Encryption security banner */}
      <div className="bg-emerald-500/10 p-6 md:p-8 rounded-[24px] border border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-xs text-emerald-600">
            <Lock className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-text-dark">Personal Health Journal</h2>
            <p className="text-text-muted text-sm mt-1 max-w-2xl leading-relaxed">
              Priya, this journal is your private sanctuary. Every entry is encrypted and can only be decrypted 
              by you. Speak or write about your energy, local meals, or household tasks.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Writing Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100 space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2 pb-3 border-b border-gray-50">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Write Your Daily Log
            </h3>

            <div className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write freely... e.g., feeling proud of walk, local meals, sleeping deeply, or back discomfort..."
                rows={5}
                className="w-full p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm bg-gray-50/30 transition-all font-sans"
              />

              {/* Multimedia buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  {/* Voice Button */}
                  <button
                    onClick={handleToggleVoice}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-display font-bold cursor-pointer transition-all ${
                      isRecording 
                        ? "bg-rose-500 text-white border-rose-500 animate-pulse" 
                        : hasVoice 
                        ? "bg-rose-50 text-rose-600 border-rose-200" 
                        : "bg-white border-gray-100 hover:bg-gray-50 text-text-muted"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {isRecording ? "Recording..." : hasVoice ? "✓ Voice Logged" : "Record Voice Note"}
                  </button>

                  {/* Photo Button */}
                  <button
                    onClick={handleTogglePhoto}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-display font-bold cursor-pointer transition-all ${
                      isPhotoUploading 
                        ? "bg-indigo-100 text-indigo-600 border-indigo-200" 
                        : hasPhoto 
                        ? "bg-pink-50 text-pink-600 border-pink-200" 
                        : "bg-white border-gray-100 hover:bg-gray-50 text-text-muted"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    {isPhotoUploading ? "Uploading..." : hasPhoto ? "✓ Photo Added" : "Attach Photo"}
                  </button>
                </div>

                <button
                  onClick={handleSaveEntry}
                  disabled={isSubmitting || (!text && !hasVoice && !hasPhoto)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display font-bold text-xs transition-all cursor-pointer ${
                    text || hasVoice || hasPhoto
                      ? "bg-indigo-600 text-white shadow-xs hover:opacity-95"
                      : "bg-gray-100 text-text-muted cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      Encrypting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Save Private Entry
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="p-6 bg-emerald-50 border border-emerald-100 rounded-[22px] flex items-start gap-4 shadow-xs"
              >
                <div className="p-2 bg-emerald-500 rounded-xl text-white">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-emerald-800 text-base">Entry Encrypted & Stored</h4>
                  <p className="text-emerald-700/90 text-xs font-sans mt-0.5 leading-relaxed">
                    Your journal was saved to your secure dossier. The central health intelligence has processed 
                    the contents and updated any associated health goals dynamically.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel: previous entries */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100 space-y-4">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              Journal Archives
            </h3>

            <div className="space-y-4 max-h-120 overflow-y-auto pr-1">
              {entries.length > 0 ? (
                entries.map((ent) => (
                  <div key={ent.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 space-y-2 hover:bg-gray-50 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-text-muted">
                        {ent.date}
                      </span>
                      <div className="flex gap-2">
                        {ent.hasVoiceNote && (
                          <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100 font-bold font-display">
                            Voice Note
                          </span>
                        )}
                        {ent.hasPhoto && (
                          <span className="text-[9px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100 font-bold font-display">
                            Photo Attachment
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-text-dark font-sans leading-relaxed">
                      {ent.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted text-center py-4 font-sans">Your private journal is currently empty.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
