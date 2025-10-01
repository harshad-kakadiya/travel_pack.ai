import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Example component showing how to use authentication
 * This component demonstrates various authentication states and methods
 */
export const AuthExample: React.FC = () => {
  const { user, session, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Authentication Status</h3>
        <p className="text-gray-600">Loading authentication state...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <h3 className="font-semibold mb-2">Authentication Status</h3>
        <p className="text-gray-600">Not signed in</p>
        <p className="text-sm text-gray-500 mt-1">
          Click "Sign In" or "Sign Up" in the header to authenticate
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-green-50 border-green-200">
      <h3 className="font-semibold mb-2">Authentication Status</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Email Verified:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
        <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
        
        {session && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p><strong>Session Expires:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
            <p><strong>Provider:</strong> {session.user.app_metadata.provider}</p>
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-green-200">
          <button
            onClick={() => signOut()}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
