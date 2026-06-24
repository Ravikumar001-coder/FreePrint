/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  RefreshCw, 
  Info,
  Layers,
  HelpCircle,
  Printer
} from "lucide-react";
import { Sheet, ImpositionConfig } from "../types";
import { getGridDimensions } from "../utils/imposer";

interface PreviewGridProps {
  sheets: Sheet[];
  config: ImpositionConfig;
  pdfThumbnails?: string[];
}

export default function PreviewGrid({ sheets, config, pdfThumbnails }: PreviewGridProps) {
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"side-by-side" | "flip">("flip");
  const [isFlipped, setIsFlipped] = useState(false);

  const totalSheets = sheets.length;
  const activeSheet: Sheet | undefined = sheets[activeSheetIdx];

  const { cols, rows, orientation } = getGridDimensions(config.pagesPerSheet);

  const handlePrev = () => {
    setActiveSheetIdx((prev) => Math.max(0, prev - 1));
    setIsFlipped(false);
  };

  const handleNext = () => {
    setActiveSheetIdx((prev) => Math.min(totalSheets - 1, prev + 1));
    setIsFlipped(false);
  };

  if (totalSheets === 0 || !activeSheet) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center h-[540px] flex flex-col items-center justify-center gap-3">
        <Layers size={36} className="text-gray-300 animate-pulse" />
        <h3 className="text-sm font-semibold text-gray-800">No PDF Loaded</h3>
        <p className="text-xs text-gray-400 max-w-sm">
          Please upload a lecture notes PDF or adjust layout parameters to generate your live duplex imposition preview.
        </p>
      </div>
    );
  }

  // Generate grids template
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    gap: "10px",
    height: "100%",
  };

  const mockLines = (pageNum: number) => {
    // Generate some dynamic mock visual nodes to make the page representation beautiful
    const seed = pageNum * 13;
    const count = 4 + (seed % 4);
    return (
      <div className="flex flex-col gap-1 w-full px-2 mt-1 opacity-20">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-1 bg-gray-600 rounded-xs"
            style={{ width: `${60 + ((seed + i * 29) % 35)}%` }}
          />
        ))}
      </div>
    );
  };

  const renderSide = (side: "front" | "back") => {
    const sideData = side === "front" ? activeSheet.front : activeSheet.back;
    if (!sideData || sideData.cells.length === 0) {
      return (
        <div className="flex-1 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center text-xs text-gray-400 min-h-[350px]">
          <Info size={20} className="mb-2 text-gray-300" />
          <span>Single-sided printing active. No back-side layout generated.</span>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col gap-3 min-h-[350px]">
        {/* SIDE HEADER */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${
                side === "front" ? "bg-indigo-100 text-indigo-800" : "bg-purple-100 text-purple-800"
              }`}
            >
              {side} side
            </span>
            <span className="text-xs text-gray-500 font-mono">
              Columns: {cols} × Rows: {rows}
            </span>
          </div>
          {side === "back" && config.duplexMode === "flip-short" && (
            <span className="text-[9px] text-amber-600 bg-amber-50 font-medium px-2 py-0.5 rounded-sm flex items-center gap-1">
              <RefreshCw size={8} /> rotated 180°
            </span>
          )}
        </div>

        {/* CONTAINER PAPER SHEET */}
        <div
          className={`relative border-2 border-gray-200 rounded-2xl bg-white shadow-xs p-4 flex flex-col justify-between transition-all aspect-[8.5/11] max-w-[420px] mx-auto w-full ${
            orientation === "landscape" ? "rotate-0 origin-center" : ""
          }`}
          style={{
            minHeight: "360px",
            borderColor: side === "front" ? "rgba(79, 70, 229, 0.25)" : "rgba(139, 92, 246, 0.25)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
          }}
        >
          {/* Angle Diagonal Watermark */}
          {config.watermark.enabled && config.watermark.text && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
              <p
                className="text-gray-400 font-mono uppercase font-bold leading-none tracking-widest text-center whitespace-nowrap opacity-15 rotate-30"
                style={{
                  fontSize: `${Math.min(22, config.watermark.size / 1.5)}px`,
                  opacity: config.watermark.opacity,
                }}
              >
                {config.watermark.text}
              </p>
            </div>
          )}

          {/* GRID OF embedded cells */}
          <div style={gridStyle}>
            {sideData.cells.map((cell) => {
              const isEmpty = cell.originalPageNumber === null;
              return (
                <div
                  key={cell.cellIndex}
                  className={`relative rounded-xl border flex flex-col justify-between items-center p-2.5 overflow-hidden transition-all text-center select-none ${
                    isEmpty
                      ? "border-dashed border-gray-200 bg-gray-50/50"
                      : "border-gray-200 bg-linear-to-b bg-gray-50/20 hover:border-indigo-300"
                  }`}
                  style={{
                    transform: cell.isFlipped ? "rotate(180deg)" : "none",
                  }}
                >
                  {/* CELL ORDER INDICATOR */}
                  <span className="absolute top-1 right-2 text-[8px] font-bold text-gray-300 font-mono">
                    Cell {cell.cellIndex + 1}
                  </span>

                  {!isEmpty ? (
                    <>
                      {/* PREVIEW CONTAINER THUMBNAIL */}
                      <div className="w-full flex-1 flex flex-col items-center justify-center pt-1 relative">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50/90 backdrop-blur-xs px-2 py-0.5 rounded-full z-10 border border-indigo-100/50 shadow-xs">
                          P. {cell.originalPageNumber}
                        </span>
                        
                        {pdfThumbnails && pdfThumbnails[cell.originalPageNumber! - 1] ? (
                          <div className="absolute inset-0 pt-6 pb-2 px-2 flex justify-center items-center overflow-hidden">
                            <img 
                              src={pdfThumbnails[cell.originalPageNumber! - 1]} 
                              className="max-w-full max-h-full object-contain mix-blend-multiply opacity-80"
                              alt={`Page ${cell.originalPageNumber}`}
                            />
                          </div>
                        ) : (
                          mockLines(cell.originalPageNumber!)
                        )}
                      </div>

                      {/* INDIVIDUAL CELL FOOTER PAGE */}
                      {config.pageNumbersEnabled && (
                        <div className="text-[8px] font-semibold text-gray-400 mt-1">
                          Page {cell.originalPageNumber}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full flex-1 flex flex-col items-center justify-center gap-1 text-[9px] text-gray-300">
                      <span>Empty</span>
                      <div className="w-6 h-[1px] bg-gray-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PHYSICAL SHEET FOOTER */}
          <div className="border-t border-gray-100 mt-3 pt-2 text-center flex justify-between items-center text-[10px] text-gray-500 font-mono">
            <span>{side.toUpperCase()} SIDE</span>
            <span>SHEET {activeSheetIdx + 1} OF {totalSheets}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" id="live_duplex_preview">
      {/* HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-5 mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Printer size={18} className="text-indigo-500" />
            Live Duplex Plate Preview
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Fold preview of active {config.preset === "booklet" ? "Booklet Mode" : "Normal imposition"}. Check alignment before printing.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-50 p-1 rounded-xl border border-gray-100 flex items-center gap-1">
            <button
              onClick={() => {
                setViewMode("side-by-side");
                setIsFlipped(false);
              }}
              className={`text-xs px-2.5 py-1.5 font-medium rounded-lg transition-all ${
                viewMode === "side-by-side"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode("flip")}
              className={`text-xs px-2.5 py-1.5 font-medium rounded-lg transition-all ${
                viewMode === "flip"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Duplex Flip Fold
            </button>
          </div>
        </div>
      </div>

      {/* PAGER BANNER */}
      <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between mb-5 border border-gray-100">
        <button
          onClick={handlePrev}
          disabled={activeSheetIdx === 0}
          className="p-2 px-4 bg-white border border-gray-200 shadow-xs hover:bg-gray-50 text-gray-700 rounded-xl disabled:opacity-40 disabled:hover:bg-white disabled:shadow-none transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer"
        >
          <ChevronLeft size={16} /> Prev Sheet
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-800">
            Physical Paper Sheet <span className="text-indigo-600">{activeSheetIdx + 1}</span> of {totalSheets}
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-800 font-bold rounded-full">
            {config.preset.toUpperCase()}
          </span>
        </div>

        <button
          onClick={handleNext}
          disabled={activeSheetIdx === totalSheets - 1}
          className="p-2 px-4 bg-white border border-gray-200 shadow-xs hover:bg-gray-50 text-gray-700 rounded-xl disabled:opacity-40 disabled:hover:bg-white disabled:shadow-none transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer"
        >
          Next Sheet <ChevronRight size={16} />
        </button>
      </div>

      {/* RENDER ACTIVE SHEET PANEL */}
      <div className="relative overflow-hidden pt-1">
        {viewMode === "side-by-side" ? (
          <div className="flex flex-col md:flex-row gap-6">
            {renderSide("front")}
            {config.duplexMode !== "none" && renderSide("back")}
          </div>
        ) : (
          /* SINGLE SHEET DUPLEX FLIP ANIMATION VIEW */
          <div className="flex flex-col items-center gap-5 py-6">
            <p className="text-xs text-gray-500 flex items-center gap-1.5 bg-amber-50 text-amber-700 font-medium px-3 py-1.5 rounded-full select-none">
              <Eye size={12} fill="currentColor" /> Shows how pages back up back-to-back when flipping physical paper sheets over.
            </p>

            <div 
              className="w-full max-w-[420px] transition-all duration-550 h-[480px] cursor-pointer group relative"
              onClick={() => {
                if (config.duplexMode !== "none") setIsFlipped((prev) => !prev);
              }}
            >
              {config.duplexMode !== "none" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-slate-900/80 text-white px-4 py-2 rounded-full font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 shadow-xl pointer-events-none">
                  <RefreshCw size={16} /> Click to Flip Sheet
                </div>
              )}
              {/* FLIP CARD CONTAINER */}
              <div
                className="w-full h-full relative transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* FRONT SIDE (3D PANEL) */}
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backfaceVisibility: "hidden",
                    zIndex: isFlipped ? 1 : 2,
                  }}
                >
                  {renderSide("front")}
                </div>

                {/* BACK SIDE (3D PANEL - ROTATED BY DEFAULT) */}
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    zIndex: isFlipped ? 2 : 1,
                  }}
                >
                  {renderSide("back")}
                </div>
              </div>
            </div>

            {/* CLICK TO FLIP BUTTON */}
            {config.duplexMode !== "none" ? (
              <button
                onClick={() => setIsFlipped((prev) => !prev)}
                className="flex items-center gap-3 bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all text-sm font-bold rounded-2xl px-8 py-3.5 shadow-md mt-4 cursor-pointer"
              >
                <RefreshCw size={18} className={isFlipped ? "rotate-180 transition-transform duration-500" : "transition-transform duration-500"} />
                {isFlipped ? "Flip Page to Front Side" : "Flip Page to Back Side"}
              </button>
            ) : (
              <span className="text-xs text-gray-400 font-medium mt-2">Single-sided sheets can't physical flip.</span>
            )}
          </div>
        )}
      </div>

      {/* HELP INSTRUCTION BANNER */}
      <div className="mt-8 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 flex items-start gap-3.5">
        <HelpCircle size={18} className="text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-800 mb-1">Duplex Imposition Secret:</p>
          In a 4-page (2x2) standard imposition layout, Page 1 backs up directly with Page 2, Page 3 with Page 4 etc. We automatically shift columns on the Back side of the paper plate (so Column 1 Front backs Column 2 Back) ensuring perfectly matching print bindings! Set your physical duplex printer to <kbd className="bg-gray-100 font-mono text-[10px] px-1 rounded-sm border border-gray-200">Flip on Long Edge</kbd> for Portrait, or <kbd className="bg-gray-100 font-mono text-[10px] px-1 rounded-sm border border-gray-200">Flip on Short Edge</kbd> for booklet layouts.
        </div>
      </div>
    </div>
  );
}
