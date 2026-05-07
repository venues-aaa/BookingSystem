# Form Builder Visual Style Guide

## Color Palette

### Primary Colors
```css
--fb-primary-50:  #eff6ff  /* Lightest - backgrounds */
--fb-primary-100: #dbeafe  /* Light - hover states */
--fb-primary-500: #3b82f6  /* Base - primary actions */
--fb-primary-600: #2563eb  /* Dark - hover on primary */
--fb-primary-700: #1d4ed8  /* Darkest - text accents */
```

**Usage**: Primary actions, links, focus states, selected states

### Semantic Colors

#### Success (Green)
```css
--fb-success-50:  #d1fae5
--fb-success-500: #10b981
--fb-success-600: #059669
```
**Usage**: Validation badges, success messages, checkmarks

#### Error (Red)
```css
--fb-error-50:  #fee2e2
--fb-error-500: #ef4444
--fb-error-600: #dc2626
```
**Usage**: Delete buttons, error states, required indicators

#### Warning (Amber)
```css
--fb-warning-50:  #fef3c7
--fb-warning-500: #f59e0b
--fb-warning-600: #d97706
```
**Usage**: Tooltips, hints, keyboard shortcuts, warnings

### Neutral Scale
```css
--fb-neutral-50:  #f9fafb  /* Backgrounds */
--fb-neutral-100: #f3f4f6  /* Borders, dividers */
--fb-neutral-200: #e5e7eb  /* Subtle borders */
--fb-neutral-300: #d1d5db  /* Default borders */
--fb-neutral-400: #9ca3af  /* Disabled text */
--fb-neutral-500: #6b7280  /* Secondary text */
--fb-neutral-600: #4b5563  /* Body text */
--fb-neutral-700: #374151  /* Headings */
--fb-neutral-800: #1f2937  /* Dark headings */
--fb-neutral-900: #111827  /* Darkest text */
```

---

## Typography

### Font Families
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
```

### Font Sizes
```css
/* Headings */
h1: 32px, weight: 800, letter-spacing: -0.04em
h2: 28px, weight: 700, letter-spacing: -0.03em
h3: 24px, weight: 700, letter-spacing: -0.02em
h4: 20px, weight: 600, letter-spacing: -0.02em

/* Body */
Large:   17px, weight: 400, line-height: 1.6
Base:    15px, weight: 400, line-height: 1.6
Small:   14px, weight: 400, line-height: 1.5
Tiny:    13px, weight: 400, line-height: 1.5
Caption: 12px, weight: 400, line-height: 1.5
Label:   11px, weight: 700, line-height: 1.4
Badge:   10px, weight: 800, letter-spacing: 0.08em
```

### Font Weights
```css
Regular:    400
Medium:     500
Semibold:   600
Bold:       700
Extra Bold: 800
```

---

## Spacing System

### 4px Base Scale
```css
--fb-space-1:  4px   /* Tiny gaps */
--fb-space-2:  8px   /* Small gaps */
--fb-space-3:  12px  /* Default gaps */
--fb-space-4:  16px  /* Medium gaps */
--fb-space-5:  20px  /* Large gaps */
--fb-space-6:  24px  /* Extra large gaps */
--fb-space-8:  32px  /* Section spacing */
--fb-space-10: 40px  /* Large sections */
--fb-space-12: 48px  /* Page sections */
--fb-space-16: 64px  /* Hero sections */
```

### Usage Guidelines
- **Component padding**: Use space-3 to space-5
- **Gap between items**: Use space-2 to space-4
- **Section spacing**: Use space-6 to space-10
- **Large hero areas**: Use space-12 to space-16

---

## Border Radius

```css
--fb-radius-sm:   4px   /* Small elements, badges */
--fb-radius-md:   6px   /* Buttons, inputs */
--fb-radius-lg:   8px   /* Cards, panels */
--fb-radius-xl:   12px  /* Large cards */
--fb-radius-full: 9999px /* Pills, circles */
```

### Usage
- **Buttons**: md (6px)
- **Input fields**: md-lg (6-8px)
- **Cards**: lg-xl (8-12px)
- **Badges**: md or full (6px or round)
- **Modal dialogs**: xl (12px)

---

## Shadows

### Elevation Levels
```css
/* Subtle elevation */
--fb-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)

/* Default elevation */
--fb-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06)

/* Raised elevation */
--fb-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                0 4px 6px -2px rgba(0, 0, 0, 0.05)

/* Floating elevation */
--fb-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04)

/* Focus ring */
--fb-shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.15)
```

### Shadow Layers
- **sm**: Subtle borders, dividers
- **md**: Buttons, inputs, small cards
- **lg**: Panels, dropdowns
- **xl**: Modals, popovers
- **focus**: All focusable elements

---

## Animations

### Timing Functions
```css
--fb-transition-fast: 150ms ease  /* Quick feedback */
--fb-transition-base: 200ms ease  /* Standard transitions */
--fb-transition-slow: 300ms ease  /* Large movements */
```

### Easing Curves
```css
/* Standard easing */
ease: cubic-bezier(0.25, 0.1, 0.25, 1)

/* Smooth entrance */
ease-out: cubic-bezier(0, 0, 0.2, 1)

/* Snappy exit */
ease-in: cubic-bezier(0.4, 0, 1, 1)

/* Material motion */
cubic-bezier(0.4, 0, 0.2, 1)
```

### Animation Principles
1. **Use transform and opacity only** for 60fps
2. **Apply will-change sparingly** (only during active drag)
3. **Stagger list animations** (0.05s-0.1s delays)
4. **Respect prefers-reduced-motion** media query

### Common Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In from Left */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Float Bounce */
@keyframes floatBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Pulse Glow */
@keyframes pulseGlow {
  0%, 100% { box-shadow: /* smaller shadow */; }
  50% { box-shadow: /* larger shadow */; }
}
```

---

## Gradients

### Background Gradients
```css
/* Subtle background */
background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);

/* Primary gradient */
background: linear-gradient(135deg,
  var(--fb-primary-500) 0%,
  var(--fb-primary-600) 100%
);

/* Success gradient */
background: linear-gradient(135deg,
  var(--fb-success-50) 0%,
  #d1fae5 100%
);

/* Error gradient */
background: linear-gradient(135deg,
  var(--fb-error-50) 0%,
  #fef2f2 100%
);
```

### Usage Rules
- **Direction**: Always 135deg for consistency
- **Stop points**: 0% and 100% for full coverage
- **Hover states**: Shift colors darker by 100 units
- **Overlays**: Use with opacity 0.05-0.1

---

## Component Patterns

### Button Styles

#### Primary Button
```css
padding: 8px 20px;
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
color: white;
border: none;
border-radius: 8px;
font-weight: 600;
box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
transition: all 200ms ease;

/* Hover */
background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
transform: translateY(-2px);
```

#### Secondary Button
```css
padding: 8px 20px;
background: white;
color: #374151;
border: 2px solid #d1d5db;
border-radius: 8px;
font-weight: 600;
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
transition: all 200ms ease;

/* Hover */
background: #f9fafb;
border-color: #3b82f6;
color: #2563eb;
transform: translateY(-2px);
```

### Input Fields
```css
width: 100%;
padding: 8px 12px;
border: 2px solid #e5e7eb;
border-radius: 8px;
font-size: 14px;
background: white;
transition: all 200ms ease;

/* Focus */
border-color: #3b82f6;
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
```

### Cards
```css
background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
border: 2px solid #e5e7eb;
border-radius: 12px;
padding: 16px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
transition: all 200ms ease;

/* Hover */
border-color: #3b82f6;
box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
transform: translateY(-3px);
```

### Badges
```css
display: inline-flex;
padding: 4px 8px;
background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
border: 1px solid #3b82f6;
border-radius: 6px;
font-size: 11px;
font-weight: 700;
color: #1d4ed8;
letter-spacing: 0.05em;
text-transform: uppercase;
```

---

## Accessibility Guidelines

### Focus States
```css
/* All interactive elements MUST have visible focus */
:focus-visible {
  outline: 3px solid var(--fb-primary-500);
  outline-offset: 2px;
}
```

### Color Contrast Requirements
- **Normal text**: 4.5:1 minimum
- **Large text (18px+ or 14px+ bold)**: 3:1 minimum
- **UI components**: 3:1 minimum

### Touch Targets
- **Minimum size**: 44x44px for all interactive elements
- **Mobile spacing**: Minimum 8px between targets

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  /* Increase border widths */
  border-width: 3px;

  /* Ensure clear visual boundaries */
  outline: 2px solid currentColor;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Mobile-First Approach
Start with mobile styles, enhance for larger screens.

### Breakpoint Usage
```css
/* Mobile-first base styles */
.component {
  padding: 12px;
  font-size: 14px;
}

/* Tablet and up */
@media (min-width: 769px) {
  .component {
    padding: 16px;
    font-size: 15px;
  }
}

/* Desktop and up */
@media (min-width: 1025px) {
  .component {
    padding: 20px;
    font-size: 16px;
  }
}
```

### Touch Considerations
- Larger click targets (44x44px minimum)
- More spacing between interactive elements
- Simplified hover states (no dependency on hover)

---

## Z-Index Scale

```css
--fb-z-base:     1   /* Default layer */
--fb-z-dropdown: 10  /* Dropdowns, mobile panels */
--fb-z-sticky:   20  /* Sticky headers */
--fb-z-overlay:  30  /* Modal overlays */
--fb-z-modal:    40  /* Modal dialogs */
--fb-z-tooltip:  50  /* Tooltips, popovers */
```

**Rule**: Never use arbitrary z-index values. Always use the scale.

---

## Icon Guidelines

### Icon Library
Using **react-icons** (FontAwesome solid icons)

### Sizes
```css
Small:  14px  /* Inline with text */
Base:   16px  /* Buttons, inputs */
Large:  18px  /* Headers, feature icons */
XLarge: 24px  /* Empty states */
Hero:   48px+ /* Large empty states */
```

### Colors
- **Default**: var(--fb-neutral-400)
- **Hover**: var(--fb-primary-500)
- **Active**: var(--fb-primary-600)
- **Disabled**: var(--fb-neutral-300)

### Accessibility
- Always use `aria-hidden="true"` on decorative icons
- Provide text alternatives for functional icons

---

## CSS Organization

### File Structure
```
component/
├── Component.js        # React component
├── Component.css       # Component styles
└── Component.test.js   # Tests
```

### CSS Ordering
1. Position properties (position, top, left, z-index)
2. Display & Box Model (display, flex, grid, width, height, padding, margin)
3. Typography (font-family, font-size, line-height, color)
4. Visual (background, border, box-shadow)
5. Misc (cursor, transition, animation)

### Naming Conventions
```css
/* BEM-inspired, component-scoped */
.component-name { }
.component-name-element { }
.component-name-element-modifier { }
```

---

## Performance Best Practices

### CSS Performance
1. **Avoid expensive properties**:
   - box-shadow (OK for static states)
   - filter, backdrop-filter (use sparingly)
   - Complex gradients

2. **Prefer transform over position**:
   ```css
   /* Good - GPU accelerated */
   transform: translateX(10px);

   /* Bad - triggers layout */
   left: 10px;
   ```

3. **Use will-change wisely**:
   ```css
   /* Only during active interaction */
   .dragging {
     will-change: transform;
   }
   ```

### Animation Performance
- **60fps target**: Use transform and opacity only
- **Avoid**: width, height, top, left, margin, padding during animations
- **Use**: translateX/Y, scale, rotate, opacity

---

## Browser Support Notes

### Modern Features Used
- CSS Custom Properties (variables)
- CSS Grid
- Flexbox
- transform, transition
- @supports queries

### Fallbacks
```css
/* Grid with Flexbox fallback */
@supports not (display: grid) {
  display: flex;
  flex-wrap: wrap;
}
```

### Vendor Prefixes
```css
/* Webkit-specific (Safari) */
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## Common Mistakes to Avoid

### ❌ Don't
- Use inline styles (bypasses media queries)
- Hardcode pixel values (use spacing scale)
- Use arbitrary z-index values (use scale)
- Animate width/height (use transform)
- Use !important (fix specificity instead)
- Forget focus states
- Ignore reduced motion preferences

### ✅ Do
- Use CSS custom properties
- Follow spacing scale
- Use z-index scale
- Animate with transform/opacity
- Use proper specificity
- Include focus-visible states
- Respect prefers-reduced-motion

---

## Quick Reference

### Most Common Values
```css
/* Spacing */
Gap between items:       var(--fb-space-3)    /* 12px */
Button padding:          var(--fb-space-2) var(--fb-space-5)
Card padding:            var(--fb-space-4)    /* 16px */
Section spacing:         var(--fb-space-8)    /* 32px */

/* Radius */
Buttons/Inputs:          var(--fb-radius-md)  /* 6px */
Cards:                   var(--fb-radius-lg)  /* 8px */
Badges:                  var(--fb-radius-full) /* Round */

/* Shadows */
Buttons:                 var(--fb-shadow-md)
Cards:                   var(--fb-shadow-lg)
Modals:                  var(--fb-shadow-xl)
Focus:                   var(--fb-shadow-focus)

/* Transitions */
Quick feedback:          var(--fb-transition-fast)  /* 150ms */
Standard:                var(--fb-transition-base)  /* 200ms */
Large movement:          var(--fb-transition-slow)  /* 300ms */
```

---

**Version**: 2.0
**Last Updated**: 2026-04-16
