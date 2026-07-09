/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { orchestrator } from "../services/orchestrator";
import { OrchestratorEvent } from "../types";
import { Terminal, Cpu, Share2, Layers, CheckCircle } from "lucide-react";

export default function OrchestratorLogs() {
  const [logs, setLogs] = useState<OrchestratorEvent[]>(orchestrator.getSystemLogs());

  useEffect(() => {
    // Subscribe to all event logs dynamically
    const unsub = orchestrator.subscribeAll(() => {
      setLogs([...orchestrator.getSystemLogs()]);
    });
    return () => unsub();
  }, []);

  return (
    <div id="orchestrator-logs-view" className="space-y-8 max-w-5xl mx-auto p-1 animate-fade-in">
      
      {/* Title */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-display font-bold text-text-dark flex items-center gap-2.5 tracking-tight">
          <Cpu className="w-8 h-8 text-indigo-500" />
          AI Care Orchestrator Logs
        </h1>
        <p className="text-text-muted mt-1.5 text-sm md:text-base font-sans">
          Inspect the real-time event-driven architecture of the Women's Health Operating System.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time terminal of Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-[24px] p-6 shadow-xl border border-slate-800 text-slate-100 font-mono text-xs relative overflow-hidden">
            {/* Top terminal headers */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-300 ml-2">
                  <Terminal className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wider text-[10px]">Real-Time Event Stream</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800/80 border border-slate-700 px-2.5 py-0.5 rounded-full font-bold">ACTIVE BUS</span>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="space-y-1.5 border-l-2 border-indigo-500/50 pl-4 py-1 hover:border-pink-400 transition-all duration-300 bg-slate-950/40 p-3 rounded-[12px] border border-slate-850">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-300 font-bold text-xs uppercase tracking-wider">{log.type}</span>
                      <span className="text-slate-500 text-[10px] font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed break-all font-mono">
                      <span className="text-slate-500">payload:</span> {JSON.stringify(log.payload, null, 1)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-500 font-sans">
                  Waiting for events... (Try logging a symptom or updating your Health Brain to fire actions!)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scalability explanation card */}
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[22px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-5">
            <h3 className="font-display font-bold text-lg text-text-dark flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600 border border-purple-100/50">
                <Share2 className="w-4.5 h-4.5" />
              </div>
              Event-Driven Coupling
            </h3>
            
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Saheli Women's Health OS utilizes a completely decoupled publish-subscribe bus. When a primary event fires, secondary systems react automatically without hardcoded logic loops.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 text-xs text-text-dark font-medium">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Layers className="w-4 h-4 flex-shrink-0" />
                </div>
                <div>
                  <span className="block font-bold">Lab Reports Sub-Module</span>
                  <p className="text-text-muted text-[11px] font-normal font-sans mt-0.5 leading-relaxed">Will simply listen to <code className="bg-gray-150 px-1 py-0.5 rounded font-mono font-bold text-indigo-700">timeline_updated</code> to auto-correlate medical data.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-text-dark font-medium">
                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                  <Layers className="w-4 h-4 flex-shrink-0" />
                </div>
                <div>
                  <span className="block font-bold">Doctor Portal Sub-Module</span>
                  <p className="text-text-muted text-[11px] font-normal font-sans mt-0.5 leading-relaxed">Subscribes directly to <code className="bg-gray-150 px-1 py-0.5 rounded font-mono font-bold text-indigo-700">symptom_added</code> to generate instant push notifications for physicians.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-text-dark font-medium">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Layers className="w-4 h-4 flex-shrink-0" />
                </div>
                <div>
                  <span className="block font-bold">Preventive Care Sub-Module</span>
                  <p className="text-text-muted text-[11px] font-normal font-sans mt-0.5 leading-relaxed">Listens to <code className="bg-gray-150 px-1 py-0.5 rounded font-mono font-bold text-indigo-700">conversation_completed</code> to compute and suggest proactive vaccination milestones.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#A7D8F2]/10 border border-[#A7D8F2]/30 p-5 rounded-[20px] shadow-2xs">
            <span className="text-xs font-display font-bold text-indigo-950 flex items-center gap-2 uppercase tracking-wide">
              <CheckCircle className="w-5 h-5 text-indigo-600 stroke-[2.5]" />
              30+ Future-ready targets
            </span>
            <p className="text-xs text-indigo-950/80 font-sans mt-2 leading-relaxed font-medium">
              Because state triggers are completely abstracted, you can attach infinite secondary microservices or cloud databases without ever editing the core Dashboard view or the Personal Health Brain structure.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
