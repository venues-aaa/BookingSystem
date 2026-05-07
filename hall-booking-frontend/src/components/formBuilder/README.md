# Form Builder - Enhanced UI/UX Documentation

## Quick Start

The form builder has been enhanced with modern UI/UX patterns, comprehensive accessibility features, and responsive design. All enhancements are backward compatible.

## Component Overview

### 1. FormBuilder.js
**Main orchestrator component that manages state and coordinates child components.**

**Key Features:**
- Manages field list and selection state
- Handles save/preview modes
- Coordinates field updates and deletions
- Enhanced loading and error states

**No breaking changes** - All existing functionality preserved.

---

### 2. FieldPalette.js (Complete Rewrite)
**Left sidebar showing available field types with search and filtering.**

#### New Features
- **Search**: Real-time filter with clear button
- **Category Tabs**: Filter by Basic, Choice, Booking, Advanced
- **Enhanced Tooltips**: Hover to see field descriptions
- **Keyboard Support**: Tab navigation + Enter to add
- **Visual Feedback**: Improved drag indicators

#### Usage
```jsx
<FieldPalette />
```

No props required. Automatically handles field type display and drag operations.

#### Keyboard Shortcuts
- `Tab` - Navigate between fields
- `Enter` - Add focused field to canvas
- `Escape` - Clear search (when search is focused)

---

### 3. DesignCanvas.js (Enhanced)
**Main canvas area for drag-and-drop field arrangement.**

#### New Features
- **Drop Indicator**: Animated line showing drop position
- **Enhanced Empty State**: 4-step guide + instructional steps
- **Better Grid**: Subtle background pattern for alignment
- **Keyboard Support**: Escape to deselect

#### Props
```javascript
{
  fields: Array,          // Array of field objects
  onFieldUpdate: Function, // Callback(fieldId, updatedField)
  onFieldDelete: Function, // Callback(fieldId)
  onFieldSelect: Function, // Callback(fieldId)
  selectedFieldId: String  // Currently selected field ID
}
```

#### Keyboard Shortcuts
- `Escape` - Deselect current field

---

### 4. FieldRenderer.js (Complete Rewrite)
**Individual field component shown in the canvas.**

#### New Features
- **Validation Badges**: Show min/max rules inline
- **Booking Validation Indicator**: Special badge for booking rules
- **Selection Indicator**: Left accent bar when selected
- **Enhanced Previews**: More realistic field appearances

#### Props
```javascript
{
  field: Object,      // Field configuration
  isSelected: Boolean, // Selection state
  onSelect: Function,  // Selection callback
  onDelete: Function   // Deletion callback
}
```

#### Keyboard Shortcuts
- `Enter` or `Space` - Select field
- `Delete` or `Backspace` - Delete field (with confirmation)

---

### 5. FieldPropertiesPanel.js (CSS Enhanced)
**Right sidebar for configuring selected field properties.**

**No code changes** - CSS enhanced for better visual design.

All existing functionality preserved.

---

## Design System

### CSS Custom Properties
All visual tokens are centralized in `FormBuilder.css`:

```css
/* Colors */
--fb-primary-500: #3b82f6
--fb-success-500: #10b981
--fb-error-500: #ef4444
--fb-warning-500: #f59e0b
--fb-neutral-{50-900}: Gray scale

/* Spacing (4px base scale) */
--fb-space-{1-16}: 4px to 64px

/* Border Radius */
--fb-radius-{sm,md,lg,xl,full}

/* Shadows */
--fb-shadow-{sm,md,lg,xl,focus}

/* Transitions */
--fb-transition-{fast,base,slow}

/* Z-Index */
--fb-z-{base,dropdown,sticky,overlay,modal,tooltip}
```

### Responsive Breakpoints
```css
Desktop:  > 1024px (default)
Tablet:   769px - 1024px
Mobile:   ≤ 768px
```

---

## Accessibility Features

### Keyboard Navigation
✅ **Full keyboard support** for all interactions
✅ **Visible focus indicators** (3px outlines)
✅ **Logical tab order** throughout interface
✅ **Keyboard shortcuts** documented in UI

### Screen Readers
✅ **ARIA labels** on all interactive elements
✅ **Role attributes** (button, group, status, etc.)
✅ **Live regions** for dynamic updates
✅ **Descriptive text** for icon-only buttons

### Visual Accessibility
✅ **WCAG AA contrast ratios** (4.5:1 minimum)
✅ **High contrast mode** support
✅ **No information by color alone**
✅ **Clear focus indicators**

### Motor Accessibility
✅ **Large click targets** (44x44px minimum)
✅ **No time limits** on interactions
✅ **Forgiving click areas**
✅ **Alternative interaction methods** (keyboard + mouse)

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* All animations disabled automatically */
}
```

---

## Browser Support

### Fully Supported
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Graceful Degradation
- Older browsers get functional UI without animations
- CSS Grid falls back to Flexbox where needed
- No polyfills required

---

## Performance

### Optimizations
- **60fps animations** using transform/opacity only
- **Hardware acceleration** for drag operations
- **will-change** applied only during active dragging
- **CSS containment** for scrollable areas
- **Debounced search** input

### Web Vitals Targets
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

---

## Customization

### Theming
All colors use CSS custom properties. To customize:

```css
:root {
  --fb-primary-500: #your-color;
  --fb-primary-600: #your-darker-color;
  /* ... etc */
}
```

### Spacing
Adjust the 4px base scale:

```css
:root {
  --fb-space-1: 4px;  /* Change base unit */
  /* All other spacing scales proportionally */
}
```

---

## Common Tasks

### Adding New Field Types
1. Add to `FIELD_TYPES` array in `FieldPalette.js`
2. Add preview renderer in `FieldRenderer.js` `renderFieldPreview()`
3. Add property configuration in `FieldPropertiesPanel.js`

### Customizing Empty State
Edit `.canvas-empty-state` section in `DesignCanvas.js`

### Changing Animation Duration
Modify transition variables:
```css
--fb-transition-fast: 150ms ease;
--fb-transition-base: 200ms ease;
--fb-transition-slow: 300ms ease;
```

---

## Testing Recommendations

### Manual Testing Checklist
- [ ] Drag and drop all field types
- [ ] Search and filter fields
- [ ] Keyboard navigation through entire interface
- [ ] Mobile responsive layout
- [ ] Screen reader announcements
- [ ] High contrast mode
- [ ] Reduced motion mode
- [ ] All validation badges appear correctly

### Automated Testing
```bash
# Visual regression (if Chromatic set up)
npm run chromatic

# Accessibility testing (if jest-axe configured)
npm test -- FieldPalette.test.js

# Cross-browser (if Playwright configured)
npm run test:e2e
```

### Accessibility Testing Tools
- **axe DevTools**: Browser extension for automated checks
- **NVDA/JAWS**: Screen reader testing
- **Keyboard**: Tab through entire interface
- **Zoom**: Test at 200% zoom level

---

## Migration from Previous Version

### Breaking Changes
**None.** All enhancements are backward compatible.

### New Dependencies
**None.** Uses existing `react-icons` and `react-grid-layout`.

### What Changed
1. **FieldPalette.js**: Complete rewrite with search/filter
2. **DesignCanvas.js**: Enhanced with drop indicators
3. **FieldRenderer.js**: Complete rewrite with validation badges
4. **All CSS files**: Enhanced with modern design system

### What Stayed the Same
1. All existing props and callbacks
2. Field data structure
3. FormBuilder orchestration logic
4. Integration with parent components

---

## Troubleshooting

### Field won't drag
- Check that `draggable` attribute is set
- Verify `onDragStart` handler is attached
- Ensure no conflicting CSS `pointer-events: none`

### Styles not applying
- Verify CSS custom properties are defined in FormBuilder.css
- Check CSS import order
- Ensure no CSS specificity conflicts

### Keyboard navigation not working
- Verify `tabIndex={0}` on interactive elements
- Check `onKeyDown` handlers are attached
- Ensure no `tabIndex={-1}` on focusable elements

### Mobile panels not sliding
- Check for `mobile-open` class toggle
- Verify transform transitions in CSS
- Test on actual mobile device (not just DevTools)

---

## Additional Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WAI-ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility

---

## Support

For questions or issues:
1. Check `ENHANCEMENT_SUMMARY.md` for detailed technical documentation
2. Review component PropTypes for API reference
3. Inspect CSS custom properties for theming options

---

**Last Updated**: 2026-04-16
**Version**: 2.0 (Enhanced UI/UX)
