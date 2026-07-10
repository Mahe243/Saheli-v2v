import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  X, 
  Send, 
  Compass, 
  Bot, 
  ArrowRight, 
  MapPin, 
  HelpCircle,
  FileText,
  Calendar,
  Activity,
  Award
} from "lucide-react";
import { useTranslation } from "../utils/translation";
import { orchestrator } from "../services/orchestrator";

interface AIGuideBotProps {
  onRedirect: (tab: string, action: string | null) => void;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  tab?: string;
  action?: string | null;
  isRedirectionSuccess?: boolean;
}

// Client-side quick keyword-based classification fallback to handle network/Gemini slowness instantly
function getLocalRedirection(text: string, lang: string) {
  const query = text.toLowerCase().trim();
  let fallbackTab = "Dashboard";
  let fallbackAction: string | null = null;
  let fallbackResponse = "";

  if (query.includes("symptom") || query.includes("fever") || query.includes("pain") || query.includes("headache") || query.includes("cough") || query.includes("cold") || query.includes("vomit") || query.includes("sick") || query.includes("nausea")) {
    fallbackTab = "Dashboard";
    fallbackAction = "open_symptoms_modal";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "मैंने आपके लिए सीधे लक्षण दर्ज करने का विकल्प खोल दिया है! सहेली आपकी सहायता के लिए हमेशा तैयार है।"
      : "I have opened the Symptom Logger for you directly so you can record your vitals and physical signs! Saheli is here to support you.";
  } else if (query.includes("book") || query.includes("schedule") || query.includes("appointment") || query.includes("visit") || query.includes("meet") || query.includes("dr.") || query.includes("doctor")) {
    fallbackTab = "Dashboard";
    fallbackAction = "open_appointment_modal";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "मैंने डॉक्टर अपॉइंटमेंट बुकिंग फॉर्म खोल दिया है! आप यहाँ डॉ. अंजली मेहता या किसी अन्य विशेषज्ञ के साथ अपॉइंटमेंट तय कर सकती हैं।"
      : "I have launched the Appointment Booking assistant for you! You can schedule a visit with Dr. Anjali Mehta or any specialist here.";
  } else if (query.includes("profile") || query.includes("edit name") || query.includes("blood group") || query.includes("emergency") || query.includes("contact") || query.includes("family") || query.includes("lineage") || query.includes("age") || query.includes("height") || query.includes("weight") || query.includes("brain")) {
    fallbackTab = "Personal Health Brain";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "आपको आपके 'पर्सनल हेल्थ ब्रेन' पर ले जाया जा रहा है! यहाँ आप अपनी व्यक्तिगत जानकारी, आपातकालीन संपर्क और परिवार की जानकारी अपडेट कर सकती हैं।"
      : "Redirecting you to your Personal Health Brain! Here you can keep your personal details, emergency contacts, and family lineage updated.";
  } else if (query.includes("chat") || query.includes("interview") || query.includes("talk") || query.includes("conversation") || query.includes("assistant")) {
    fallbackTab = "AI Health Conversation";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "मैं आपको हमारे 'एआई स्वास्थ्य वार्तालाप' टैब पर ले जा रही हूँ। आइए आपकी स्वास्थ्य संबंधी चिंताओं पर विस्तार से बात करें।"
      : "I am redirecting you to our AI Health Conversation tab. Let's talk about your concerns in detail.";
  } else if (query.includes("timeline") || query.includes("journey") || query.includes("milestone") || query.includes("history")) {
    fallbackTab = "Care Journey Timeline";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "आपकी 'केयर जर्नी टाइमलाइन' खोली जा रही है! यहाँ आप अपने संपूर्ण स्वास्थ्य इतिहास और मील के पत्थरों को देख सकती हैं।"
      : "Opening your Care Journey Timeline! Track your complete clinical updates and milestones chronologically here.";
  } else if (query.includes("record") || query.includes("file") || query.includes("pdf") || query.includes("scan") || query.includes("upload") || query.includes("prescription") || query.includes("document")) {
    fallbackTab = "Medical Records";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "आपके 'मेडिकल रिकॉर्ड्स' खोले जा रहे हैं! यहाँ आप पर्ची, टेस्ट रिपोर्ट और दस्तावेज़ अपलोड और देख सकती हैं।"
      : "Opening your Medical Records drawer! You can scan, upload, and view clinical documents, prescriptions, and images here.";
  } else if (query.includes("lab") || query.includes("blood test") || query.includes("test result") || query.includes("biomarker") || query.includes("urine")) {
    fallbackTab = "Lab Intelligence";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "आपको 'लैब इंटेलिजेंस' पर ले जाया जा रहा है। यहाँ आप अपने ब्लड टेस्ट और रिपोर्ट्स का विश्लेषण कर सकती हैं।"
      : "Redirecting you to Lab Intelligence. Here you can analyze biomarker deviations, review blood test histories, and track reference thresholds.";
  } else if (query.includes("companion") || query.includes("briefing") || query.includes("prep") || query.includes("dr. anjali") || query.includes("anjali") || query.includes("physician guide")) {
    fallbackTab = "Doctor Companion";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "आपके 'डॉक्टर कंपेनियन' पर ले जाया जा रहा है! डॉक्टर के पास जाने से पहले अपने प्रश्नों की सूची यहाँ तैयार करें।"
      : "Navigating to your Doctor Companion! Prepare a custom pre-visit guide with list of questions and sync with Dr. Anjali Mehta.";
  } else if (query.includes("medication") || query.includes("pill") || query.includes("reminder") || query.includes("adherence") || query.includes("medicine") || query.includes("tablet") || query.includes("dose") || query.includes("iron") || query.includes("folic")) {
    fallbackTab = "Medication Dashboard";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "आपका 'दवाइयाँ डैशबोर्ड' खोला जा रहा है। अपनी दैनिक दवाओं का विवरण और अनुस्मारक यहाँ देखें।"
      : "Opening your Medication Dashboard. Check your scheduled therapy compliance and log daily reminders safely.";
  } else if (query.includes("preventive") || query.includes("screening") || query.includes("icmr") || query.includes("vaccine") || query.includes("booster") || query.includes("mammography")) {
    fallbackTab = "Preventive Care";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "आपको 'निवारक देखभाल' (Preventive Care) इंजन पर ले जाया जा रहा है! अपनी आयु के अनुसार आवश्यक टीकों और जाँचों की सूची यहाँ देखें।"
      : "Redirecting to your Preventive Care Engine! Review vaccination calendars and screening guidelines calibrated to your age.";
  } else if (query.includes("logs") || query.includes("orchestrator") || query.includes("system") || query.includes("event") || query.includes("cascade")) {
    fallbackTab = "Orchestrator Logs";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "सिस्टम लॉग्स खोले जा रहे हैं!"
      : "Navigating to Orchestrator Logs! You can view secure clinical cascades and technical system logs here.";
  } else if (query.includes("settings") || query.includes("language") || query.includes("theme") || query.includes("mfa") || query.includes("privacy")) {
    fallbackTab = "Settings";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "सेटिंग्स खोली जा रही हैं! यहाँ आप भाषा और गोपनीयता विकल्पों को बदल सकती हैं।"
      : "Redirecting to Settings! Here you can manage your preferred language, multi-factor authentication, and privacy sharing consent.";
  } else {
    fallbackTab = "Dashboard";
    fallbackResponse = lang.toLowerCase().includes("hindi") || lang.toLowerCase().includes("हिन्दी")
      ? "सहेली में आपका स्वागत है! आइए होम डैशबोर्ड पर चलें जहाँ आप अपना स्वास्थ्य सारांश देख सकती हैं।"
      : "Welcome to Saheli! Let me guide you to the home dashboard where you can see your complete clinical health summary.";
  }

  return { tab: fallbackTab, action: fallbackAction, response: fallbackResponse };
}

export default function AIGuideBot({ onRedirect }: AIGuideBotProps) {
  const { t, currentLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when opened or language changes
  useEffect(() => {
    const welcomeText = currentLanguage.toLowerCase().includes("hindi") || currentLanguage.toLowerCase().includes("हिन्दी")
      ? "नमस्ते! मैं आपकी सखी। मुझसे पूछें कि कोई भी फीचर कहाँ है या आप क्या करना चाहती हैं (जैसे: 'मुझे पर्ची अपलोड करनी है', 'मेरा ब्लड टेस्ट रिपोर्ट कहाँ है?', 'मुझे बुखार है', या 'अपॉइंटमेंट कैसे बुक करूँ?'), और मैं आपको सीधे वहीं ले जाऊँगी!"
      : "Hello! I am your Sakhi. Ask me where any feature is or what you want to do (e.g. 'Where do I upload prescriptions?', 'I need to check biomarkers', 'I have a fever', or 'How to schedule a clinic visit?'), and I will redirect you there instantly!";

    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: welcomeText
      }
    ]);
  }, [currentLanguage]);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Suggestion options to assist users
  const suggestions = currentLanguage.toLowerCase().includes("hindi") || currentLanguage.toLowerCase().includes("हिन्दी")
    ? [
        { label: "मुझे बुखार है 🤒", query: "मुझे बुखार है" },
        { label: "पर्ची और रिपोर्ट्स 📄", query: "मुझे पर्ची अपलोड करनी है" },
        { label: "अपॉइंटमेंट बुक करें 📅", query: "डॉक्टर अपॉइंटमेंट बुक करना है" },
        { label: "वैक्सीन और स्क्रीनिंग 💉", query: "टीकाकरण और स्क्रीनिंग कहाँ है?" }
      ]
    : [
        { label: "I have a fever 🤒", query: "I have a fever" },
        { label: "Upload reports 📄", query: "Where do I upload reports and prescriptions?" },
        { label: "Book Appointment 📅", query: "How do I schedule a doctor appointment?" },
        { label: "Preventive care list 💉", query: "Show me vaccination calendar and preventive screening guide" }
      ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch("/api/gemini/find-feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          preferredLanguage: currentLanguage
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed response status");
      }

      const data = await response.json();

      const botMsg: Message = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        sender: "bot",
        text: data.response || "I have navigated you to the requested tab.",
        tab: data.tab,
        action: data.action,
        isRedirectionSuccess: !!data.tab
      };

      setMessages(prev => [...prev, botMsg]);

      // Execute redirect if matched tab/action found
      if (data.tab) {
        setTimeout(() => {
          onRedirect(data.tab, data.action || null);
          
          // Log orchestrator event for visibility in Tech logs
          orchestrator.getSystemLogs().unshift({
            type: "health_summary_updated", // Reusing standard type for reactivity
            payload: {
              title: `AI Redirected via Guide Bot`,
              description: `Redirected to Tab: "${data.tab}" ${data.action ? `with Action: "${data.action}"` : ""}`
            },
            timestamp: new Date().toISOString()
          });
        }, 800);
      }

    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("Server call failed or timed out. Falling back to local classifier.", err);
      
      const localResult = getLocalRedirection(textToSend, currentLanguage);

      const botMsg: Message = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        sender: "bot",
        text: localResult.response,
        tab: localResult.tab,
        action: localResult.action,
        isRedirectionSuccess: true
      };

      setMessages(prev => [...prev, botMsg]);

      // Execute redirect instantly via local classification
      if (localResult.tab) {
        setTimeout(() => {
          onRedirect(localResult.tab, localResult.action || null);
          
          orchestrator.getSystemLogs().unshift({
            type: "health_summary_updated",
            payload: {
              title: `Local AI Redirected via Guide Bot`,
              description: `Redirected to Tab: "${localResult.tab}" ${localResult.action ? `with Action: "${localResult.action}"` : ""}`
            },
            timestamp: new Date().toISOString()
          });
        }, 800);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. Floating Action Trigger Button with pulsing glowing state */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-4 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl hover:shadow-indigo-500/30 flex items-center justify-center cursor-pointer group border border-white/20"
          title="Sakhi"
        >
          {/* Animated background ping ring */}
          <span className="absolute inset-0 rounded-full bg-indigo-500/40 animate-ping -z-10" />
          
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="flex items-center gap-2">
              <Compass className="w-6 h-6 animate-spin-slow text-white" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-28 transition-all duration-500 ease-out font-display font-bold text-xs whitespace-nowrap text-white pr-1">
                {t("App Guide")}
              </span>
            </div>
          )}
        </motion.button>
      </div>

      {/* 2. Collapsible Chat Bubble Overlay Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white rounded-[28px] shadow-[0_20px_60px_rgba(79,70,229,0.15)] border border-gray-100/80 flex flex-col overflow-hidden z-50"
          >
            {/* Header Banner - Rich indigo background with design detail */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-4 pb-5 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10 text-white shadow-inner animate-pulse">
                  <Sparkles className="w-5 h-5 text-pink-300" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
                    {t("Sakhi")}
                  </h4>
                  <p className="text-[10px] text-white/80 font-sans tracking-wide">
                    {t("Instant redirection to all tools")}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Log Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
            >
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div 
                    key={msg.id}
                    className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-2 max-w-[88%] ${isBot ? "mr-auto" : "ml-auto"}`}
                  >
                    {isBot && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                        <Bot className="w-4 h-4 text-indigo-500" />
                      </div>
                    )}
                    
                    <div className="space-y-1.5">
                      <div className={`p-3.5 rounded-2xl text-xs font-sans font-medium shadow-xs leading-relaxed ${
                        isBot 
                          ? "bg-white text-text-dark border border-gray-100 rounded-tl-xs" 
                          : "bg-indigo-600 text-white rounded-tr-xs"
                      }`}>
                        {msg.text}
                      </div>

                      {/* Redirection indicator block */}
                      {isBot && msg.tab && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center gap-2 text-[10px] font-sans font-bold"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          <span>
                            {t("Redirecting directly to:")} <span className="underline">{t(msg.tab)}</span>
                            {msg.action && ` (${msg.action})`}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing Dot Loader */}
              {isLoading && (
                <div className="flex justify-start items-center gap-2 mr-auto max-w-[80%]">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    <Bot className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="p-3 bg-white text-gray-400 border border-gray-100 rounded-2xl rounded-tl-xs flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions Shelf */}
            {messages.length === 1 && !isLoading && (
              <div className="p-3 bg-white border-t border-gray-50 space-y-1.5">
                <p className="text-[10px] font-display font-bold text-text-muted uppercase tracking-wider pl-1 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-indigo-400" />
                  {t("Suggested Map Enquiries")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug.query)}
                      className="text-[10px] px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 text-text-muted font-sans font-semibold rounded-full transition-all cursor-pointer text-left"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Text Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputVal);
              }}
              className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  currentLanguage.toLowerCase().includes("hindi") || currentLanguage.toLowerCase().includes("हिन्दी")
                    ? "पूछें: यह सुविधा कहाँ है?"
                    : "Ask me: 'Where is...?'"
                }
                className="flex-1 bg-slate-50 border border-gray-100 hover:border-gray-200 focus:border-indigo-500 focus:bg-white outline-none rounded-xl px-3 py-2 text-xs font-sans transition-all text-text-dark placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className={`p-2.5 bg-indigo-600 text-white rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer ${
                  (!inputVal.trim() || isLoading) 
                    ? "opacity-40 cursor-not-allowed bg-slate-400 shadow-none" 
                    : "hover:bg-indigo-700 hover:scale-105 active:scale-95"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
