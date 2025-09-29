import { useEffect, useRef, useState } from 'react';

type Opts = { 
  root?: Element | null; 
  rootMargin?: string; 
  threshold?: number; 
  once?: boolean; 
};

export function useInView<T extends HTMLElement>({ 
  root = null, 
  rootMargin = '0px 0px -10% 0px', 
  threshold = 0.15, 
  once = true 
}: Opts = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) obs.disconnect();
      } else if (!once) {
        setInView(false);
      }
    }, { root, rootMargin, threshold });
    
    obs.observe(el);
    return () => obs.disconnect();
  }, [root, rootMargin, threshold, once]);
  
  return { ref, inView } as const;
}