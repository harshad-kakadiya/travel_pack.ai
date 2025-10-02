
import React from 'react';

export function CookieBanner() {
  const [visible, setVisible] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('cookiesAccepted');
  });
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center z-50">
      <div className="max-w-3xl w-[95%] bg-white shadow-xl rounded-2xl p-4 border border-slate-200">
        <p className="text-sm text-slate-700">
          We use essential cookies for site functionality and anonymous analytics to improve TravelBrief.ai. 
          By using this site you agree to our <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
        <div className="mt-3 flex gap-2">
          <button onClick={() => { localStorage.setItem('cookiesAccepted','1'); setVisible(false); }} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm">Accept</button>
          <a href="/privacy" className="px-3 py-2 rounded-lg border text-sm">Learn more</a>
        </div>
      </div>
    </div>
  );
}
