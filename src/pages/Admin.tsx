import React, { useState, useEffect } from 'react';
import { AdminLogin } from '../components/AdminLogin';
import { AdminDashboard } from '../components/AdminDashboard';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken) {
        // Simple token validation - in production, you'd verify with server
        if (adminToken.length === 64) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('admin_token');
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (password: string) => {
    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would call your API endpoint
      // For now, we'll use a simple password check
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
      
      if (password === adminPassword) {
        // Generate a simple token
        const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        localStorage.setItem('admin_token', token);
        setIsAuthenticated(true);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin 
        onLogin={handleLogin}
        error={error}
        loading={loading}
      />
    );
  }

  return (
    <AdminDashboard onLogout={handleLogout} />
  );
}