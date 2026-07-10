/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Calendar, Check, Stethoscope, ShieldCheck, Clock } from "lucide-react";
import { orchestrator } from "../services/orchestrator";
import { useTranslation } from "../utils/translation";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  const { t } = useTranslation();
  const [doctorName, setDoctorName] = useState("Dr. Anjali Mehta (Gynaecologist)");
  const [customDoctor, setCustomDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [purpose, setPurpose] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const finalDoctor = doctorName === "Other" ? customDoctor.trim() || t("Private Practitioner") : doctorName;
    const finalPurpose = purpose.trim() || t("Routine checkup");

    // Create the appointment using Orchestrator
    orchestrator.createAppointment({
      doctorName: finalDoctor,
      date,
      time,
      purpose: finalPurpose,
    });

    setSuccess(true);
    setTimeout(() => {
      // Reset state and close modal
      setDoctorName("Dr. Anjali Mehta (Gynaecologist)");
      setCustomDoctor("");
      setDate("");
      setTime("10:00 AM");
      setPurpose("");
      setSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white max-w-lg w-full rounded-[24px] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/80 relative space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          /* Success Screen */
          <div className="text-center py-8 space-y-5 animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-100 to-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-200/50 shadow-xs">
              <Check className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-2xl text-text-dark tracking-tight">
                {t("Appointment Booked!")}
              </h3>
              <p className="text-sm text-text-muted max-w-sm mx-auto font-sans leading-relaxed">
                {t("Your appointment has been successfully scheduled. Saheli has updated your Care Timeline and initialized your pre-visit Doctor Companion briefing prep guide.")}
              </p>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200/50">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                {t("appointment_created Cascade Fired")}
              </div>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-text-dark tracking-tight">
                  {t("Book Doctor Appointment")}
                </h2>
                <p className="text-xs text-text-muted mt-0.5 font-sans leading-normal">
                  {t("Schedule a visit with your physician or health center specialist.")}
                </p>
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-dark uppercase tracking-wider font-sans">
                {t("Select Physician / Specialist *")}
              </label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-sm text-text-dark outline-none focus:border-indigo-500 focus:bg-white focus:shadow-xs transition-all font-sans"
              >
                <option value="Dr. Anjali Mehta (Gynaecologist)">Dr. Anjali Mehta (Gynaecologist)</option>
                <option value="Dr. R. K. Sharma (General Physician)">Dr. R. K. Sharma (General Physician)</option>
                <option value="Dr. Sunita Patil (Pediatrician)">Dr. Sunita Patil (Pediatrician)</option>
                <option value="Sunita (ANM Health Worker)">Sunita (ANM Health Worker)</option>
                <option value="Other">{t("Other Doctor")}</option>
              </select>
            </div>

            {doctorName === "Other" && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="block text-xs font-bold text-text-dark uppercase tracking-wider font-sans">
                  {t("Doctor's Full Name *")}
                </label>
                <input
                  type="text"
                  placeholder={t("e.g. Dr. Amit Patel")}
                  value={customDoctor}
                  onChange={(e) => setCustomDoctor(e.target.value)}
                  required
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-sm text-text-dark outline-none focus:border-indigo-500 focus:bg-white focus:shadow-xs transition-all font-sans"
                />
              </div>
            )}

            {/* Date and Time Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-dark uppercase tracking-wider font-sans">
                  {t("Preferred Date *")}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-sm text-text-dark outline-none focus:border-indigo-500 focus:bg-white focus:shadow-xs transition-all font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-dark uppercase tracking-wider font-sans">
                  {t("Preferred Time *")}
                </label>
                <input
                  type="text"
                  placeholder={t("e.g. 10:00 AM, 3:30 PM")}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-sm text-text-dark outline-none focus:border-indigo-500 focus:bg-white focus:shadow-xs transition-all font-sans"
                />
              </div>
            </div>

            {/* Purpose of appointment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-dark uppercase tracking-wider font-sans">
                {t("Purpose of Visit *")}
              </label>
              <input
                type="text"
                placeholder={t("e.g. Pre-conception checkup, chronic back stiffness")}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-sm text-text-dark outline-none focus:border-indigo-500 focus:bg-white focus:shadow-xs transition-all font-sans"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 border border-gray-200 rounded-full text-xs font-bold text-text-dark hover:bg-gray-50 cursor-pointer transition-all duration-200 font-sans"
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                disabled={!date || (!purpose && doctorName !== "Other")}
                className="px-7 py-3.5 bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md font-display font-bold text-sm rounded-full cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent transition-all"
              >
                {t("Schedule Appointment")}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
