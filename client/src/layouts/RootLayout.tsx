import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { ScrollToTop } from '../components/ScrollToTop';

function PageLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-soft-ivory">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-dark-teal/20 border-t-primary-dark-teal animate-spin" />
        <span className="text-xs font-semibold text-primary-dark/60 tracking-wider uppercase">Loading...</span>
      </div>
    </div>
  );
}

export function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <ScrollRestoration 
        getKey={(location) => location.pathname} 
      />
      <Suspense fallback={<PageLoadingFallback />}>
        <Outlet />
      </Suspense>
    </>
  );
}
