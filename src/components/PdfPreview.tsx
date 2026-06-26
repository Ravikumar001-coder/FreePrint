import React from 'react';
import { usePdfThumbnails } from '../utils/usePdfThumbnails';
import { Loader2 } from 'lucide-react';

interface PdfPreviewProps {
  pdfFileBytes: ArrayBuffer | null;
}

export default function PdfPreview({ pdfFileBytes }: PdfPreviewProps) {
  const { thumbnails, isGenerating } = usePdfThumbnails(pdfFileBytes);

  if (!pdfFileBytes) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs transition-all mt-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Document Preview</h2>
      <div className="w-full h-64 bg-slate-100 rounded-xl border border-slate-200 overflow-y-auto relative">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
             <Loader2 className="animate-spin mb-2 w-6 h-6" />
             <span className="text-sm">Generating preview...</span>
          </div>
        ) : thumbnails.length > 0 ? (
          <div className="p-4 flex flex-col gap-4 items-center">
            {thumbnails.map((thumb, idx) => (
              <img 
                key={idx} 
                src={thumb} 
                alt={`Page ${idx + 1}`} 
                className="max-w-full h-auto shadow-sm border border-slate-300 rounded"
                loading="lazy"
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
             Preview not available
          </div>
        )}
      </div>
    </div>
  );
}
