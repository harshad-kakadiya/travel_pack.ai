import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { UserProfile } from './UserProfile';

export function Header() {
  const { isAdmin, adminEmail, setAdminEmail, isWhitelisted } = useAdminContext();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignInClick = () => {
    setAuthModalOpen(true);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">✈️</span>
            <span className="text-xl font-bold text-gray-900">TravelPack.ai</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link to="/examples" className="text-gray-600 hover:text-gray-900 transition-colors">
              Examples
            </Link>
            <Link to="/support" className="text-gray-600 hover:text-gray-900 transition-colors">
              Support
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">
                <User className="h-4 w-4 text-yellow-600" />
                <input
                  type="email"
                  placeholder="Admin email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="bg-transparent text-sm border-none outline-none placeholder-yellow-600 text-yellow-800 w-32"
                />
                {adminEmail && isWhitelisted(adminEmail) && (
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                )}
                <Link 
                  to="/admin" 
                  className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                >
                  Admin
                </Link>
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </button>
                <Link
                  to="/plan"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Start Planning
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSignInClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      
      <UserProfile
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </header>
  );
}