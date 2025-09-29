import { useEffect } from 'react';

export function useHitTestDebug() {
  useEffect(() => {
    // Only activate when ?debug=hit is in URL
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('debug') || urlParams.get('debug') !== 'hit') return;

    const handleClick = (e: MouseEvent) => {
      // Get the topmost element under the cursor
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      
      if (!elementUnderCursor) return;

      // Log detailed information about the element
      const rect = elementUnderCursor.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(elementUnderCursor);
      
      console.info('🎯 Hit Test Debug:', {
        element: elementUnderCursor,
        tagName: elementUnderCursor.tagName,
        className: elementUnderCursor.className,
        id: elementUnderCursor.id,
        testId: elementUnderCursor.getAttribute('data-testid'),
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        },
        styles: {
          position: computedStyle.position,
          zIndex: computedStyle.zIndex,
          pointerEvents: computedStyle.pointerEvents,
          display: computedStyle.display,
          visibility: computedStyle.visibility
        },
        inlineStyles: elementUnderCursor.getAttribute('style')
      });

      // Flash outline on the element
      const originalOutline = elementUnderCursor.style.outline;
      elementUnderCursor.style.outline = '3px solid red';
      elementUnderCursor.style.outlineOffset = '2px';
      
      setTimeout(() => {
        elementUnderCursor.style.outline = originalOutline;
        elementUnderCursor.style.outlineOffset = '';
      }, 500);
    };

    // Add click listener with capture to intercept before other handlers
    document.addEventListener('click', handleClick, true);

    console.info('🔍 Hit test debugger active. Click elements to see what\'s intercepting.');

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);
}