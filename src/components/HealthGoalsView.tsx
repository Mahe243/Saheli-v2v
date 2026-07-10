/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Award, Sparkles, Plus, Check, Flame, Trophy, Trash } from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { HealthGoal, Achievement } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "../utils/translation";

export default function HealthGoalsView() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState<HealthGoal[]>(orchestrator.getGoals());
  const [achievements, setAchievements] = useState<Achievement[]>(orchestrator.getAchievements());

  // Goal adding states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HealthGoal["category"]>("Exercise");
  const [targetValue, setTargetValue] = useState<number>(30);
  const [unit, setUnit] = useState("minutes");
  
  const [isAdding, setIsAdding] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedGoal, setCelebratedGoal] = useState<string>("");

  useEffect(() => {
    const unsub = orchestrator.subscribeAll(() => {
      setGoals([...orchestrator.getGoals()]);
      setAchievements([...orchestrator.getAchievements()]);
    });
    return () => unsub();
  }, []);

  const handleCreateGoal = () => {
    if (!title) return;
    orchestrator.addGoal(title, category, targetValue, unit);
    setTitle("");
    setIsAdding(false);
  };

  const handleProgressBump = (goal: HealthGoal) => {
    const newValue = Math.min(goal.targetValue, goal.currentValue + Math.max(1, Math.round(goal.targetValue / 5)));
    orchestrator.updateGoalProgress(goal.id, newValue);
    
    if (newValue >= goal.targetValue && !goal.completed) {
      setCelebratedGoal(goal.title);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
    }
  };

  return (
    <div id="health-goals-and-wins" className="space-y-8">
      {/* Celebration Overlay Popup */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0, type: "spring" }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white p-8 rounded-[32px] max-w-sm w-full text-center shadow-2xl border border-pink-100 space-y-5 relative overflow-hidden"
            >
              {/* Confetti particles simulating celebration */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-4 left-6 w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="absolute top-10 right-8 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-12 left-10 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce"></div>
              </div>

              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 text-white flex items-center justify-center text-4xl mx-auto shadow-md">
                🏆
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-pink-600">{t("Milestone Achieved!")}</span>
                <h3 className="font-display font-bold text-xl text-text-dark">{t("Shabash, Priya!")}</h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans">
                  {t("You successfully completed your goal:")}<br />
                  <span className="font-bold text-indigo-600">"{t(celebratedGoal)}"</span>
                </p>
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-xl text-xs font-display font-bold shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-95"
              >
                {t("Dhanyavaad (Dismiss)")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner */}
      <div className="bg-gradient-to-r from-pink-500/10 to-indigo-500/10 p-6 md:p-8 rounded-[24px] border border-pink-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-xs text-pink-600">
            <Trophy className="w-6 h-6 text-pink-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-text-dark">{t("Health Goals & Wins")}</h2>
            <p className="text-text-muted text-sm mt-1 max-w-2xl leading-relaxed">
              {t("Track daily and weekly habits. Completing goals boosts your immune response, balances sleep, and triggers automated reward logs in your Saheli ledger.")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Active Goals Progress List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50 mb-6">
              <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                {t("Active Goals")}
              </h3>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-display font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
                {t("New Goal")}
              </button>
            </div>

            {/* Add Goal Collapse Form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gray-50/50 p-5 rounded-2xl border border-gray-100/60 mb-6 space-y-4"
                >
                  <h4 className="font-display font-bold text-sm text-text-dark">{t("Create Custom Health Goal")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-text-muted">{t("Goal Title")}</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t("e.g., Take Afternoon Nap, Walk in sun...")}
                        className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-text-muted">{t("Category")}</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as HealthGoal["category"])}
                        className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Exercise">{t("Exercise / Vyayam")}</option>
                        <option value="Water">{t("Water / Hydration")}</option>
                        <option value="Medicine">{t("Medicine / Supplement")}</option>
                        <option value="Stress">{t("Stress Release / Dhyana")}</option>
                        <option value="Nutrition">{t("Nutrition / Diet")}</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-text-muted">{t("Target Value")}</label>
                      <input
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(parseInt(e.target.value) || 10)}
                        className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-display font-bold uppercase tracking-wider text-text-muted">{t("Unit")}</label>
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder={t("minutes, glasses, days...")}
                        className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      onClick={() => setIsAdding(false)}
                      className="px-3.5 py-1.5 text-xs font-display font-bold hover:bg-gray-100 rounded-lg text-text-muted cursor-pointer"
                    >
                      {t("Cancel")}
                    </button>
                    <button
                      onClick={handleCreateGoal}
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-display font-bold shadow-xs hover:opacity-95 cursor-pointer"
                    >
                      {t("Create Goal")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Goals List */}
            <div className="space-y-4">
              {goals.map((goal) => {
                const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="p-5 rounded-2xl border border-gray-100 hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-display font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full border border-indigo-100">
                          {t(goal.category)}
                        </span>
                        {goal.completed && (
                          <span className="text-[9px] font-display font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> {t("Completed")}
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-sm text-text-dark">{t(goal.title)}</h4>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/80">
                          <div
                            style={{ width: `${percentage}%` }}
                            className={`h-full transition-all duration-500 rounded-full ${
                              goal.completed 
                                ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                                : "bg-gradient-to-r from-pink-400 to-indigo-500"
                            }`}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-text-muted font-bold font-mono">
                          <span>{goal.currentValue} / {goal.targetValue} {t(goal.unit)}</span>
                          <span>{percentage}%</span>
                        </div>
                      </div>
                    </div>

                    {!goal.completed && (
                      <button
                        onClick={() => handleProgressBump(goal)}
                        className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl text-xs font-display font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 flex-shrink-0"
                      >
                        <Flame className="w-3.5 h-3.5 text-pink-500" />
                        {t("Log Progress")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Achievements ledger / Wins */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100 space-y-4">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <Award className="w-5 h-5 text-pink-500" />
              {t("Celebrate Wins")}
            </h3>
            <p className="text-[10px] text-text-muted leading-relaxed">
              {t("Every healthy choice Priya makes is logged here. Take pride in your wellness milestones!")}
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {achievements.length > 0 ? (
                achievements.map((ach) => (
                  <div key={ach.id} className="p-3.5 bg-pink-50/20 border border-pink-100/30 rounded-xl flex items-start gap-3 hover:bg-pink-50/40 transition-all">
                    <span className="text-xl mt-0.5">{ach.icon}</span>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold text-pink-600 block">{ach.date}</span>
                      <h4 className="font-display font-bold text-xs text-text-dark leading-tight">{t(ach.title)}</h4>
                      <p className="text-[10px] text-text-muted font-sans leading-normal">{t(ach.description)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted text-center py-4 font-sans">{t("No wins celebrated yet. Stay active!")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
