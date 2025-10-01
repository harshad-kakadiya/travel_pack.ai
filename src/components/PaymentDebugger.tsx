import React, { useState } from 'react';
import { createCheckoutSession } from '../lib/stripe';

export function PaymentDebugger() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEnvironment = () => {
    addLog('=== Environment Check ===');
    addLog(`VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL || 'MISSING'}`);
    addLog(`VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'MISSING'}`);
    addLog(`VITE_STRIPE_PUBLISHABLE_KEY: ${import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Present' : 'MISSING'}`);
  };

  const testCheckoutSession = async () => {
    setIsLoading(true);
    addLog('=== Testing Checkout Session ===');
    
    try {
      addLog('Creating checkout session for yearly plan...');
      const { url } = await createCheckoutSession({
        plan: 'yearly',
        pending_session_id: 'test-session-id'
      });
      addLog(`✅ Success! Checkout URL: ${url}`);
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Checkout test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setDebugInfo([]);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-semibold mb-4">Payment Debugger</h3>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={testEnvironment}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Environment
        </button>
        
        <button
          onClick={testCheckoutSession}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Checkout'}
        </button>
        
        <button
          onClick={clearLogs}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
        {debugInfo.length === 0 ? (
          <div className="text-gray-500">Click "Test Environment" to start debugging...</div>
        ) : (
          debugInfo.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))
        )}
      </div>
    </div>
  );
}
