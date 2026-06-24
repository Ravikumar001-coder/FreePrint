/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Terminal, 
  HelpCircle, 
  Loader2, 
  Check, 
  ChevronRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { AISuggestion, PresetMode } from "../types";

interface AIPanelProps {
  pdfMetadata: { name: string; size: number; pageCount: number } | null;
  onSelectRecommendedPreset: (preset: PresetMode) => void;
}

export default function AIPanel({ pdfMetadata, onSelectRecommendedPreset }: AIPanelProps) {
  const [category, setCategory] = useState("Engineering Slides");
  const [topic, setTopic] = useState("");
  const [sampleText, setSampleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [applied, setApplied] = useState(false);

  const handleAIAnalyze = async () => {
    setLoading(true);
    setApplied(false);
    try {
      const response = await fetch("/api/notes/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: pdfMetadata?.name || "Study_Notes.pdf",
          pageCount: pdfMetadata?.pageCount || 16,
          category,
          topic,
          sampleText,
        }),
      });

      const data = await response.json();
      setSuggestion(data);
    } catch (err) {
      console.error("Failed to analyze notes with AI:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onSelectRecommendedPreset(suggestion.presetRecommended);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-5" id="ai_notes_optimiser_panel">
      <div>
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500 fill-amber-500 animate-pulse" />
          AI Print Layout & Content Optimizer
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Let Gemini parse note contents to suggest print presets and create dense revision cheatsheet summaries.
        </p>
      </div>

      {/* INPUT FORM */}
      <div className="flex flex-col gap-4 bg-gray-50/50 rounded-xl p-4.5 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Notes Category */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase font-mono">Academic Subject</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs rounded-lg border border-gray-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Engineering Slides">Engineering Lectures / Slide Decks</option>
              <option value="GATE Notes">GATE Competitive Formulas</option>
              <option value="MAKAUT Syllabus Notes">MAKAUT Direct Slide Revisions</option>
              <option value="Medical Diagrams">Medical & Biopharm notes</option>
              <option value="Humanities Narrative">Humanities Textbooks / Narrative</option>
              <option value="Pocket Cheat Sheets">Pocket Study Outlines</option>
            </select>
          </div>

          {/* Quick Context Topic */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase font-mono">Specific Topic Outline</span>
            <input
              type="text"
              placeholder="e.g. Electromagnetism Formulas, CS Data Structures"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="text-xs rounded-lg border border-gray-200 p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Note Sample Text */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-gray-500 font-bold uppercase font-mono">
            Sample Note Text Snippet (For CheatSheet Creator)
          </span>
          <textarea
            rows={2.5}
            placeholder="Paste syllabus syllabus lines, tricky equations, vocab lists, or revision notes here. The AI will synthesize them into an ultra-condensed printable study box."
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            className="w-full text-xs rounded-lg border border-gray-200 p-2 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleAIAnalyze}
          disabled={loading}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-700 font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Scanning Materials with Gemini...
            </>
          ) : (
            <>
              <Sparkles size={14} className="text-amber-300 fill-amber-300" />
              Optimize Layout & Generate Cheatsheet
            </>
          )}
        </button>
      </div>

      {/* SUGGESTION / ACTIONS CARDS */}
      {suggestion && (
        <div className="mt-2 flex flex-col gap-5 border-t border-gray-100 pt-5 animate-fade-in">
          {/* Recommended Preset Highlight */}
          <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
                <TrendingUp size={16} />
              </div>
              <div>
                <span className="text-[9px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Gemini Ideal Preset Match
                </span>
                <p className="text-sm font-black text-gray-900 mt-1 uppercase">
                  {suggestion.presetRecommended} Mode
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-normal">
                  {suggestion.explanation}
                </p>
              </div>
            </div>

            <button
              onClick={handleApply}
              className={`shrink-0 rounded-lg text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 transition-all cursor-pointer ${
                applied
                  ? "bg-indigo-650 bg-indigo-600 text-white scale-95"
                  : "bg-indigo-105 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 active:scale-95"
              }`}
            >
              {applied ? (
                <>
                  <Check size={12} />
                  Preset Configured!
                </>
              ) : (
                <>
                  Apply Recommended Grid
                  <ChevronRight size={12} />
                </>
              )}
            </button>
          </div>

          {/* Savings Ratio Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[9px] text-gray-500 font-bold uppercase font-mono">Print Reduction Factor</span>
              <p className="text-xs text-gray-700 mt-1 font-semibold">{suggestion.compressionRatioAdvice}</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[9px] text-gray-500 font-bold uppercase font-mono">Estimated Material Offset</span>
              <p className="text-xs text-indigo-700 mt-1 font-bold">{suggestion.estimatedPagesReduction}</p>
            </div>
          </div>

          {/* Dense Pocket Revision Summary block */}
          <div className="border border-gray-100 rounded-2xl bg-slate-900 p-5 text-slate-100">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3.5">
              <Terminal size={14} className="text-amber-400" />
              <span className="text-xs font-bold font-mono text-slate-200">Printable Pocket Cheatsheet Revision Block</span>
            </div>
            <div className="prose prose-invert prose-xs text-slate-300 font-sans leading-relaxed text-xs">
              <div className="whitespace-pre-wrap font-sans text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 max-h-[220px] overflow-y-auto">
                {suggestion.cheatSheetSummary}
              </div>
            </div>
            <p className="text-[9px] text-slate-500 mt-3 font-mono leading-normal">
              PRO TIP: Copy this synthesized summary and overlay it as a custom watermark, or place it on the final page grid cells! Very handy for rapid formula lookups.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
