import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, 
  Droplet, 
  Sparkles, 
  Trash2, 
  Plus, 
  Smile, 
  Frown, 
  Activity, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Heart,
  BookOpen
} from "lucide-react";
import { useTranslation } from "../utils/translation";

interface PeriodEntry {
  id: string;
  startDate: string;
  endDate: string;
  cycleLength: number;
  periodLength: number;
}

interface SymptomLog {
  date: string;
  flow: "None" | "Spotting" | "Light" | "Medium" | "Heavy";
  cramps: "None" | "Mild" | "Moderate" | "Severe";
  headache: "None" | "Mild" | "Moderate" | "Severe";
  fatigue: "None" | "Mild" | "Moderate" | "Severe";
  mood: "Happy" | "Calm" | "Irritable" | "Anxious" | "Sad" | "Fatigued";
  bloating: boolean;
  backache: boolean;
}

export default function WomensHealthView() {
  const { t } = useTranslation();

  // Load state from localStorage
  const [periodHistory, setPeriodHistory] = useState<PeriodEntry[]>(() => {
    const saved = localStorage.getItem("saheli_period_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.log(e); }
    }
    // Default dummy data if empty to make it look active
    return [
      {
        id: "1",
        startDate: "2026-06-15",
        endDate: "2026-06-20",
        cycleLength: 28,
        periodLength: 5,
      },
      {
        id: "2",
        startDate: "2026-05-18",
        endDate: "2026-05-23",
        cycleLength: 28,
        periodLength: 5,
      }
    ];
  });

  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(() => {
    const saved = localStorage.getItem("saheli_symptom_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.log(e); }
    }
    return [
      {
        date: "2026-07-10",
        flow: "None",
        cramps: "Mild",
        headache: "None",
        fatigue: "Moderate",
        mood: "Calm",
        bloating: true,
        backache: false,
      }
    ];
  });

  // Basic User Constants (can be edited)
  const [averageCycleLength, setAverageCycleLength] = useState<number>(() => {
    const saved = localStorage.getItem("saheli_avg_cycle_length");
    return saved ? parseInt(saved, 10) : 28;
  });
  const [averagePeriodLength, setAveragePeriodLength] = useState<number>(() => {
    const saved = localStorage.getItem("saheli_avg_period_length");
    return saved ? parseInt(saved, 10) : 5;
  });

  // State for form logs
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);

  // State for current symptom form
  const [selectedSymptomDate, setSelectedSymptomDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [currentFlow, setCurrentFlow] = useState<SymptomLog["flow"]>("Light");
  const [currentCramps, setCurrentCramps] = useState<SymptomLog["cramps"]>("None");
  const [currentHeadache, setCurrentHeadache] = useState<SymptomLog["headache"]>("None");
  const [currentFatigue, setCurrentFatigue] = useState<SymptomLog["fatigue"]>("None");
  const [currentMood, setCurrentMood] = useState<SymptomLog["mood"]>("Calm");
  const [currentBloating, setCurrentBloating] = useState(false);
  const [currentBackache, setCurrentBackache] = useState(false);

  // Sync back to localStorage
  useEffect(() => {
    localStorage.setItem("saheli_period_history", JSON.stringify(periodHistory));
  }, [periodHistory]);

  useEffect(() => {
    localStorage.setItem("saheli_symptom_logs", JSON.stringify(symptomLogs));
  }, [symptomLogs]);

  useEffect(() => {
    localStorage.setItem("saheli_avg_cycle_length", averageCycleLength.toString());
  }, [averageCycleLength]);

  useEffect(() => {
    localStorage.setItem("saheli_avg_period_length", averagePeriodLength.toString());
  }, [averagePeriodLength]);

  // Handle logging a period manually
  const handleAddPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logStartDate || !logEndDate) return;

    const start = new Date(logStartDate);
    const end = new Date(logEndDate);
    if (end < start) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    const differenceInTime = end.getTime() - start.getTime();
    const periodDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1;

    const newEntry: PeriodEntry = {
      id: Math.random().toString(),
      startDate: logStartDate,
      endDate: logEndDate,
      cycleLength: averageCycleLength,
      periodLength: periodDays,
    };

    setPeriodHistory(prev => [newEntry, ...prev].sort((a, b) => b.startDate.localeCompare(a.startDate)));
    setIsAddingPeriod(false);
    setLogStartDate("");
    setLogEndDate("");
  };

  const handleDeletePeriod = (id: string) => {
    setPeriodHistory(prev => prev.filter(entry => entry.id !== id));
  };

  // Quick log period starting today
  const handleLogPeriodStartToday = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const estimatedEnd = new Date();
    estimatedEnd.setDate(estimatedEnd.getDate() + averagePeriodLength - 1);
    const estimatedEndStr = estimatedEnd.toISOString().split("T")[0];

    const newEntry: PeriodEntry = {
      id: Math.random().toString(),
      startDate: todayStr,
      endDate: estimatedEndStr,
      cycleLength: averageCycleLength,
      periodLength: averagePeriodLength,
    };

    // Prevent duplicate logs on same start date
    if (periodHistory.some(entry => entry.startDate === todayStr)) {
      alert("A period starting today is already logged.");
      return;
    }

    setPeriodHistory(prev => [newEntry, ...prev].sort((a, b) => b.startDate.localeCompare(a.startDate)));
  };

  // Handle logging symptoms
  const handleLogSymptoms = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: SymptomLog = {
      date: selectedSymptomDate,
      flow: currentFlow,
      cramps: currentCramps,
      headache: currentHeadache,
      fatigue: currentFatigue,
      mood: currentMood,
      bloating: currentBloating,
      backache: currentBackache,
    };

    setSymptomLogs(prev => {
      const filtered = prev.filter(log => log.date !== selectedSymptomDate);
      return [newLog, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    });

    alert(t("Symptoms successfully logged!"));
  };

  // Get symptoms for selected date
  useEffect(() => {
    const existingLog = symptomLogs.find(log => log.date === selectedSymptomDate);
    if (existingLog) {
      setCurrentFlow(existingLog.flow);
      setCurrentCramps(existingLog.cramps);
      setCurrentHeadache(existingLog.headache);
      setCurrentFatigue(existingLog.fatigue);
      setCurrentMood(existingLog.mood);
      setCurrentBloating(existingLog.bloating);
      setCurrentBackache(existingLog.backache);
    } else {
      // Defaults
      setCurrentFlow("None");
      setCurrentCramps("None");
      setCurrentHeadache("None");
      setCurrentFatigue("None");
      setCurrentMood("Calm");
      setCurrentBloating(false);
      setCurrentBackache(false);
    }
  }, [selectedSymptomDate, symptomLogs]);

  // Compute Cycle Info
  const lastPeriod = periodHistory[0];
  let cycleDay = 1;
  let cyclePhase = "Follicular Phase";
  let daysUntilNextPeriod = 14;
  let nextPeriodDateStr = "";
  let ovulationDateStr = "";
  let fertileStartStr = "";
  let fertileEndStr = "";

  if (lastPeriod) {
    const today = new Date();
    const lastStart = new Date(lastPeriod.startDate);
    
    const diffTime = today.getTime() - lastStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
    
    // Calculate current day of current cycle (modulo the cycle length)
    cycleDay = (diffDays % averageCycleLength) + 1;
    if (cycleDay <= 0) cycleDay = averageCycleLength + cycleDay;

    // Phase Classification
    if (cycleDay <= averagePeriodLength) {
      cyclePhase = "Menstrual Phase";
    } else if (cycleDay <= 12) {
      cyclePhase = "Follicular Phase";
    } else if (cycleDay <= 16) {
      cyclePhase = "Ovulation Phase";
    } else {
      cyclePhase = "Luteal Phase";
    }

    // Predictions
    daysUntilNextPeriod = averageCycleLength - cycleDay;
    if (daysUntilNextPeriod <= 0) {
      daysUntilNextPeriod = averageCycleLength + daysUntilNextPeriod;
    }

    // Next Period Date calculation
    const nextPeriod = new Date(lastStart);
    nextPeriod.setDate(nextPeriod.getDate() + averageCycleLength);
    nextPeriodDateStr = nextPeriod.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

    // Ovulation Day (Typically 14 days before next period)
    const ovulationDate = new Date(lastStart);
    ovulationDate.setDate(ovulationDate.getDate() + averageCycleLength - 14);
    ovulationDateStr = ovulationDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    // Fertile Window (5 days before ovulation to 1 day after)
    const fStart = new Date(ovulationDate);
    fStart.setDate(fStart.getDate() - 5);
    const fEnd = new Date(ovulationDate);
    fEnd.setDate(fEnd.getDate() + 1);

    fertileStartStr = fStart.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    fertileEndStr = fEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } else {
    // Default placeholders
    const defaultNext = new Date();
    defaultNext.setDate(defaultNext.getDate() + 12);
    nextPeriodDateStr = defaultNext.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    
    const defaultOvulation = new Date();
    defaultOvulation.setDate(defaultOvulation.getDate() - 2);
    ovulationDateStr = defaultOvulation.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    const fStart = new Date(defaultOvulation);
    fStart.setDate(fStart.getDate() - 5);
    const fEnd = new Date(defaultOvulation);
    fEnd.setDate(fEnd.getDate() + 1);
    fertileStartStr = fStart.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    fertileEndStr = fEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  // Empathetic health insights in regional languages depending on current state or logged symptoms
  const getPhaseInsight = () => {
    switch (cyclePhase) {
      case "Menstrual Phase":
        return {
          title: t("Menstrual Phase Tips"),
          desc: t("Focus on warm, iron-rich foods. Gentle stretching or yoga can help ease cramps. Warm chamomile tea is wonderful right now.")
        };
      case "Follicular Phase":
        return {
          title: t("Follicular Phase Tips"),
          desc: t("Energy levels are rising! Great time for active exercises, nourishing protein-rich meals, and starting new projects.")
        };
      case "Ovulation Phase":
        return {
          title: t("Ovulation Phase Tips"),
          desc: t("Peak fertility and high energy window. Ensure you stay well-hydrated. Keep meals balanced with fresh greens.")
        };
      case "Luteal Phase":
      default:
        return {
          title: t("Luteal Phase Tips"),
          desc: t("Hormones are transitioning, so PMS may appear. Prioritize rest, limit caffeine and sodium to reduce bloating.")
        };
    }
  };

  const phaseInsight = getPhaseInsight();

  // Symptom specific advice
  const getSymptomAdvice = () => {
    const todayLog = symptomLogs.find(log => log.date === new Date().toISOString().split("T")[0]);
    if (todayLog) {
      if (todayLog.cramps === "Moderate" || todayLog.cramps === "Severe") {
        return {
          symptom: t("Cramps"),
          advice: t("Apply a warm compress on your lower abdomen. Sip warm ginger or cinnamon tea, and rest to soothe the cramping muscle fibers.")
        };
      }
      if (todayLog.headache === "Moderate" || todayLog.headache === "Severe") {
        return {
          symptom: t("Headache"),
          advice: t("Ensure you are hydrated. Seek a quiet, dark room, gently massage your temples with lavender or peppermint oil, and practice slow deep breaths.")
        };
      }
      if (todayLog.fatigue === "Moderate" || todayLog.fatigue === "Severe") {
        return {
          symptom: t("Fatigue"),
          advice: t("Your body is telling you to rest. Take a short 20-minute nap, avoid stressful tasks, and keep meals light but energy-rich.")
        };
      }
      if (todayLog.bloating) {
        return {
          symptom: t("Bloating"),
          advice: t("Reduce salt intake, drink plenty of warm water, and try a small walk or gentle core twists to release gas and ease pressure.")
        };
      }
    }
    return null;
  };

  const symptomAdvice = getSymptomAdvice();

  return (
    <div className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8 pb-24">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-pink-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 fill-pink-600 animate-pulse" />
            {t("Sakhi Women's Health OS")}
          </span>
          <h1 className="text-3xl font-display font-black text-text-dark tracking-tight mt-1">
            {t("Women's Health Tracking")}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {t("Track your menstrual cycle, understand symptom patterns, and get personalized insights.")}
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogPeriodStartToday}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-display font-bold shadow-sm cursor-pointer hover:bg-rose-700"
          >
            <Droplet className="w-4 h-4 fill-white" />
            {t("Period Started Today")}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddingPeriod(!isAddingPeriod)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-text-dark rounded-xl text-sm font-display font-bold cursor-pointer hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 text-text-dark" />
            {t("Log Past Period")}
          </motion.button>
        </div>
      </div>

      {/* Adding Period Slide-down Panel */}
      <AnimatePresence>
        {isAddingPeriod && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-rose-100 rounded-2xl p-6 shadow-xs overflow-hidden"
          >
            <h3 className="font-display font-bold text-lg text-text-dark mb-4">
              {t("Log Menstrual Period")}
            </h3>
            <form onSubmit={handleAddPeriod} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">{t("Period Start Date")}</label>
                <input 
                  type="date" 
                  value={logStartDate}
                  onChange={e => setLogStartDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">{t("Period End Date")}</label>
                <input 
                  type="date" 
                  value={logEndDate}
                  onChange={e => setLogEndDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-sm py-2 px-4 rounded-xl cursor-pointer"
                >
                  {t("Save Period")}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddingPeriod(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-text-dark font-display font-semibold text-sm py-2 px-4 rounded-xl cursor-pointer"
                >
                  {t("Cancel")}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Interactive Tracker and Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column: Interactive Cycle Progress Ring */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Cycle Ring Tracker Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
              {/* Outer circle decoration */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle 
                  cx="96" 
                  cy="96" 
                  r="80" 
                  className="stroke-gray-100 fill-none" 
                  strokeWidth="8"
                />
                <circle 
                  cx="96" 
                  cy="96" 
                  r="80" 
                  className="stroke-rose-500 fill-none transition-all duration-1000 ease-out" 
                  strokeWidth="8"
                  strokeDasharray="502"
                  strokeDashoffset={502 - (502 * Math.min(cycleDay, averageCycleLength)) / averageCycleLength}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Center Details */}
              <div className="text-center z-10">
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">{t("Cycle Day")}</span>
                <div className="text-4xl font-display font-black text-rose-600 mt-1">{cycleDay}</div>
                <div className="text-[10px] text-text-muted font-medium mt-1">/ {averageCycleLength} {t("Days")}</div>
              </div>

              {/* Little moving cursor dot along the ring */}
              <div 
                className="absolute w-4 h-4 bg-white border-2 border-rose-600 rounded-full shadow-md transition-all duration-1000"
                style={{
                  transform: `rotate(${(cycleDay / averageCycleLength) * 360 - 90}deg) translate(80px) rotate(-${(cycleDay / averageCycleLength) * 360 - 90}deg)`
                }}
              />
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-full">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  {t(cyclePhase)}
                </span>
                <h2 className="text-2xl font-display font-black text-text-dark tracking-tight mt-2">
                  {cyclePhase === "Menstrual Phase" && t("Rest & Hydrate")}
                  {cyclePhase === "Follicular Phase" && t("Rise & Build Energy")}
                  {cyclePhase === "Ovulation Phase" && t("Peak Fertility Phase")}
                  {cyclePhase === "Luteal Phase" && t("Prepare & Slow Down")}
                </h2>
                <p className="text-text-muted text-sm mt-2">
                  {cyclePhase === "Menstrual Phase" && t("Your uterine lining is shedding. Prioritize hot drinks, extra sleep, and light walking.")}
                  {cyclePhase === "Follicular Phase" && t("Estrogen levels are rising, driving physical resilience and sharp cognitive coordination.")}
                  {cyclePhase === "Ovulation Phase" && t("Luteinizing hormone peaks, triggering ovulation. High physical stamina and social confidence.")}
                  {cyclePhase === "Luteal Phase" && t("Progesterone dominates to soothe. Ideal window for mindful reflection, warm foods, and stretching.")}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 text-center min-w-[100px]">
                  <span className="text-[10px] text-text-muted font-bold block uppercase">{t("Next Period")}</span>
                  <span className="text-xs font-display font-bold text-text-dark mt-0.5 block">{daysUntilNextPeriod} {t("Days")}</span>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 text-center min-w-[100px]">
                  <span className="text-[10px] text-text-muted font-bold block uppercase">{t("Ovulation In")}</span>
                  <span className="text-xs font-display font-bold text-text-dark mt-0.5 block">
                    {cycleDay <= averageCycleLength - 14 
                      ? `${(averageCycleLength - 14) - cycleDay} ${t("Days")}`
                      : t("Completed")
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Predictor Dashboard / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Predicted Period */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 flex-shrink-0">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase block">{t("Predicted Period")}</span>
                <span className="text-sm font-display font-black text-text-dark block mt-0.5">{nextPeriodDateStr}</span>
              </div>
            </div>

            {/* Fertile Window */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase block">{t("Fertile Window")}</span>
                <span className="text-xs font-display font-black text-text-dark block mt-0.5">
                  {fertileStartStr} - {fertileEndStr}
                </span>
              </div>
            </div>

            {/* Ovulation Day */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
                <Droplet className="w-6 h-6 fill-rose-100" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase block">{t("Ovulation Day")}</span>
                <span className="text-sm font-display font-black text-text-dark block mt-0.5">{ovulationDateStr}</span>
              </div>
            </div>
          </div>

          {/* Health Insights & Clinical Advice (Empathetic) */}
          <div className="bg-[#FFF5F6] border border-rose-100 rounded-3xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-100 animate-pulse" />
              <h3 className="font-display font-black text-lg text-text-dark">
                {t("Empathetic Health Insights")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cycle Phase Insight */}
              <div className="bg-white/80 backdrop-blur-xs border border-rose-100/50 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                  {phaseInsight.title}
                </span>
                <p className="text-text-dark text-sm leading-relaxed">
                  {phaseInsight.desc}
                </p>
              </div>

              {/* Active Symptom Remedy / Tip */}
              <div className="bg-white/80 backdrop-blur-xs border border-rose-100/50 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {symptomAdvice ? `${t("Remedy for")} ${symptomAdvice.symptom}` : t("Daily Companion Tip")}
                </span>
                <p className="text-text-dark text-sm leading-relaxed">
                  {symptomAdvice 
                    ? symptomAdvice.advice
                    : t("Regularly logging flow levels and cramping severity helps Sakhi map out highly tailored suggestions for your clinic visits.")
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Menstrual & Cycle Configurations */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-text-dark">
              {t("Cycle Configurations")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  {t("Average Cycle Length (Days)")}
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="21" 
                    max="45" 
                    value={averageCycleLength}
                    onChange={e => setAverageCycleLength(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                  <span className="font-display font-black text-sm text-text-dark">{averageCycleLength} {t("Days")}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  {t("Average Period Length (Days)")}
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="3" 
                    max="10" 
                    value={averagePeriodLength}
                    onChange={e => setAveragePeriodLength(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                  <span className="font-display font-black text-sm text-text-dark">{averagePeriodLength} {t("Days")}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Symptom Logger and Period History */}
        <div className="space-y-8">
          
          {/* Daily PMS & Cycle Symptom Logger Form */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
            <div>
              <h3 className="font-display font-bold text-lg text-text-dark">
                {t("Symptom Logger")}
              </h3>
              <p className="text-text-muted text-xs mt-0.5">
                {t("Log your flow and symptoms to enhance predictions.")}
              </p>
            </div>

            <form onSubmit={handleLogSymptoms} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">{t("Select Logging Date")}</label>
                <input 
                  type="date"
                  value={selectedSymptomDate}
                  onChange={e => setSelectedSymptomDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-text-dark focus:outline-none"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Flow Intensity Slider / Selector */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">{t("Menstrual Flow")}</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(["None", "Spotting", "Light", "Medium", "Heavy"] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setCurrentFlow(f)}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                        currentFlow === f
                          ? "bg-rose-600 border-rose-600 text-white"
                          : "bg-gray-50 border-gray-200 text-text-dark hover:bg-gray-100"
                      }`}
                    >
                      {t(f)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cramps Intensity */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">{t("Cramps Severity")}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["None", "Mild", "Moderate", "Severe"] as const).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrentCramps(c)}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                        currentCramps === c
                          ? "bg-rose-50 border-rose-300 text-rose-700"
                          : "bg-gray-50 border-gray-200 text-text-dark hover:bg-gray-100"
                      }`}
                    >
                      {t(c)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headache Severity */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">{t("Headache Severity")}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["None", "Mild", "Moderate", "Severe"] as const).map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setCurrentHeadache(h)}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                        currentHeadache === h
                          ? "bg-purple-50 border-purple-300 text-purple-700"
                          : "bg-gray-50 border-gray-200 text-text-dark hover:bg-gray-100"
                      }`}
                    >
                      {t(h)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fatigue Severity */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">{t("Fatigue Severity")}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["None", "Mild", "Moderate", "Severe"] as const).map(fa => (
                    <button
                      key={fa}
                      type="button"
                      onClick={() => setCurrentFatigue(fa)}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                        currentFatigue === fa
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-gray-50 border-gray-200 text-text-dark hover:bg-gray-100"
                      }`}
                    >
                      {t(fa)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">{t("Primary Mood")}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["Happy", "Calm", "Irritable", "Anxious", "Sad", "Fatigued"] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCurrentMood(m)}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                        currentMood === m
                          ? "bg-amber-50 border-amber-300 text-amber-700 font-black"
                          : "bg-gray-50 border-gray-200 text-text-dark hover:bg-gray-100"
                      }`}
                    >
                      {t(m)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkbox Symptoms: Bloating, Backache */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={currentBloating}
                    onChange={e => setCurrentBloating(e.target.checked)}
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-text-dark">{t("Bloating")}</span>
                </label>

                <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={currentBackache}
                    onChange={e => setCurrentBackache(e.target.checked)}
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-text-dark">{t("Backache")}</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-sm py-2.5 rounded-xl mt-4 cursor-pointer"
              >
                {t("Log Symptoms")}
              </button>
            </form>
          </div>

          {/* Period History Log Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-text-dark">
                {t("Period History")}
              </h3>
              <span className="text-[10px] font-bold text-text-muted uppercase">
                {periodHistory.length} {t("Logs")}
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {periodHistory.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  {t("No period logs registered yet.")}
                </div>
              ) : (
                periodHistory.map(entry => {
                  const start = new Date(entry.startDate);
                  const end = new Date(entry.endDate);
                  const startStr = start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                  const endStr = end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

                  return (
                    <div 
                      key={entry.id}
                      className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-display font-black text-text-dark">
                          <span className="w-2.5 h-2.5 bg-rose-600 rounded-full inline-block" />
                          {startStr}
                        </div>
                        <div className="text-xs text-text-muted">
                          {t("to")} {endStr} • <span className="font-bold text-rose-600">{entry.periodLength} {t("days")}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePeriod(entry.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg cursor-pointer transition-colors"
                        title={t("Delete Log")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
