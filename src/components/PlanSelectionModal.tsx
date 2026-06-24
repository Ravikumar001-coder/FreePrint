import React, { useState } from 'react';
import { X, Check, Zap, Shield, Crown } from 'lucide-react';
import { SubscriptionPlan, CouponCode } from '../types';

interface PlanSelectionModalProps {
  plans: SubscriptionPlan[];
  currentPlanId: string;
  authToken: string;
  subscriptionCoupon?: CouponCode | null;
  onClose: () => void;
  onPlanSelected: (planId: string) => void;
}

export default function PlanSelectionModal({ 
  plans, 
  currentPlanId, 
  authToken, 
  subscriptionCoupon,
  onClose,
  onPlanSelected 
}: PlanSelectionModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter only active plans and sort them by price
  const activePlans = plans.filter(p => p.isActive).sort((a, b) => a.pricePerMonth - b.pricePerMonth);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    try {
      setLoading(plan.id);
      setError(null);
      
      const res = await fetch('/api/subscriptions/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          plan_id: plan.id,
          coupon_code: subscriptionCoupon?.code 
        })
      });
      
      if (res.ok) {
        onPlanSelected(plan.id);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to select plan');
      }
    } catch (err) {
      setError('Network error. Could not change plan.');
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (tier: string) => {
    const t = tier.toLowerCase();
    if (t.includes('pro') || t.includes('plus')) return <Zap size={24} className="text-amber-500" />;
    if (t.includes('elite') || t.includes('premium')) return <Crown size={24} className="text-purple-500" />;
    return <Shield size={24} className="text-emerald-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-slate-50 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">Choose Your Plan</h2>
            <p className="text-sm text-slate-500 mt-1">Upgrade to unlock more pages, larger files, and premium features.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {activePlans.length === 0 ? (
            <div className="text-center p-12 text-slate-500">
              No active subscription plans are currently available. Please contact support.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activePlans.map(plan => {
                const isCurrent = currentPlanId === plan.id;
                const isLoading = loading === plan.id;

                let originalPrice = plan.pricePerMonth;
                let discountedPrice = originalPrice;
                if (subscriptionCoupon && originalPrice > 0) {
                  if (subscriptionCoupon.discountType === 'fixed') {
                    discountedPrice = Math.max(0, originalPrice - subscriptionCoupon.discountValue);
                  } else if (subscriptionCoupon.discountType === 'percent') {
                    discountedPrice = Math.max(0, originalPrice - (originalPrice * subscriptionCoupon.discountValue / 100));
                  }
                }

                return (
                  <div 
                    key={plan.id} 
                    className={`bg-white rounded-2xl p-6 flex flex-col border-2 transition-all ${
                      isCurrent ? 'border-indigo-500 shadow-lg scale-105 z-10' : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        {getPlanIcon(plan.name)}
                      </div>
                      {isCurrent && (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                    <div className="mt-2 mb-6 flex items-end gap-2">
                      <span className="text-3xl font-black text-slate-900">
                        {discountedPrice === 0 ? 'Free' : `₹${discountedPrice}`}
                      </span>
                      {subscriptionCoupon && originalPrice > 0 && originalPrice !== discountedPrice && (
                        <span className="text-lg text-slate-400 line-through mb-1">
                          ₹{originalPrice}
                        </span>
                      )}
                      {plan.pricePerMonth > 0 && <span className="text-sm text-slate-500 font-medium mb-1">/month</span>}
                    </div>

                    <ul className="flex-1 space-y-3 mb-8">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                        <span><strong>{plan.maxPagesLimit} pages</strong> per file limit</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                        <span><strong>{plan.maxFileSizeMb || 50} MB</strong> max file size</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                        <span><strong>{plan.weeklyCredits || 50}</strong> processing credits / week</span>
                      </li>
                      {plan.allowsWatermarkRemoval && (
                        <li className="flex items-start gap-2.5 text-sm text-slate-600">
                          <Check size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                          <span>Remove Watermarks</span>
                        </li>
                      )}
                      {plan.allowsBatchProcessing && (
                        <li className="flex items-start gap-2.5 text-sm text-slate-600">
                          <Check size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                          <span>Batch Processing (Up to {plan.maxBatchSize})</span>
                        </li>
                      )}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrent || isLoading}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {isLoading ? 'Processing...' : isCurrent ? 'Active Plan' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
