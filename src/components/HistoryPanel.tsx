import React, { useEffect, useState } from 'react';
import { History, FileText, X } from 'lucide-react';

export default function HistoryPanel({ authToken }: { authToken: string | null }) {
  const [uploads, setUploads] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('hideHistoryPanel') !== 'true';
  });

  useEffect(() => {
    if (authToken && isVisible) {
      fetch('/api/uploads', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setUploads(data);
      })
      .catch(console.error);
    }
  }, [authToken, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hideHistoryPanel', 'true');
  };

  if (!authToken || uploads.length === 0 || !isVisible) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs mt-6 relative group">
      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
        title="Hide Recent Uploads"
      >
        <X size={16} />
      </button>
      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <History size={16} className="text-indigo-500" />
        Recent Uploads
      </h2>
      <div className="flex flex-col gap-3">
        {uploads.map((upload: any) => (
          <div key={upload.upload_id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileText size={14} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">{upload.original_filename}</p>
                <p className="text-[10px] text-slate-500">
                  {new Date(upload.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
