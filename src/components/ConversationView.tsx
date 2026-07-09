/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Mic, 
  MicOff, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Activity, 
  ChevronRight, 
  BrainCircuit, 
  Printer, 
  Heart,
  Loader2
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { InterviewQuestion, InterviewSummary } from "../types";

export default function ConversationView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interview flow state
  const [history, setHistory] = useState<{ question: string; answer: string; field: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isDictating, setIsDictating] = useState(false);
  
  // Results
  const [isFinished, setIsFinished] = useState(false);
  const [clinicalBrief, setClinicalBrief] = useState<InterviewSummary | null>(null);
  const [savedToBrain, setSavedToBrain] = useState(false);

  // Focus ref for text input accessibility
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load the first question when view opens
    fetchNextQuestion([]);
  }, []);

  const fetchNextQuestion = async (currentHistory: typeof history) => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = orchestrator.getHealthBrain().profile;
      const res = await fetch("/api/gemini/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: currentHistory,
          userProfile,
          isComplete: false
        })
      });

      if (!res.ok) throw new Error("Could not fetch interview node.");
      const data = await res.json();

      if (data.isFinished) {
        // Conversation has run through all required fields
        generateFinalSummary(currentHistory);
      } else {
        setCurrentQuestion(data);
        setTextInput("");
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (err: any) {
      setError("We encountered a small communication delay. Resetting to secure offline local assistant.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateFinalSummary = async (currentHistory: typeof history) => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = orchestrator.getHealthBrain().profile;
      const res = await fetch("/api/gemini/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: currentHistory,
          userProfile,
          isComplete: true
        })
      });

      if (!res.ok) throw new Error("Failed generating brief.");
      const data = await res.json();
      setClinicalBrief(data.summary);
      setIsFinished(true);
    } catch (err) {
      setError("Could not structure clinical brief. Please try resetting the interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (answerText: string) => {
    if (!answerText.trim() || !currentQuestion) return;

    const newHistoryEntry = {
      question: currentQuestion.text,
      answer: answerText.trim(),
      field: currentQuestion.field
    };

    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);
    fetchNextQuestion(updatedHistory);
  };

  // Simulates voice dictation for accessibility ("Voice input placeholders")
  const triggerVoiceDictationSimulation = () => {
    if (isDictating) {
      setIsDictating(false);
      return;
    }
    
    setIsDictating(true);
    
    // Simulate speech-to-text dictation
    const simulatedAnswers: Record<string, string> = {
      chiefComplaint: "Yes, I have an uncomfortable heavy back pain and sometimes a little bit of fatigue after field farming.",
      timeline: "This backache has been going on for about a week, mostly in the early mornings and late afternoons.",
      severity: "I would call it moderate. It is around 5 out of 10. I can still walk but it hurts to bend over.",
      betterFactor: "Applying some local warm heat compress and lying flat on the floor really relaxes it.",
      worseFactor: "Lifting water pots or bending down to plant crops definitely makes it tighten up.",
      historyOfSymptom: "I felt a very similar ache near the end of my pregnancy two years ago.",
      currentMedsForSymptom: "No medication yet, only my daily iron tablets.",
      additionalInfo: "I am taking care of my active two-year-old child and want to prepare for another healthy pregnancy soon."
    };

    setTimeout(() => {
      if (currentQuestion) {
        setTextInput(simulatedAnswers[currentQuestion.field] || "I feel mild discomfort during the day.");
      }
      setIsDictating(false);
    }, 2500);
  };

  const handleCommitToHealthBrain = () => {
    if (!clinicalBrief) return;

    // Trigger Orchestrator core symptom log
    orchestrator.addSymptom({
      name: clinicalBrief.chiefComplaint,
      severity: clinicalBrief.severity,
      notes: `Identified symptoms: ${clinicalBrief.symptoms.join(", ")}. Timeline: ${clinicalBrief.timeline}`
    });

    // Fire the specialized 'conversation_completed' event with full brief
    orchestrator.publish("conversation_completed", clinicalBrief);

    setSavedToBrain(true);
  };

  const handleResetInterview = () => {
    setHistory([]);
    setCurrentQuestion(null);
    setIsFinished(false);
    setClinicalBrief(null);
    setSavedToBrain(false);
    setError(null);
    fetchNextQuestion([]);
  };

  return (
    <div id="conversation-view" className="max-w-4xl mx-auto space-y-8 p-1 animate-fade-in">
      
      {/* Module Title */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-display font-bold text-text-dark flex items-center gap-2.5 tracking-tight">
          <BrainCircuit className="w-8 h-8 text-indigo-500" />
          AI Smart Clinical Interview
        </h1>
        <p className="text-text-muted mt-1.5 text-sm md:text-base font-sans">
          This adaptive clinical guide assesses your symptoms and creates a secure medical briefing to share with local physicians.
        </p>
      </div>

      {/* Progress Tracker (Accessibility Requirement: Step-by-Step form) */}
      {!isFinished && (
        <div className="bg-white px-6 py-4.5 rounded-[22px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-display font-bold text-text-muted uppercase tracking-wider">Assessment Progress</span>
          </div>
          <div className="flex items-center gap-2">
            {["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"].map((qNode, i) => (
              <div 
                key={qNode} 
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  i < history.length ? "bg-emerald-400 scale-102" : 
                  i === history.length ? "bg-indigo-100 border-2 border-indigo-500 scale-110" : "bg-gray-150"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">{history.length} of 8 answered</span>
        </div>
      )}

      {/* Primary Interview Box */}
      {!isFinished ? (
        <div className="bg-white rounded-[24px] shadow-[0_15px_45px_rgba(0,0,0,0.02)] border border-gray-100/80 p-6 md:p-8 space-y-6 relative min-h-[380px] flex flex-col justify-between overflow-hidden group">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#A7D8F2]/20 to-transparent rounded-bl-full pointer-events-none" />

          {loading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-md flex flex-col items-center justify-center rounded-[24px] z-20 space-y-4">
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin stroke-[2.5]" />
              </div>
              <p className="text-sm font-display font-bold text-indigo-950">Saheli is thinking...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-[16px] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="text-sm text-amber-800 font-sans">
                <p className="font-bold">Communication Delay</p>
                <p className="mt-0.5 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Core Interactive Question */}
          {currentQuestion && (
            <div className="space-y-6 flex-1">
              <div className="space-y-3.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-50 text-indigo-700 font-display font-bold text-xs rounded-full border border-indigo-100/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  Intelligent Assistant
                </span>
                <h2 className="text-xl md:text-2xl font-display font-bold text-text-dark leading-snug tracking-tight">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Touch Suggestions Area (Accessibility: Large Touch Targets, minimal typing needed) */}
              {currentQuestion.suggestions && currentQuestion.suggestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-display font-bold text-text-muted uppercase tracking-wider block">Tap an option to answer quickly:</span>
                  <div className="flex flex-wrap gap-2.5">
                    {currentQuestion.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSubmit(suggestion)}
                        className="px-5 py-3.5 bg-gray-50/60 hover:bg-[#A7D8F2]/20 hover:border-[#A7D8F2] text-sm font-semibold text-text-dark border border-gray-200/80 rounded-full transition-all cursor-pointer active:scale-95 shadow-2xs hover:shadow-xs"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Action Field */}
          <div className="pt-5 border-t border-gray-150 flex flex-col sm:flex-row gap-3.5 items-stretch">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder={currentQuestion?.placeholder || "Type your health concern here..."}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnswerSubmit(textInput)}
                className="w-full pl-5 pr-14 py-4 bg-gray-50/60 border border-gray-200 rounded-full text-sm text-text-dark outline-none focus:border-indigo-400 focus:bg-white focus:shadow-xs transition-all font-sans"
              />
              
              {/* Accessibility Voice Input button */}
              <button
                onClick={triggerVoiceDictationSimulation}
                title="Tap to speak in local language"
                className={`absolute right-3.5 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all cursor-pointer ${
                  isDictating ? "bg-rose-500 text-white shadow-lg animate-pulse scale-105" : "text-gray-400 hover:text-indigo-600 hover:bg-gray-100"
                }`}
              >
                {isDictating ? <Mic className="w-4.5 h-4.5 stroke-[2.5]" /> : <MicOff className="w-4.5 h-4.5" />}
              </button>
            </div>

            <button
              onClick={() => handleAnswerSubmit(textInput)}
              disabled={!textInput.trim()}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-[#D8C4F1] text-white hover:shadow-md disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:border-transparent font-display font-bold rounded-full text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Next Step
              <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Accessibility Voice dictation floating alert */}
          {isDictating && (
            <div className="mt-3 p-4 bg-rose-50/50 border border-rose-100 rounded-[16px] text-xs text-rose-800 animate-pulse flex items-center gap-2.5 font-medium">
              <Activity className="w-4.5 h-4.5 text-rose-500 animate-bounce" />
              Saheli Voice dictation is listening in Hindi/Marathi/local dialect... Speak clearly now.
            </div>
          )}

        </div>
      ) : (
        /* 100% Completed Visual State: The Clinical Dossier Summary */
        <div className="space-y-8 animate-scale-in">
          <div className="bg-white rounded-[24px] shadow-[0_15px_45px_rgba(0,0,0,0.02)] border border-gray-100/80 p-6 md:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-5 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                  <CheckCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-text-dark tracking-tight">Clinical Brief Generated</h2>
                  <p className="text-xs text-text-muted mt-0.5 font-sans">Intake summary is fully structured and secure</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-full font-bold text-xs text-text-dark hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4 text-gray-500" /> Print Summary
                </button>
              </div>
            </div>

            {clinicalBrief && (
              <div className="space-y-6">
                
                {/* 1. Chief Complaint Block */}
                <div className="p-5 bg-gradient-to-r from-blue-50/20 to-[#A7D8F2]/15 border border-[#A7D8F2]/30 rounded-[20px] space-y-1.5">
                  <span className="text-xs font-display font-bold text-indigo-900 uppercase tracking-wide">Chief Complaint</span>
                  <h3 className="text-lg font-display font-bold text-text-dark italic">"{clinicalBrief.chiefComplaint}"</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Symptoms & Severity */}
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-display font-bold text-text-muted uppercase tracking-wider block">Identified Symptoms</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {clinicalBrief.symptoms.map((symptom, i) => (
                          <span key={i} className="px-3 py-1.5 text-xs font-bold bg-gray-50 border border-gray-150 text-text-dark rounded-lg">{symptom}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-display font-bold text-text-muted uppercase tracking-wider block">Determined Severity</span>
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full mt-2 border ${
                        clinicalBrief.severity === "Severe" ? "bg-rose-50 border-rose-100 text-rose-800" :
                        clinicalBrief.severity === "Moderate" ? "bg-amber-50 border-amber-100 text-amber-800" : "bg-emerald-50 border-emerald-100 text-emerald-800"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {clinicalBrief.severity} Severity Level
                      </span>
                    </div>
                  </div>

                  {/* Chronology & Timeline */}
                  <div>
                    <span className="text-xs font-display font-bold text-text-muted uppercase tracking-wider block">Clinical Timeline</span>
                    <p className="text-sm text-text-dark leading-relaxed font-sans mt-2 opacity-95">
                      {clinicalBrief.timeline}
                    </p>
                  </div>

                </div>

                {/* 3. Recommended Doctor Questions */}
                <div className="p-6 bg-gradient-to-r from-[#D8C4F1]/10 to-[#F8C8DC]/5 border border-[#D8C4F1]/30 rounded-[20px] space-y-3.5">
                  <span className="text-xs font-display font-bold text-indigo-900 uppercase tracking-wider block">Recommended Questions For Your Doctor:</span>
                  <ul className="space-y-2.5">
                    {clinicalBrief.questionsForDoctor.map((question, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-dark leading-relaxed">
                        <span className="font-bold text-indigo-600 font-mono">{i + 1}.</span>
                        <span className="font-sans font-medium text-text-dark/95">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {/* Commit actions */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
              <button 
                onClick={handleResetInterview}
                className="px-6 py-3.5 border border-gray-200 rounded-full text-xs font-bold text-text-dark hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Start New Assessment
              </button>

              <button
                disabled={savedToBrain}
                onClick={handleCommitToHealthBrain}
                className={`px-7 py-3.5 font-display font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  savedToBrain ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-[#D8C4F1] text-text-dark hover:bg-opacity-90 border border-purple-200/50"
                }`}
              >
                {savedToBrain ? (
                  <>
                    <CheckCircle className="w-4.5 h-4.5 stroke-[2.5]" /> Saved in Personal Health Brain
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4.5 h-4.5" /> Commit to Lifelong Health Brain
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Calming Educational Message after Saving */}
          {savedToBrain && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[24px] p-6 flex items-start gap-4 animate-fade-in shadow-2xs">
              <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-500">
                <Heart className="w-6 h-6 fill-emerald-500/10" />
              </div>
              <div className="text-sm text-emerald-800 space-y-1.5 font-sans">
                <h4 className="font-display font-bold text-base">Your medical details are secure and remembered.</h4>
                <p className="leading-relaxed text-emerald-800/90">
                  The AI Care Orchestrator has logged your symptoms to your permanent **Care Journey Timeline** and updated your home dashboard snapshot. When you visit Dr. Mehta or your local health sub-center, they will see your complete health history.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
