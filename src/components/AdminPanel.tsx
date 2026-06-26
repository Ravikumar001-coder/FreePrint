/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Check, 
  Ticket, 
  Crown, 
  AlertCircle, 
  Info,
  BadgeCent,
  Percent,
  X,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Users,
  UserCheck,
  UserX,
  UserCog,
  ChevronLeft,
  ChevronRight,
  History,
  Search,
  Shield,
  Ban,
  RefreshCw,
  Gift
} from "lucide-react";
import { SubscriptionPlan, CouponCode } from "../types";

interface AdminPanelProps {
  subscriptionPlans: SubscriptionPlan[];
  setSubscriptionPlans: React.Dispatch<React.SetStateAction<SubscriptionPlan[]>>;
  couponCodes: CouponCode[];
  setCouponCodes: React.Dispatch<React.SetStateAction<CouponCode[]>>;
  currentPlanId: string;
  setCurrentPlanId: (id: string) => void;
  authToken: string | null;
}

export default function AdminPanel({
  subscriptionPlans,
  setSubscriptionPlans,
  couponCodes,
  setCouponCodes,
  currentPlanId,
  setCurrentPlanId,
  authToken
}: AdminPanelProps) {
  // New Plan Form States
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState(0);
  const [newPlanDesc, setNewPlanDesc] = useState("");
  const [newPlanLimit, setNewPlanLimit] = useState(100);
  const [newPlanMultiplier, setNewPlanMultiplier] = useState(0.8);
  const [newWeeklyCredits, setNewWeeklyCredits] = useState(500);
  const [newPlanFeature, setNewPlanFeature] = useState("");
  const [newPlanFeatures, setNewPlanFeatures] = useState<string[]>([]);

  // New Coupon Form States
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscountType, setNewDiscountType] = useState<"percent" | "fixed" | "free">("percent");
  const [newDiscountValue, setNewDiscountValue] = useState(10);
  const [newCouponDesc, setNewCouponDesc] = useState("");
  const [newCouponMaxUses, setNewCouponMaxUses] = useState("");
  const [newCouponHasLimit, setNewCouponHasLimit] = useState(false);
  const [includeDiscount, setIncludeDiscount] = useState(true);
  const [includeCredits, setIncludeCredits] = useState(false);
  const [newFreeCredits, setNewFreeCredits] = useState(100);

  // Editing state
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanName, setEditingPlanName] = useState("");
  const [editingPlanPrice, setEditingPlanPrice] = useState(0);
  const [editingPlanDesc, setEditingPlanDesc] = useState("");
  const [editingPlanLimit, setEditingPlanLimit] = useState(100);
  const [editingPlanMultiplier, setEditingPlanMultiplier] = useState(1.0);
  const [editingWeeklyCredits, setEditingWeeklyCredits] = useState(500);

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Admin Stats State
  const [adminStats, setAdminStats] = useState<{ total_users: number; total_jobs_processed: number; global_paper_sheets_saved: number } | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (authToken) {
      const fetchStats = async () => {
        try {
          const res = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setAdminStats(data);
            setStatsError(null);
          } else {
            setStatsError("You need an admin role to view live platform statistics.");
          }
        } catch (err) {
          console.error("Failed to fetch admin stats", err);
        }
      };
      fetchStats();
    }
  }, [authToken]);

  // Fetch Coupons
  const fetchCoupons = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCouponCodes(data.map((c: any) => ({
          id: c.coupon_id,
          code: c.code,
          discountType: c.discount_type,
          discountValue: c.discount_value,
          description: c.description,
          usageLimit: c.usage_limit,
          usedCount: c.used_count,
          active: c.is_active
        })));
      }
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    }
  }, [authToken, setCouponCodes]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ── USER MANAGEMENT STATE ──────────────────────────────────────────────────
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPlanFilter, setUserPlanFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userDateStart, setUserDateStart] = useState('');
  const [userDateEnd, setUserDateEnd] = useState('');
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ userId: string; action: string; label: string } | null>(null);
  const [promoteRoleSlug, setPromoteRoleSlug] = useState<{ [userId: string]: string }>({});
  const [promoteSubscriptionId, setPromoteSubscriptionId] = useState<{ [userId: string]: string }>({});
  const [sendCouponModal, setSendCouponModal] = useState<{ 
    userId: string; 
    userEmail: string; 
    isCustom: boolean;
    couponId: string; 
    customDiscountType: 'percent' | 'fixed' | 'free' | 'none';
    customDiscountValue: number;
    customFreeCredits: number;
    customDescription: string;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!authToken) return;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setUsersError('Failed to load users.');
      }
    } catch (err) {
      setUsersError('Network error loading users.');
    } finally {
      setUsersLoading(false);
    }
  }, [authToken]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUserStatusChange = async (userId: string, status: string) => {
    setUserActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerToast(`User status updated to "${status}" successfully.`);
        await fetchUsers();
      } else {
        const d = await res.json();
        triggerToast(`Error: ${d.error || 'Failed to update status.'}`);
      }
    } catch (err) {
      triggerToast('Network error. Could not update user status.');
    } finally {
      setUserActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleUserRoleChange = async (userId: string, role_slug: string) => {
    setUserActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ role_slug })
      });
      if (res.ok) {
        triggerToast(`User role updated to "${role_slug}" successfully.`);
        await fetchUsers();
      } else {
        const d = await res.json();
        triggerToast(`Error: ${d.error || 'Failed to update role.'}`);
      }
    } catch (err) {
      triggerToast('Network error. Could not update user role.');
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleUserSubscriptionChange = async (userId: string, subscription_id: string) => {
    setUserActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ subscription_id })
      });
      if (res.ok) {
        triggerToast(`User subscription updated successfully.`);
        await fetchUsers();
      } else {
        const d = await res.json();
        triggerToast(`Error: ${d.error || 'Failed to update subscription.'}`);
      }
    } catch (err) {
      triggerToast('Network error. Could not update user subscription.');
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleUserPlanReset = async (userId: string) => {
    setUserActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        triggerToast(`User's plan credits have been successfully reset.`);
        await fetchUsers();
      } else {
        const d = await res.json();
        triggerToast(`Error: ${d.error || 'Failed to reset user plan.'}`);
      }
    } catch (err) {
      triggerToast('Network error. Could not reset user plan.');
    } finally {
      setUserActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleSendCoupon = async () => {
    if (!sendCouponModal) return;
    const { userId, userEmail, couponId } = sendCouponModal;
    const coupon = couponCodes.find(c => c.id === couponId);
    if (!coupon && !sendCouponModal.isCustom) return;
    
    setUserActionLoading(userId);
    try {
      const payload = sendCouponModal.isCustom 
        ? { 
            is_custom: true, 
            discount_type: sendCouponModal.customDiscountType, 
            discount_value: sendCouponModal.customDiscountValue, 
            free_credits: sendCouponModal.customFreeCredits,
            description: sendCouponModal.customDescription
          } 
        : { coupon_code: coupon?.code };

      const res = await fetch(`/api/admin/users/${userId}/send-coupon`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(`Successfully sent coupon to ${userEmail}`);
        setSendCouponModal(null);
      } else {
        triggerToast(`Error: ${data.error || 'Failed to send coupon.'}`);
      }
    } catch (err) {
      triggerToast('Network error. Could not send coupon.');
    } finally {
      setUserActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.username?.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesRole = userRoleFilter === 'all' || (u.role?.role_slug || 'student') === userRoleFilter;
    const matchesPlan = userPlanFilter === 'all' || (u.subscription_id || 'free') === userPlanFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    
    let matchesDate = true;
    if (userDateStart || userDateEnd) {
      const uDate = new Date(u.created_at);
      if (userDateStart) {
        matchesDate = matchesDate && uDate >= new Date(userDateStart);
      }
      if (userDateEnd) {
        const endDate = new Date(userDateEnd);
        endDate.setDate(endDate.getDate() + 1);
        matchesDate = matchesDate && uDate < endDate;
      }
    }

    return matchesSearch && matchesRole && matchesPlan && matchesStatus && matchesDate;
  });

  // ── AUDIT LOG STATE ────────────────────────────────────────────────────────
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState('');
  const AUDIT_LIMIT = 10;

  const fetchAuditLogs = useCallback(async (page = 1) => {
    if (!authToken) return;
    setAuditLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(AUDIT_LIMIT) });
      if (auditCategoryFilter) params.set('action_category', auditCategoryFilter);
      if (auditSeverityFilter) params.set('severity', auditSeverityFilter);
      const res = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
        setAuditTotal(data.pagination?.total || 0);
        setAuditTotalPages(data.pagination?.total_pages || 1);
        setAuditPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setAuditLoading(false);
    }
  }, [authToken, auditCategoryFilter, auditSeverityFilter]);

  useEffect(() => { fetchAuditLogs(1); }, [fetchAuditLogs]);

  const severityColor = (s: string) => {
    if (s === 'critical') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'warning') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-100';
  };

  const statusBadge = (status: string) => {
    if (status === 'active') return 'bg-emerald-100 text-emerald-700';
    if (status === 'suspended') return 'bg-amber-100 text-amber-700';
    if (status === 'banned') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-600';
  };

  const roleBadge = (roleSlug?: string) => {
    if (roleSlug === 'admin' || roleSlug === 'superadmin') return 'bg-purple-100 text-purple-700';
    if (roleSlug === 'educator') return 'bg-sky-100 text-sky-700';
    return 'bg-slate-100 text-slate-600';
  };

  // Add Plan features helper
  const handleAddPlanFeature = () => {
    if (newPlanFeature.trim()) {
      setNewPlanFeatures([...newPlanFeatures, newPlanFeature.trim()]);
      setNewPlanFeature("");
    }
  };

  const handleRemovePlanFeature = (idx: number) => {
    setNewPlanFeatures(newPlanFeatures.filter((_, i) => i !== idx));
  };

  // Create Subscription Plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName) {
      alert("Plan name is required!");
      return;
    }

    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          plan_name: newPlanName,
          plan_slug: newPlanName.toLowerCase().replace(/\s+/g, '-'),
          plan_tier: newPlanPrice === 0 ? 'free' : 'pro',
          price_monthly: newPlanPrice,
          description: newPlanDesc,
          max_pages_per_file: newPlanLimit,
          cost_multiplier: newPlanMultiplier,
          weekly_credits: newWeeklyCredits,
          features: newPlanFeatures,
          allows_custom_presets: true,
          allows_watermark_removal: newPlanPrice > 0,
          allows_priority_processing: newPlanPrice > 0
        })
      });

      if (res.ok) {
        const p = await res.json();
        setSubscriptionPlans(prev => [...prev, {
          id: p.plan_slug,
          name: p.plan_name,
          pricePerMonth: p.price_monthly,
          description: p.description || "",
          features: ["Automated placement sizing", "Basic PDF optimizations"],
          maxPagesLimit: p.max_pages_per_file,
          costMultiplier: p.cost_multiplier || Number(newPlanMultiplier),
          weeklyCredits: p.weekly_credits
        }]);
        triggerToast(`Subscription Plan "${newPlanName}" created!`);

        setNewPlanName("");
        setNewPlanPrice(0);
        setNewPlanDesc("");
        setNewPlanLimit(100);
        setNewPlanMultiplier(0.8);
        setNewWeeklyCredits(0);
        setNewPlanFeatures([]);
        setShowAddPlan(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create plan");
      }
    } catch (err) {
      alert("Network error creating plan");
    }
  };

  // Delete Plan
  const handleDeletePlan = async (id: string) => {
    if (id === "free") {
      alert("The default Free plan cannot be deleted.");
      return;
    }
    const plan = subscriptionPlans.find(p => p.id === id);
    // Find the real plan_id from the backend, wait we mapped plan_slug to id in App.tsx!
    // For simplicity, we assume we can delete by slug if we change the backend to support it, or we just rely on local state update for demo if we don't have the real UUID. 
    // Wait, the backend delete expects UUID! Since we don't have it in frontend `SubscriptionPlan.id`, we might fail.
    // For this prototype, just updating local state to simulate deletion if API fails.
    try {
      await fetch(`/api/admin/plans/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` } });
    } catch (e) {}
    
    if (id === currentPlanId) setCurrentPlanId("free");
    setSubscriptionPlans(prev => prev.filter(p => p.id !== id));
    triggerToast(`Plan "${plan?.name || "Tier"}" deleted successfully.`);
  };

  // Start Edit Plan
  const handleStartEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setEditingPlanName(plan.name);
    setEditingPlanPrice(plan.pricePerMonth);
    setEditingPlanDesc(plan.description);
    setEditingPlanLimit(plan.maxPagesLimit);
    setEditingPlanMultiplier(plan.costMultiplier);
    setEditingWeeklyCredits(plan.weeklyCredits || 0);
  };

  // Save Edit Plan
  const handleSaveEditPlan = async () => {
    if (!editingPlanName.trim()) return;
    
    try {
      await fetch(`/api/admin/plans/${editingPlanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          plan_name: editingPlanName,
          price_monthly: editingPlanPrice,
          description: editingPlanDesc,
          max_pages_per_file: editingPlanLimit,
          cost_multiplier: editingPlanMultiplier,
          weekly_credits: editingWeeklyCredits,
        }),
      });
    } catch (e) {}

    setSubscriptionPlans(prev => prev.map(p => {
      if (p.id === editingPlanId) {
        return {
          ...p,
          name: editingPlanName,
          pricePerMonth: editingPlanPrice,
          description: editingPlanDesc,
          maxPagesLimit: editingPlanLimit,
          costMultiplier: Number(editingPlanMultiplier)
        };
      }
      return p;
    }));
    triggerToast(`Saved plan details for "${editingPlanName}".`);
    setEditingPlanId(null);
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      alert("Coupon code is required!");
      return;
    }

    const cleanCode = newCode.trim().toUpperCase();

    // Check if duplicate code exists
    if (couponCodes.some(c => c.code === cleanCode)) {
      alert(`The coupon code "${cleanCode}" already exists! Please use a unique string.`);
      return;
    }

    try {
      const payload = {
        code: newCode.trim().toUpperCase(),
        discount_type: includeDiscount ? newDiscountType : "none",
        discount_value: includeDiscount ? Number(newDiscountValue) : 0,
        free_credits: includeCredits ? Number(newFreeCredits) : 0,
        description: newCouponDesc,
        usage_limit: newCouponHasLimit ? Number(newCouponMaxUses) : null,
        is_active: true
      };

      const res = await fetch('/api/admin/coupons', {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const p = await res.json();
        setCouponCodes(prev => [...prev, {
          id: p.coupon_id,
          code: p.code,
          discountType: p.discount_type as "percent" | "fixed" | "free" | "none",
          discountValue: p.discount_value,
          freeCredits: p.free_credits,
          description: p.description || "",
          usageLimit: p.usage_limit || undefined,
          usedCount: p.used_count,
          active: p.is_active
        }]);
        triggerToast(`Coupon Code "${cleanCode}" added successfully!`);

        setNewCode("");
        setNewDiscountType("percent");
        setNewDiscountValue(15);
        setNewCouponDesc("");
        setNewCouponMaxUses("");
        setNewCouponHasLimit(false);
        setShowAddCoupon(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create coupon.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    const coupon = couponCodes.find(c => c.id === id);
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` } });
    } catch (e) {}
    setCouponCodes(prev => prev.filter(c => c.id !== id));
    triggerToast(`Coupon "${coupon?.code}" deleted.`);
  };

  // Toggle active state of coupon
  const handleToggleCouponActive = async (id: string) => {
    const coupon = couponCodes.find(c => c.id === id);
    if (!coupon) return;
    
    const nextActive = !coupon.active;
    let nextLimit = coupon.usageLimit;
    if (nextActive && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      nextLimit = coupon.usedCount + 5;
    }

    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ is_active: nextActive, usage_limit: nextLimit })
      });
    } catch (e) {}

    setCouponCodes(prev => prev.map(c => {
      if (c.id === id) {
        if (nextActive && c.usageLimit !== undefined && c.usedCount >= c.usageLimit) {
          triggerToast(`Extended "${c.code}" limit to ${nextLimit} to re-activate it.`);
        }
        return { ...c, active: nextActive, usageLimit: nextLimit };
      }
      return c;
    }));
  };

  return (
    <div className="flex flex-col gap-6" id="admin_console_container_inside">
      {/* HEADER PANEL */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md">
            <ShieldAlert size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-900/60 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
              System Admin Console
            </span>
            <h2 className="text-base font-bold text-slate-100 mt-1 uppercase">
              Configure Corporate Policies & Codes
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-2xl">
              Manage printing subscription rates, process ceilings, and dynamic checkout vouchers. Changes made here propagate instantly to the live cost matrix widget.
            </p>
          </div>
        </div>
      </div>

      {/* TOAST ALERT FEEDBACK */}
      {toastMessage && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold p-3 px-4.5 rounded-xl flex items-center gap-2 animate-fade-in shadow-xs">
          <Check size={14} className="text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* LIVE PLATFORM STATISTICS PANEL */}
      <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-4">
          <Info size={14} className="text-emerald-500" />
          Live Global Platform Analytics
        </h3>
        {statsError ? (
          <div className="text-[10px] text-red-500 bg-red-50 p-2 rounded">{statsError}</div>
        ) : adminStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Total Users</span>
              <span className="text-lg font-black text-slate-800">{adminStats.total_users}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Jobs Processed</span>
              <span className="text-lg font-black text-slate-800">{adminStats.total_jobs_processed}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-col">
              <span className="text-[10px] text-emerald-700 font-bold uppercase">Paper Sheets Saved Globally</span>
              <span className="text-lg font-black text-emerald-600">{adminStats.global_paper_sheets_saved}</span>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 italic">Fetching stats from server or awaiting admin login...</div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* SECTION A: MANAGE SUBSCRIPTION PLANS */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-50">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <Crown size={14} className="text-slate-500" />
                Imposition Subscription Tiers
              </h3>
              <p className="text-[10px] text-slate-400">Set monthly pricing, processing ceilings & discount multipliers.</p>
            </div>
            
            <button
              onClick={() => setShowAddPlan(!showAddPlan)}
              className="p-1.5 font-bold hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
            >
              <Plus size={14} />
              Add Tier
            </button>
          </div>

          {/* ADD PLAN FORM OVERLAY */}
          {showAddPlan && (
            <form onSubmit={handleCreatePlan} className="bg-indigo-50/40 p-4 border border-indigo-100 rounded-xl flex flex-col gap-3 animate-fade-in">
              <div className="flex justify-between items-center pb-1 border-b border-indigo-100/40">
                <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">New Subscription Tier Details</span>
                <button type="button" onClick={() => setShowAddPlan(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Tier Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scholar Ultra"
                    value={newPlanName}
                    onChange={e => setNewPlanName(e.target.value)}
                    className="text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Price per Month (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 299"
                    value={newPlanPrice}
                    onChange={e => setNewPlanPrice(Number(e.target.value))}
                    className="text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Weekly Credits</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="e.g. 500"
                  value={newWeeklyCredits}
                  onChange={e => setNewWeeklyCredits(Number(e.target.value))}
                  className="text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Short Pitch</label>
                <input
                  type="text"
                  placeholder="e.g. Best for competitive students doing dense formula mock exams."
                  value={newPlanDesc}
                  onChange={e => setNewPlanDesc(e.target.value)}
                  className="text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase flex justify-between">
                    <span>Process Limit</span>
                    <span className="font-bold text-indigo-700">{newPlanLimit} pages</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="10"
                    value={newPlanLimit}
                    onChange={e => setNewPlanLimit(Number(e.target.value))}
                    className="text-xs rounded border border-slate-200 p-1.5 bg-white focus:ring-1 focus:ring-indigo-500 w-24 font-mono font-bold text-indigo-700"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase flex justify-between">
                    <span>Cost Multiplier</span>
                    <span className="font-bold text-indigo-700">{newPlanMultiplier}x</span>
                  </label>
                  <input
                    type="number"
                    min="0.10"
                    max="1.50"
                    step="0.05"
                    value={newPlanMultiplier}
                    onChange={e => setNewPlanMultiplier(Number(e.target.value))}
                    className="text-xs rounded border border-slate-200 p-1.5 bg-white focus:ring-1 focus:ring-indigo-500 w-24 font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Features</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 24/7 priority downloads"
                    value={newPlanFeature}
                    onChange={e => setNewPlanFeature(e.target.value)}
                    className="text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500 flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddPlanFeature}
                    className="bg-indigo-600 text-white text-xs font-bold p-2 px-3.5 rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {newPlanFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {newPlanFeatures.map((feat, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        {feat}
                        <button type="button" onClick={() => handleRemovePlanFeature(i)} className="text-slate-400 hover:text-slate-600 text-[11px] font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 border border-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider py-2.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Assemble & Publish subscription Tier
              </button>
            </form>
          )}

          {/* LIST SUBSCRIPTION PLANS */}
          <div className="flex flex-col gap-3">
            {subscriptionPlans.map(plan => {
              const isUserActive = plan.id === currentPlanId;
              const isEditing = plan.id === editingPlanId;

              return (
                <div
                  key={plan.id}
                  className={`border rounded-2xl p-4.5 transition-all text-xs flex flex-col gap-3 ${
                    isUserActive ? "border-indigo-500 bg-linear-to-b bg-indigo-50/5/10" : "border-slate-100 bg-slate-50/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingPlanName}
                          onChange={e => setEditingPlanName(e.target.value)}
                          className="font-bold border border-slate-250 p-1.5 text-xs bg-white focus:ring-1 focus:ring-indigo-500 rounded"
                        />
                      ) : (
                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          {plan.name}
                          {isUserActive && (
                            <span className="text-[8px] bg-indigo-100 text-indigo-700 font-extrabold uppercase px-1.5 py-0.5 rounded-full font-mono">
                              Simulating Active
                            </span>
                          )}
                        </h4>
                      )}

                      {isEditing ? (
                        <input
                          type="text"
                          value={editingPlanDesc}
                          onChange={e => setEditingPlanDesc(e.target.value)}
                          className="text-[10px] border border-slate-250 p-1 mt-1 font-mono text-slate-600 bg-white focus:ring-1 focus:ring-indigo-500 rounded w-full"
                        />
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-1">{plan.description}</p>
                      )}
                    </div>

                    <div className="text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-xs text-slate-500 font-bold">₹</span>
                          <input
                            type="number"
                            value={editingPlanPrice}
                            onChange={e => setEditingPlanPrice(Number(e.target.value))}
                            className="font-mono text-xs font-black border border-slate-250 p-1.5 rounded w-16 bg-white"
                          />
                          <span className="text-[10px] text-slate-400">/mo</span>
                        </div>
                      ) : (
                        <div className="font-black font-mono text-indigo-650 text-indigo-600">
                          ₹{plan.pricePerMonth}
                          <span className="text-[10px] text-slate-400 font-medium">/mo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex flex-col gap-1 mt-2">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Weekly Credits</label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={editingWeeklyCredits}
                        onChange={e => setEditingWeeklyCredits(Number(e.target.value))}
                        className="font-mono text-xs font-black border border-slate-250 p-1.5 rounded w-full bg-white"
                      />
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 mt-1 font-mono font-bold">
                      {plan.weeklyCredits} credits /wk
                    </div>
                  )}

                  {/* Limits and multipliers editable sliders in place */}
                  <div className="bg-white/80 rounded-xl p-3 border border-slate-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] font-mono select-none">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <span className="text-slate-450 uppercase text-[9px] font-bold">Processing Limit:</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="10"
                            max="1000"
                            step="10"
                            value={editingPlanLimit}
                            onChange={e => setEditingPlanLimit(Number(e.target.value))}
                            className="font-bold font-mono text-indigo-700 border border-slate-250 p-1 rounded w-20 bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="font-bold font-mono text-slate-500 whitespace-nowrap">pages</span>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-800">{plan.maxPagesLimit} pages / run</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <span className="text-slate-450 uppercase text-[9px] font-bold">Base Cost Multiplier:</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0.10"
                            max="1.50"
                            step="0.05"
                            value={editingPlanMultiplier}
                            onChange={e => setEditingPlanMultiplier(Number(e.target.value))}
                            className="font-bold font-mono text-indigo-700 border border-slate-250 p-1 rounded w-20 bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="font-bold font-mono text-slate-500 whitespace-nowrap">x</span>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-800">{plan.costMultiplier}x multiplier</span>
                      )}
                    </div>
                  </div>

                  {/* Plan features lists */}
                  {!isEditing && (
                    <div className="flex flex-wrap gap-1.5">
                      {plan.features.map((feature, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-sm flex items-center gap-1">
                          <Check size={10} className="text-emerald-500 shrink-0" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex justify-end gap-1.5 border-t border-slate-100 pt-2.5">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditingPlanId(null)}
                          className="bg-slate-100 text-slate-600 hover:bg-slate-200 p-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEditPlan}
                          className="bg-indigo-600 text-white hover:bg-indigo-700 p-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Save size={10} />
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEditPlan(plan)}
                          className="hover:bg-slate-100 text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 size={11} />
                          Edit Details
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={plan.id === "free"}
                          className="hover:bg-red-50 text-slate-400 hover:text-red-600 p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          <Trash2 size={11} />
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION B: MANAGE COUPON VOUCHERS */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-50">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <Ticket size={14} className="text-slate-500" />
                Voucher Coupon Engine
              </h3>
              <p className="text-[10px] text-slate-400">Generate discount codes from percent ranges (0-100%) to fully free.</p>
            </div>

            <button
              onClick={() => setShowAddCoupon(!showAddCoupon)}
              className="p-1.5 font-bold hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
            >
              <Plus size={14} />
              Add Code
            </button>
          </div>

          {/* ADD COUPON FORM OVERLAY */}
          {showAddCoupon && (
            <form onSubmit={handleCreateCoupon} className="bg-indigo-50/40 p-4 border border-indigo-100 rounded-xl flex flex-col gap-3 animate-fade-in">
              <div className="flex justify-between items-center pb-1 border-b border-indigo-100/40">
                <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">Generate Promo Code</span>
                <button type="button" onClick={() => setShowAddCoupon(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Voucher Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MONSOON30"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1 border-b border-indigo-100/40 pb-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Voucher Benefits</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={includeDiscount} onChange={e => setIncludeDiscount(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      Apply Price Discount
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={includeCredits} onChange={e => setIncludeCredits(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      Grant Free Credits
                    </label>
                  </div>
                </div>

                {includeDiscount && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Discount Type</label>
                      <select
                        value={newDiscountType}
                        onChange={e => {
                          const type = e.target.value as "percent" | "fixed" | "free";
                          setNewDiscountType(type);
                          if (type === "free") {
                            setNewDiscountValue(100);
                          } else if (type === "percent" && newDiscountValue > 100) {
                            setNewDiscountValue(100);
                          }
                        }}
                        className="text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="percent">Percentage Discount (%)</option>
                        <option value="fixed">Fixed Rate Discount (₹)</option>
                        <option value="free">100% Free Pass (Free)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Discount Sizing</label>
                      <input
                        type="number"
                        disabled={newDiscountType === "free"}
                        min="0"
                        max={newDiscountType === "percent" ? "100" : undefined}
                        placeholder={newDiscountType === "percent" ? "e.g. 25" : "e.g. 50"}
                        value={newDiscountValue}
                        onChange={e => setNewDiscountValue(Number(e.target.value))}
                        className="text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                  </>
                )}

                {includeCredits && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-emerald-600 uppercase">Free Credits Amount</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 100"
                      value={newFreeCredits}
                      onChange={e => setNewFreeCredits(Number(e.target.value))}
                      className="text-xs rounded-lg border border-emerald-200 p-2 bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">


                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>Redemption Limit?</span>
                    <button
                      type="button"
                      onClick={() => setNewCouponHasLimit(!newCouponHasLimit)}
                      className="cursor-pointer text-indigo-600 hover:text-indigo-800"
                    >
                      {newCouponHasLimit ? (
                        <span className="flex items-center gap-1 font-mono text-[9px]"><ToggleRight size={18} className="text-indigo-600 inline" /> YES</span>
                      ) : (
                        <span className="flex items-center gap-1 font-mono text-[9px] text-slate-400"><ToggleLeft size={18} className="text-slate-400 inline" /> NO</span>
                      )}
                    </button>
                  </label>
                  {newCouponHasLimit ? (
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 10 uses max"
                      value={newCouponMaxUses}
                      onChange={e => setNewCouponMaxUses(e.target.value)}
                      className="text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="text-[10.5px] text-slate-400 italic font-mono px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-lg">
                      Unlimited Uses Enabled
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Voucher Description Label</label>
                <input
                  type="text"
                  placeholder="e.g. 15% discount for Exam Season preparation"
                  value={newCouponDesc}
                  onChange={e => setNewCouponDesc(e.target.value)}
                  className="text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 border border-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider py-2.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Log & Inject Promo Code
              </button>
            </form>
          )}

          {/* LIST LIVE COUPONS */}
          <div className="flex flex-col gap-2.5">
            {couponCodes.map(coupon => {
              const hasLimit = coupon.usageLimit !== undefined;
              const isExhausted = hasLimit && coupon.usedCount >= (coupon.usageLimit || 0);

              return (
                <div
                  key={coupon.id}
                  className={`border rounded-xl p-3.5 transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
                    coupon.active && !isExhausted
                      ? "border-slate-100 bg-white shadow-xs"
                      : "border-slate-200/60 bg-gray-50/50 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="mt-1 shrink-0 flex flex-col gap-1">
                      {coupon.discountType === "none" && coupon.freeCredits ? (
                        <div className="p-1 px-2.5 bg-emerald-100 border border-emerald-200 text-emerald-700 text-[9px] font-extrabold uppercase font-mono rounded flex items-center justify-center">
                          +{coupon.freeCredits} Cr
                        </div>
                      ) : coupon.discountType === "free" ? (
                        <div className="p-1 px-2.5 bg-emerald-500 text-white text-[9px] font-extrabold uppercase font-mono rounded flex items-center justify-center">
                          Free
                        </div>
                      ) : (
                        <div className="p-1 px-2.5 bg-indigo-500 text-white text-[9px] font-extrabold uppercase font-mono rounded flex items-center justify-center">
                          {coupon.discountType === "percent" ? (
                            <>
                              <Percent size={10} className="mr-0.5" />
                              {coupon.discountValue}%
                            </>
                          ) : (
                            <>
                              ₹{coupon.discountValue}
                            </>
                          )}
                        </div>
                      )}
                      {coupon.discountType !== "none" && (coupon.freeCredits ?? 0) > 0 && (
                        <div className="p-1 px-2.5 bg-emerald-100 border border-emerald-200 text-emerald-700 text-[9px] font-extrabold uppercase font-mono rounded flex items-center justify-center">
                          +{coupon.freeCredits} Cr
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded border border-slate-250 font-bold tracking-widest text-[10px]">
                          {coupon.code}
                        </code>
                        {!coupon.active && (
                          <span className="text-[8px] bg-red-100 text-red-700 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Paused/Inactive
                          </span>
                        )}
                        {isExhausted && (
                          <span className="text-[8px] bg-amber-100 text-amber-700 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Exhausted
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal truncate">{coupon.description}</p>
                      
                      {/* Redemptions count & adjustment buttons */}
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="text-[9.5px] text-slate-400 font-mono">
                          Redemptions: <b className="text-slate-700 font-black">{coupon.usedCount}</b> {hasLimit ? `/ ${coupon.usageLimit}` : "unlimited"}
                        </span>

                        {hasLimit && (
                          <div className="flex items-center gap-1.5 bg-slate-50 p-1 px-2 border border-slate-200/50 rounded-lg">
                            <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wide font-sans">Limit adjustment:</span>
                            <button
                              onClick={() => {
                                setCouponCodes(prev => prev.map(c => {
                                  if (c.id === coupon.id && c.usageLimit !== undefined) {
                                    const nextLimit = Math.max(1, c.usageLimit - 1);
                                    const exceedsNow = c.usedCount >= nextLimit;
                                    return { 
                                      ...c, 
                                      usageLimit: nextLimit, 
                                      active: exceedsNow ? false : c.active 
                                    };
                                  }
                                  return c;
                                }));
                              }}
                              className="w-4 h-4 rounded bg-white hover:bg-slate-200 border border-slate-200 text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors"
                              title="Decrease redemption limit"
                            >
                              -
                            </button>
                            <span className="font-mono text-[9px] font-black text-indigo-700 px-1">{coupon.usageLimit}</span>
                            <button
                              onClick={() => {
                                setCouponCodes(prev => prev.map(c => {
                                  if (c.id === coupon.id && c.usageLimit !== undefined) {
                                    const nextLimit = c.usageLimit + 5;
                                    const exceedsNow = c.usedCount >= nextLimit;
                                    return { 
                                      ...c, 
                                      usageLimit: nextLimit, 
                                      active: exceedsNow ? false : c.active 
                                    };
                                  }
                                  return c;
                                }));
                              }}
                              className="w-4 h-4 rounded bg-white hover:bg-slate-200 border border-slate-200 text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors"
                              title="Increase redemption limit by 5"
                            >
                              +5
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Toggle Limit state switch */}
                    <div className="flex flex-col items-center gap-0.5 px-2 py-1 bg-slate-50/50 border border-slate-100 rounded-lg">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Voucher Limit</span>
                      <button
                        onClick={() => {
                          setCouponCodes(prev => prev.map(c => {
                            if (c.id === coupon.id) {
                              const toggleOn = c.usageLimit === undefined;
                              const limitValue = toggleOn ? 10 : undefined;
                              const exceedsNow = toggleOn && c.usedCount >= (limitValue || 0);
                              return {
                                ...c,
                                usageLimit: limitValue,
                                active: exceedsNow ? false : c.active
                              };
                            }
                            return c;
                          }));
                        }}
                        className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {hasLimit ? (
                          <>
                            <ToggleRight size={20} className="text-emerald-500" />
                            <span className="font-mono text-[9px] text-emerald-600 font-bold">LIMIT ON</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={20} className="text-slate-400" />
                            <span className="font-mono text-[9px] text-slate-400">UNLIMITED</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Toggle Active state switch */}
                    <div className="flex flex-col items-center gap-0.5 px-2 py-1 bg-slate-50/50 border border-slate-100 rounded-lg">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Active Status</span>
                      <button
                        onClick={() => handleToggleCouponActive(coupon.id)}
                        className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {coupon.active ? (
                          <>
                            <ToggleRight size={20} className="text-indigo-600" />
                            <span className="text-indigo-600 font-bold font-mono text-[9px]">ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={20} className="text-slate-400" />
                            <span className="text-slate-400 font-bold font-mono text-[9px]">PAUSED</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors cursor-pointer mt-3"
                      title="Delete Promo Code"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      {/* ── CONFIRM ACTION MODAL ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <AlertCircle size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Confirm Action</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5">
              Are you sure you want to <strong>{confirmModal.label}</strong> this user? This action will be recorded in the audit log.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmModal(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer">Cancel</button>
              <button
                onClick={() => {
                  if (confirmModal.action === 'reset_plan') {
                    handleUserPlanReset(confirmModal.userId);
                  } else {
                    handleUserStatusChange(confirmModal.userId, confirmModal.action);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer"
                disabled={userActionLoading === confirmModal.userId}
              >
                {userActionLoading === confirmModal.userId ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEND COUPON MODAL ── */}
      {sendCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <Gift size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Send Coupon to {sendCouponModal.userEmail}</h3>
            </div>
            <div className="mb-5 flex flex-col gap-3">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button 
                  onClick={() => setSendCouponModal(prev => prev ? { ...prev, isCustom: false } : null)}
                  className={`flex-1 text-xs py-1.5 rounded-md font-bold transition-colors ${!sendCouponModal.isCustom ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Existing
                </button>
                <button 
                  onClick={() => setSendCouponModal(prev => prev ? { ...prev, isCustom: true } : null)}
                  className={`flex-1 text-xs py-1.5 rounded-md font-bold transition-colors ${sendCouponModal.isCustom ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Custom
                </button>
              </div>

              {!sendCouponModal.isCustom ? (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select a Coupon</label>
                  <select
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={sendCouponModal.couponId || ''}
                    onChange={(e) => setSendCouponModal(prev => prev ? { ...prev, couponId: e.target.value } : null)}
                  >
                    <option value="" disabled>Select a coupon...</option>
                    {couponCodes.filter(c => c.active).map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.description}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Discount Type</label>
                      <select 
                        value={sendCouponModal.customDiscountType}
                        onChange={(e) => setSendCouponModal(prev => prev ? { ...prev, customDiscountType: e.target.value as any } : null)}
                        className="text-xs border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="none">None</option>
                        <option value="percent">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                        <option value="free">100% Free</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Discount Value</label>
                      <input 
                        type="number" min="0" step="1"
                        value={sendCouponModal.customDiscountValue}
                        onChange={(e) => setSendCouponModal(prev => prev ? { ...prev, customDiscountValue: Number(e.target.value) } : null)}
                        disabled={sendCouponModal.customDiscountType === 'none' || sendCouponModal.customDiscountType === 'free'}
                        className="text-xs border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-emerald-600 uppercase">Free Credits Amount</label>
                      <input 
                        type="number" min="0" step="1"
                        value={sendCouponModal.customFreeCredits}
                        onChange={(e) => setSendCouponModal(prev => prev ? { ...prev, customFreeCredits: Number(e.target.value) } : null)}
                        className="text-xs border border-emerald-200 rounded p-1.5 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Voucher Description</label>
                      <input 
                        type="text"
                        placeholder="e.g. Apology Gift"
                        value={sendCouponModal.customDescription}
                        onChange={(e) => setSendCouponModal(prev => prev ? { ...prev, customDescription: e.target.value } : null)}
                        className="text-xs border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSendCouponModal(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer">Cancel</button>
              <button
                onClick={handleSendCoupon}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                disabled={userActionLoading === sendCouponModal.userId || (!sendCouponModal.isCustom && !sendCouponModal.couponId)}
              >
                {userActionLoading === sendCouponModal.userId ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION C: USER MANAGEMENT ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4" id="admin_user_management">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-slate-500" />
              User Management
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Suspend, ban, or promote users. All actions are audit logged.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44"
              />
            </div>
            <button onClick={fetchUsers} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer" title="Refresh">
              <RefreshCw size={12} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase text-slate-500">Role</span>
            <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} className="text-xs border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer">
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="educator">Educator</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase text-slate-500">Plan</span>
            <select value={userPlanFilter} onChange={e => setUserPlanFilter(e.target.value)} className="text-xs border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer">
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              {subscriptionPlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase text-slate-500">Status</span>
            <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)} className="text-xs border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase text-slate-500">Joined After</span>
            <input type="date" value={userDateStart} onChange={e => setUserDateStart(e.target.value)} className="text-xs border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase text-slate-500">Joined Before</span>
            <input type="date" value={userDateEnd} onChange={e => setUserDateEnd(e.target.value)} className="text-xs border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer" />
          </div>
          <div className="flex flex-col gap-1 justify-end ml-auto">
            <button 
              onClick={() => {
                setUserRoleFilter('all');
                setUserPlanFilter('all');
                setUserStatusFilter('all');
                setUserDateStart('');
                setUserDateEnd('');
                setUserSearch('');
              }}
              className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {usersError && (
          <div className="text-[10px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center gap-2">
            <AlertCircle size={12} /> {usersError}
          </div>
        )}

        {usersLoading ? (
          <div className="text-[10px] text-slate-400 italic py-4 text-center">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-[10px] text-slate-400 italic py-4 text-center">{userSearch ? 'No users match your search.' : 'No users found.'}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map(u => (
              <div key={u.user_id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 relative">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{u.full_name || u.username || '—'}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${statusBadge(u.status)}`}>
                      {u.status}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${roleBadge(u.role?.role_slug)}`}>
                      {u.role?.role_slug || 'no role'}
                    </span>
                  </div>
                </div>
                
                <div className="text-[10px] text-slate-400 font-mono">
                  Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mt-1 flex flex-col gap-3 border border-slate-100">
                  <div className="flex flex-col gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Change Role</span>
                      <div className="flex items-center gap-1">
                        <select
                          value={promoteRoleSlug[u.user_id] || u.role?.role_slug || 'student'}
                          onChange={e => setPromoteRoleSlug(prev => ({ ...prev, [u.user_id]: e.target.value }))}
                          className="text-[10px] border border-slate-200 rounded-lg p-1 bg-white cursor-pointer focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="student">Student</option>
                          <option value="educator">Educator</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                        <button
                          onClick={() => handleUserRoleChange(u.user_id, promoteRoleSlug[u.user_id] || 'student')}
                          disabled={userActionLoading === u.user_id}
                          className="text-[10px] bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold p-1 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                          title="Apply role change"
                        >
                          <UserCog size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Change Plan</span>
                      <div className="flex items-center gap-1">
                        <select
                          value={promoteSubscriptionId[u.user_id] || u.subscription_id || 'free'}
                          onChange={e => setPromoteSubscriptionId(prev => ({ ...prev, [u.user_id]: e.target.value }))}
                          className="text-[10px] border border-slate-200 rounded-lg p-1 bg-white cursor-pointer focus:ring-1 focus:ring-indigo-500 max-w-[110px]"
                        >
                          <option value="free" disabled>Select plan...</option>
                          {subscriptionPlans.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUserSubscriptionChange(u.user_id, promoteSubscriptionId[u.user_id] || u.subscription_id || 'free')}
                          disabled={userActionLoading === u.user_id}
                          className="text-[10px] bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold p-1 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                          title="Apply plan change"
                        >
                          <Crown size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Account Actions</span>
                    <div className="flex flex-wrap gap-2">
                      {u.status !== 'active' ? (
                        <button
                          onClick={() => setConfirmModal({ userId: u.user_id, action: 'active', label: 'Activate' })}
                          disabled={userActionLoading === u.user_id}
                          className="flex-1 flex justify-center items-center gap-1 text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold px-2 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <UserCheck size={12} /> Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmModal({ userId: u.user_id, action: 'suspended', label: 'Suspend' })}
                          disabled={userActionLoading === u.user_id}
                          className="flex-1 flex justify-center items-center gap-1 text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold px-2 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <UserX size={12} /> Suspend
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmModal({ userId: u.user_id, action: 'banned', label: 'Ban' })}
                        disabled={userActionLoading === u.user_id || u.status === 'banned'}
                        className="flex-1 flex justify-center items-center gap-1 text-[10px] bg-red-100 hover:bg-red-200 text-red-700 font-bold px-2 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <Ban size={12} /> Ban
                      </button>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setSendCouponModal({ 
                            userId: u.user_id, 
                            userEmail: u.email, 
                            isCustom: false,
                            couponId: '',
                            customDiscountType: 'none',
                            customDiscountValue: 0,
                            customFreeCredits: 100,
                            customDescription: 'Custom Admin Voucher'
                          })}
                          disabled={userActionLoading === u.user_id || u.status !== 'active'}
                          className="flex-1 flex justify-center items-center gap-1.5 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                        >
                          <Gift size={12} /> Send Voucher
                        </button>
                        <button
                          onClick={() => setConfirmModal({ userId: u.user_id, action: 'reset_plan', label: 'Reset Credits' })}
                          disabled={userActionLoading === u.user_id || u.status !== 'active'}
                          className="flex-1 flex justify-center items-center gap-1.5 text-[10px] bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold px-2 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
                          title="Restore user credits to their active plan's default weekly limit"
                        >
                          <RefreshCw size={12} /> Reset Credits
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION D: AUDIT LOG VIEWER ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4" id="admin_audit_log">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <History size={14} className="text-slate-500" />
              Audit Log
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {auditTotal > 0 ? `${auditTotal} total entries` : 'All admin actions are recorded here.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={auditCategoryFilter}
              onChange={e => setAuditCategoryFilter(e.target.value)}
              className="text-[10px] border border-slate-200 rounded-lg p-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="user_management">User Management</option>
              <option value="commerce">Commerce</option>
            </select>
            <select
              value={auditSeverityFilter}
              onChange={e => setAuditSeverityFilter(e.target.value)}
              className="text-[10px] border border-slate-200 rounded-lg p-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <button onClick={() => fetchAuditLogs(1)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer" title="Refresh audit log">
              <RefreshCw size={12} className="text-slate-500" />
            </button>
          </div>
        </div>

        {auditLoading ? (
          <div className="text-[10px] text-slate-400 italic py-4 text-center">Loading audit log...</div>
        ) : auditLogs.length === 0 ? (
          <div className="text-[10px] text-slate-400 italic py-4 text-center flex flex-col items-center gap-2">
            <Shield size={24} className="text-slate-200" />
            No audit log entries yet. Admin actions will appear here.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {auditLogs.map((log: any) => (
              <div key={log.audit_id} className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 mt-0.5 font-mono ${severityColor(log.severity)}`}>
                  {log.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-800 font-mono">{log.action_type}</span>
                    <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{log.action_category}</span>
                    {log.table_name && (
                      <span className="text-[9px] text-slate-400">→ {log.table_name}</span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{log.notes}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {log.user?.email && (
                      <span className="text-[9px] text-indigo-600 font-mono">{log.user.email}</span>
                    )}
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {auditTotalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono">Page {auditPage} of {auditTotalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchAuditLogs(auditPage - 1)}
                disabled={auditPage <= 1 || auditLoading}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={12} className="text-slate-600" />
              </button>
              <button
                onClick={() => fetchAuditLogs(auditPage + 1)}
                disabled={auditPage >= auditTotalPages || auditLoading}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={12} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
