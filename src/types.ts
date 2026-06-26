/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PagesPerSheet = number;

export type PaperSize = "A4" | "A3" | "Letter" | "A5";

export type MarginOption = "none" | "compact" | "standard" | "wide" | "custom";

export interface CustomMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type DuplexMode = "flip-long" | "flip-short" | "none";

export type PresetMode = "lecture" | "gate" | "booklet" | "exam" | "jee" | "twoUp" | "custom";

export interface CostConfig {
  costPerSheet: number; // e.g. 1.0 or 0.05
  duplexDiscount: number; // percentage discount, e.g. 10%
}

export interface WatermarkConfig {
  text: string;
  enabled: boolean;
  opacity: number; // 0 to 1
  size: number; // font size
}

export interface ImpositionConfig {
  preset: PresetMode;
  paperSize: PaperSize;
  pagesPerSheet: PagesPerSheet;
  columns: number;
  rows: number;
  duplexMode: DuplexMode;
  margin: MarginOption;
  customMargins: CustomMargins; // in points (1 inch = 72 points)
  pageNumbersEnabled: boolean;
  watermark: WatermarkConfig;
  cost: CostConfig;
  selectedPages: string; // e.g. "1-10, 12, 14-16" or empty for all
  scaleToFit: boolean;
  layoutFlow: "z-curve" | "rows" | "columns" | "duplex-notes";
}

export interface PDFMetadata {
  name: string;
  size: number;
  pageCount: number;
}

export interface GridCell {
  cellIndex: number; // 0-based cell position on sheet
  originalPageNumber: number | null; // 1-based page number, or null if blank/padding
  isFlipped: boolean; // whether back page should fold/be inverted
}

export interface SheetSide {
  side: "front" | "back";
  cells: GridCell[];
}

export interface Sheet {
  sheetIndex: number; // 0-based index of the physical sheet of paper
  front: SheetSide;
  back: SheetSide;
}

export interface AISuggestion {
  presetRecommended: PresetMode;
  explanation: string;
  compressionRatioAdvice: string;
  estimatedPagesReduction: string;
  cheatSheetSummary: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerMonth: number;
  description: string;
  features: string[];
  maxPagesLimit: number; // Max page processing allowed
  costMultiplier: number; // e.g. 1.0 for standard, 0.8 for discount, 0.5 for premium
  maxFileSizeMb?: number;
  maxUploadsPerMonth?: number;
  weeklyCredits?: number;
  allowsWatermarkRemoval?: boolean;
  allowsBatchProcessing?: boolean;
  maxBatchSize?: number;
  isActive?: boolean;
}

export interface CouponCode {
  id: string;
  code: string;
  discountType: "percent" | "fixed" | "free" | "none";
  discountValue: number; // % discount if percent, absolute value if fixed, 100 if free
  freeCredits?: number;
  description: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
}
