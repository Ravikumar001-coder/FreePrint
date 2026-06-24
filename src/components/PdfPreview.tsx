import React, { useEffect, useState } from 'react';

interface PdfPreviewProps {
  pdfFileBytes: ArrayBuffer | null;
}

export default function PdfPreview({ pdfFileBytes }: PdfPreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfFileBytes) {
      const blob = new Blob([pdfFileBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url + '#toolbar=0&navpanes=0&scrollbar=0&view=FitH');
      return () => URL.revokeObjectURL(url);
    } else {
      setBlobUrl(null);
    }
  }, [pdfFileBytes]);

  if (!blobUrl) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs transition-all mt-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Document Preview</h2>
      <div className="w-full h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
        <iframe 
          src={blobUrl} 
          className="w-full h-full" 
          title="PDF Preview"
        />
      </div>
    </div>
  );
}
