# MOBILE_SHOW_MORE_CHECKS.md

## Implementation Summary

Added mobile-only "Show more / Show less" toggle functionality per persona section on the static Examples page (`/examples`). The Step-2 checkout flow remains completely unchanged.

## Files Modified

### `src/pages/Examples.tsx`
- Added state management for expanded personas: `expandedPersonas` state and related functions
- Modified card visibility logic to respect expansion state on mobile
- Added mobile-only toggle buttons with proper ARIA attributes
- Used `sm:hidden` to hide buttons on tablet and desktop

## Implementation Details

### State Management
```jsx
const [expandedPersonas, setExpandedPersonas] = useState<Record<string, boolean>>({});
const isPersonaExpanded = (persona: string) => !!expandedPersonas[persona];
const togglePersonaExpansion = (persona: string) => {
  setExpandedPersonas(prev => ({ ...prev, [persona]: !prev[persona] }));
};
```

### Visibility Logic
- **Mobile (≤sm)**: Shows 2 cards initially, expands to all when toggled
- **Tablet+ (≥sm)**: Always shows all cards, toggle button hidden
- **Conditional classes**: `(!isPersonaExpanded(persona) && i >= 2) ? 'hidden sm:block' : 'block'`

### Toggle Button
- Only visible on mobile (`sm:hidden`)
- Shows count of additional cards: "Show more (3 more)"
- Proper ARIA attributes for accessibility
- Styled consistently with existing design system

## Verification Checklist

### Mobile Behavior (≤640px width):
- [ ] `/examples` initially shows 2 cards per persona section
- [ ] "Show more" button appears below each persona section with >2 cards
- [ ] Clicking "Show more" reveals all cards for that persona
- [ ] Button text changes to "Show less" after expansion
- [ ] Clicking "Show less" collapses back to 2 cards
- [ ] Each persona section toggles independently

### Desktop Behavior (≥640px width):
- [ ] `/examples` shows all cards per persona section
- [ ] No "Show more/less" buttons are visible
- [ ] Layout remains unchanged from original design

### Step-2 Checkout Flow:
- [ ] `/examples-checkout-step` behavior is completely unchanged
- [ ] No Step-2 files were modified
- [ ] Checkout flow navigation and guards work normally

### Accessibility:
- [ ] Toggle buttons have proper `aria-expanded` attributes
- [ ] Toggle buttons have `aria-controls` pointing to persona sections
- [ ] Button text clearly indicates action and count

## Safety Verification

### Files NOT Modified:
- `src/pages/ExamplesCheckoutStep.tsx` - No changes to Step-2 behavior
- `src/App.tsx` - No additional route changes needed
- `src/components/Header.tsx` - No navigation changes needed
- Any other checkout flow components

### Scope Compliance:
✅ Only modified the static Examples page file
✅ No shared components were altered
✅ No Step-2 files were touched
✅ Used Tailwind responsive utilities (`sm:hidden`, `sm:block`)
✅ Maintained identical content and styling
✅ Added progressive disclosure without changing base layout

## Technical Implementation

### Responsive Breakpoints:
- **Mobile (sm and below)**: `≤639px` - Shows 2 cards initially with toggle
- **Tablet and up (sm and above)**: `≥640px` - Shows all cards, no toggle

### State Structure:
- `expandedPersonas`: Object mapping persona names to boolean expansion state
- Independent state per persona allows individual control
- Default collapsed state ensures consistent initial experience

### Button Behavior:
- Dynamic text based on expansion state
- Count display shows number of additional cards available
- Smooth transitions using existing Tailwind classes
- Consistent styling with existing button patterns

### Performance Impact:
- Minimal: All cards are rendered, visibility controlled via CSS
- No dynamic data fetching or complex state management
- Maintains React key stability and component lifecycle