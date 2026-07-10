/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Brain, Heart, Sparkles, Check, ChevronRight, BookOpen } from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { LifeStageType } from "../types";
import { motion } from "motion/react";

const LIFE_STAGES: { name: LifeStageType; range: string; desc: string; icon: string; advice: string }[] = [
  {
    name: "First Period",
    range: "Age 10-14",
    desc: "Beginning of the menstrual cycle, learning hygiene, rhythm, and body changes.",
    icon: "🩸",
    advice: "Dr. Anjali advises focusing on clean cotton pads, tracking cycles early, and talking openly with elders about any fear."
  },
  {
    name: "Teenager",
    range: "Age 13-19",
    desc: "Puberty, physical growth, and hormonal adaptation during school years.",
    icon: "👧",
    advice: "Maintain a healthy local diet with green iron-rich vegetables to build strong blood storage early."
  },
  {
    name: "College",
    range: "Age 18-22",
    desc: "Academics, early independence, stress management, and nutritional consistency.",
    icon: "🎓",
    advice: "Hydrate well and manage sleep routines. Avoid skip-meals patterns despite busy schedules."
  },
  {
    name: "Working Professional",
    range: "Age 21-35",
    desc: "Vocational focus, posture, desk ergonomics or field work safety, and stress release.",
    icon: "💼",
    advice: "Practice active back stretches and core-strengthening moves to prevent chronic occupational fatigue."
  },
  {
    name: "Newly Married",
    range: "Age 20-30",
    desc: "Couples wellness, joint health, and pre-conception discussions.",
    icon: "💍",
    advice: "Consult Dr. Anjali Mehta about safe family spacing options and ensuring both partners stay healthy."
  },
  {
    name: "Trying to Conceive",
    range: "Age 21-38",
    desc: "Pre-pregnancy alignment, optimizing iron storage, vitamins, and tracking ovulation.",
    icon: "🌸",
    advice: "Crucial stage: start taking Folic Acid daily. Keep hemoglobin levels above 12 g/dL to prevent prenatal complications."
  },
  {
    name: "Pregnancy",
    range: "9 Months Cycle",
    desc: "Antenatal care (ANC), fetal development trackers, vaccine schedules, and gentle exercise.",
    icon: "🤰",
    advice: "Track vaccine dates (TT injection). Ensure regular village counselor (ANM) check-ups for blood pressure and weight."
  },
  {
    name: "Motherhood",
    range: "Postpartum & Parenting",
    desc: "Postpartum rehabilitation, nursing support, pediatric vaccine schedules, and back care.",
    icon: "👩‍👦",
    advice: "Priya, take care of your lower back! Lift your toddler with bent knees. Ensure you continue your calcium and iron doses."
  },
  {
    name: "Perimenopause",
    range: "Age 40-48",
    desc: "Transition years, cycle irregularities, mood swings, and general cardiovascular screens.",
    icon: "🍂",
    advice: "Understand that irregular cycles are normal during this shift. Incorporate calcium-rich dairy or local finger millets (ragi)."
  },
  {
    name: "Menopause",
    range: "Age 48-55",
    desc: "Estrogen drop support, bone mineral safety screens, and managing vasomotor flashes.",
    icon: "❄️",
    advice: "Protect your bone health. Screen for bone mineral density and stay physically active to keep your joints supple."
  },
  {
    name: "Healthy Aging",
    range: "Age 55+",
    desc: "Joint health, cardiac screens, blood pressure checks, and active community living.",
    icon: "👵",
    advice: "Do routine screenings for cataract, fasting sugar, and lipid levels. Keep walking daily to maintain robust circulation."
  }
];

export default function LifeStageView() {
  const [activeStage, setActiveStage] = useState<LifeStageType>(orchestrator.getLifeStage());
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetStage, setTargetStage] = useState<LifeStageType | null>(null);

  const handleStageSelect = (stage: LifeStageType) => {
    setTargetStage(stage);
    setShowConfirm(true);
  };

  const handleConfirmChange = () => {
    if (targetStage) {
      orchestrator.updateLifeStage(targetStage);
      setActiveStage(targetStage);
      setShowConfirm(false);
      setTargetStage(null);
    }
  };

  const currentDetails = LIFE_STAGES.find(s => s.name === activeStage) || LIFE_STAGES[7];

  return (
    <div id="life-stage-intelligence" className="space-y-8">
      {/* Current Selection Banner */}
      <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full pointer-events-none"></div>
        <div className="flex items-center gap-4.5">
          <div className="w-16 h-16 rounded-2xl bg-pastel-purple text-3xl flex items-center justify-center shadow-xs border border-purple-200">
            {currentDetails.icon}
          </div>
          <div>
            <span className="text-xs font-display font-bold uppercase tracking-wider text-purple-600">Active Life Stage</span>
            <h2 className="text-2xl font-display font-bold text-text-dark">{activeStage}</h2>
            <p className="text-xs text-text-muted mt-0.5 font-sans font-medium">{currentDetails.range}</p>
          </div>
        </div>

        <div className="bg-purple-50/50 px-5 py-4 rounded-2xl border border-purple-100 max-w-md">
          <span className="text-[10px] font-display font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            Adaptive Guidance
          </span>
          <p className="text-xs text-text-dark font-sans leading-relaxed font-medium">
            "{currentDetails.desc}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Grid: All Stages Selector */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100">
            <h3 className="font-display font-bold text-lg text-text-dark mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              Adjust Your Lifelong Journey State
            </h3>
            <p className="text-xs text-text-muted mb-6 leading-relaxed">
              Select your current stage of life. The Saheli Operating System dynamically adjusts the Preventive guidelines, 
              Care Journey suggestions, and AI advice to matches your exact bio-context.
            </p>

            <div className="space-y-3">
              {LIFE_STAGES.map((stage) => {
                const isActive = activeStage === stage.name;
                return (
                  <button
                    key={stage.name}
                    onClick={() => handleStageSelect(stage.name)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer text-left ${
                      isActive
                        ? "bg-pastel-purple/50 border-purple-300 shadow-xs"
                        : "border-gray-50 hover:border-gray-200 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl">{stage.icon}</span>
                      <div>
                        <h4 className="font-display font-bold text-sm text-text-dark">{stage.name}</h4>
                        <span className="text-[10px] text-text-muted font-mono block mt-0.5">{stage.range}</span>
                      </div>
                    </div>
                    {isActive ? (
                      <div className="bg-purple-600 text-white p-1 rounded-full">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Grid: Advisors advice */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-100 space-y-4">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-500" />
              Advisor's Guidelines
            </h3>

            <div className="p-4 rounded-2xl bg-gradient-to-tr from-pink-500/5 to-purple-500/5 border border-pink-100/50 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 font-display font-bold text-xs flex items-center justify-center border border-pink-200 shadow-xs">
                  AM
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-text-dark">Dr. Anjali Mehta</h4>
                  <p className="text-[9px] text-text-muted font-mono leading-none">Senior Obstetrician & Gynecologist</p>
                </div>
              </div>

              <p className="text-xs text-text-muted font-sans leading-relaxed italic">
                "{currentDetails.advice}"
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-text-muted block">
                Recommended Actions for Priya
              </span>
              <ul className="space-y-2">
                <li className="flex items-start gap-2.5 text-xs font-sans text-text-muted font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                  Check that all matching vaccines are up to date.
                </li>
                <li className="flex items-start gap-2.5 text-xs font-sans text-text-muted font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                  Keep the village healthcare worker (ANM) informed of your stage.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      {showConfirm && targetStage && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-display font-bold text-lg text-text-dark">Confirm Life Stage Change?</h3>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Are you sure you want to transition your active life stage to <span className="font-bold text-purple-600">"{targetStage}"</span>? 
              This will re-calculate your dashboard alerts, clinical recommendations, and care timelines dynamically.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => { setShowConfirm(false); setTargetStage(null); }}
                className="px-4 py-2 text-xs font-display font-bold hover:bg-gray-50 rounded-xl transition-colors cursor-pointer text-text-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChange}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-display font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                Yes, Align My Care
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
