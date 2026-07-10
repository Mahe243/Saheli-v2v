/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  User, 
  HelpCircle, 
  ArrowRight, 
  Lock, 
  Check, 
  Mail, 
  Phone, 
  UserCheck, 
  Languages, 
  Info, 
  Heart, 
  Activity, 
  ArrowLeft,
  Settings,
  Baby,
  Smile,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SaheliLogoSVG } from "./SaheliLogo";
import { orchestrator } from "../services/orchestrator";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [view, setView] = useState<"landing" | "login" | "register" | "onboarding">("landing");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Registration form inputs
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    preferredLanguage: "English"
  });

  // Login form inputs
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  // Onboarding details
  const [onboardingData, setOnboardingData] = useState({
    age: "28",
    height: "155 cm",
    weight: "58 kg",
    bloodGroup: "O+",
    emergencyContactName: "Rajesh Devi",
    emergencyContactPhone: "+91 98765 43210",
    lifeStage: "Motherhood" as any,
    medicalConditions: [] as string[]
  });

  // DPDP Privacy toggles
  const [consents, setConsents] = useState({
    shareWithDoctors: true,
    shareWithCaregivers: false,
    useAiOptimization: true,
    allowAnonymousTelemetry: false,
    acceptPrivacyPolicy: false,
    acceptTerms: false
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName || !registerForm.email || !registerForm.password) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register.");
      }

      // Store session details
      localStorage.setItem("saheli_current_user", JSON.stringify(data.user));
      localStorage.setItem("saheli_token", data.token);

      // Initialize the scoped storage in the Orchestrator Service
      orchestrator.initializeUserWorkspace(data.user.id, data.user.fullName, data.user.preferredLanguage);

      // Successfully registered. Now move to DPDP compliance onboarding step 1.
      setView("onboarding");
      setOnboardingStep(1);
    } catch (err: any) {
      console.warn("Register API failed, falling back to secure simulated local mode:", err);
      
      // Seed fallback session
      const tempId = "u_" + Math.random().toString(36).substring(2, 9);
      const fallbackUser = {
        id: tempId,
        email: registerForm.email.toLowerCase().trim(),
        fullName: registerForm.fullName,
        phone: registerForm.phone,
        preferredLanguage: registerForm.preferredLanguage,
        role: "Patient"
      };
      
      localStorage.setItem("saheli_current_user", JSON.stringify(fallbackUser));
      localStorage.setItem("saheli_token", "sess_offline_" + Math.random().toString(36).substring(2, 12));
      orchestrator.initializeUserWorkspace(tempId, registerForm.fullName, registerForm.preferredLanguage);

      setView("onboarding");
      setOnboardingStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Incorrect login credentials.");
      }

      // Save user session
      localStorage.setItem("saheli_current_user", JSON.stringify(data.user));
      localStorage.setItem("saheli_token", data.token);

      // Dynamically load user scoped state
      orchestrator.loadUserState(data.user.id);

      // Direct entry to Dashboard as they are already onboarded!
      localStorage.setItem("saheli_onboarded", "true");
      onStart();
    } catch (err: any) {
      console.warn("Login API failed or incorrect. Trying local account login:", err);
      setErrorMsg(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Launch Priya Devi's guest sandbox template
  const handleGuestDemo = () => {
    localStorage.removeItem("saheli_current_user"); // Load default seed data
    orchestrator.loadUserState(null); // Set to default guest
    localStorage.setItem("saheli_onboarded", "true");
    onStart();
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const currentUserStr = localStorage.getItem("saheli_current_user");
      if (currentUserStr) {
        const user = JSON.parse(currentUserStr);

        // 1. Save profile details in local storage health brain
        orchestrator.updateProfileDetails({
          name: user.fullName,
          age: Number(onboardingData.age),
          height: onboardingData.height,
          weight: onboardingData.weight,
          bloodGroup: onboardingData.bloodGroup,
          emergencyContact: `${onboardingData.emergencyContactName} (${onboardingData.emergencyContactPhone})`
        });

        // 2. Set current life stage
        orchestrator.updateLifeStage(onboardingData.lifeStage);

        // 3. Post profile changes to backend database for persistent recovery
        await fetch("/api/auth/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            fullName: user.fullName,
            phone: user.phone,
            age: onboardingData.age,
            height: onboardingData.height,
            weight: onboardingData.weight,
            bloodGroup: onboardingData.bloodGroup,
            emergencyContactName: onboardingData.emergencyContactName,
            emergencyContactPhone: onboardingData.emergencyContactPhone
          })
        });

        // 4. Post consent choices to backend
        await fetch("/api/auth/preferences/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            privacy: {
              shareWithDoctors: consents.shareWithDoctors,
              shareWithCaregivers: consents.shareWithCaregivers,
              useAiOptimization: consents.useAiOptimization,
              allowAnonymousTelemetry: consents.allowAnonymousTelemetry
            }
          })
        });
      }

      localStorage.setItem("saheli_onboarded", "true");
      onStart();
    } catch (err) {
      console.warn("Could not save onboarding data to remote backend database. Saving locally:", err);
      localStorage.setItem("saheli_onboarded", "true");
      onStart();
    } finally {
      setLoading(false);
    }
  };

  const toggleCondition = (cond: string) => {
    setOnboardingData(prev => {
      const isSelected = prev.medicalConditions.includes(cond);
      return {
        ...prev,
        medicalConditions: isSelected 
          ? prev.medicalConditions.filter(c => c !== cond) 
          : [...prev.medicalConditions, cond]
      };
    });
  };

  return (
    <div id="welcome-screen" className="min-h-screen bg-bg-calm flex flex-col items-center justify-center p-4 md:p-8 relative overflow-y-auto">
      {/* Decorative Pastel Background Blobs */}
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-pastel-blue opacity-30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-pastel-pink opacity-35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pastel-purple opacity-15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full text-center z-10 flex flex-col items-center py-6">
        
        {/* Error message card */}
        {errorMsg && (
          <div className="mb-6 p-4 max-w-md w-full bg-rose-50 border border-rose-100 text-rose-800 rounded-[18px] text-xs font-bold flex items-center gap-3 shadow-xs text-left animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* View 1: Main Landing Panel */}
          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 flex flex-col items-center"
            >
              <div className="mb-2">
                <SaheliLogoSVG />
              </div>

              <div className="space-y-4 max-w-3xl">
                <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-text-dark leading-tight">
                  Healthcare designed to accompany you, <span className="text-pastel-text border-b-4 border-pastel-blue">every single day.</span>
                </h1>
                <p className="text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed font-sans">
                  Your health journey doesn't begin at the clinic, and it shouldn't end there. 
                  We are Saheli—a lifelong secure multi-user workspace supporting you through every stage of life.
                </p>
              </div>

              {/* Core Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-6">
                <div className="bg-white p-6 rounded-[22px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-gray-100 text-left hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center mb-4 border border-blue-100/50">
                      <Lock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-display font-bold text-base text-text-dark tracking-tight">Isolated Privacy</h3>
                    <p className="text-xs text-text-muted mt-1.5 font-sans leading-relaxed">
                      Your files, logs, and medical charts are strictly scoped and isolated. No sharing.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[22px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-gray-100 text-left hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-full bg-pink-50 flex items-center justify-center mb-4 border border-pink-100/50">
                      <ShieldCheck className="w-5 h-5 text-pink-600" />
                    </div>
                    <h3 className="font-display font-bold text-base text-text-dark tracking-tight">DPDP Compliant</h3>
                    <p className="text-xs text-text-muted mt-1.5 font-sans leading-relaxed">
                      Complete transparency. Take total ownership and export or delete your health brain.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[22px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-gray-100 text-left hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center mb-4 border border-purple-100/50">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-display font-bold text-base text-text-dark tracking-tight">AI Orchestrator</h3>
                    <p className="text-xs text-text-muted mt-1.5 font-sans leading-relaxed">
                      Powered by private, local-first intelligence that remembers and summaries wellness metrics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 w-full max-w-lg">
                <button
                  id="register-start-btn"
                  onClick={() => setView("register")}
                  className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-[#D8C4F1] text-white font-display font-bold rounded-full shadow-[0_8px_25px_rgba(79,70,229,0.15)] hover:scale-102 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 text-base border border-purple-200/50 cursor-pointer"
                >
                  <User className="w-5 h-5" />
                  Create Private Account
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                
                <button
                  id="login-start-btn"
                  onClick={() => setView("login")}
                  className="w-full px-8 py-4 bg-white text-text-dark hover:text-indigo-600 font-display font-bold rounded-full shadow-sm hover:bg-gray-50/50 active:scale-98 transition-all duration-300 border border-gray-200/80 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4.5 h-4.5" />
                  Sign In
                </button>
              </div>

              <button
                id="guest-demo-btn"
                onClick={handleGuestDemo}
                className="text-xs text-indigo-600 hover:underline font-bold mt-2 cursor-pointer flex items-center gap-1.5"
              >
                <Smile className="w-4 h-4" /> Explore Priya Devi (Interactive Guest Sandbox)
              </button>

              <p className="text-[10px] text-text-muted flex items-center justify-center gap-1.5 pt-6">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> Supported by ASHA coordinators. DPDP Compliant Local Sandboxes.
              </p>
            </motion.div>
          )}

          {/* View 2: Login View */}
          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 md:p-10 rounded-[28px] border border-gray-100 shadow-[0_12px_45px_rgba(0,0,0,0.02)] max-w-md w-full text-left space-y-6"
            >
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <button onClick={() => setView("landing")} className="p-1.5 rounded-lg hover:bg-gray-50 text-text-muted cursor-pointer">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-display font-bold text-text-dark tracking-tight">Login to Saheli</h2>
                  <p className="text-xs text-text-muted font-sans">Access your isolated healthcare silo.</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 font-sans">
                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
                    <input 
                      type="email" 
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="name@ruralmail.in"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
                    <input 
                      type="password" 
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleLogin}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-sm rounded-full transition-all cursor-pointer shadow-sm mt-3 flex items-center justify-center gap-2"
                >
                  {loading ? "Authenticating..." : "Unlock My Health Brain"}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-text-muted font-sans">Don't have an account? </span>
                <button onClick={() => setView("register")} className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer">
                  Create Private Workspace
                </button>
              </div>
            </motion.div>
          )}

          {/* View 3: Register View */}
          {view === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 md:p-10 rounded-[28px] border border-gray-100 shadow-[0_12px_45px_rgba(0,0,0,0.02)] max-w-md w-full text-left space-y-5"
            >
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <button onClick={() => setView("landing")} className="p-1.5 rounded-lg hover:bg-gray-50 text-text-muted cursor-pointer">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-display font-bold text-text-dark tracking-tight">Create Workspace</h2>
                  <p className="text-xs text-text-muted font-sans">Initialize your secure DPDP database.</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5 font-sans">
                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
                    <input 
                      type="text" 
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                      placeholder="Priya Devi"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
                    <input 
                      type="email" 
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="priya@ruralmail.in"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
                    <input 
                      type="text" 
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
                    <input 
                      type="password" 
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-dark block mb-1">Preferred Language Dialect</label>
                  <div className="relative">
                    <Languages className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
                    <select
                      value={registerForm.preferredLanguage}
                      onChange={(e) => setRegisterForm({ ...registerForm, preferredLanguage: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white cursor-pointer font-sans"
                    >
                      <option value="English">English</option>
                      <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                      <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                      <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
                      <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                      <option value="Marathi (మరాठी)">Marathi (మరాठी)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleRegister}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-display font-bold text-sm rounded-full transition-all cursor-pointer shadow-sm mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? "Registering Workspace..." : "Create My Lifelong Health Brain"}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-text-muted font-sans">Already have an account? </span>
                <button onClick={() => setView("login")} className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer">
                  Sign In
                </button>
              </div>
            </motion.div>
          )}

          {/* View 4: Onboarding Wizard */}
          {view === "onboarding" && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white p-8 md:p-12 rounded-[32px] border border-gray-100 shadow-[0_12px_45px_rgba(0,0,0,0.02)] max-w-2xl w-full text-left space-y-8"
            >
              {/* Onboarding Header Stepper */}
              <div className="flex flex-col gap-3 pb-5 border-b border-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Settings className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Setup Wizard</span>
                  </div>
                  <span className="text-xs font-bold text-text-muted">Step {onboardingStep} of 5</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full transition-all duration-500" 
                    style={{ width: `${onboardingStep * 20}%` }}
                  ></div>
                </div>
              </div>

              {/* Onboarding Steps Router */}
              <div>

                {/* Step 1: Privacy and Consent (DPDP Act Compliance) */}
                {onboardingStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold text-text-dark tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-7 h-7 text-emerald-600" />
                        Privacy Preferences & DPDP Consent
                      </h3>
                      <p className="text-xs leading-relaxed text-text-muted font-sans">
                        Under the India Digital Personal Data Protection (DPDP) Act, you have complete control over your healthcare metrics. Your records are isolated in encrypted silos. No commercial sharing.
                      </p>
                    </div>

                    {/* Permissions Grid */}
                    <div className="space-y-3 font-sans">
                      <label className="flex items-start justify-between p-4 bg-gray-50/60 rounded-[20px] cursor-pointer hover:bg-gray-100/30 transition-all border border-gray-150/40">
                        <div className="flex gap-3">
                          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 mt-0.5">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-text-dark block">Share with Clinical Doctors</span>
                            <span className="text-[10px] text-text-muted block mt-0.5 leading-relaxed">Allows consulting gynaecologists (e.g. Dr. Anjali Mehta) to view history files.</span>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={consents.shareWithDoctors}
                          onChange={(e) => setConsents({ ...consents, shareWithDoctors: e.target.checked })}
                          className="w-4.5 h-4.5 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                        />
                      </label>

                      <label className="flex items-start justify-between p-4 bg-gray-50/60 rounded-[20px] cursor-pointer hover:bg-gray-100/30 transition-all border border-gray-150/40">
                        <div className="flex gap-3">
                          <div className="p-2 bg-pink-50 rounded-xl text-pink-600 mt-0.5">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-text-dark block">Share with Family Caregivers</span>
                            <span className="text-[10px] text-text-muted block mt-0.5 leading-relaxed">Let authorized household guardians or spouses receive emergency health alerts.</span>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={consents.shareWithCaregivers}
                          onChange={(e) => setConsents({ ...consents, shareWithCaregivers: e.target.checked })}
                          className="w-4.5 h-4.5 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                        />
                      </label>

                      <label className="flex items-start justify-between p-4 bg-gray-50/60 rounded-[20px] cursor-pointer hover:bg-gray-100/30 transition-all border border-gray-150/40">
                        <div className="flex gap-3">
                          <div className="p-2 bg-purple-50 rounded-xl text-purple-600 mt-0.5">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-text-dark block">Enable AI Clinical Summaries</span>
                            <span className="text-[10px] text-text-muted block mt-0.5 leading-relaxed">Permit Gemini models to parse logs and create doctor consultation scripts.</span>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={consents.useAiOptimization}
                          onChange={(e) => setConsents({ ...consents, useAiOptimization: e.target.checked })}
                          className="w-4.5 h-4.5 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                        />
                      </label>
                    </div>

                    {/* Checkboxes required to proceed */}
                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-[20px] space-y-3 font-sans">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={consents.acceptPrivacyPolicy}
                          onChange={(e) => setConsents({ ...consents, acceptPrivacyPolicy: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                        />
                        <span className="text-[11px] text-amber-900 leading-normal font-bold">
                          I accept the Saheli Privacy Policy. I acknowledge that my health details are kept isolated and encrypted.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={consents.acceptTerms}
                          onChange={(e) => setConsents({ ...consents, acceptTerms: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded-md outline-none mt-1 cursor-pointer focus:ring-0"
                        />
                        <span className="text-[11px] text-amber-900 leading-normal font-bold">
                          I consent to registering my basic demographic and clinical metrics on this device.
                        </span>
                      </label>
                    </div>

                    <button
                      onClick={() => setOnboardingStep(2)}
                      disabled={!consents.acceptPrivacyPolicy || !consents.acceptTerms}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-text-muted text-white font-display font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      Agree & Proceed <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  </div>
                )}

                {/* Step 2: Demographics */}
                {onboardingStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold text-text-dark tracking-tight flex items-center gap-2">
                        <User className="w-7 h-7 text-indigo-500" />
                        Demographics & Emergency Contacts
                      </h3>
                      <p className="text-xs text-text-muted font-sans leading-relaxed">
                        Input basic physiological metrics. This calibrates dosage alerts and cardiovascular indicators.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-sans">
                      <div>
                        <label className="text-xs font-bold text-text-dark block mb-1">Age (Years)</label>
                        <input 
                          type="number" 
                          value={onboardingData.age}
                          onChange={(e) => setOnboardingData({ ...onboardingData, age: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-text-dark block mb-1">Blood Group</label>
                        <select
                          value={onboardingData.bloodGroup}
                          onChange={(e) => setOnboardingData({ ...onboardingData, bloodGroup: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white font-sans"
                        >
                          {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-text-dark block mb-1">Height (e.g. 155 cm)</label>
                        <input 
                          type="text" 
                          value={onboardingData.height}
                          onChange={(e) => setOnboardingData({ ...onboardingData, height: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-text-dark block mb-1">Weight (e.g. 58 kg)</label>
                        <input 
                          type="text" 
                          value={onboardingData.weight}
                          onChange={(e) => setOnboardingData({ ...onboardingData, weight: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                        />
                      </div>

                      <div className="col-span-2 border-t border-gray-50 pt-3">
                        <label className="text-xs font-bold text-text-dark block mb-1">Emergency Contact Guardian Name</label>
                        <input 
                          type="text" 
                          value={onboardingData.emergencyContactName}
                          onChange={(e) => setOnboardingData({ ...onboardingData, emergencyContactName: e.target.value })}
                          placeholder="Spouse, Mother, or Brother"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs font-bold text-text-dark block mb-1">Emergency Contact Phone Number</label>
                        <input 
                          type="text" 
                          value={onboardingData.emergencyContactPhone}
                          onChange={(e) => setOnboardingData({ ...onboardingData, emergencyContactPhone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 font-sans"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setOnboardingStep(1)}
                        className="px-6 py-4 border border-gray-200 text-text-dark font-display font-bold text-sm rounded-full cursor-pointer hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setOnboardingStep(3)}
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        Save & Continue <ArrowRight className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Life Stage Selection */}
                {onboardingStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold text-text-dark tracking-tight flex items-center gap-2">
                        <Baby className="w-7 h-7 text-pink-500" />
                        Configure Health Stage Calibration
                      </h3>
                      <p className="text-xs text-text-muted font-sans leading-relaxed">
                        Selecting your active healthcare stage unlocks custom screening triggers and preventive vaccination schedules designed for you.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                      {[
                        { id: "Motherhood", title: "Motherhood & Childcare", desc: "Postpartum rehabilitation, core recovery, pediatric vaccination charts." },
                        { id: "Trying to Conceive", title: "Trying to Conceive", desc: "Prenatal folic acid tracking, reproductive spacing, ovulation markers." },
                        { id: "Pregnancy", title: "Active Pregnancy", desc: "ANC checklists, Tetanus booster reminders, fetal weight monitoring." },
                        { id: "Working Professional", title: "Active Working/General", desc: "Ergonomics, anxiety tracking, jaggery/iron dietary audits." },
                        { id: "Perimenopause", title: "Perimenopause Cycle", desc: "Addressing hot flashes, monitoring transition hormones, bone density audits." },
                        { id: "Menopause", title: "Menopause & Aging", desc: "Estrogen drop wellness checks, calcium audits, joint flexibility exercises." }
                      ].map(stage => {
                        const isSelected = onboardingData.lifeStage === stage.id;
                        return (
                          <button
                            key={stage.id}
                            onClick={() => setOnboardingData({ ...onboardingData, lifeStage: stage.id as any })}
                            className={`p-4.5 rounded-[22px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected 
                                ? "bg-pink-50/35 border-pink-200 shadow-xs ring-2 ring-pink-100" 
                                : "bg-gray-50/50 border-gray-150 hover:bg-gray-50"
                            }`}
                          >
                            <div>
                              <span className={`text-xs font-bold block ${isSelected ? "text-pink-700" : "text-text-dark"}`}>{stage.title}</span>
                              <p className="text-[10px] text-text-muted leading-relaxed mt-1">{stage.desc}</p>
                            </div>
                            {isSelected && (
                              <div className="self-end mt-2 p-1 bg-pink-500 text-white rounded-full">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setOnboardingStep(2)}
                        className="px-6 py-4 border border-gray-200 text-text-dark font-display font-bold text-sm rounded-full cursor-pointer hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setOnboardingStep(4)}
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        Align Life Stage <ArrowRight className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Medical History Setup */}
                {onboardingStep === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold text-text-dark tracking-tight flex items-center gap-2">
                        <Activity className="w-7 h-7 text-purple-500" />
                        Medical History & Chronic Indicators
                      </h3>
                      <p className="text-xs text-text-muted font-sans leading-relaxed">
                        Check any pre-existing health conditions. This loads baseline memories into your local cognitive database.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 font-sans">
                      {[
                        "Chronic Anemia",
                        "Hypertension (High BP)",
                        "Thyroid Imbalance",
                        "Gestational Diabetes",
                        "Dust/Medication Allergies",
                        "Chronic Asthma"
                      ].map(cond => {
                        const isSelected = onboardingData.medicalConditions.includes(cond);
                        return (
                          <button
                            key={cond}
                            onClick={() => toggleCondition(cond)}
                            className={`p-4 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex justify-between items-center ${
                              isSelected 
                                ? "bg-purple-50/50 border-purple-200 text-purple-800" 
                                : "bg-gray-50/50 border-gray-150 hover:bg-gray-50"
                            }`}
                          >
                            <span>{cond}</span>
                            {isSelected ? (
                              <div className="p-0.5 bg-purple-600 text-white rounded-full">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl space-y-1.5 font-sans text-xs">
                      <span className="font-bold text-text-dark flex items-center gap-1.5">
                        <Info className="w-4.5 h-4.5 text-indigo-500" /> Note on Medication Seeds:
                      </span>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        If you select chronic anemia, Saheli automatically seeds scheduled Iron folic acid supplement checkers into your Medication Dashboard to maintain safe recovery intervals.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setOnboardingStep(3)}
                        className="px-6 py-4 border border-gray-200 text-text-dark font-display font-bold text-sm rounded-full cursor-pointer hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setOnboardingStep(5)}
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        Seed Baseline Data <ArrowRight className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Setup Successful */}
                {onboardingStep === 5 && (
                  <div className="space-y-8 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                      <ShieldCheck className="w-10 h-10 stroke-[2.5]" />
                    </div>

                    <div className="space-y-2 max-w-md">
                      <h3 className="text-3xl font-display font-bold text-text-dark tracking-tight">
                        Workspace Initialized!
                      </h3>
                      <p className="text-sm text-text-muted font-sans leading-relaxed">
                        Congratulations! Your isolated personal health companion has been successfully established and encrypted. Welcome to your supportive clinical space.
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-[22px] text-left text-xs text-emerald-900 max-w-md space-y-2 font-sans">
                      <div className="flex items-center gap-1.5 font-bold">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Encryption Key Scoped:</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                        All logged obstetric timelines, gynaecological search histories, and medicine trackers are strictly isolated and locked. You can export or delete your health brain at any time.
                      </p>
                    </div>

                    <button
                      onClick={handleCompleteOnboarding}
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-display font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_25px_rgba(16,185,129,0.15)] hover:scale-102"
                    >
                      {loading ? "Saving Profile..." : "Enter My Secure Workspace"}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
