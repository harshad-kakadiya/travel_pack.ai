import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  adminEmail: string;
  setAdminEmail: (email: string) => void;
  isWhitelisted: (email: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminEmail, setAdminEmail] = useState('');
  
  const isAdmin = import.meta.env.VITE_IS_ADMIN === 'true';
  
  const isWhitelisted = (email: string) => {
    if (!isAdmin) return false;
    const whitelist = import.meta.env.VITE_ADMIN_WHITELIST?.split(',').map((e: string) => e.trim()) || [];
    return whitelist.includes(email);
  };

  useEffect(() => {
    // Load admin email from localStorage if available
    const stored = localStorage.getItem('admin-email');
    if (stored) setAdminEmail(stored);
  }, []);

  useEffect(() => {
    // Persist admin email
    if (adminEmail) {
      localStorage.setItem('admin-email', adminEmail);
    }
  }, [adminEmail]);

  return (
    <AdminContext.Provider value={{
      isAdmin,
      adminEmail,
      setAdminEmail,
      isWhitelisted
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
}