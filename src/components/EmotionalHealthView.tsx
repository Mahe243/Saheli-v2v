/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Smile, Heart, Sparkles, MessageSquare, History, Check } from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { EmotionLog } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "../utils/translation";

const EMOTIONS: { name: EmotionLog["emotion"]; label: string; emoji: string; color: string; bg: string }[] = [
  { name: "Happy", label: "Happy / Khush", emoji: "😊", color: "text-emerald-600 border-emerald-200", bg: "bg-emerald-50/60" },
  { name: "Calm", label: "Calm / Shanti", emoji: "😌", color: "text-blue-600 border-blue-200", bg: "bg-blue-50/60" },
  { name: "Tired", label: "Tired / Thaka Hua", emoji: "😴", color: "text-amber-600 border-amber-200", bg: "bg-amber-50/60" },
  { name: "Stressed", label: "Stressed / Chintit", emoji: "😣", color: "text-orange-600 border-orange-200", bg: "bg-orange-50/60" },
  { name: "Worried", label: "Worried / Pareshan", emoji: "😟", color: "text-rose-600 border-rose-200", bg: "bg-rose-50/60" },
  { name: "Emotional", label: "Emotional / Bhavuk", emoji: "😢", color: "text-purple-600 border-purple-200", bg: "bg-purple-50/60" },
  { name: "Low", label: "Low / Udaas", emoji: "😔", color: "text-indigo-600 border-indigo-200", bg: "bg-indigo-50/60" },
];

export default function EmotionalHealthView() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<EmotionLog[]>(orchestrator.getEmotionLogs());
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionLog["emotion"] | null>(null);
  const [note, setNote] = useState("");
  const [justSavedLog, setJustSavedLog] = useState<EmotionLog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = orchestrator.subscribe("emotion_logged", () => {
      setLogs([...orchestrator.getEmotionLogs()]);
    });
    return () => unsub();
  }, []);

  const handleSaveCheckIn = () => {
    if (!selectedEmotion) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      orchestrator.addEmotionLog(selectedEmotion, note);
      const updatedLogs = orchestrator.getEmotionLogs();
      const latest = updatedLogs[0];
      
      setJustSavedLog(latest);
      setSelectedEmotion(null);
      setNote("");
      setIsSubmitting(false);

      // Dismiss success screen after 5 seconds
      setTimeout(() => {
        setJustSavedLog(null);
      }, 5000);
    }, 800);
  };

  return (
    <div id="emotional-health-companion" className="space-y-8">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 md:p-8 rounded-[24px] border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-xs text-purple-600">
            <Heart className="w-6 h-6 animate-pulse text-rose-500 fill-rose-500/20" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-text-dark">{t("Daily Emotional Companion")}</h2>
            <p className="text-text-muted text-sm mt-1 max-w-2xl leading-relaxed">
              {t("How are you feeling today, Priya? Sharing your emotions helps Saheli understand your energy and health patterns.")} 
              <span className="font-semibold text-purple-700 block mt-1">{t("Note: This companion is a supportive listener, not a replacement for medical therapy.")}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left/Middle: Logging Area */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100">
            <h3 className="font-display font-bold text-lg text-text-dark mb-4 flex items-center gap-2">
              <Smile className="w-5 h-5 text-pink-500" />
              {t("How is your mind feeling right now?")}
            </h3>

            {/* Emotion Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {EMOTIONS.map((item) => {
                const isSelected = selectedEmotion === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setSelectedEmotion(item.name)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-center ${
                      isSelected 
                        ? `${item.color} ${item.bg} ring-2 ring-purple-400 scale-[1.03] shadow-xs` 
                        : "border-gray-100 hover:bg-gray-50 text-text-muted hover:text-text-dark"
                    }`}
                  >
                    <span className="text-3xl mb-1">{item.emoji}</span>
                    <span className="text-xs font-display font-bold tracking-tight">{t(item.label)}</span>
                  </button>
                );
              })}
            </div>

            {/* Optional Note */}
            <div className="mt-6 space-y-2">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-text-muted block">
                {t("Any notes or reasons? (Optional)")}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("Write down any thoughts, agricultural workload, or simple joy you experienced...")}
                rows={3}
                className="w-full p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm bg-gray-50/30 transition-all font-sans"
              />
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveCheckIn}
                disabled={!selectedEmotion || isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm cursor-pointer transition-all ${
                  selectedEmotion && !isSubmitting
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md active:scale-95 hover:opacity-95"
                    : "bg-gray-100 text-text-muted cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    {t("Saving check-in...")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t("Register Mood")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sweet AI Comfort Animation Banner */}
          <AnimatePresence>
            {justSavedLog && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-emerald-50 border border-emerald-100 p-6 rounded-[22px] shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-500 rounded-xl text-white">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-display font-bold text-emerald-800 text-base">{t("Check-in Registered Successfully")}</h4>
                    <p className="text-emerald-700/90 text-sm font-sans leading-relaxed italic">
                      "{justSavedLog.aiResponse}"
                    </p>
                    <span className="text-[10px] text-emerald-600/80 block mt-1">
                      {t("Our intelligence calibrated this log with your core bio-signals.")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: History Timeline List */}
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100 space-y-4">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              {t("Mood History")}
            </h3>

            <div className="space-y-4.5 max-h-96 overflow-y-auto pr-1 divide-y divide-gray-50">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const emotionDetail = EMOTIONS.find(e => e.name === log.emotion) || EMOTIONS[0];
                  return (
                    <div key={log.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{emotionDetail.emoji}</span>
                          <div>
                            <span className="text-sm font-display font-bold text-text-dark block">{t(log.emotion)}</span>
                            <span className="text-[10px] text-text-muted block">{log.date}</span>
                          </div>
                        </div>
                      </div>
                      {log.note && (
                        <p className="text-xs text-text-dark font-medium font-sans bg-gray-50/50 p-2.5 rounded-lg border border-gray-100/50">
                          {log.note}
                        </p>
                      )}
                      {log.aiResponse && (
                        <div className="bg-purple-50/40 p-3 rounded-lg border border-purple-100/30 text-xs text-text-muted flex gap-2 items-start font-sans">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                          <p className="leading-relaxed italic">
                            <span className="font-bold font-display text-[10px] uppercase text-purple-600 block mb-0.5">{t("Saheli Comfort")}</span>
                            "{log.aiResponse}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-text-muted text-center py-4 font-sans">{t("No daily emotion check-ins recorded yet.")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
