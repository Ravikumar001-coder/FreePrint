import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Tag } from 'lucide-react';

interface Notification {
  notification_id: string;
  title: string;
  message: string;
  coupon_code: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationsPanelProps {
  authToken: string;
}

export default function NotificationsPanel({ authToken }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users/me/notifications', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchNotifications();
    }
  }, [authToken]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/users/me/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setNotifications(prev => 
        prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
            <button 
              onClick={fetchNotifications}
              className="text-[10px] text-indigo-600 font-semibold hover:underline"
            >
              Refresh
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">You have no new notifications.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(notif => (
                  <div key={notif.notification_id} className={`p-4 transition-colors ${!notif.is_read ? 'bg-indigo-50/30' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-xs font-bold ${!notif.is_read ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[9px] text-slate-400 whitespace-nowrap ml-2">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                      {notif.message}
                    </p>
                    
                    {notif.coupon_code && (
                      <div className="mt-2 flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-indigo-700">
                          <Tag size={12} />
                          <code className="text-xs font-black tracking-widest">{notif.coupon_code}</code>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(notif.coupon_code!)}
                          className="text-[10px] font-bold bg-white text-indigo-600 px-2 py-1 rounded shadow-sm hover:bg-indigo-50 cursor-pointer"
                        >
                          COPY
                        </button>
                      </div>
                    )}

                    {!notif.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(notif.notification_id)}
                        className="mt-3 text-[10px] flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                      >
                        <CheckCircle size={12} /> Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
