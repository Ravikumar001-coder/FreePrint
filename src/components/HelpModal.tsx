import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
      {/* 90% width and 90% height modal for optimal PDF viewing */}
      <div className="bg-white w-full max-w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded text-white">
              <HelpCircle size={18} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">DuplexPro User Manual</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area - PDF Embed */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-100">
          {/* We use an iframe to embed the PDF. Modern browsers provide a native PDF viewer 
              inside the iframe which includes high-quality Zoom In / Zoom Out controls, 
              panning, printing, and searching. */}
          <iframe 
            src="/DuplexPro_User_Manual.pdf#toolbar=1&navpanes=0&zoom=100" 
            className="w-full h-full border-none"
            title="DuplexPro Official User Manual"
          />
        </div>
      </div>
    </div>
  );
}
