import React, { useEffect, useState } from 'react';
import { History, FileText } from 'lucide-react';

export default function HistoryPanel({ authToken }: { authToken: string | null }) {
  const [uploads, setUploads] = useState<any[]>([]);

  useEffect(() => {
    if (authToken) {
      fetch('/api/uploads', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setUploads(data);
      })
      .catch(console.error);
    }
  }, [authToken]);

  if (!authToken || uploads.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs mt-6">
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
