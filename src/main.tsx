import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { NotFound, Illustration } from './components/ui/not-found';
import './index.css';

// @ts-ignore
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id';

function NotFoundPage() {
  return (
    <div className="relative flex flex-col w-full justify-center min-h-svh bg-background p-6 md:p-10">
      <div className="relative max-w-5xl mx-auto w-full">
        <Illustration className="absolute inset-0 w-full h-[50vh] opacity-[0.04] dark:opacity-[0.03] text-foreground" />
        <NotFound
          title="Page not found"
          description="Lost, this page is. In another system, it may be."
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
