/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, Sparkles, User, HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { SaheliLogoSVG, SaheliAppIconSVG } from "./SaheliLogo";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div id="welcome-screen" className="min-h-screen bg-bg-calm flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Decorative Pastel Background Blobs */}
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-pastel-blue opacity-30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-pastel-pink opacity-35 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pastel-purple opacity-20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full text-center z-10 space-y-8 flex flex-col items-center">
        {/* Main Landing Logo (Reconstruction of user's provided picture) */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-2"
        >
          <SaheliLogoSVG />
        </motion.div>

        {/* Dynamic Display Typography */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4 max-w-3xl"
        >
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-text-dark leading-tight">
            Healthcare designed to companion you, <span className="text-pastel-text border-b-4 border-pastel-blue">every single day.</span>
          </h1>
          <p className="text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed font-sans">
            Your health journey doesn't begin at the clinic, and it shouldn't end there. 
            We are Saheli—a lifelong personal health companion supporting you through every stage of life.
          </p>
        </motion.div>

        {/* Core Value Pillars for Quick Onboarding */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-6"
        >
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-[22px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 text-left hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#A7D8F2]/30 to-[#A7D8F2]/5 flex items-center justify-center mb-5 border border-[#A7D8F2]/40">
                <Sparkles className="w-5 h-5 text-indigo-600/80" />
              </div>
              <h3 className="font-display font-bold text-lg text-text-dark tracking-tight">Always Remembers</h3>
              <p className="text-sm text-text-muted mt-2 font-sans leading-relaxed">
                Continuously updates your Lifelong Health Brain with zero hassle or stress.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-[22px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 text-left hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#F8C8DC]/40 to-[#F8C8DC]/5 flex items-center justify-center mb-5 border border-[#F8C8DC]/50">
                <ShieldCheck className="w-5 h-5 text-pink-600/80" />
              </div>
              <h3 className="font-display font-bold text-lg text-text-dark tracking-tight">Warm & Supportive</h3>
              <p className="text-sm text-text-muted mt-2 font-sans leading-relaxed">
                Designed with local health workers for maximum warmth, safety, and readability.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-[22px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 text-left hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#D8C4F1]/40 to-[#D8C4F1]/5 flex items-center justify-center mb-5 border border-[#D8C4F1]/50">
                <User className="w-5 h-5 text-purple-600/80" />
              </div>
              <h3 className="font-display font-bold text-lg text-text-dark tracking-tight">Patient-Led OS</h3>
              <p className="text-sm text-text-muted mt-2 font-sans leading-relaxed">
                A simple, beautiful timeline you can share with family or your doctor easily.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Welcoming Interactive Call to Action */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
        >
          <button
            id="start-onboarding-btn"
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-[#D8C4F1] text-white font-display font-bold rounded-full shadow-[0_8px_25px_rgba(79,70,229,0.2)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.3)] hover:scale-102 active:scale-98 transition-all duration-300 flex items-center justify-center gap-3 text-lg border border-purple-200/50 cursor-pointer"
          >
            Enter Dashboard
            <ArrowRight className="w-5 h-5 text-white/90" />
          </button>
          
          <button
            id="login-btn"
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-white text-text-dark hover:text-indigo-600 font-display font-semibold rounded-full shadow-sm hover:shadow-md hover:bg-gray-50/50 active:scale-98 transition-all duration-300 border border-gray-200/80 cursor-pointer"
          >
            Login / Rural Asha Helper Mode
          </button>
        </motion.div>

        {/* Rural Assistant Help Text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-text-muted flex items-center justify-center gap-2 pt-10"
        >
          <HelpCircle className="w-4 h-4 text-purple-400" />
          Supported by rural ASHA health coordinators. Optimized for low-bandwidth networks.
        </motion.p>
      </div>
    </div>
  );
}
