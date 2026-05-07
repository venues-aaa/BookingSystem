# Form Builder Design Tokens Reference

## Quick Reference Guide

This document provides a quick reference for all CSS custom properties (design tokens) used in the form builder components.

## Color Palette

### Primary (Blue)
```css
--fb-primary-50: #eff6ff    /* Lightest blue for backgrounds */
--fb-primary-100: #dbeafe   /* Light blue accents */
--fb-primary-500: #3b82f6   /* Primary brand color */
--fb-primary-600: #2563eb   /* Hover states */
--fb-primary-700: #1d4ed8   /* Pressed states */
```

**Usage**: Buttons, links, selected states, focus indicators

### Neutral (Grays)
```css
--fb-neutral-50: #f9fafb    /* Lightest gray backgrounds */
--fb-neutral-100: #f3f4f6   /* Disabled backgrounds */
--fb-neutral-200: #e5e7eb   /* Borders */
--fb-neutral-300: #d1d5db   /* Hover borders */
--fb-neutral-400: #9ca3af   /* Disabled text */
--fb-neutral-500: #6b7280   /* Placeholder text */
--fb-neutral-600: #4b5563   /* Secondary text */
--fb-neutral-700: #374151   /* Labels */
--fb-neutral-800: #1f2937   /* Headings */
--fb-neutral-900: #111827   /* Primary text */
```

**Usage**: Text, backgrounds, borders, shadows

### Success (Green)
```css
--fb-success-50: #d1fae5    /* Success backgrounds */
--fb-success-500: #10b981   /* Success badges */
--fb-success-600: #059669   /* Success hover */
```

**Usage**: Validation badges, success messages, positive indicators

### Error (Red)
```css
--fb-error-50: #fee2e2      /* Error backgrounds */
--fb-error-500: #ef4444     /* Error badges */
--fb-error-600: #dc2626     /* Error hover */
```

**Usage**: Delete buttons, required indicators, error states

### Warning (Amber)
```css
--fb-warning-50: #fef3c7    /* Warning backgrounds */
--fb-warning-500: #f59e0b   /* Warning badges */
--fb-warning-600: #d97706   /* Warning hover */
```

**Usage**: Tips, hints, caution indicators

## Spacing Scale (4px base)

```css
--fb-space-1: 4px      /* Tiny gaps */
--fb-space-2: 8px      /* Small gaps, input padding */
--fb-space-3: 12px     /* Medium gaps, button padding */
--fb-space-4: 16px     /* Large gaps, card padding */
--fb-space-5: 20px     /* Section spacing */
--fb-space-6: 24px     /* Panel padding */
--fb-space-8: 32px     /* Large section spacing */
--fb-space-10: 40px    /* Extra large spacing */
--fb-space-12: 48px    /* Massive spacing */
--fb-space-16: 64px    /* Huge spacing, empty states */
```

**Usage Pattern**:
- Padding: `--fb-space-2` to `--fb-space-4`
- Gaps: `--fb-space-2` to `--fb-space-3`
- Margins: `--fb-space-4` to `--fb-space-6`
- Section spacing: `--fb-space-6` to `--fb-space-8`

## Border Radius

```css
--fb-radius-sm: 4px     /* Small elements, badges */
--fb-radius-md: 6px     /* Inputs, buttons */
--fb-radius-lg: 8px     /* Cards, panels */
--fb-radius-xl: 12px    /* Large cards, modals */
--fb-radius-full: 9999px /* Pills, circular badges */
```

**Usage**:
- Buttons: `--fb-radius-lg`
- Inputs: `--fb-radius-md`
- Cards: `--fb-radius-lg`
- Badges: `--fb-radius-full`

## Shadows

```css
--fb-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
/* Subtle depth, small elements */

--fb-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06)
/* Standard cards, buttons */

--fb-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                0 4px 6px -2px rgba(0, 0, 0, 0.05)
/* Elevated elements, dropdowns */

--fb-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04)
/* Modals, overlays */

--fb-shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.15)
/* Focus indicators (accessibility) */
```

**Usage**:
- Default cards: `--fb-shadow-sm`
- Hover states: `--fb-shadow-md`
- Active/dragging: `--fb-shadow-lg`
- Focus: `--fb-shadow-focus`

## Transitions

```css
--fb-transition-fast: 150ms ease    /* Quick micro-interactions */
--fb-transition-base: 200ms ease    /* Standard transitions */
--fb-transition-slow: 300ms ease    /* Smooth, noticeable changes */
```

**Usage**:
- Hover effects: `--fb-transition-fast`
- Color changes: `--fb-transition-base`
- Slide animations: `--fb-transition-slow`

## Z-Index Scale

```css
--fb-z-base: 1          /* Normal elements */
--fb-z-dropdown: 10     /* Dropdowns, tooltips */
--fb-z-sticky: 20       /* Sticky headers */
--fb-z-overlay: 30      /* Overlays, backdrops */
--fb-z-modal: 40        /* Modals, dialogs */
--fb-z-tooltip: 50      /* Tooltips (highest) */
```

**Usage**:
- Sticky header: `z-index: var(--fb-z-sticky)`
- Tooltips: `z-index: var(--fb-z-tooltip)`
- Mobile panels: `z-index: var(--fb-z-dropdown)`

## Common Patterns

### Button Gradient
```css
background: linear-gradient(135deg,
  var(--fb-primary-500) 0%,
  var(--fb-primary-600) 100%);
```

### Card Background
```css
background: linear-gradient(135deg,
  #ffffff 0%,
  var(--fb-primary-50) 100%);
```

### Focus State
```css
border-color: var(--fb-primary-500);
box-shadow: var(--fb-shadow-focus);
```

### Disabled State
```css
background: var(--fb-neutral-100);
color: var(--fb-neutral-400);
cursor: not-allowed;
```

### Hover Transform
```css
transition: all var(--fb-transition-base);
transform: translateY(-2px);
box-shadow: var(--fb-shadow-md);
```

### Active/Pressed State
```css
transform: translateY(0) scale(0.98);
```

## Typography Scale (Inherited)

While not defined as custom properties, the form builder uses these sizes:

```css
/* Headings */
h2: 20px (600 weight)
h3: 18px (700 weight)
h4: 16px (600 weight)

/* Body Text */
Base: 14px (400-500 weight)
Small: 13px (400-500 weight)
Tiny: 12px (400-500 weight)
Badge: 10-11px (700 weight, uppercase)
```

## Using Tokens in New Components

### Example: Custom Button
```css
.my-custom-button {
  padding: var(--fb-space-2) var(--fb-space-4);
  background: linear-gradient(135deg,
    var(--fb-primary-500) 0%,
    var(--fb-primary-600) 100%);
  color: white;
  border: none;
  border-radius: var(--fb-radius-lg);
  box-shadow: var(--fb-shadow-md);
  transition: all var(--fb-transition-base);
  cursor: pointer;
}

.my-custom-button:hover {
  box-shadow: var(--fb-shadow-lg);
  transform: translateY(-2px);
}

.my-custom-button:focus-visible {
  outline: none;
  box-shadow: var(--fb-shadow-focus);
}

.my-custom-button:active {
  transform: translateY(0);
}
```

### Example: Custom Card
```css
.my-custom-card {
  padding: var(--fb-space-6);
  background: white;
  border: 2px solid var(--fb-neutral-200);
  border-radius: var(--fb-radius-lg);
  box-shadow: var(--fb-shadow-sm);
  transition: all var(--fb-transition-base);
}

.my-custom-card:hover {
  border-color: var(--fb-primary-400);
  box-shadow: var(--fb-shadow-md);
}
```

## Responsive Breakpoints

While not tokens, these are the standard breakpoints:

```css
/* Mobile-first approach */
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 1200px) { /* Small desktop */ }
```

## Animation Keyframes

Pre-defined animations available globally:

```css
@keyframes fadeIn { /* Opacity 0 → 1 */ }
@keyframes fadeInUp { /* Slide up + fade */ }
@keyframes slideDown { /* Slide from top */ }
@keyframes slideInLeft { /* Slide from left */ }
@keyframes slideInRight { /* Slide from right */ }
@keyframes floatIn { /* Scale + slide up */ }
@keyframes scaleIn { /* Scale 0.95 → 1 */ }
@keyframes spin { /* 360° rotation */ }
@keyframes pulse { /* Opacity pulse */ }
@keyframes glow { /* Shadow pulse */ }
@keyframes floatBounce { /* Vertical bounce */ }
@keyframes placeholderPulse { /* Opacity pulse for placeholder */ }
@keyframes gradientShift { /* Background gradient animation */ }
```

## Best Practices

1. **Always use tokens** instead of hardcoded values
2. **Use semantic names**: `--fb-primary-500` not `#3b82f6`
3. **Maintain spacing scale**: Multiply by 4 for consistency
4. **Combine shadows**: Use multiple for depth (e.g., `var(--fb-shadow-focus), var(--fb-shadow-md)`)
5. **Accessibility first**: Always include focus states with `--fb-shadow-focus`
6. **Performance**: Use `transform` and `opacity` for animations
7. **Gradients**: Always 135deg diagonal for consistency

---

**Version**: 1.0
**Last Updated**: 2026-04-16
**Compatibility**: All modern browsers (Chrome 90+, Firefox 88+, Safari 14.1+)
