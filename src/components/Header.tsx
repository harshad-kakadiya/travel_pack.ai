import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { UserProfile } from './UserProfile';
import { getCachedSubscription } from '../utils/subscription';

export function Header() {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignUpClick = () => {
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
                  className={`relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 ${getCachedSubscription(user.email)?.isSubscribed ? 'ring-2 ring-yellow-400' : ''}`}
                  title={user.email || 'Profile'}
                >
                  {getCachedSubscription(user.email)?.isSubscribed && (
                    <Crown className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-500" />
                  )}
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
                  onClick={handleSignUpClick}
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
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className={`${mobileOpen ? 'hidden' : 'block'} h-6 w-6`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <svg className={`${mobileOpen ? 'block' : 'hidden'} h-6 w-6`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-4 space-y-3">
            <Link to="/features" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-gray-900">Features</Link>
            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-gray-900">Pricing</Link>
            <Link to="/examples" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-gray-900">Examples</Link>
            <Link to="/support" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-gray-900">Support</Link>
            <div className="pt-3 border-t border-gray-200">
              {user ? (
                <div className="space-y-3">
                  <button onClick={() => { setProfileOpen(true); setMobileOpen(false); }} className="w-full text-left text-gray-700 hover:text-gray-900">Profile</button>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left text-gray-700 hover:text-gray-900">Log out</button>
                </div>
              ) : (
                <button onClick={() => { handleSignUpClick(); setMobileOpen(false); }} className="w-full text-left text-gray-700 hover:text-gray-900">Sign up</button>
              )}
              <Link to="/plan" onClick={() => setMobileOpen(false)} className="mt-3 inline-flex w-full items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">Start Planning</Link>
            </div>
          </nav>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        startInSignUp
      />

      <UserProfile
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </header>
  );
}
