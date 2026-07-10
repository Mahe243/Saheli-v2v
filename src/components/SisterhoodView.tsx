/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  MessageSquare, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  BookOpen, 
  Users, 
  Send, 
  Check, 
  Phone, 
  MapPin, 
  Smile,
  ArrowRight
} from "lucide-react";
import { orchestrator } from "../services/orchestrator";

// Mock letters of support from trial community sisters
const TRIAL_LETTERS = [
  {
    id: 1,
    author: "Kavitha Sharma",
    stage: "32 Weeks Pregnant",
    location: "Bhopal, MP",
    avatar: "🌸",
    content: "Sisters, you are not alone on this journey. Last month, my hemoglobin dropped and I was terrified. But our ASHA Didi Sunita came over, made me hot daliya, and sat with me. Take your iron tablets, drink water, and keep smiling. We are all holding hands across this trial!",
    likes: 24,
    likedByMe: false
  },
  {
    id: 2,
    author: "Shreya Patidar",
    stage: "Mother of 2-month-old",
    location: "Indore, MP",
    avatar: "🌾",
    content: "Postpartum days can feel lonely and exhausting. Priya, if you are reading this, please rest! Do not worry about cooking everything or sweeping. Lift your baby with bent knees to protect your back, and eat the dry-fruit laddoos. Your body has done a miracle.",
    likes: 41,
    likedByMe: false
  },
  {
    id: 3,
    author: "Meera Deshmukh",
    stage: "Trying to Conceive",
    location: "Jabalpur, MP",
    avatar: "🦋",
    content: "Sometimes waiting is the hardest part. Every month when my period came, I would cry. My Saheli app reminded me that my body is preparing in its own time. To anyone waiting—be gentle with yourself today.",
    likes: 19,
    likedByMe: false
  }
];

// Grandma's traditional remedies & comfort tips (daadi-nani ke nuskhe)
const TRADITIONAL_WISDOM = [
  {
    id: "remedy-1",
    title: "Iron-Boosting Gur & Chana Snack",
    category: "Nutrition",
    description: "Roasted chickpea (chana) paired with organic jaggery (gur) is a traditional dry iron-rich snack that keeps energy up and fights pregnancy fatigue.",
    instruction: "Keep a small pouch in your purse. Eat a handful with warm water every afternoon.",
    icon: "🥜"
  },
  {
    id: "remedy-2",
    title: "Ginger & Fennel Morning Sip",
    category: "Comfort",
    description: "For fighting morning nausea or abdominal bloating safely without harsh medicines.",
    instruction: "Boil half a teaspoon of fennel seeds (saunf) and a tiny slice of ginger in water. Let it cool slightly and sip slowly.",
    icon: "☕"
  },
  {
    id: "remedy-3",
    title: "Postpartum Sesame Oil Compress",
    category: "Recovery",
    description: "Warm black sesame (til) oil helps soothe aching lower back muscles and joints after delivery.",
    instruction: "Have a family member gently rub warm oil in circular motions on your lower back, followed by a warm water cloth compress.",
    icon: "💆‍♀️"
  },
  {
    id: "remedy-4",
    title: "Grass-Scent Breathing Grounding",
    category: "Mindfulness",
    description: "Traditional local grounding to release stress, anxiety, or trial panic.",
    instruction: "Walk barefoot on natural green grass for 5 minutes in the morning. Focus on the cold dew and take deep belly breaths.",
    icon: "🌱"
  }
];

// Audio guidance messages from ASHA Worker
const AUDIO_GUIDANCES = [
  {
    id: "audio-1",
    title: "Didi's Blessing & Trimester Safety",
    duration: "2:15",
    narrator: "ASHA Worker Sunita Devi",
    hindiTranscript: "नमस्ते प्रिया, मैं तुम्हारी सुनीता दीदी बोल रही हूँ। तुम्हारे तीसरे तिमाही में थोड़ा भारीपन लगना स्वाभाविक है। घबराओ मत, अपने आयरन और कैल्शियम की गोलियाँ समय पर लेती रहो। शाम को थोड़ी देर खुली हवा में टहलो और जब भी मन उदास हो, मुझे तुरंत फ़ोन करो। तुम्हारी सहेली हमेशा तुम्हारे साथ है।",
    englishTranscript: "Hello Priya, this is your Sunita Didi speaking. Feeling a bit heavy in your third trimester is completely natural. Don't worry, keep taking your iron and calcium tablets on time. Walk in the fresh air in the evening, and if you ever feel low, call me right away. Your Saheli is always with you."
  },
  {
    id: "audio-2",
    title: "Fighting Fatigue with Local Foods",
    duration: "1:48",
    narrator: "ASHA Worker Sunita Devi",
    hindiTranscript: "अरे सुनो, थकान होना शरीर की बात है। अपने खाने में हरी सब्ज़ियाँ जैसे पालक, मेथी और चने की दाल शामिल करो। दिन में दो बार गुनगुना दूध ज़रूर पियो। गाँव की ताज़ा हवा में गहरी साँस लो और भारी वज़न उठाने से परहेज़ करो।",
    englishTranscript: "Listen, fatigue is just your body talking to you. Include green leafy vegetables like spinach, fenugreek, and split chickpeas in your food. Drink warm milk twice a day. Take deep breaths of fresh village air and avoid lifting heavy loads."
  },
  {
    id: "audio-3",
    title: "Maternal Mental Peace Advice",
    duration: "2:05",
    narrator: "ASHA Worker Sunita Devi",
    hindiTranscript: "चिंता करने से बच्चे पर भी असर पड़ता है। जब भी घबराहट हो, आँखें बंद करके अपनी सांसों पर ध्यान दो। अपने आँगन में बैठो, तुलसी माँ को देखो, और याद रखो कि तुम एक सुंदर जीव को जन्म देने वाली हो। तुम अकेली नहीं हो, हम सब तुम्हारे साथ हैं।",
    englishTranscript: "Worrying affects your baby too. Whenever you feel anxious, close your eyes and focus on your breath. Sit in your courtyard, look at the Tulsi plant, and remember that you are bringing a beautiful life into this world. You are not alone, we are all with you."
  }
];

export default function SisterhoodView() {
  const [letters, setLetters] = useState(TRIAL_LETTERS);
  const [selectedAudio, setSelectedAudio] = useState(AUDIO_GUIDANCES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [speechLanguage, setSpeechLanguage] = useState<"hi" | "en">("hi");
  const [newLetterContent, setNewLetterContent] = useState("");
  const [isSubmittingLetter, setIsSubmittingLetter] = useState(false);
  const [lettersLiked, setLettersLiked] = useState<number[]>([]);
  const [showVisitSuccess, setShowVisitSuccess] = useState(false);
  const [visitRequested, setVisitRequested] = useState(false);
  
  // Real Speech Synthesis controller
  useEffect(() => {
    if (!isPlaying) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (!("speechSynthesis" in window)) {
      // Fallback progress if speech synthesis is not supported on this platform/device
      let progressInterval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1.5;
        });
      }, 250);
      return () => clearInterval(progressInterval);
    }

    const synth = window.speechSynthesis;
    const textToSpeak = speechLanguage === "hi" ? selectedAudio.hindiTranscript : selectedAudio.englishTranscript;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Voice configuration matching: prefer female Indian voice for Sunita Devi
    const voices = synth.getVoices();
    const langCode = speechLanguage === "hi" ? "hi-IN" : "en-IN";
    
    let voice = voices.find(v => v.lang.startsWith(langCode) && v.name.toLowerCase().includes("female"));
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(langCode));
    }
    if (!voice && speechLanguage === "en") {
      voice = voices.find(v => v.lang.startsWith("en"));
    }
    
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = langCode;
    utterance.rate = 0.85; // Warm, gentle pace for elderly maternal companion feel

    // Estimated total duration based on text length to drive robust progress updates
    const wordCount = textToSpeak.split(/\s+/).length;
    const estDuration = Math.max(7, speechLanguage === "hi" ? wordCount * 0.45 : wordCount * 0.5);
    const startTime = Date.now();

    const progressTimer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const percentage = (elapsed / estDuration) * 100;
      setAudioProgress(Math.min(99, percentage));
    }, 150);

    // Match exact word boundaries if supported by browser
    utterance.onboundary = (event) => {
      if (event.charIndex !== undefined && textToSpeak.length > 0) {
        const percentage = (event.charIndex / textToSpeak.length) * 100;
        setAudioProgress(Math.min(99, Math.max(percentage, ((Date.now() - startTime) / 1000 / estDuration) * 100)));
      }
    };

    utterance.onend = () => {
      clearInterval(progressTimer);
      setIsPlaying(false);
      setAudioProgress(0);
    };

    utterance.onerror = () => {
      clearInterval(progressTimer);
      setIsPlaying(false);
      setAudioProgress(0);
    };

    // Chrome/Safari issue mitigation: cancel previous speaking before starting
    synth.cancel();
    const speakTimeout = setTimeout(() => {
      synth.speak(utterance);
    }, 50);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(speakTimeout);
      synth.cancel();
    };
  }, [isPlaying, selectedAudio, speechLanguage]);

  const handlePlayPause = (audioId?: string) => {
    if (audioId && audioId !== selectedAudio.id) {
      const found = AUDIO_GUIDANCES.find(a => a.id === audioId);
      if (found) {
        setSelectedAudio(found);
        setAudioProgress(0);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleLikeLetter = (id: number) => {
    if (lettersLiked.includes(id)) {
      setLettersLiked(prev => prev.filter(item => item !== id));
      setLetters(prev => prev.map(l => l.id === id ? { ...l, likes: l.likes - 1 } : l));
    } else {
      setLettersLiked(prev => [...prev, id]);
      setLetters(prev => prev.map(l => l.id === id ? { ...l, likes: l.likes + 1 } : l));
    }
  };

  const handlePostLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLetterContent.trim()) return;
    setIsSubmittingLetter(true);

    setTimeout(() => {
      const userProfile = orchestrator.getHealthBrain().profile;
      const newLetter = {
        id: Date.now(),
        author: userProfile.name || "Priya Devi",
        stage: "32 Weeks Pregnant",
        location: "Indore, MP (You)",
        avatar: "💖",
        content: newLetterContent,
        likes: 0,
        likedByMe: false
      };
      setLetters([newLetter, ...letters]);
      setNewLetterContent("");
      setIsSubmittingLetter(false);

      // Register orchestrator log event
      orchestrator.addLifeEvent(
        "Sisterhood Note Posted",
        "Shared an encouraging support note with the trial community circle.",
        new Date().toISOString().split("T")[0],
        "Logged via Sisterhood Forum."
      );
    }, 800);
  };

  const handleRequestVisit = () => {
    setVisitRequested(true);
    setShowVisitSuccess(true);
    
    // Register orchestrator appointment
    orchestrator.createAppointment({
      date: new Date().toISOString().split("T")[0],
      time: "02:00 PM",
      doctorName: "ASHA Worker Sunita Devi",
      purpose: "Home check-in (BP and Hemoglobin check)"
    });

    setTimeout(() => {
      setShowVisitSuccess(false);
    }, 4000);
  };

  // Convert progress bar percentage to simulated timestamp MM:SS
  const getProgressTime = () => {
    const totalSec = selectedAudio.id === "audio-1" ? 135 : selectedAudio.id === "audio-2" ? 108 : 125;
    const currentSec = Math.floor((audioProgress / 100) * totalSec);
    const format = (sec: number) => {
      const mins = Math.floor(sec / 60);
      const secs = sec % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };
    return `${format(currentSec)} / ${format(totalSec)}`;
  };

  return (
    <div id="sisterhood-and-wisdom" className="space-y-8 animate-fade-in">
      
      {/* 1. Header Empathy Greeting Row */}
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-blue-500/5 p-6 md:p-8 rounded-[24px] border border-pink-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#F8C8DC]/30 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-3xl flex items-center justify-center shadow-xs border border-pink-200 shrink-0">
              👭
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-text-dark">Sisterhood & Warm Wisdom</h2>
              <p className="text-text-muted text-sm mt-1 max-w-2xl leading-relaxed">
                A sanctuary of care where maternal clinical trials meet authentic human warmth. Listen to your village ASHA companion, connect with other mothers in the trial, and embrace safe traditional healing wisdom.
              </p>
            </div>
          </div>
          
          {/* Quick ASHA Worker Card */}
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-pink-100 shadow-xs flex items-center gap-3 shrink-0 w-full md:w-auto">
            <div className="w-11 h-11 rounded-full bg-orange-100 border border-orange-200 text-lg flex items-center justify-center font-bold">
              👵
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-orange-600 block tracking-wider">Your ASHA Sister</span>
              <span className="text-xs font-display font-bold text-text-dark block">Sunita Devi</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                In Village Today
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Voice Cabin & Traditional Remedies */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ASHA DIDI VOICE CABIN */}
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100 relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-50 rounded-lg text-pink-600 border border-pink-100/30">
                <Volume2 className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-text-dark">ASHA Sister's Voice Cabin</h3>
                <p className="text-xs text-text-muted">Personalized spoken advice for physical and mental comfort</p>
              </div>
            </div>

            {/* Simulated Audio Player Dashboard */}
            <div className="bg-gradient-to-br from-gray-50 to-pink-50/20 p-5 rounded-2xl border border-gray-100/50 flex flex-col md:flex-row gap-5 items-center">
              
              {/* Playback Controls & Animated Waveform */}
              <div className="flex flex-col items-center justify-center w-full md:w-52 bg-white p-4.5 rounded-xl border border-gray-100 shadow-xs shrink-0">
                <button
                  onClick={() => handlePlayPause()}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer transition-all ${
                    isPlaying 
                      ? "bg-rose-500 hover:bg-rose-600 scale-95" 
                      : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
                  }`}
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-1" />}
                </button>
                
                {/* Language selection pills */}
                <div className="flex items-center gap-1 mt-3.5 mb-2.5 bg-gray-50 p-1 rounded-lg border border-gray-100 w-full shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSpeechLanguage("hi");
                      if (isPlaying) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    className={`flex-1 text-center py-1 text-[9px] font-display font-bold rounded-md transition-all cursor-pointer ${
                      speechLanguage === "hi"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-text-muted hover:text-text-dark"
                    }`}
                  >
                    Hindi (हिंदी)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSpeechLanguage("en");
                      if (isPlaying) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    className={`flex-1 text-center py-1 text-[9px] font-display font-bold rounded-md transition-all cursor-pointer ${
                      speechLanguage === "en"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-text-muted hover:text-text-dark"
                    }`}
                  >
                    English
                  </button>
                </div>

                <span className="text-xs font-display font-bold text-text-dark text-center line-clamp-1">{selectedAudio.title}</span>
                <span className="text-[10px] text-text-muted mt-0.5">{selectedAudio.narrator}</span>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between w-full mt-2 px-0.5">
                  <span className="text-[9px] font-mono font-bold text-text-muted">{getProgressTime()}</span>
                  <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                    Didi Voice
                  </span>
                </div>
              </div>

              {/* Real-time Bilingual Transcript Subtitles */}
              <div className="flex-1 space-y-4">
                <div className="bg-white/80 p-4 rounded-xl border border-gray-50 space-y-3">
                  {/* Hindi transcript */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-orange-600 font-display">Hindi / हिंदी</span>
                    <p className="text-sm font-medium text-text-dark leading-relaxed font-sans">
                      "{selectedAudio.hindiTranscript}"
                    </p>
                  </div>
                  {/* English transcript */}
                  <div className="space-y-1 border-t border-gray-100/50 pt-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 font-display">English Translation</span>
                    <p className="text-xs font-medium text-text-muted leading-relaxed font-sans italic">
                      "{selectedAudio.englishTranscript}"
                    </p>
                  </div>
                </div>

                {/* Waveform graphic showing active play state */}
                <div className="flex items-center justify-center gap-1 h-8 px-4">
                  {[...Array(16)].map((_, idx) => {
                    const animationDelay = `${idx * 0.1}s`;
                    const animationDuration = `${0.5 + Math.random() * 0.7}s`;
                    return (
                      <div 
                        key={idx} 
                        className={`w-1 rounded-full bg-indigo-400 ${isPlaying ? "animate-pulse" : "opacity-30"}`}
                        style={{ 
                          height: isPlaying ? `${10 + Math.random() * 22}px` : "4px",
                          animationDelay,
                          animationDuration,
                          transition: "height 0.3s ease-in-out"
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Audio selection choices list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
              {AUDIO_GUIDANCES.map((item) => {
                const isCurrent = selectedAudio.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePlayPause(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                      isCurrent 
                        ? "bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200" 
                        : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isCurrent ? "bg-indigo-500 text-white" : "bg-gray-50 text-text-muted"}`}>
                      {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-display font-bold text-text-dark block leading-snug line-clamp-1">{item.title}</span>
                      <span className="text-[10px] text-text-muted block mt-0.5">{item.duration} • Sunita Didi</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DADI-NANI KE NUSKHE (TRADITIONAL COMFORT & WISDOM) */}
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600 border border-orange-100/30">
                <BookOpen className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-text-dark">Traditional Wellness Wisdom (दादी-नानी के नुस्खे)</h3>
                <p className="text-xs text-text-muted">Clinically vetted safe guidelines from elders & maternal heritage</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRADITIONAL_WISDOM.map((remedy) => (
                <div 
                  key={remedy.id}
                  className="p-5 bg-white border border-gray-100 rounded-[22px] hover:border-pink-200/60 hover:shadow-[0_8px_25px_rgba(0,0,0,0.015)] transition-all duration-300 flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50/50 text-2xl flex items-center justify-center border border-orange-100/50 shrink-0">
                    {remedy.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-orange-600 tracking-wider bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100/30">
                        {remedy.category}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-text-dark mt-1">{remedy.title}</h4>
                    <p className="text-xs text-text-muted leading-relaxed font-sans font-medium">{remedy.description}</p>
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-2">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 block">How to use:</span>
                      <p className="text-[11px] text-text-dark mt-0.5 leading-snug font-sans">{remedy.instruction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Trial Sisters Circle Letters & Posting support */}
        <div className="space-y-8">
          
          {/* SISTER SUPPORT NOTE FORUM */}
          <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.015)] border border-gray-100 flex flex-col h-full">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-pink-50 rounded-lg text-pink-500 border border-pink-100/50">
                <Users className="w-4.5 h-4.5 text-pink-500" />
              </div>
              Sisterhood Support Circle
            </h3>
            <p className="text-xs text-text-muted mb-5 leading-normal">
              Read warm letters of solidarity or write an encouraging note to other sisters in the healthcare trial.
            </p>

            {/* Message Posting box */}
            <form onSubmit={handlePostLetter} className="space-y-3 mb-6 bg-pink-50/20 p-4 rounded-xl border border-pink-100/30">
              <span className="text-[10px] uppercase font-bold text-pink-600 block tracking-wider">Leave a supportive word</span>
              <textarea
                value={newLetterContent}
                onChange={(e) => setNewLetterContent(e.target.value)}
                placeholder="Share a comforting thought, trial blessing, or encouragement for other sisters..."
                rows={3}
                className="w-full p-3 text-xs bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-xl transition-all font-sans"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingLetter || !newLetterContent.trim()}
                  className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl font-display font-bold text-xs cursor-pointer transition-all ${
                    newLetterContent.trim() && !isSubmittingLetter
                      ? "bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-xs active:scale-95"
                      : "bg-gray-100 text-text-muted cursor-not-allowed"
                  }`}
                >
                  {isSubmittingLetter ? (
                    <>
                      <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Post comfort note
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Letters Feed */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              <AnimatePresence>
                {letters.map((letter) => {
                  const isLiked = lettersLiked.includes(letter.id);
                  return (
                    <motion.div 
                      key={letter.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 border border-gray-100 hover:border-pink-100 rounded-xl bg-white space-y-3 hover:shadow-xs transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-base">
                            {letter.avatar}
                          </div>
                          <div>
                            <span className="text-xs font-display font-bold text-text-dark block">{letter.author}</span>
                            <span className="text-[9px] text-text-muted font-mono block leading-none">{letter.stage} • {letter.location}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-text-dark leading-relaxed font-sans font-medium italic">
                        "{letter.content}"
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50/50">
                        <button
                          type="button"
                          onClick={() => handleLikeLetter(letter.id)}
                          className={`flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors ${
                            isLiked ? "text-pink-600" : "text-text-muted hover:text-pink-600"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-pink-600 stroke-pink-600" : ""}`} />
                          <span>{letter.likes} Love</span>
                        </button>
                        
                        <span className="text-[9px] text-text-muted font-bold flex items-center gap-1 font-display">
                          <Check className="w-3 h-3 text-emerald-500" />
                          Verified Mom
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* REQUEST HOME VISIT FROM ASHA DIDI */}
          <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-6 rounded-[24px] border border-orange-100/40 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100/30 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-orange-600 shrink-0 border border-orange-200/50">
                <MapPin className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-text-dark leading-snug">Need a warm, physical visit?</h4>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed font-sans font-medium">
                  If you are feeling physical pain, stress, or need ASHA Sister Sunita to visit you at home in the village to check your blood pressure/hemoglobin, click below.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRequestVisit}
                disabled={visitRequested}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-bold text-xs cursor-pointer transition-all ${
                  visitRequested
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-orange-600 text-white hover:bg-orange-700 shadow-xs hover:shadow-md"
                }`}
              >
                {visitRequested ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    Home visit request received
                  </>
                ) : (
                  <>
                    <Phone className="w-3.5 h-3.5" />
                    Request Home visit from Sunita Didi
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {showVisitSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-center"
                >
                  <p className="text-[11px] text-emerald-800 font-display font-bold">
                    ✓ Request sent! Sunita Didi has been notified to stop by your house today.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
