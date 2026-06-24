/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  TrendingUp, 
  Leaf, 
  HelpCircle,
  ThumbsUp,
  Ticket,
  Percent,
  Check,
  X,
  Crown,
  ShieldAlert,
  AlertCircle
} from "lucide-react";
import { ImpositionConfig, SubscriptionPlan, CouponCode } from "../types";

interface CostEstimatorProps {
  originalPageCount: number;
  printedSheetCount: number;
  config: ImpositionConfig;
  subscriptionPlans: SubscriptionPlan[];
  currentPlanId: string;
  appliedCoupon: CouponCode | null;
  setAppliedCoupon: (coupon: CouponCode | null) => void;
  couponCodes: CouponCode[];
  onDiscountVoucherApplied?: (coupon: CouponCode) => void;
}

export default function CostEstimator({
  originalPageCount,
  printedSheetCount,
  config,
  subscriptionPlans,
  currentPlanId,
  appliedCoupon,
  setAppliedCoupon,
  couponCodes,
  onDiscountVoucherApplied
}: CostEstimatorProps) {
  const { costPerSheet, duplexDiscount } = config.cost;

  const fallbackPlan: SubscriptionPlan = {
    id: "free",
    name: "Free Student",
    pricePerMonth: 0,
    description: "",
    features: [],
    maxPagesLimit: 30,
    costMultiplier: 1.0
  };

  const activePlan = subscriptionPlans.find(p => p.id === currentPlanId) || subscriptionPlans[0] || fallbackPlan;
  const hasPlanDiscount = activePlan.costMultiplier < 1.0;

  // 1. Costs for Unposed (Single-Sided Single-Page)
  const rawCostSelf = originalPageCount * costPerSheet;

  // 2. Base Imposed Cost (Before subscription multipliers and coupons)
  const finalSheets = printedSheetCount;
  const isDuplex = config.duplexMode !== "none";
  let prePlanImposedCost = 0;

  if (isDuplex) {
    const baseCostPerSheetDuplex = costPerSheet * 2;
    const discountMultiplier = 1 - duplexDiscount / 100;
    prePlanImposedCost = finalSheets * baseCostPerSheetDuplex * discountMultiplier;
  } else {
    prePlanImposedCost = finalSheets * costPerSheet;
  }

  // 3. Apply Subscription Plan costMultiplier
  const planDiscountFactor = activePlan.costMultiplier;
  const planDiscountedCost = prePlanImposedCost * planDiscountFactor;

  // 4. Apply Coupon Code Discounts
  let finalCost = planDiscountedCost;
  let couponSavingsAmount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === "free") {
      couponSavingsAmount = planDiscountedCost;
      finalCost = 0;
    } else if (appliedCoupon.discountType === "percent") {
      const discountRatio = appliedCoupon.discountValue / 100;
      couponSavingsAmount = planDiscountedCost * discountRatio;
      finalCost = Math.max(0, planDiscountedCost - couponSavingsAmount);
    } else if (appliedCoupon.discountType === "fixed") {
      couponSavingsAmount = Math.min(planDiscountedCost, appliedCoupon.discountValue);
      finalCost = Math.max(0, planDiscountedCost - couponSavingsAmount);
    }
  }

  // Savings calculations
  const totalMoneySaved = Math.max(0, rawCostSelf - finalCost);
  const percentSaved = rawCostSelf > 0 ? Math.round((totalMoneySaved / rawCostSelf) * 100) : 0;
  const sheetsSaved = Math.max(0, originalPageCount - finalSheets);

  // Environmental metrics
  const gramsPulpSaved = sheetsSaved * 5;
  const leavesSavedCount = parseFloat((sheetsSaved / 83.33).toFixed(2));
  const gramsCo2Saved = sheetsSaved * 10;

  // Input states for Checkout Coupons
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const handleApplyCouponCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const cleanInput = couponInput.trim().toUpperCase();
    if (!cleanInput) {
      setCouponError("Please type a promo code.");
      return;
    }

    try {
      const token = localStorage.getItem('imposer_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/coupons/${cleanInput}`, { headers });
      if (!res.ok) {
        const data = await res.json();
        setCouponError(data.error || "Invalid promo code.");
        return;
      }
      const matched = await res.json();
      
      let successMsg = `Coupon "${cleanInput}" successfully applied!`;

      if (matched.free_credits && matched.free_credits > 0) {
        const redeemRes = await fetch(`/api/coupons/${cleanInput}/redeem`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${localStorage.getItem('imposer_token')}` }
        });
        const redeemData = await redeemRes.json();
        if (redeemRes.ok) {
           successMsg = redeemData.message;
           // Dispatch a custom event so the header/wallet can update its balance
           window.dispatchEvent(new CustomEvent("credits_updated"));
        } else {
           setCouponError(redeemData.error || "Failed to redeem free credits.");
           return;
        }
      }

      if (matched.discount_type !== "none") {
        const mappedCoupon: CouponCode = {
          id: matched.coupon_id,
          code: matched.code,
          discountType: matched.discount_type,
          discountValue: matched.discount_value,
          freeCredits: matched.free_credits,
          description: matched.description || "",
          usageLimit: matched.usage_limit,
          usedCount: matched.used_count,
          active: matched.is_active
        };

        if (onDiscountVoucherApplied) {
          onDiscountVoucherApplied(mappedCoupon);
          setCouponSuccess("Opening Subscription Plans...");
          setCouponInput("");
          return;
        } else {
          setAppliedCoupon(mappedCoupon);
        }
      }
      
      setCouponSuccess(successMsg);
      setCouponInput("");
    } catch (err) {
      setCouponError("Error connecting to server to validate coupon.");
    }
  };

  const handleClearCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6" id="cost_savings_estimator">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            Print Cost & Savings Estimator
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Durable cost matrix backed by active subscription parameters and vouchers.
          </p>
        </div>

        {/* ACTIVE PLAN INDICATOR TAG */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 border border-slate-200/60 p-1.5 px-3 rounded-full">
          <Crown size={12} className="text-amber-500 fill-amber-500 shrink-0" />
          <span className="text-[10px] font-bold text-slate-700 tracking-wide uppercase">
            Plan: {activePlan.name} ({activePlan.costMultiplier}x multiplier)
          </span>
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cost Before */}
        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
          <span className="text-[10px] text-gray-500 font-bold uppercase font-mono">Unposed Regular Prints</span>
          <div className="mt-2.5">
            <span className="text-2xl font-bold font-mono text-gray-400">₹{rawCostSelf.toFixed(2)}</span>
            <span className="text-[10px] text-gray-400 block mt-1">
              {originalPageCount} physical sheets ({originalPageCount} pages, 1-up, simplex)
            </span>
          </div>
        </div>

        {/* Cost After */}
        <div className="bg-indigo-50/25 p-4 rounded-xl border border-indigo-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl translate-x-4 -translate-y-4" />
          <span className="text-[10px] text-indigo-800 font-bold uppercase font-mono flex items-center gap-1">
            Optimized Imposed Notes Price
          </span>
          <div className="mt-2.5">
            <span className="text-2xl font-black font-mono text-indigo-600">₹{finalCost.toFixed(2)}</span>
            <span className="text-[10px] text-indigo-500 block mt-1">
              {finalSheets} sheets ({config.pagesPerSheet}-up, {isDuplex ? "duplex" : "simplex"})
            </span>
          </div>
        </div>

        {/* Net Savings Percentage */}
        <div className="bg-linear-to-b bg-indigo-600 text-white p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-x-4 translate-y-4" />
          <span className="text-[10px] text-indigo-100 font-bold uppercase font-mono flex items-center gap-1">
            Student Budget Relief Saved
          </span>
          <div className="mt-2.5">
            <span className="text-3xl font-black font-mono tracking-tight">{percentSaved}%</span>
            <span className="text-[10px] text-indigo-50 block mt-0.5">
              Saved ₹{totalMoneySaved.toFixed(2)} total pocket cash!
            </span>
          </div>
        </div>
      </div>

      {/* DISCOUNTS APPLIED BREAKDOWN INFO */}
      {(hasPlanDiscount || appliedCoupon) && (
        <div className="p-3.5 bg-indigo-50/20 border border-indigo-100/50 rounded-xl flex flex-col gap-2">
          <span className="text-[9px] font-bold text-indigo-850 text-indigo-800 uppercase tracking-wider font-mono">Discounts Application Stack:</span>
          <div className="flex flex-col gap-1 text-[11px] text-slate-700">
            {hasPlanDiscount && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Crown size={10} className="text-amber-500" /> {activePlan.name} Tier Multiplier Discount</span>
                <span className="font-semibold text-indigo-700 font-mono">-{( (1 - activePlan.costMultiplier) * 100 ).toFixed(0)}% off base</span>
              </div>
            )}
            {appliedCoupon && (
              <div className="flex justify-between items-center border-t border-indigo-100/30 pt-1 mt-1">
                <span className="flex items-center gap-1 font-semibold text-emerald-800"><Ticket size={10} className="text-emerald-500" /> Voucher Code Applied: {appliedCoupon.code}</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {appliedCoupon.discountType === "free" ? "100% OFF (FREE)" : `Saved ₹${couponSavingsAmount.toFixed(2)}`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED SAVINGS EXPLANATION */}
      <div className="bg-indigo-50/10 rounded-xl p-4 border border-indigo-100/50 flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-4 text-center sm:text-left select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-lg hidden sm:block shrink-0">
            <ThumbsUp size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Double-Sided Booklet Efficiency</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
              Dual-side landscape print layouts reduces total print sheet raw material charges.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center bg-white px-4 py-2 border border-indigo-100 rounded-lg text-indigo-700 font-sans font-black text-xs">
          ₹{totalMoneySaved.toFixed(2)} REDUCED
        </div>
      </div>

      {/* INTEGRATED CHECKOUT VOUCHER INPUT FIELD */}
      <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-xl flex flex-col gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
            <Ticket size={14} className="text-indigo-500" />
            Apply Revision Voucher Coupon
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Have a voucher created in the Admin console? Type it below to claim instant free prints or deductions.
          </p>
        </div>

        {appliedCoupon ? (
          <div className="bg-emerald-55 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-lg p-2.5 flex items-center justify-between animate-fade-in text-xs font-medium">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-600" />
              <span>Discount active! Code: <b className="font-mono bg-white p-1 px-1.5 border border-emerald-250 rounded uppercase text-[10px] text-emerald-800 tracking-wider inline-block">{appliedCoupon.code}</b> ({appliedCoupon.description})</span>
            </div>
            <button
              onClick={handleClearCoupon}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-150 rounded transition-all cursor-pointer"
              title="Remove coupon"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCouponCode} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="e.g. FREEPRINT, STUDYBUDDY, HALFOFF..."
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-250 p-2.5 bg-white uppercase font-mono tracking-widest focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 font-semibold"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-extrabold uppercase tracking-wider p-2 px-5 rounded-lg cursor-pointer transition-all active:scale-95 whitespace-nowrap"
            >
              Apply Redeem
            </button>
          </form>
        )}

        {couponError && (
          <p className="text-[10px] text-red-650 text-red-600 font-bold flex items-center gap-1 animate-fade-in">
            <AlertCircle size={12} />
            {couponError}
          </p>
        )}

        {couponSuccess && (
          <p className="text-[10px] text-emerald-750 text-emerald-700 font-bold flex items-center gap-1 animate-fade-in">
            <Check size={12} />
            {couponSuccess}
          </p>
        )}
      </div>

      {/* GREEN SCORECARD */}
      <div className="bg-emerald-550/5 bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10">
        <h3 className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5 mb-3.5">
          <Leaf size={14} fill="currentColor" className="text-emerald-500 shrink-0" />
          Student Green-Print Environmental Scorecard
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-500/5">
            <span className="text-xs font-black font-mono text-emerald-700">{sheetsSaved}</span>
            <span className="text-[9px] text-gray-500 block mt-1 uppercase font-semibold">Sheets of Paper Saved</span>
          </div>
          <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-500/5">
            <span className="text-xs font-black font-mono text-emerald-700">{gramsPulpSaved}g</span>
            <span className="text-[9px] text-gray-500 block mt-1 uppercase font-semibold">Raw wood pulp offset</span>
          </div>
          <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-500/5">
            <span className="text-xs font-black font-mono text-emerald-700">{gramsCo2Saved}g</span>
            <span className="text-[9px] text-gray-500 block mt-1 uppercase font-semibold">Manufacturing Carbon Offset</span>
          </div>
        </div>
      </div>
    </div>
  );
}
