/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { PDFDocument } from 'pdf-lib';
import { 
  FileUp, 
  Settings, 
  LayoutGrid, 
  DollarSign, 
  BookOpen, 
  Printer, 
  FileText, 
  Check, 
  AlertCircle,
  Hash,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { ImpositionConfig, PresetMode, PagesPerSheet, MarginOption, DuplexMode, PaperSize } from "../types";

interface ControlPanelProps {
  config: ImpositionConfig;
  onChangeConfig: (newConfig: ImpositionConfig) => void;
  pdfMetadata: { name: string; size: number; pageCount: number } | null;
  onUploadPDF: (file: File) => Promise<void>;
  loading: boolean;
  uploadProgress: number;
  onApplyPreset: (preset: PresetMode) => void;
}

export default function ControlPanel({
  config,
  onChangeConfig,
  pdfMetadata,
  onUploadPDF,
  loading,
  uploadProgress,
  onApplyPreset,
}: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [animateSettings, setAnimateSettings] = useState(false);

  const glowClass = animateSettings ? "ring-2 ring-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] border-indigo-400" : "";

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processUploadedFile = async (file: File) => {
    setErrorText(null);
    const fileNameLower = file.name.toLowerCase();
    
    if (file.type === "application/pdf" || fileNameLower.endsWith(".pdf")) {
      return await onUploadPDF(file);
    }
    
    if (file.type.startsWith("image/") || fileNameLower.match(/\.(jpg|jpeg|png)$/)) {
      try {
        const imageBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.create();
        let image;
        if (fileNameLower.endsWith('.png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
        
        const pdfBytes = await pdfDoc.save();
        const pdfFile = new File([pdfBytes], file.name.replace(/\.[^/.]+$/, "") + ".pdf", { type: "application/pdf" });
        return await onUploadPDF(pdfFile);
      } catch (err) {
        setErrorText("Failed to convert image to PDF.");
        return;
      }
    }
    
    if (fileNameLower.match(/\.(docx|pptx)$/)) {
      try {
        setErrorText("Converting document to PDF... Please wait.");
        
        const formData = new FormData();
        formData.append('file', file);
        
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/convert', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to convert document.");
        }
        
        const pdfBlob = await res.blob();
        const pdfFile = new File([pdfBlob], file.name.replace(/\.[^/.]+$/, "") + ".pdf", { type: "application/pdf" });
        setErrorText(null);
        return await onUploadPDF(pdfFile);
      } catch (err: any) {
        setErrorText(err.message || "An error occurred during conversion.");
        return;
      }
    }

    setErrorText("Unsupported file format. Please upload a PDF or Image.");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processUploadedFile(e.target.files[0]);
    }
  };

  const updateConfig = (key: keyof ImpositionConfig, value: any) => {
    onChangeConfig({
      ...config,
      [key]: value,
    });
  };

  const updateWatermark = (key: keyof ImpositionConfig["watermark"], value: any) => {
    onChangeConfig({
      ...config,
      watermark: {
        ...config.watermark,
        [key]: value,
      },
    });
  };

  const updateCost = (key: keyof ImpositionConfig["cost"], value: any) => {
    onChangeConfig({
      ...config,
      cost: {
        ...config.cost,
        [key]: value,
      },
    });
  };

  const handlePresetSelect = (preset: PresetMode) => {
    onApplyPreset(preset);
  };

  // Human-readable format of file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-6" id="notes_control_panel">
      {/* 1. FILE UPLOADER SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs transition-all hover:shadow-md">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <FileUp size={16} className="text-indigo-500" />
          Upload Lecture Notes / PDF
        </h2>

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-gray-200 hover:border-indigo-400 bg-gray-50/50"
          }`}
          id="drop_zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.pptx"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-indigo-500 transition-colors">
              <FileUp size={24} />
            </div>
            {loading ? (
              <div className="w-full max-w-xs mt-2">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Parsing PDF...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Click to select or drag and drop
                </p>
                <p className="text-[10px] text-gray-500">
                  PDF, JPG, PNG, DOCX, PPTX
                </p>
              </>
            )}
          </div>
        </div>

        {errorText && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-500 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {pdfMetadata && (
          <div className="mt-4 p-3 border border-indigo-100 bg-indigo-50/30 rounded-lg flex items-start gap-3">
            <div className="p-1.5 bg-indigo-600 text-white rounded-md shrink-0">
              <Check size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-700 truncate">{pdfMetadata.name}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                <span>Size: {formatBytes(pdfMetadata.size)}</span>
                <span>•</span>
                <span className="font-semibold text-indigo-700">{pdfMetadata.pageCount} pages detected</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. PRESETS OPTION CARDS */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-amber-500" />
          Optimal Imposition Presets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              id: "lecture" as PresetMode,
              title: "Lecture Deck (4-Up)",
              desc: "4 pages per sheet (2x2), compact margins, fit slides",
              icon: LayoutGrid,
              color: "text-blue-500 bg-blue-50 border-blue-100",
            },
            {
              id: "gate" as PresetMode,
              title: "GATE Reference",
              desc: "9 pages per sheet (3x3), zero margin, dense facts",
              icon: Hash,
              color: "text-purple-500 bg-purple-50 border-purple-100",
            },
            {
              id: "booklet" as PresetMode,
              title: "Classic Booklet",
              desc: "Folded book signatures (4 pages/sheet, A5 fold)",
              icon: BookOpen,
              color: "text-amber-500 bg-amber-50 border-amber-100",
            },
            {
              id: "exam" as PresetMode,
              title: "Exam Revision",
              desc: "6 pages per sheet (2x3), bottom tags, watermark",
              icon: Printer,
              color: "text-indigo-500 bg-indigo-50 border-indigo-100",
            },
            {
              id: "jee" as PresetMode,
              title: "JEE/NEET Mock",
              desc: "6 pages per sheet (3x2), long-edge flip, compact margins",
              icon: LayoutGrid,
              color: "text-rose-500 bg-rose-50 border-rose-100",
            },
            {
              id: "twoUp" as PresetMode,
              title: "Quick 2-Up",
              desc: "2 pages per sheet, standard margins",
              icon: LayoutGrid,
              color: "text-teal-500 bg-teal-50 border-teal-100",
            },
          ].map((preset) => {
            const Icon = preset.icon;
            const isSelected = config.preset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`relative text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500 font-semibold"
                    : "border-gray-200 hover:border-indigo-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-md shrink-0 border ${preset.color}`}>
                      <Icon size={12} />
                    </div>
                    <span className="font-semibold text-gray-900">{preset.title}</span>
                  </div>
                  {isSelected && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById("imposition_parameters")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        setAnimateSettings(true);
                        setTimeout(() => setAnimateSettings(false), 800);
                      }}
                      className="text-indigo-600 animate-bounce bg-indigo-100 p-0.5 rounded-full cursor-pointer hover:bg-indigo-200" 
                      title="Tweak Advanced Settings"
                    >
                      <ChevronDown size={14} />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 leading-normal pr-4">{preset.desc}</p>
              </button>
            );
          })}
          <button
            onClick={() => handlePresetSelect("custom")}
            className={`relative text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 col-span-1 sm:col-span-2 ${
              config.preset === "custom"
                ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500 font-semibold"
                : "border-gray-200 hover:border-indigo-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md shrink-0 border text-gray-500 bg-gray-50 border-gray-100">
                  <Settings size={12} />
                </div>
                <span className="font-semibold text-gray-900">Custom Mode</span>
              </div>
              {config.preset === "custom" && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById("imposition_parameters")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setAnimateSettings(true);
                    setTimeout(() => setAnimateSettings(false), 800);
                  }}
                  className="text-indigo-600 animate-bounce bg-indigo-100 p-0.5 rounded-full cursor-pointer hover:bg-indigo-200" 
                  title="Tweak Advanced Settings"
                >
                  <ChevronDown size={14} />
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-500 leading-normal pr-4">
              Unlock total manual page layout sequence control (specify row grid splits, watermarking sizes, and custom margins)
            </p>
          </button>
        </div>
      </div>

      {/* 3. IMPOSTER MANUAL CONFIGURATION - ACCORDION LAYOUT / CONDITIONAL DISPLAY */}
      <div id="imposition_parameters" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col gap-4 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Settings size={16} className="text-indigo-500" />
            Imposition Parameters
          </h2>
          {config.preset !== "custom" && (
            <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 font-medium rounded-full">
              Preset Controlled
            </span>
          )}
        </div>

        {/* Paper Size Settings */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 flex justify-between">
            <span>Target Paper Canvas</span>
          </label>
          <select
            value={config.paperSize}
            onChange={(e) => updateConfig("paperSize", e.target.value as PaperSize)}
            disabled={config.preset === "booklet"}
            className="w-full text-xs rounded-lg border border-gray-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="A4">A4 (Standard Document)</option>
            <option value="A3">A3 (Engineering / Poster)</option>
            <option value="Letter">Letter (US Standard)</option>
            <option value="A5">A5 (Pocket Flyer)</option>
          </select>
        </div>

        {/* pages-per-sheet settings */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 flex justify-between">
            <span>Pages Per Sheet Side</span>
            <span className="text-indigo-600 font-bold">{config.pagesPerSheet} Pages</span>
          </label>
          
          {config.preset === "custom" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.columns}
                  onChange={(e) => {
                    const cols = parseInt(e.target.value, 10) || 1;
                    onChangeConfig({
                      ...config,
                      columns: cols,
                      pagesPerSheet: cols * config.rows,
                    });
                  }}
                  className="w-full text-xs rounded-lg border border-gray-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.rows}
                  onChange={(e) => {
                    const r = parseInt(e.target.value, 10) || 1;
                    onChangeConfig({
                      ...config,
                      rows: r,
                      pagesPerSheet: config.columns * r,
                    });
                  }}
                  className="w-full text-xs rounded-lg border border-gray-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (
            <select
              disabled={true}
              value={config.pagesPerSheet}
              className="w-full text-xs rounded-lg border border-gray-200 p-2 bg-gray-50 text-gray-400 cursor-not-allowed"
            >
              <option value={config.pagesPerSheet}>{config.pagesPerSheet} pages per sheet ({config.columns}x{config.rows})</option>
            </select>
          )}
        </div>

        {/* Duplex and Layout Flow */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Duplex Binding</label>
            <select
              value={config.duplexMode}
              onChange={(e) => updateConfig("duplexMode", e.target.value as DuplexMode)}
              className={`text-xs rounded-lg border border-gray-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500 transition-all duration-500 ${glowClass}`}
            >
              <option value="flip-long">Flip Long Edge (Portrait)</option>
              <option value="flip-short">Flip Short Edge (Landscape)</option>
              <option value="none">Single-Sided (No Back Page)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Page Alignment</label>
            <select
              disabled={config.preset === "booklet"}
              value={config.layoutFlow}
              onChange={(e) => updateConfig("layoutFlow", e.target.value)}
              className={`text-xs rounded-lg border border-gray-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-500 ${glowClass}`}
            >
              <option value="duplex-notes">Correct Notes (Backs match Fronts)</option>
              <option value="rows">Simple Flow (By horizontal rows)</option>
              <option value="z-curve">Z-Curve Flow (Left to right, top down)</option>
            </select>
          </div>
        </div>

        {/* Page Range Restriction */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 flex justify-between items-center">
            <span>Selective Print Page Range</span>
            <span className="text-[10px] text-gray-400 font-normal">e.g. 1-12, 15, 18-20</span>
          </label>
          <input
            type="text"
            placeholder="Blank for all pages"
            value={config.selectedPages}
            onChange={(e) => updateConfig("selectedPages", e.target.value)}
            className={`w-full text-xs rounded-lg border border-gray-200 p-2 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 transition-all duration-500 ${glowClass}`}
          />
        </div>

        {/* Margins */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Outer Margins</label>
            <select
              disabled={config.preset !== "custom"}
              value={config.margin}
              onChange={(e) => updateConfig("margin", e.target.value as MarginOption)}
              className={`text-xs rounded-lg border border-gray-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 transition-all duration-500 ${glowClass}`}
            >
              <option value="none">None (0 pt)</option>
              <option value="compact">Compact (12 pt)</option>
              <option value="standard">Standard (24 pt)</option>
              <option value="wide">Wide (40 pt)</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Scale to Fit Cell</label>
            <div className="flex items-center h-full">
              <input
                type="checkbox"
                id="scale_to_fit"
                checked={config.scaleToFit}
                onChange={(e) => updateConfig("scaleToFit", e.target.checked)}
                className="w-4 h-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="scale_to_fit" className="text-xs text-gray-500 ml-2 font-medium">
                Aspect ratio locks
              </label>
            </div>
          </div>
        </div>

        {config.margin === "custom" && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">Top (pt)</label>
              <input type="number" value={config.customMargins?.top || 0} onChange={(e) => onChangeConfig({ ...config, customMargins: { ...config.customMargins, top: parseInt(e.target.value) || 0 }})} className="w-full text-xs border border-gray-200 p-1.5 rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">Bottom (pt)</label>
              <input type="number" value={config.customMargins?.bottom || 0} onChange={(e) => onChangeConfig({ ...config, customMargins: { ...config.customMargins, bottom: parseInt(e.target.value) || 0 }})} className="w-full text-xs border border-gray-200 p-1.5 rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">Left (pt)</label>
              <input type="number" value={config.customMargins?.left || 0} onChange={(e) => onChangeConfig({ ...config, customMargins: { ...config.customMargins, left: parseInt(e.target.value) || 0 }})} className="w-full text-xs border border-gray-200 p-1.5 rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">Right (pt)</label>
              <input type="number" value={config.customMargins?.right || 0} onChange={(e) => onChangeConfig({ ...config, customMargins: { ...config.customMargins, right: parseInt(e.target.value) || 0 }})} className="w-full text-xs border border-gray-200 p-1.5 rounded" />
            </div>
          </div>
        )}

        {/* Watermarking Controls */}
        <div className="border-t border-gray-50 pt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Security / Institution Watermark</span>
            <input
              type="checkbox"
              checked={config.watermark.enabled}
              onChange={(e) => updateWatermark("enabled", e.target.checked)}
              className="w-4.5 h-4.5 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {config.watermark.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-500 font-semibold uppercase">Watermark Caption</span>
                <input
                  type="text"
                  placeholder="e.g. LECTURE EXAM PREP"
                  value={config.watermark.text}
                  onChange={(e) => updateWatermark("text", e.target.value)}
                  className="text-xs rounded-lg border border-gray-200 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase font-mono">Opacity</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={config.watermark.opacity}
                    onChange={(e) => updateWatermark("opacity", parseFloat(e.target.value) || 0.1)}
                    className="text-xs rounded-lg border border-gray-200 p-2"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase font-mono">Size (pt)</span>
                  <input
                    type="number"
                    min="8"
                    max="72"
                    value={config.watermark.size}
                    onChange={(e) => updateWatermark("size", parseInt(e.target.value, 10) || 24)}
                    className="text-xs rounded-lg border border-gray-200 p-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Page Numbers */}
        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
          <span className="text-xs font-semibold text-gray-700">Overlay Page Index Footers</span>
          <input
            type="checkbox"
            checked={config.pageNumbersEnabled}
            onChange={(e) => updateConfig("pageNumbersEnabled", e.target.checked)}
            className="w-4.5 h-4.5 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 4. COST SAVINGS ESTIMATOR MODEL INPUT */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign size={16} className="text-indigo-500" />
          Local Print Shop Rates (Calculator Settings)
        </h2>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Cost Per Sheet side</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">₹/$</span>
              <input
                type="number"
                step="0.1"
                min="0.01"
                value={config.cost.costPerSheet}
                onChange={(e) => updateCost("costPerSheet", parseFloat(e.target.value) || 1)}
                className="w-full text-xs rounded-lg border border-gray-200 pl-8 pr-2 py-2"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Duplex Discount (%)</span>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={config.cost.duplexDiscount}
              onChange={(e) => updateCost("duplexDiscount", parseInt(e.target.value, 10) || 0)}
              className="w-full text-xs rounded-lg border border-gray-200 p-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
