import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for pdfjs-dist
// Using unpkg CDN to ensure it works regardless of Vite config issues with dynamic worker imports
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export function usePdfThumbnails(pdfFileBytes: ArrayBuffer | null) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function generateThumbnails() {
      if (!pdfFileBytes) {
        setThumbnails([]);
        return;
      }

      setIsGenerating(true);
      try {
        // Clone the ArrayBuffer to prevent pdf.js from transferring ownership to the worker
        // and detaching the original buffer, which would break pdf-lib compilation later
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfFileBytes.slice(0)) });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        
        const newThumbnails: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          if (!isMounted) break;
          
          const page = await pdf.getPage(i);
          
          // Render at a higher scale for readable text, but keep it balanced
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };

          await page.render(renderContext as any).promise;
          
          if (isMounted) {
            newThumbnails.push(canvas.toDataURL('image/jpeg', 0.9)); // Higher quality JPEG
          }
        }

        if (isMounted) {
          setThumbnails(newThumbnails);
        }
      } catch (error) {
        console.error("Error generating PDF thumbnails:", error);
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    }

    generateThumbnails();

    return () => {
      isMounted = false;
    };
  }, [pdfFileBytes]);

  return { thumbnails, isGenerating };
}
