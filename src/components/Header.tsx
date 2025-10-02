import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { UserProfile } from './UserProfile';

export function Header() {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignInClick = () => {
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">✈️</span>
            <span className="text-xl font-bold text-gray-900">TravelBrief.ai</span>
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
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                  title={user.email || 'Profile'}
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <nav className="hidden md:flex items-center space-x-4">
                <button
                  onClick={handleSignInClick}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign up
                </button>
              </nav>
            )}
            <Link
              to="/plan"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Start Planning
            </Link>
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
