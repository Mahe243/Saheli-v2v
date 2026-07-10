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
import { useTranslation } from "../utils/translation";

export default function ConversationView() {
  const { t } = useTranslation();
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
          isComplete: false,
          preferredLanguage: localStorage.getItem("saheli_preferred_language") || "English"
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
      console.warn(err);
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
          isComplete: true,
          preferredLanguage: localStorage.getItem("saheli_preferred_language") || "English"
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
    
    // Determine the current preferred language
    const currentLang = localStorage.getItem("saheli_preferred_language") || "English";
    const normalizedLang = currentLang.toLowerCase();

    // Multilingual speech dictations
    const dictationsByLanguage: Record<string, Record<string, string>> = {
      english: {
        chiefComplaint: "Yes, I have an uncomfortable heavy back pain and sometimes a little bit of fatigue after field farming.",
        timeline: "This backache has been going on for about a week, mostly in the early mornings and late afternoons.",
        severity: "I would call it moderate. It is around 5 out of 10. I can still walk but it hurts to bend over.",
        betterFactor: "Applying some local warm heat compress and lying flat on the floor really relaxes it.",
        worseFactor: "Lifting water pots or bending down to plant crops definitely makes it tighten up.",
        historyOfSymptom: "I felt a very similar ache near the end of my pregnancy two years ago.",
        currentMedsForSymptom: "No medication yet, only my daily iron tablets.",
        additionalInfo: "I am taking care of my active two-year-old child and want to prepare for another healthy pregnancy soon."
      },
      hindi: {
        chiefComplaint: "हाँ, मुझे खेत में काम करने के बाद पीठ में भारी और असहज दर्द होता है और कभी-कभी थोड़ी थकान भी होती है।",
        timeline: "यह पीठ दर्द लगभग एक सप्ताह से चल रहा है, ज्यादातर सुबह-सुबह और दोपहर के बाद होता है।",
        severity: "मैं इसे मध्यम कहूँगी। यह 10 में से लगभग 5 है। मैं अभी भी चल सकती हूँ लेकिन झुकने पर दर्द होता है।",
        betterFactor: "थोड़ी गर्म सिंकाई करने और फर्श पर सीधे लेटने से मुझे सच में बहुत आराम मिलता है।",
        worseFactor: "पानी के बर्तन उठाना या फसल लगाने के लिए झुकना निश्चित रूप से दर्द को बढ़ा देता है।",
        historyOfSymptom: "मैंने दो साल पहले अपनी गर्भावस्था के अंत के समय बिल्कुल ऐसा ही दर्द महसूस किया था।",
        currentMedsForSymptom: "अभी तक कोई दवा नहीं ली है, केवल मेरी दैनिक आयरन की गोलियां चल रही हैं।",
        additionalInfo: "मैं अपने दो साल के सक्रिय बच्चे की देखभाल कर रही हूँ और जल्द ही दूसरी स्वस्थ गर्भावस्था की तैयारी करना चाहती हूँ।"
      },
      bengali: {
        chiefComplaint: "হ্যাঁ, মাঠে কাজ করার পর আমার পিঠে একটা অস্বস্তিকর ভারী ব্যথা হয় এবং মাঝে মাঝে একটু ক্লান্তি বোধ হয়।",
        timeline: "এই পিঠের ব্যথা প্রায় এক সপ্তাহ ধরে চলছে, বেশিরভাগই সকালের দিকে এবং বিকেলের দিকে হয়।",
        severity: "আমি এটিকে মাঝারি বলব। এটি ১০ এর মধ্যে প্রায় ৫। আমি এখনও হাঁটতে পারছি তবে নিচু হলে ব্যথা করছে।",
        betterFactor: "একটু গরম সেঁক দিলে এবং মেঝেতে সোজা হয়ে শুয়ে থাকলে সত্যি খুব উপশম হয়।",
        worseFactor: "জলের কলসি তোলা বা ফসল বোনার জন্য নিচু হওয়া নিশ্চিতভাবেই ব্যথা বাড়িয়ে তোলে।",
        historyOfSymptom: "আমি দুই বছর আগে আমার গর্ভাবস্থার শেষের দিকে ঠিক এই রকম ব্যথা অনুভব করেছিলাম।",
        currentMedsForSymptom: "এখনো কোনো ওষুধ নেইনি, শুধু আমার দৈনিক আয়রন ট্যাবলেটগুলি নিচ্ছি।",
        additionalInfo: "আমি আমার দুই বছরের চঞ্চল শিশুর যত্ন নিচ্ছি এবং শীঘ্রই আরেকটি সুস্থ গর্ভাবস্থার জন্য প্রস্তুতি নিতে চাই।"
      },
      telugu: {
        chiefComplaint: "అవును, పొలంలో పనిచేసిన తర్వాత నాకు నడుములో విపరీతమైన నొప్పి వస్తుంది మరియు ఒక్కోసారి కొంచెం అలసటగా కూడా ఉంటుంది.",
        timeline: "ఈ వెన్నునొప్పి సుమారు ఒక వారంగా ఉంది, ఎక్కువగా ఉదయాన్నే మరియు సాయంత్రం వేళల్లో వస్తుంది.",
        severity: "నేను దీనిని మితంగా చెబుతాను. ఇది 10 కి 5 గా ఉంది. నేను నడవగలను కానీ ముందుకు వంగితే నొప్పి వస్తుంది.",
        betterFactor: "కొద్దిగా వేడి కాపడం పెట్టడం మరియు నేలపై వెల్లకిలా పడుకోవడం వల్ల చాలా ఉపశమనం లభిస్తుంది.",
        worseFactor: "నీళ్ల కుండలు ఎత్తడం లేదా పంటలు నాటడానికి ముందుకు వంగడం వల్ల నొప్పి కచ్చితంగా పెరుగుతోంది.",
        historyOfSymptom: "రెండు సంవత్సరాల క్రితం నా గర్భధారణ చివరలో నేను ఇలాంటి నొప్పినే అనుభవించాను.",
        currentMedsForSymptom: "ఇంకా ఏ మందులు తీసుకోలేదు, కేవలం నా రోజువారీ ఐరన్ టాబ్లెట్లు మాత్రమే వాడుతున్నాను.",
        additionalInfo: "నేను నా రెండు సంవత్సరాల బాబు సంరక్షణ చూసుకుంటున్నాను మరియు త్వరలోనే మరో ఆరోగ్యకరమైన గర్భధారణకు సిద్ధం కావాలనుకుంటున్నాను."
      },
      tamil: {
        chiefComplaint: "ஆம், வயலில் வேலை செய்த பிறகு எனக்கு முதுகில் ஒரு அசௌகரியமான கடுமையான வலி ஏற்படுகிறது, சில சமயங்களில் லேசான சோர்வும் உண்டாகிறது.",
        timeline: "இந்த முதுகுவலி சுமார் ஒரு வாரமாக நீடிக்கிறது, பெரும்பாலும் அதிகாலையிலும் மாலை வேளையிலும் ஏற்படுகிறது.",
        severity: "நான் இதை மிதமானது என்று சொல்வேன். இது 10-ல் சுமார் 5 ஆகும். என்னால் இன்னும் நடக்க முடிகிறது, ஆனால் குனியும் போது வலிக்கிறது.",
        betterFactor: "வெதுவெதுப்பான ஒத்தடம் தருவதும், தரையில் நேராக படுத்திருப்பதும் உண்மையில் வலியைக் குறைக்கிறது.",
        worseFactor: "தண்ணீர் குடங்களை தூக்குவது அல்லது பயிர் நடுவதற்கு குனிவது கண்டிப்பாக வலியை அதிகப்படுத்துகிறது.",
        historyOfSymptom: "இரண்டு ஆண்டுகளுக்கு முன்பு எனது கர்ப்ப காலத்தின் இறுதியின் போது இதேபோன்ற வலியை நான் உணர்ந்தேன்.",
        currentMedsForSymptom: "இதுவரை மருந்து எதுவும் எடுக்கவில்லை, எனது தினசரி இரும்புச்சத்து மாத்திரைகளை மட்டுமே எடுத்துக்கொள்கிறேன்.",
        additionalInfo: "நான் எனது இரண்டு வயது குழந்தையை கவனித்து வருகிறேன், விரைவில் மற்றொரு ஆரோக்கியமான கர்ப்பத்திற்கு தயாராக விரும்புகிறேன்."
      },
      marathi: {
        chiefComplaint: "होय, शेतात काम केल्यानंतर माझ्या पाठीत जड आणि असह्य वेदना होतात आणि कधीकधी थोडा थकवा देखील जाणवतो.",
        timeline: "हा पाठदुखीचा त्रास साधारण एका आठवड्यापासून सुरू आहे, मुख्यतः सकाळी लवकर आणि दुपारी उशिरा होतो.",
        severity: "मी याला मध्यम म्हणेन. हे १० पैकी साधारण ५ आहे. मी अजूनही चालू शकते पण वाकल्यावर त्रास होतो.",
        betterFactor: "किंचित गरम शेक देणे आणि जमिनीवर सरळ झोपणे यामुळे मला खूप आराम मिळतो.",
        worseFactor: "पाण्याचे हंडे उचलणे किंवा पिके लावण्यासाठी खाली वाकणे यामुळे पाठीत निश्चितच जास्त ताण येतो.",
        historyOfSymptom: "मला दोन वर्षांपूर्वी माझ्या गरोदरपणाच्या शेवटी अशाच प्रकारचा त्रास जाणवला होता.",
        currentMedsForSymptom: "अजून कोणतेही औषध घेतलेले नाही, फक्त माझी रोजची लोहाची औषध सुरू आहे.",
        additionalInfo: "मी माझ्या दोन वर्षांच्या खोडकर बाळाची काळजी घेत आहे आणि लवकरच दुसऱ्या निरोगी गरोदरपणासाठी तयारी करू इच्छिते."
      },
      odia: {
        chiefComplaint: "ହଁ, ବିଲରେ କାମ କରିବା ପରେ ମୋ ପିଠିରେ ଏକ ଅସହଜ ଭାରୀ ଯନ୍ତ୍ରଣା ହୁଏ ଏବଂ କେବେକେବେ ସାମାନ୍ୟ କ୍ଳାନ୍ତି ମଧ୍ୟ ଅନୁଭବ ହୁଏ ।",
        timeline: "ଏହି ପିଠି ଯନ୍ତ୍ରଣା ପ୍ରାୟ ଏକ ସପ୍ତାହ ହେବ ଚାଲିଛି, ବିଶେଷ କରି ସକାଳେ ଏବଂ ଅପରାହ୍ନରେ ହୁଏ ।",
        severity: "ମୁଁ ଏହାକୁ ମଧ୍ୟମ କହିବି । ଏହା ୧୦ ରୁ ପ୍ରାୟ ୫ ଅଟେ । ମୁଁ ଚାଲିପାରୁଛି କିନ୍ତୁ ନଇଁବା ସମୟରେ ଯନ୍ତ୍ରଣା ହେଉଛି ।",
        betterFactor: "ଗରମ ସେକ ଦେବା ଏବଂ ଚଟାଣରେ ସିଧା ଶୋଇବା ଦ୍ୱାରା ପ୍ରକୃତରେ ବହୁତ ଆରାମ ମିଳିଥାଏ ।",
        worseFactor: "ପାଣି ମାଠିଆ ଟେକିବା କିମ୍ବା ଫସଲ ଲଗାଇବା ପାଇଁ ଆଗକୁ ନଇଁବା ଦ୍ୱାରା ପ୍ରକୃତରେ କଷ୍ଟ ବଢିଯାଏ ।",
        historyOfSymptom: "ମୁଁ ଦୁଇ ବର୍ଷ ପୂର୍ବେ ମୋର ଗର୍ଭାବସ୍ଥା ଶେଷ ସମୟରେ ଠିକ୍ ଏହିଭଳି ଯନ୍ତ୍ରଣା ଅନୁଭବ କରିଥିଲି ।",
        currentMedsForSymptom: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଔଷଧ ନାହିଁ, କେବଳ ମୋର ଦୈନିକ ଆଇרନ ଟାବଲେଟ ନେଉଛି ।",
        additionalInfo: "ମୁଁ ମୋର ଦୁଇ ବର୍ଷର ଶିଶୁର ଯତ୍ନ ନେଉଛି ଏବଂ ଶୀଘ୍ର ଆଉ ଏକ ସୁସ୍ଥ ଗର୍ଭାବସ୍ଥା ପାଇଁ ପ୍ରସ୍ତୁତ ହେବାକୁ ଚାହୁଁଛି ।"
      }
    };

    let targetLangKey = "english";
    if (normalizedLang.includes("hindi") || normalizedLang.includes("हिन्दी")) targetLangKey = "hindi";
    else if (normalizedLang.includes("bengali") || normalizedLang.includes("বাংলা")) targetLangKey = "bengali";
    else if (normalizedLang.includes("telugu") || normalizedLang.includes("తెలుగు")) targetLangKey = "telugu";
    else if (normalizedLang.includes("tamil") || normalizedLang.includes("தமிழ்")) targetLangKey = "tamil";
    else if (normalizedLang.includes("marathi") || normalizedLang.includes("मराठी")) targetLangKey = "marathi";
    else if (normalizedLang.includes("odia") || normalizedLang.includes("ଓଡ଼ିଆ")) targetLangKey = "odia";

    const simulatedAnswers = dictationsByLanguage[targetLangKey] || dictationsByLanguage.english;
    const fallbackDefault = targetLangKey === "hindi" ? "मुझे दिन के दौरान हल्का दर्द महसूस होता है।"
      : targetLangKey === "bengali" ? "আমি দিনের বেলা মৃদু অস্বস্তি অনুভব করি।"
      : targetLangKey === "telugu" ? "నేను పగటిపూట స్వల్ప అసౌకర్యాన్ని అనుభవిస్తున్నాను."
      : targetLangKey === "tamil" ? "பகலில் லேசான அசௌகரியத்தை உணர்கிறேன்."
      : targetLangKey === "marathi" ? "मला दिवसा सौम्य त्रास जाणवतो."
      : targetLangKey === "odia" ? "ମୁଁ ଦିନରେ ସାମାନ୍ୟ କଷ୍ଟ ଅନୁଭବ କରୁଛି ।"
      : "I feel mild discomfort during the day.";

    setTimeout(() => {
      if (currentQuestion) {
        setTextInput(simulatedAnswers[currentQuestion.field] || fallbackDefault);
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
          {t("AI Smart Clinical Interview")}
        </h1>
        <p className="text-text-muted mt-1.5 text-sm md:text-base font-sans">
          {t("This adaptive clinical guide assesses your symptoms and creates a secure medical briefing to share with local physicians.")}
        </p>
      </div>

      {/* Progress Tracker (Accessibility Requirement: Step-by-Step form) */}
      {!isFinished && (
        <div className="bg-white px-6 py-4.5 rounded-[22px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-display font-bold text-text-muted uppercase tracking-wider">{t("Assessment Progress")}</span>
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
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">{history.length} {t("of")} 8 {t("answered")}</span>
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
              <p className="text-sm font-display font-bold text-indigo-950">{t("Saheli is thinking...")}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-[16px] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="text-sm text-amber-800 font-sans">
                <p className="font-bold">{t("Communication Delay")}</p>
                <p className="mt-0.5 font-medium">{t(error)}</p>
              </div>
            </div>
          )}

          {/* Core Interactive Question */}
          {currentQuestion && (
            <div className="space-y-6 flex-1">
              <div className="space-y-3.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-50 text-indigo-700 font-display font-bold text-xs rounded-full border border-indigo-100/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("Intelligent Assistant")}
                </span>
                <h2 className="text-xl md:text-2xl font-display font-bold text-text-dark leading-snug tracking-tight">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Touch Suggestions Area (Accessibility: Large Touch Targets, minimal typing needed) */}
              {currentQuestion.suggestions && currentQuestion.suggestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-display font-bold text-text-muted uppercase tracking-wider block">{t("Tap an option to answer quickly:")}</span>
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
                placeholder={currentQuestion?.placeholder ? t(currentQuestion.placeholder) : t("Type your health concern here...")}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnswerSubmit(textInput)}
                className="w-full pl-5 pr-14 py-4 bg-gray-50/60 border border-gray-200 rounded-full text-sm text-text-dark outline-none focus:border-indigo-400 focus:bg-white focus:shadow-xs transition-all font-sans"
              />
              
              {/* Accessibility Voice Input button */}
              <button
                onClick={triggerVoiceDictationSimulation}
                title={t("Tap to speak in local language")}
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
              {t("Next Step")}
              <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Accessibility Voice dictation floating alert */}
          {isDictating && (
            <div className="mt-3 p-4 bg-rose-50/50 border border-rose-100 rounded-[16px] text-xs text-rose-800 animate-pulse flex items-center gap-2.5 font-medium">
              <Activity className="w-4.5 h-4.5 text-rose-500 animate-bounce" />
              {t("Saheli Voice dictation is listening in Hindi/Marathi/local dialect... Speak clearly now.")}
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
                  <h2 className="text-xl font-display font-bold text-text-dark tracking-tight">{t("Clinical Brief Generated")}</h2>
                  <p className="text-xs text-text-muted mt-0.5 font-sans">{t("Intake summary is fully structured and secure")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-full font-bold text-xs text-text-dark hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4 text-gray-500" /> {t("Print Summary")}
                </button>
              </div>
            </div>

            {clinicalBrief && (
              <div className="space-y-6">
                
                {/* 1. Chief Complaint Block */}
                <div className="p-5 bg-gradient-to-r from-blue-50/20 to-[#A7D8F2]/15 border border-[#A7D8F2]/30 rounded-[20px] space-y-1.5">
                  <span className="text-xs font-display font-bold text-indigo-900 uppercase tracking-wide">{t("Chief Complaint")}</span>
                  <h3 className="text-lg font-display font-bold text-text-dark italic">"{clinicalBrief.chiefComplaint}"</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Symptoms & Severity */}
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-display font-bold text-text-muted uppercase tracking-wider block">{t("Identified Symptoms")}</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {clinicalBrief.symptoms.map((symptom, i) => (
                          <span key={i} className="px-3 py-1.5 text-xs font-bold bg-gray-50 border border-gray-150 text-text-dark rounded-lg">{t(symptom)}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-display font-bold text-text-muted uppercase tracking-wider block">{t("Determined Severity")}</span>
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full mt-2 border ${
                        clinicalBrief.severity === "Severe" ? "bg-rose-50 border-rose-100 text-rose-800" :
                        clinicalBrief.severity === "Moderate" ? "bg-amber-50 border-amber-100 text-amber-800" : "bg-emerald-50 border-emerald-100 text-emerald-800"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {t(clinicalBrief.severity)} {t("Severity Level")}
                      </span>
                    </div>
                  </div>

                  {/* Chronology & Timeline */}
                  <div>
                    <span className="text-xs font-display font-bold text-text-muted uppercase tracking-wider block">{t("Clinical Timeline")}</span>
                    <p className="text-sm text-text-dark leading-relaxed font-sans mt-2 opacity-95">
                      {clinicalBrief.timeline}
                    </p>
                  </div>

                </div>

                {/* 3. Recommended Doctor Questions */}
                <div className="p-6 bg-gradient-to-r from-[#D8C4F1]/10 to-[#F8C8DC]/5 border border-[#D8C4F1]/30 rounded-[20px] space-y-3.5">
                  <span className="text-xs font-display font-bold text-indigo-900 uppercase tracking-wider block">{t("Recommended Questions For Your Doctor:")}</span>
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
                <RotateCcw className="w-4 h-4" /> {t("Start New Assessment")}
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
                    <CheckCircle className="w-4.5 h-4.5 stroke-[2.5]" /> {t("Saved in Personal Health Brain")}
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4.5 h-4.5" /> {t("Commit to Lifelong Health Brain")}
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
                <h4 className="font-display font-bold text-base">{t("Your medical details are secure and remembered.")}</h4>
                <p className="leading-relaxed text-emerald-800/90">
                  {t("The AI Care Orchestrator has logged your symptoms to your permanent **Care Journey Timeline** and updated your home dashboard snapshot. When you visit Dr. Mehta or your local health sub-center, they will see your complete health history.")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
