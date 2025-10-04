import React from 'react';
import { useInView } from '../hooks/useInView';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type Variant = 'fade' | 'fade-up' | 'fade-right' | 'fade-left' | 'zoom' | 'blur';

type Props = React.PropsWithChildren<{
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  variant?: Variant;
  delay?: number;      // ms
  duration?: number;   // ms
  offset?: string;     // rootMargin
  once?: boolean;
  threshold?: number;
}>;

export default function Reveal({
  as = 'div',
  className,
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 500,
  offset = '0px 0px -5% 0px',
  once = true,
  threshold = 0.1,
}: Props) {
  const Comp: any = as;
  const reduce = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({ 
    root: null, 
    rootMargin: offset, 
    threshold, 
    once 
  });

  const hidden = {
    'fade': 'opacity-0',
    'fade-up': 'opacity-0 translate-y-6',
    'fade-right': 'opacity-0 -translate-x-6',
    'fade-left': 'opacity-0 translate-x-6',
    'zoom': 'opacity-0 scale-[0.96]',
    'blur': 'opacity-0 blur-sm',
  }[variant];

  const shown = 'opacity-100 translate-x-0 translate-y-0 scale-100 blur-0';
  const base = 'will-change-transform will-change-opacity';

  const style: React.CSSProperties = reduce ? {} : {
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    transitionDelay: `${delay}ms`,
  };

  return (
    <Comp
      ref={ref}
      className={[
        className,
        reduce ? '' : base,
        reduce ? '' : (inView ? shown : hidden)
      ].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </Comp>
  );
}