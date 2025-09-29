import { CookieConsent } from './CookieConsent';
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <CookieConsent />
      <Footer />
    </div>
  );
}