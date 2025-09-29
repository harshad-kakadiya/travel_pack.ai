import React, { useEffect } from 'react';
export const ErrorMonitorProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  useEffect(() => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn) return;
    import('@sentry/browser').then(Sentry => { Sentry.init({ dsn, tracesSampleRate: 0.1 }); }).catch(() => {});
  }, []);
  return <>{children}</>;
};