import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkSubscriptionByEmail, cancelSubscription } from '../lib/stripe';
import { ConfirmModal } from './ConfirmModal';
import { setCachedSubscription } from '../utils/subscription';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);
  const [unsubscribeError, setUnsubscribeError] = useState<string | null>(null);
  const [unsubscribeSuccess, setUnsubscribeSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Check subscription status when modal opens
  useEffect(() => {
    if (isOpen && user?.email) {
      checkSubscription();
    }
  }, [isOpen, user?.email]);

  const checkSubscription = async () => {
    if (!user?.email) return;
    
    setCheckingSubscription(true);
    try {
      const result = await checkSubscriptionByEmail(user.email);
      setIsSubscribed(result.is_subscribed);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleUnsubscribeClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmUnsubscribe = async () => {
    if (!user?.email) return;

    setUnsubscribeLoading(true);
    setUnsubscribeError(null);
    setUnsubscribeSuccess(false);

    try {
      const result = await cancelSubscription(user.email);
      
      if (result.success) {
        setUnsubscribeSuccess(true);
        setIsSubscribed(false);
        setShowConfirmModal(false);
        // Update cached subscription status
        setCachedSubscription(user.email, false);
        // Show success message for 3 seconds then close
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setUnsubscribeError(result.error || 'Failed to cancel subscription');
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setUnsubscribeError('An unexpected error occurred. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setUnsubscribeLoading(false);
    }
  };

  const handleCancelUnsubscribe = () => {
    setShowConfirmModal(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.user_metadata?.full_name || 'User'}
                </h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Member since:</span>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Email verified:</span>
                  <p className="font-medium">
                    {user.email_confirmed_at ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="border-t pt-4">
              <span className="text-gray-500 text-sm">Subscription status:</span>
              {checkingSubscription ? (
                <p className="font-medium text-gray-600 mt-1">Checking...</p>
              ) : (
                <p className={`font-medium mt-1 ${isSubscribed ? 'text-green-600' : 'text-gray-600'}`}>
                  {isSubscribed ? '✓ Active ($39/year)' : 'No active subscription'}
                </p>
              )}
            </div>

            {/* Success Message */}
            {unsubscribeSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm font-medium">
                  ✓ Subscription cancelled successfully
                </p>
              </div>
            )}

            {/* Error Message */}
            {unsubscribeError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{unsubscribeError}</p>
              </div>
            )}

            {/* Unsubscribe Button */}
            {isSubscribed && !unsubscribeSuccess && (
              <div className="border-t pt-4">
                <button
                  onClick={handleUnsubscribeClick}
                  disabled={unsubscribeLoading}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Unsubscribe
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Cancel your $39/year subscription
                </p>
              </div>
            )}

            {/* Sign Out Button */}
            <div className="border-t pt-4">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Cancel Subscription?"
        message="Are you sure you want to cancel your subscription? You will lose access to unlimited travel briefs."
        confirmText="Yes, Unsubscribe"
        cancelText="Keep Subscription"
        onConfirm={handleConfirmUnsubscribe}
        onCancel={handleCancelUnsubscribe}
        isLoading={unsubscribeLoading}
        variant="warning"
      />
    </div>
  );
};
