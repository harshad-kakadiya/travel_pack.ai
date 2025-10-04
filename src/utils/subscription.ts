const KEY_PREFIX = 'subscribed:';

export interface CachedSubscription {
  isSubscribed: boolean;
  updatedAt: number; // epoch ms
}

export function getSubscriptionKey(email: string) {
  return `${KEY_PREFIX}${email.toLowerCase()}`;
}

export function getCachedSubscription(email?: string | null): CachedSubscription | null {
  try {
    if (!email) return null;
    const raw = localStorage.getItem(getSubscriptionKey(email));
    if (!raw) return null;
    return JSON.parse(raw) as CachedSubscription;
  } catch {
    return null;
  }
}

export function setCachedSubscription(email?: string | null, isSubscribed?: boolean) {
  try {
    if (!email || typeof isSubscribed !== 'boolean') return;
    const value: CachedSubscription = { isSubscribed, updatedAt: Date.now() };
    localStorage.setItem(getSubscriptionKey(email), JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function clearCachedSubscription(email?: string | null) {
  try {
    if (!email) return;
    localStorage.removeItem(getSubscriptionKey(email));
  } catch {
    // ignore
  }
}

// Remove all cached subscription entries regardless of email
export function clearAllCachedSubscriptions() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
