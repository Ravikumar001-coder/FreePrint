import React, { useState } from 'react';
import { X, HelpCircle, BookOpen, Layers, Settings2, CreditCard, ChevronDown, CheckCircle2, FileText, Sparkles, Download, ExternalLink } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const faqs = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <BookOpen size={18} className="text-blue-500" />,
    content: (
      <div className="space-y-3 text-sm text-slate-600">
        <p>DuplexPro is designed to save paper by intelligently compressing your PDFs into high-density revision layouts.</p>
        <ul className="space-y-2 mt-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
            <span><strong>Upload:</strong> Click the upload area or drag a PDF into it.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
            <span><strong>Configure:</strong> Choose a pre-defined preset or set custom rows and columns.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
            <span><strong>Compile:</strong> Click Compile & Download to generate your optimized print plate.</span>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'presets',
    title: 'Presets Explained',
    icon: <Layers size={18} className="text-purple-500" />,
    content: (
      <div className="space-y-4 text-sm text-slate-600">
        <p>Presets automatically configure rows, columns, margins, and duplex settings for specific use cases.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5"><FileText size={14}/> Lecture (4-Up)</h4>
            <p className="text-xs mt-1 text-slate-500">Perfect for standard PowerPoint slides. 4 pages per sheet.</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5"><BookOpen size={14}/> Booklet (2-Up)</h4>
            <p className="text-xs mt-1 text-slate-500">2 pages per sheet, optimized for folding in the center.</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5"><Sparkles size={14}/> GATE/JEE (6-Up+)</h4>
            <p className="text-xs mt-1 text-slate-500">Extremely dense micro-notes for competitive exams.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'layout',
    title: 'Duplex & Layout Flows',
    icon: <Settings2 size={18} className="text-orange-500" />,
    content: (
      <div className="space-y-3 text-sm text-slate-600">
        <p>Correct duplex (double-sided) settings are critical so your pages aren't printed upside down on the back.</p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
          <li><strong className="text-slate-700">Flip Long Edge:</strong> The standard setting for portrait documents. The paper turns like a normal book.</li>
          <li><strong className="text-slate-700">Flip Short Edge:</strong> Used for landscape prints (like calendars or some booklets) so the back side faces the right way.</li>
        </ul>
        <p className="mt-2 text-xs bg-indigo-50 text-indigo-700 p-2 rounded-lg border border-indigo-100">
          <strong>Pro Tip:</strong> Our "Duplex-Notes" layout flow automatically orders your pages so that when you cut the sheet in half, the pages stack in perfect numerical order!
        </p>
      </div>
    )
  },
  {
    id: 'credits',
    title: 'Subscriptions & Limits',
    icon: <CreditCard size={18} className="text-emerald-500" />,
    content: (
      <div className="space-y-3 text-sm text-slate-600">
        <p>Every rendering job uses credits and must respect your active tier's limits.</p>
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <ul className="space-y-2 text-xs">
            <li className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Free Tier</span>
              <span className="text-slate-500">Basic limits, watermark included.</span>
            </li>
            <li className="flex items-center justify-between border-t border-slate-200 pt-2">
              <span className="font-medium text-indigo-600 flex items-center gap-1"><Sparkles size={12}/> Pro Tier</span>
              <span className="text-slate-500">Higher limits, custom watermarks.</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-slate-500 italic">You can change your simulated tier in the Admin Panel or by clicking "Change" in the top bar (if logged in).</p>
      </div>
    )
  },
  {
    id: 'manuals',
    title: 'PDF Manuals & Resources',
    icon: <FileText size={18} className="text-rose-500" />,
    content: (
      <div className="space-y-3 text-sm text-slate-600">
        <p>If you prefer reading offline or need detailed technical instructions, you can view or download our official manuals.</p>
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
              <FileText size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Official User Manual</h4>
              <p className="text-xs text-slate-500">DuplexPro_User_Manual.pdf</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a 
              href="/DuplexPro_User_Manual.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold transition-colors"
            >
              <ExternalLink size={14} /> View
            </a>
            <a 
              href="/DuplexPro_User_Manual.pdf" 
              download
              className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors"
            >
              <Download size={14} /> Save
            </a>
          </div>
        </div>
      </div>
    )
  }
];

export default function HelpModal({ onClose }: HelpModalProps) {
  const [openSection, setOpenSection] = useState<string>('getting-started');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4 sm:p-6">
      {/* Container */}
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-xl text-white shadow-sm">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight">User Manual</h2>
              <p className="text-xs text-slate-500 font-medium">Learn how to use DuplexPro</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 p-2 rounded-full transition-colors border border-slate-200 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area - Native UI instead of ugly PDF iframe */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = openSection === faq.id;
              
              return (
                <div 
                  key={faq.id} 
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
                >
                  <button 
                    onClick={() => setOpenSection(isOpen ? '' : faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isOpen ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                        {faq.icon}
                      </div>
                      <span className={`font-bold text-sm sm:text-base ${isOpen ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {faq.title}
                      </span>
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} 
                    />
                  </button>
                  
                  {/* Expandable Content */}
                  <div 
                    className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-white">
                      {faq.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <HelpCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-900">Need more help?</h4>
              <p className="text-xs text-indigo-700 mt-1">If you encounter issues with specific PDFs, make sure they are not password protected or corrupted before uploading.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
