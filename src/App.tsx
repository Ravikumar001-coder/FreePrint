/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Printer, 
  Sparkles, 
  Download, 
  HelpCircle, 
  RotateCcw, 
  Layers, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Crown,
  Ticket,
  Check,
  X,
  User,
  Menu,
  CircleUser,
  ChevronDown
} from "lucide-react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { ImpositionConfig, PresetMode, PDFMetadata, SubscriptionPlan, CouponCode } from "./types";
import { generateSheetLayout, createImposedPDF, parsePageSubset } from "./utils/imposer";
import ControlPanel from "./components/ControlPanel";
import PreviewGrid from "./components/PreviewGrid";
import CostEstimator from "./components/CostEstimator";
import AIPanel from "./components/AIPanel";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";
import HistoryPanel from "./components/HistoryPanel";
import PdfPreview from "./components/PdfPreview";
import NotificationsPanel from "./components/NotificationsPanel";
import PlanSelectionModal from "./components/PlanSelectionModal";
import { Agentation } from "agentation";
import { usePdfThumbnails } from "./utils/usePdfThumbnails";

const fallbackPlan: SubscriptionPlan = {
  id: "free",
  name: "Free Student",
  pricePerMonth: 0,
  description: "",
  features: [],
  maxPagesLimit: 30,
  costMultiplier: 1.0
};

const DEFAULT_CONFIG: ImpositionConfig = {
  preset: "makaut",
  pagesPerSheet: 4,
  columns: 2,
  rows: 2,
  duplexMode: "flip-long",
  margin: "compact",
  customMarginValue: 12,
  pageNumbersEnabled: true,
  watermark: {
    text: "MAKAUT REVISION",
    enabled: true,
    opacity: 0.1,
    size: 26,
  },
  cost: {
    costPerSheet: 1.0, // ₹1.0 standard Local rate
    duplexDiscount: 15, // 15% discount for duplex prints
  },
  selectedPages: "",
  scaleToFit: true,
  layoutFlow: "duplex-notes",
};

export default function App() {
  const [config, setConfig] = useState<ImpositionConfig>(DEFAULT_CONFIG);
  const [pdfFileBytes, setPdfFileBytes] = useState<ArrayBuffer | null>(null);
  const [pdfMetadata, setPdfMetadata] = useState<PDFMetadata | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Extract PDF Thumbnails dynamically
  const { thumbnails: pdfThumbnails } = usePdfThumbnails(pdfFileBytes);
  
  // Imposition processing state control
  const [imposing, setImposing] = useState(false);
  const [imposeProgressText, setImposeProgressText] = useState("");
  const [compileSuccessText, setCompileSuccessText] = useState<string | null>(null);

  // VIEW MODE
  const [viewMode, setViewMode] = useState<"print-designer" | "admin-console">("print-designer");

  // AUTH STATE
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("imposer_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem("imposer_token") || null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        (!mobileMenuToggleRef.current || !mobileMenuToggleRef.current.contains(event.target as Node))
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Helper: check if logged-in user is admin or superadmin
  const isAdmin = (user: any) => {
    const slug = user?.role?.role_slug;
    return slug === 'admin' || slug === 'superadmin';
  };

  // If a non-admin somehow ends up in admin-console view, redirect them back
  useEffect(() => {
    if (viewMode === 'admin-console' && !isAdmin(currentUser)) {
      setViewMode('print-designer');
    }
  }, [currentUser, viewMode]);

  // USER STATS
  const [userStats, setUserStats] = useState<{ total_pages_processed: number; total_paper_saved: number } | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("imposer_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("imposer_user");
    }
  }, [currentUser]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem("imposer_token", authToken);
      // Verify token is still valid (e.g. user not banned)
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }).then(async res => {
        if (res.status === 401 || res.status === 403) {
          // Token invalid or user banned
          setCurrentUser(null);
          setAuthToken(null);
          localStorage.removeItem("imposer_user");
          localStorage.removeItem("imposer_token");
        } else if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
        }
      }).catch(err => console.error("Token verification failed", err));
    } else {
      localStorage.removeItem("imposer_token");
    }
  }, [authToken]);

  useEffect(() => {
    const handleCreditsUpdated = () => {
      if (authToken) {
        fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }).then(async res => {
          if (res.ok) {
            const user = await res.json();
            setCurrentUser(user);
          }
        });
      }
    };
    
    window.addEventListener("credits_updated", handleCreditsUpdated);
    return () => window.removeEventListener("credits_updated", handleCreditsUpdated);
  }, [authToken]);

  // SUBSCRIPTION & COUPON STATES
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

  // Fetch Plans from Backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/subscriptions/plans');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Map backend schema to frontend interface
            const mappedPlans: SubscriptionPlan[] = data.map((p: any) => ({
              id: p.plan_slug,
              name: p.plan_name,
              pricePerMonth: p.price_monthly,
              description: p.description || "",
              features: [
                p.allows_watermark_removal ? "Watermark Customization" : "",
                p.allows_custom_presets ? "Custom Presets" : "",
                p.allows_priority_processing ? "Priority Processing" : "",
                p.allows_batch_processing ? "Batch Processing" : ""
              ].filter(Boolean),
              maxPagesLimit: p.max_pages_per_file,
              costMultiplier: p.plan_tier === 'free' ? 1.0 : p.plan_tier === 'pro' ? 0.85 : 0.70,
              maxFileSizeMb: p.max_file_size_mb,
              maxUploadsPerMonth: p.max_uploads_per_month,
              weeklyCredits: p.weekly_credits,
              allowsWatermarkRemoval: p.allows_watermark_removal,
              allowsBatchProcessing: p.allows_batch_processing,
              maxBatchSize: p.max_batch_size,
              isActive: p.is_active
            }));
            
            // Ensure features has at least one item
            mappedPlans.forEach(p => {
              if (p.features.length === 0) p.features = ["Standard features"];
            });
            
            setSubscriptionPlans(mappedPlans);
          }
        }
      } catch (err) {
        console.error("Failed to fetch plans from backend", err);
      }
    };
    fetchPlans();
  }, []);

  // Fetch User Stats
  useEffect(() => {
    if (authToken) {
      const fetchStats = async () => {
        try {
          const res = await fetch('/api/users/me/stats', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUserStats(data);
          }
        } catch (err) {
          console.error("Failed to fetch user stats", err);
        }
      };
      fetchStats();
    } else {
      setUserStats(null);
    }
  }, [authToken]);

  const [couponCodes, setCouponCodes] = useState<CouponCode[]>([]);

  const [currentPlanId, setCurrentPlanId] = useState<string>(() => {
    return localStorage.getItem("imposer_current_plan_id") || "free";
  });

  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [subscriptionCoupon, setSubscriptionCoupon] = useState<CouponCode | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const handleDiscountVoucherApplied = (coupon: CouponCode) => {
    setSubscriptionCoupon(coupon);
    setIsPlanModalOpen(true);
  };

  // Sync back to local storage
  // Removed local storage sync for plans since we fetch from DB now.



  useEffect(() => {
    localStorage.setItem("imposer_current_plan_id", currentPlanId);
  }, [currentPlanId]);


  // Apply printing presets
  const handleApplyPreset = (preset: PresetMode) => {
    if (preset === "makaut") {
      setConfig({
        ...config,
        preset: "makaut",
        pagesPerSheet: 4,
        columns: 2,
        rows: 2,
        duplexMode: "flip-long",
        margin: "compact",
        pageNumbersEnabled: true,
        watermark: {
          text: "MAKAUT EXAM",
          enabled: true,
          opacity: 0.1,
          size: 28,
        },
        layoutFlow: "duplex-notes",
      });
    } else if (preset === "gate") {
      setConfig({
        ...config,
        preset: "gate",
        pagesPerSheet: 9,
        columns: 3,
        rows: 3,
        duplexMode: "flip-long",
        margin: "none",
        pageNumbersEnabled: true,
        watermark: {
          text: "GATE HIGH-DENSE",
          enabled: true,
          opacity: 0.08,
          size: 20,
        },
        layoutFlow: "duplex-notes",
      });
    } else if (preset === "booklet") {
      setConfig({
        ...config,
        preset: "booklet",
        pagesPerSheet: 2,
        columns: 2,
        rows: 1,
        duplexMode: "flip-short",
        margin: "standard",
        pageNumbersEnabled: true,
        watermark: {
          text: "",
          enabled: false,
          opacity: 0.05,
          size: 24,
        },
        layoutFlow: "duplex-notes",
      });
    } else if (preset === "exam") {
      setConfig({
        ...config,
        preset: "exam",
        pagesPerSheet: 6,
        columns: 3,
        rows: 2,
        duplexMode: "flip-short",
        margin: "standard",
        pageNumbersEnabled: true,
        watermark: {
          text: "STUDY NOTES ONLY",
          enabled: true,
          opacity: 0.12,
          size: 32,
        },
        layoutFlow: "rows",
      });
    } else if (preset === "jee") {
      setConfig({
        ...config,
        preset: "jee",
        pagesPerSheet: 6,
        columns: 3,
        rows: 2,
        duplexMode: "flip-long",
        margin: "compact",
        pageNumbersEnabled: true,
        watermark: {
          text: "JEE/NEET MOCK",
          enabled: true,
          opacity: 0.1,
          size: 24,
        },
        layoutFlow: "duplex-notes",
      });
    } else if (preset === "twoUp") {
      setConfig({
        ...config,
        preset: "twoUp",
        pagesPerSheet: 2,
        columns: 2,
        rows: 1,
        duplexMode: "flip-long",
        margin: "standard",
        pageNumbersEnabled: true,
        watermark: {
          text: "QUICK PRINT",
          enabled: true,
          opacity: 0.05,
          size: 28,
        },
        layoutFlow: "rows",
      });
    } else {
      setConfig({
        ...config,
        preset: "custom",
      });
    }
  };

  // Safe file loader routine
  const handleUploadPDF = async (file: File) => {
    setUploadLoading(true);
    setUploadProgress(0);
    setCompileSuccessText(null);
    try {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      reader.onload = async (e) => {
        const bytes = e.target?.result as ArrayBuffer;
        if (bytes) {
          try {
            const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
            const pCount = pdfDoc.getPageCount();
            
            // Check active plan constraint and warn
            const activePlan = subscriptionPlans.find(p => p.id === currentPlanId) || subscriptionPlans[0] || fallbackPlan;
            if (pCount > activePlan.maxPagesLimit) {
              alert(`File Limit Warning: This document contains ${pCount} pages, which exceeds your active subscription plan "${activePlan.name}" limit of ${activePlan.maxPagesLimit} pages. You can view the file details, but to compile and download its imposition plate, you must switch your simulated plan in the "System Admin Console" tab or reduce pages in the subset selector!`);
            }

            setPdfFileBytes(bytes);
            setPdfMetadata({
              name: file.name,
              size: file.size,
              pageCount: pCount,
            });
          } catch (err: any) {
            console.error("Failed to load pdf", err);
            alert("Error loading PDF. File is empty, password-secured, or corrupted. Please double-check.");
          }
        }
        setUploadLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setUploadLoading(false);
    }
  };

  /**
   * Automatically designs a beautiful mock study notebook programmatically inside pdf-lib
   * if the student wants to test drive the compiler before uploading their own exam notes.
   */
  const generateMockNotebookBytes = async (): Promise<ArrayBuffer> => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    
    const colors = [
      rgb(0.95, 0.98, 0.96), // soft green
      rgb(0.96, 0.95, 0.98), // soft purple
      rgb(0.95, 0.96, 0.98), // soft blue
      rgb(0.98, 0.96, 0.95), // soft orange
    ];

    const totalPages = 16;
    for (let i = 1; i <= totalPages; i++) {
      const page = doc.addPage([612, 792]); // Standard USA Letter
      const bgIndex = (i - 1) % colors.length;
      
      // Draw colored backdrop
      page.drawRectangle({
        x: 20,
        y: 20,
        width: 572,
        height: 752,
        color: colors[bgIndex],
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 1,
      });

      // Draw Academic Mock Title
      page.drawText(`SAMPLE REVISION JOURNAL — NOTES PAGE ${i}`, {
        x: 45,
        y: 720,
        size: 11,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
      });

      // Draw horizontal ruled lines like a paper notebook
      for (let line = 0; line < 18; line++) {
        const lineY = 640 - line * 26;
        page.drawLine({
          start: { x: 45, y: lineY },
          end: { x: 567, y: lineY },
          color: rgb(0.9, 0.9, 0.9),
          thickness: 0.8,
        });

        // Draw some mock curriculum text blocks on every 3rd ruled row
        if (line % 4 === 1) {
          page.drawText(`- Core Formula Definition block ${line + 1}:  F(x) = E [ lim (x -> inf) sum(g_i(t)^2) ]`, {
            x: 55,
            y: lineY + 6,
            size: 8,
            font: font,
            color: rgb(0.4, 0.4, 0.4),
          });
        } else if (line % 4 === 3) {
          page.drawText(`* Revision keyword point ${line * 3}: active recall helps consolidate long term memory.`, {
            x: 55,
            y: lineY + 6,
            size: 8,
            font: font,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      }

      // Large original page indicator
      page.drawCircle({
        x: 306,
        y: 80,
        size: 24,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
      });

      const labelText = `${i}`;
      const textWidth = fontBold.widthOfTextAtSize(labelText, 12);
      page.drawText(labelText, {
        x: 306 - textWidth / 2,
        y: 75,
        size: 12,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    const docBytes = await doc.save();
    return docBytes.buffer;
  };

  // Compile and Trigger Save of the final Imposed notes PDF document
  const handleCompileAndDownload = async () => {
    if (!authToken) {
      setAuthModalOpen(true);
      return;
    }

    // Validate subscription plan page limit before processing
    const activePlan = subscriptionPlans.find(p => p.id === currentPlanId) || subscriptionPlans[0] || fallbackPlan;
    const targetPageCount = pdfMetadata ? pdfMetadata.pageCount : 16;
    if (targetPageCount > activePlan.maxPagesLimit) {
      alert(`Access Blocked: Your active student subscription plan ("${activePlan.name}") covers up to ${activePlan.maxPagesLimit} pages. Your file contains ${targetPageCount} pages. Please switch your active plan in the "System Admin Console" to double your limits!`);
      return;
    }

    // Check backend limit and record job
    try {
      const res = await fetch('/api/jobs/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          pages_processed: targetPageCount,
          preset: config.preset,
          is_unwatermarked: !config.watermark.enabled,
          is_ai_requested: false // AI costs handled separately
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to authorize job');
        return;
      }
      
      // Update local credit balance
      if (currentUser && data.remaining_credits !== undefined) {
        setCurrentUser({ ...currentUser, credit_balance: data.remaining_credits });
      }
    } catch (err: any) {
      alert(`Backend check failed: ${err.message}`);
      return;
    }

    setImposing(true);
    setCompileSuccessText(null);
    setImposeProgressText("Initializing compiler context...");

    try {
      let targetBytes: ArrayBuffer;

      if (!pdfFileBytes) {
        setImposeProgressText("No custom PDF loaded. Generating high-resolution physical 16-page test notes notebook...");
        // Wait a small bit so they see the progress text
        await new Promise((r) => setTimeout(r, 600));
        targetBytes = await generateMockNotebookBytes();
      } else {
        targetBytes = pdfFileBytes;
      }

      const compiledPdf = await createImposedPDF(targetBytes, config, (progressText) => {
        setImposeProgressText(progressText);
      });

      // Increment coupon count if a coupon is active
      if (appliedCoupon) {
        setCouponCodes(prev => {
          const updated = prev.map(c => {
            if (c.id === appliedCoupon.id) {
              const nextCount = c.usedCount + 1;
              const limitExceeded = c.usageLimit !== undefined && nextCount >= c.usageLimit;
              return {
                ...c,
                usedCount: nextCount,
                active: limitExceeded ? false : c.active
              };
            }
            return c;
          });
          
          const matched = updated.find(c => c.id === appliedCoupon.id);
          if (matched && !matched.active) {
            setAppliedCoupon(null);
            setCompileSuccessText(`Compiled successfully! Voucher "${matched.code}" reached its limit and is now de-activated.`);
          } else if (matched) {
            setAppliedCoupon(matched);
          }
          return updated;
        });
      }

      // Prepare save blob
      const blob = new Blob([compiledPdf], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = downloadUrl;
      tempLink.download = pdfMetadata 
        ? `Imposed_${config.pagesPerSheet}up_${pdfMetadata.name}`
        : `Imposed_Demo_Notes_Signature_${config.pagesPerSheet}up.pdf`;
      
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(downloadUrl);

      setCompileSuccessText(
        pdfMetadata 
          ? `Successfully compiled and downloaded "${pdfMetadata.name}" as an optimized ${config.pagesPerSheet}-page plate!`
          : "Successfully compiled and downloaded 16-page Imposed Demo Notebook!"
      );
    } catch (err: any) {
      console.error("Compilation error:", err);
      alert(`Fail during imposition layout compilation: ${err.message || err}`);
    } finally {
      setImposing(false);
    }
  };

  // Reset parameters in one click
  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setPdfFileBytes(null);
    setPdfMetadata(null);
    setCompileSuccessText(null);
  };

  // Dynamic on-render plate sheet arrays
  const activePageCount = pdfMetadata ? pdfMetadata.pageCount : 16; // Use 16 pages as interactive default
  const activePages = parsePageSubset(config.selectedPages, activePageCount);
  const sheets = generateSheetLayout(activePages, config);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col antialiased">
      {/* 1. BRAND HEADER */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 shadow-xs" id="brand_header">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 w-8 h-8 rounded flex items-center justify-center text-white">
            <Printer size={18} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
              SmartPrint Imposer <span className="text-indigo-500 font-medium text-xs">v2.1</span>
            </h1>
            <p className="text-[9px] text-indigo-600 font-bold font-mono tracking-wider -mt-0.5">
              HIGH DENSITY REVISION LAYOUTS
            </p>
          </div>
        </div>

        {/* Desktop View Action Panel */}
        <div className="hidden sm:flex items-center gap-3 w-auto justify-end">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Hi, {currentUser.name || currentUser.full_name || currentUser.username}</span>
              {isAdmin(currentUser) && (
                <span className="inline-flex items-center gap-1 text-[9px] bg-amber-100 text-amber-700 font-extrabold uppercase px-2 py-0.5 rounded-full font-mono tracking-wider">
                  <ShieldAlert size={9} />
                  ADMIN
                </span>
              )}
              {currentUser && (
                <span className="inline-flex text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">
                  ⚡ {currentUser?.credit_balance || 0} Credits
                </span>
              )}
              {authToken && <NotificationsPanel authToken={authToken} />}
              <button onClick={() => { setCurrentUser(null); setAuthToken(null); setViewMode('print-designer'); }} className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider cursor-pointer">Logout</button>
            </div>
          ) : (
            <button onClick={() => setAuthModalOpen(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">Login</button>
          )}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-semibold text-slate-600 font-mono">
            Tier: <span className="text-indigo-600 font-bold">{(subscriptionPlans.find(p => p.id === currentPlanId)?.name || "Free").toUpperCase()}</span>
            {currentUser && (
              <button 
                onClick={() => setIsPlanModalOpen(true)}
                className="ml-1 text-[9px] bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded cursor-pointer uppercase tracking-wider font-bold transition-colors"
              >
                Change
              </button>
            )}
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-950 transition-all bg-slate-100 p-1.5 px-3 rounded-lg border border-slate-200 cursor-pointer text-[11px]"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          {currentUser && authToken && <NotificationsPanel authToken={authToken} />}
          {currentUser ? (
            <button 
              ref={mobileMenuToggleRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="flex items-center gap-1 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 cursor-pointer transition-colors border border-slate-200/60"
            >
              <CircleUser size={18} className="text-indigo-600" />
              {isMobileMenuOpen ? <X size={14} className="text-slate-500 mr-0.5" /> : <ChevronDown size={14} className="text-slate-500 mr-0.5" />}
            </button>
          ) : (
            <button onClick={() => setAuthModalOpen(true)} className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full cursor-pointer">
              Login
            </button>
          )}
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="sm:hidden bg-white border-b border-slate-200 p-4 flex flex-col gap-3 shadow-xl z-50 absolute w-full left-0 top-[56px] animate-fade-in">
          {currentUser ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="bg-indigo-100 p-2 rounded-full text-indigo-700"><User size={16}/></div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-800 font-bold">{currentUser.name || currentUser.full_name || currentUser.username}</span>
                  {isAdmin(currentUser) && (
                    <span className="text-[9px] text-amber-700 font-bold uppercase tracking-wider mt-0.5">Administrator</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                 <span className="text-xs font-bold text-slate-600">Credits Remaining</span>
                 <span className="text-xs font-bold text-amber-700">⚡ {currentUser?.credit_balance || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                 <span className="text-xs font-bold text-slate-600">Current Plan</span>
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-indigo-600">{(subscriptionPlans.find(p => p.id === currentPlanId)?.name || "Free").toUpperCase()}</span>
                   <button onClick={() => {setIsMobileMenuOpen(false); setIsPlanModalOpen(true);}} className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md cursor-pointer font-bold">Change</button>
                 </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleReset(); }}
                  className="flex-1 flex justify-center items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 p-2.5 rounded-lg font-bold"
                >
                  <RotateCcw size={14} /> Reset UI
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setCurrentUser(null); setAuthToken(null); setViewMode('print-designer'); }} 
                  className="flex-1 text-xs text-red-600 hover:bg-red-50 bg-white border border-red-200 p-2.5 rounded-lg font-bold uppercase cursor-pointer text-center"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => {setIsMobileMenuOpen(false); setAuthModalOpen(true);}} className="w-full bg-indigo-600 text-white text-sm font-bold p-2.5 rounded-lg text-center">Login to your account</button>
          )}
        </div>
      )}

      {/* 2. TAB TOGGLE NAVIGATION STRIP */}
      <div className="bg-slate-100 border-b border-slate-200/60 p-2.5 flex justify-center sticky top-0 z-20 shadow-xs">
        <div className="bg-white p-1 rounded-xl shadow-xs border border-slate-200 flex flex-wrap gap-1 items-center justify-center">
          <button
            onClick={() => setViewMode("print-designer")}
            className={`p-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === "print-designer"
                ? "bg-indigo-650 bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-905 hover:bg-slate-50"
            }`}
          >
            <Printer size={14} />
            Revision Print Studio
          </button>
          
          {isAdmin(currentUser) && (
            <button
              onClick={() => setViewMode("admin-console")}
              className={`p-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === "admin-console"
                  ? "bg-indigo-650 bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-905 hover:bg-slate-50"
              }`}
            >
              <ShieldAlert size={14} />
              System Admin Console
              <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full font-mono">
                Plans / Coupons
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 3. CORE CONTENT LAYER */}
      {viewMode === "admin-console" && isAdmin(currentUser) ? (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
          <AdminPanel
            subscriptionPlans={subscriptionPlans}
            setSubscriptionPlans={setSubscriptionPlans}
            couponCodes={couponCodes}
            setCouponCodes={setCouponCodes}
            currentPlanId={currentPlanId}
            setCurrentPlanId={setCurrentPlanId}
            authToken={authToken}
          />
        </div>
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          {/* COMPILER STATUS STRIP BANNER */}
          {compileSuccessText && (
            <div className="col-span-12 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm animate-fade-in mb-2">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-900">Success!</p>
                <p className="text-emerald-700 mt-0.5">{compileSuccessText}</p>
              </div>
            </div>
          )}

          {/* --- LEFT HAND SIDE: CONTROLS & SETTINGS (Col span 5/12) --- */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6" id="app_controls_column">
            {/* CONTROL SETTINGS WRAPPER */}
            <ControlPanel
              config={config}
              onChangeConfig={setConfig}
              pdfMetadata={pdfMetadata}
              onUploadPDF={handleUploadPDF}
              loading={uploadLoading}
              uploadProgress={uploadProgress}
              subscriptionPlans={subscriptionPlans}
              currentPlanId={currentPlanId}
              currentUser={currentUser}
              authToken={authToken}
              setCurrentUser={setCurrentUser}
              onApplyPreset={handleApplyPreset}
            />
            
            <PdfPreview pdfFileBytes={pdfFileBytes} />
            <HistoryPanel authToken={authToken} />

            {/* AI DECISION ENGINE WRAPPER */}
            <AIPanel
              pdfMetadata={pdfMetadata}
              currentUser={currentUser}
              authToken={authToken}
              setCurrentUser={setCurrentUser}
              onSelectRecommendedPreset={(recommendedPreset) => {
                handleApplyPreset(recommendedPreset);
              }}
            />
          </div>

          {/* --- RIGHT HAND SIDE: VISUAL PLATING & COST STATS (Col span 7/12) --- */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6" id="app_visualizer_column">
            {/* PRIMARY DOWNLOAD RENDER BUTTON TRIGGER */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Generate Printed Matter</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {pdfMetadata 
                      ? "Saves all changes and starts compilation of your uploaded notes PDF"
                      : "Uses our simulated 16-page revision notebook to test download instant impositions!"}
                  </p>
                </div>

                <button
                  onClick={handleCompileAndDownload}
                  disabled={imposing || (currentUser && currentUser.credit_balance < ((pdfMetadata?.pageCount || 16) + (!config.watermark.enabled ? 50 : 0)))}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-500/80 p-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 animate-fade-in"
                >
                  {imposing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      Compile & Download PDF 
                      <span className="bg-indigo-800 text-indigo-100 px-1.5 py-0.5 rounded text-[10px]">
                        (-{(pdfMetadata?.pageCount || 16) + (!config.watermark.enabled ? 50 : 0)} Credits)
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Midnight Cram-Pack CTA */}
              {currentUser && currentUser.credit_balance < ((pdfMetadata?.pageCount || 16) + (!config.watermark.enabled ? 50 : 0)) && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between animate-fade-in">
                  <div>
                    <p className="text-xs font-bold text-rose-800">⚠️ Out of Credits?</p>
                    <p className="text-[10px] text-rose-600 mt-0.5">You don't have enough credits for this export.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      alert("Online payments are currently disabled. Please contact your administrator to purchase credits or redeem an Admin Voucher.");
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Get Midnight Cram-Pack (+150 for ₹39)
                  </button>
                </div>
              )}
            </div>

            {/* COMPILING PROGRESS LOADER */}
            {imposing && (
              <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-inner flex items-center gap-4.5 animate-pulse">
                <Loader2 size={18} className="text-indigo-500 animate-spin shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-indigo-400 block font-mono uppercase tracking-wider">
                    Imposition Engine Active
                  </span>
                  <p className="text-xs text-slate-300 mt-1 truncate">{imposeProgressText}</p>
                </div>
              </div>
            )}

            {/* DUPLEX GRID PLAN PREVIEWER */}
            <PreviewGrid 
              sheets={sheets}
              config={config}
              pdfThumbnails={pdfThumbnails}
            />

            {/* COST ESTIMATES PANEL */}
            <CostEstimator
              originalPageCount={activePageCount}
              printedSheetCount={sheets.length}
              config={config}
              subscriptionPlans={subscriptionPlans}
              currentPlanId={currentPlanId}
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
              couponCodes={couponCodes}
              onDiscountVoucherApplied={handleDiscountVoucherApplied}
            />
          </div>
        </main>
      )}

      {/* 4. PHYSICAL APPLET FOOTER */}
      <footer className="bg-white border-t border-gray-100 p-6 text-center text-[10px] text-gray-400 font-mono mt-12 select-none" id="applet_footer">
        <p className="font-semibold text-gray-500">PDF IMPOSTER & SMART NOTES PRINTER — ACADEMIC OPTIMIZER</p>
        <p className="mt-1">Designed with React / Vite / pdf-lib / Gemini 3.5 AI</p>
      </footer>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onLoginSuccess={(user, token) => {
          setCurrentUser(user);
          setAuthToken(token);
          if (user.subscription_id || user.plan_id) setCurrentPlanId(user.subscription_id || user.plan_id);
        }} 
      />

      {isPlanModalOpen && authToken && (
        <PlanSelectionModal
          plans={subscriptionPlans}
          currentPlanId={currentPlanId}
          authToken={authToken}
          subscriptionCoupon={subscriptionCoupon}
          onClose={() => {
             setIsPlanModalOpen(false);
             setSubscriptionCoupon(null);
          }}
          onPlanSelected={(planId) => {
            setCurrentPlanId(planId);
            setIsPlanModalOpen(false);
            setSubscriptionCoupon(null);
          }}
        />
      )}

      {/* Agentation — dev-only UI annotation tool for AI agents */}
      {process.env.NODE_ENV === "development" && <Agentation />}
    </div>
  );
}
