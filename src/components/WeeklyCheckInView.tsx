/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Activity, Sparkles, Check, History, Heart, ChevronRight } from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { WeeklyCheckIn } from "../types";
import { motion, AnimatePresence } from "motion/react";

const SCALES = [
  { value: 1, label: "Very Low / Bahut Kam", emoji: "😢" },
  { value: 2, label: "Low / Kam", emoji: "😟" },
  { value: 3, label: "Medium / Normal", emoji: "😐" },
  { value: 4, label: "Good / Accha", emoji: "😊" },
  { value: 5, label: "Excellent / Bahut Accha", emoji: "🤩" },
];

export default function WeeklyCheckInView() {
  const [history, setHistory] = useState<WeeklyCheckIn[]>(orchestrator.getWeeklyCheckIns());
  const [pain, setPain] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);
  const [mood, setMood] = useState<number>(3);
  const [sleep, setSleep] = useState<number>(3);
  const [exercise, setExercise] = useState<number>(3);
  const [waterIntake, setWaterIntake] = useState<number>(3);
  
  const [cycle, setCycle] = useState<string>("Regular");
  const [medicationExperience, setMedicationExperience] = useState<string>("Good");

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = orchestrator.subscribe("weekly_checkin_completed", () => {
      setHistory([...orchestrator.getWeeklyCheckIns()]);
    });
    return () => unsub();
  }, []);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      orchestrator.addWeeklyCheckIn({
        pain,
        energy,
        mood,
        sleep,
        exercise,
        waterIntake,
        cycle,
        medicationExperience,
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }, 1000);
  };

  return (
    <div id="continuous-symptom-monitoring" className="space-y-8">
      {/* Informational Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-6 md:p-8 rounded-[24px] border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-xs text-blue-600">
            <Activity className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-text-dark">Continuous Symptom Monitoring</h2>
            <p className="text-text-muted text-sm mt-1 max-w-2xl leading-relaxed">
              Priya, take a few minutes each week to log your physical vitals and cycle patterns. Regular check-ins build a 
              highly predictive trend history that Dr. Anjali Mehta can inspect during appointments.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Sliders & Selectors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100 space-y-8">
            <h3 className="font-display font-bold text-lg text-text-dark pb-3 border-b border-gray-50 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              New Weekly Log
            </h3>

            {/* Slider Questions */}
            <div className="space-y-6">
              {/* Question 1 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-display font-bold text-text-dark flex items-center gap-2">
                    <span className="text-xl">🩹</span>
                    Pain & Back Discomfort Level (Dard Ka Star)
                  </label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-text-dark">
                    {SCALES.find(s => s.value === pain)?.emoji} {SCALES.find(s => s.value === pain)?.label}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={pain}
                  onChange={(e) => setPain(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-bold font-mono">
                  <span>No Pain</span>
                  <span>Moderate</span>
                  <span>Severe Pain</span>
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-display font-bold text-text-dark flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    Energy & Fatigue Levels (Takad Aur Thakan)
                  </label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-text-dark">
                    {SCALES.find(s => s.value === energy)?.emoji} {SCALES.find(s => s.value === energy)?.label}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-bold font-mono">
                  <span>Very Weak</span>
                  <span>Normal</span>
                  <span>Super Active</span>
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-display font-bold text-text-dark flex items-center gap-2">
                    <span className="text-xl">😴</span>
                    Sleep Quality (Neeand Ki Gunvatta)
                  </label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-text-dark">
                    {SCALES.find(s => s.value === sleep)?.emoji} {SCALES.find(s => s.value === sleep)?.label}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={sleep}
                  onChange={(e) => setSleep(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-bold font-mono">
                  <span>Restless</span>
                  <span>Average</span>
                  <span>Deep Sleep</span>
                </div>
              </div>

              {/* Question 4 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-display font-bold text-text-dark flex items-center gap-2">
                    <span className="text-xl">💧</span>
                    Daily Hydration / Water Intake (Paani)
                  </label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-text-dark">
                    {SCALES.find(s => s.value === waterIntake)?.emoji} {SCALES.find(s => s.value === waterIntake)?.label}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-bold font-mono">
                  <span>1-2 Glasses</span>
                  <span>4-5 Glasses</span>
                  <span>8+ Glasses</span>
                </div>
              </div>

              {/* Cycle and Medication Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div className="space-y-2">
                  <label className="text-xs font-display font-bold uppercase tracking-wider text-text-muted block">
                    Menstrual Cycle Status (Maahwari)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Regular", "Delayed", "Heavy", "Light", "N/A"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCycle(opt)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-display font-bold transition-all cursor-pointer ${
                          cycle === opt
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white border-gray-100 hover:bg-gray-50 text-text-muted"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-display font-bold uppercase tracking-wider text-text-muted block">
                    Medication Experience (Dawa Ka Asar)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Good", "Side effects", "N/A"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setMedicationExperience(opt)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-display font-bold transition-all cursor-pointer ${
                          medicationExperience === opt
                            ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                            : "bg-white border-gray-100 hover:bg-gray-50 text-text-muted"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-xl font-display font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    Saving Log...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    Complete Weekly Log
                  </>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isSuccess && (
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
                  <h4 className="font-display font-bold text-emerald-800 text-base">Weekly Log Synchronized!</h4>
                  <p className="text-emerald-700/90 text-xs font-sans mt-0.5 leading-relaxed">
                    Our central health orchestrator processed your vitals successfully. If physical pains increase, 
                    Dr. Anjali Mehta will receive an automated trigger prior to your next appointment.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Trends & Previous logs */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100 space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              Check-in History
            </h3>

            <div className="space-y-4 max-h-120 overflow-y-auto pr-1">
              {history.length > 0 ? (
                history.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 space-y-3 hover:bg-gray-50 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-text-muted bg-white px-2 py-0.5 rounded-full border border-gray-200/50 shadow-2xs">
                        {item.date}
                      </span>
                      <span className="text-xs font-display font-semibold text-indigo-600 flex items-center gap-1">
                        Cycle: <span className="font-bold">{item.cycle}</span>
                      </span>
                    </div>

                    {/* Metric Grids */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2 rounded-lg border border-gray-100 flex justify-between items-center">
                        <span className="text-text-muted font-sans">Pain score:</span>
                        <span className="font-bold text-text-dark font-mono">{item.pain}/5</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100 flex justify-between items-center">
                        <span className="text-text-muted font-sans">Energy:</span>
                        <span className="font-bold text-text-dark font-mono">{item.energy}/5</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100 flex justify-between items-center">
                        <span className="text-text-muted font-sans">Sleep quality:</span>
                        <span className="font-bold text-text-dark font-mono">{item.sleep}/5</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100 flex justify-between items-center">
                        <span className="text-text-muted font-sans">Water:</span>
                        <span className="font-bold text-text-dark font-mono">{item.waterIntake}/5</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200/40 text-[10px] text-text-muted font-sans flex items-center justify-between">
                      <span>Meds Experience: <span className="font-bold text-pink-600">{item.medicationExperience}</span></span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted text-center py-4 font-sans">No weekly check-ins recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
