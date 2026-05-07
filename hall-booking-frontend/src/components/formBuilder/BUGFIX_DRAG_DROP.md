# Drag-and-Drop Bug Fix: Repeating Group Field Sticking to Cursor

## Problem Description

The "repeating group" field type was getting stuck to the mouse cursor and could not be dropped onto the canvas. The cursor remained in a "grabbing" state even after the drag operation should have ended.

## Root Cause

The bug was caused by the `field-dragging` CSS class not being properly removed from the `document.body` element in certain edge cases:

1. **Missing cleanup on successful drop** - The class was only removed in `handleDragEnd` in FieldPalette.js, but not when the drop succeeded in DesignCanvas.js
2. **No fallback cleanup** - If the `dragend` event didn't fire (browser inconsistencies, timing issues), the class would remain indefinitely
3. **No cleanup on drag leave** - When dragging out of the canvas area without dropping, the class persisted
4. **No cleanup on component unmount** - If the component unmounted during a drag operation, the class remained

The `field-dragging` class sets `cursor: grabbing` on all field items (FieldPalette.css line 477-479), causing the visual bug.

## Solution

Implemented a multi-layered cleanup strategy:

### 1. Centralized Cleanup Function (FieldPalette.js)
```javascript
const cleanupDragState = () => {
  if (dragTimeoutRef.current) {
    clearTimeout(dragTimeoutRef.current);
    dragTimeoutRef.current = null;
  }
  document.body.classList.remove('field-dragging');
};
```

### 2. Timeout Failsafe (FieldPalette.js)
Added a 5-second timeout in `handleDragStart` to force cleanup if the drag event chain breaks:
```javascript
dragTimeoutRef.current = setTimeout(cleanupDragState, 5000);
```

### 3. Drop Event Cleanup (DesignCanvas.js)
Added cleanup in the `handleDrop` function to ensure the class is removed when the field is successfully dropped:
```javascript
document.body.classList.remove('field-dragging');
```

### 4. Drag Leave Cleanup (DesignCanvas.js)
Added cleanup in `handleDragLeave` to remove the class when the user drags outside the canvas area:
```javascript
if (e.currentTarget === e.target) {
  document.body.classList.remove('field-dragging');
}
```

### 5. Component Unmount Cleanup (FieldPalette.js)
Added a `useEffect` cleanup hook to ensure the class is removed if the component unmounts during a drag:
```javascript
React.useEffect(() => {
  return () => {
    cleanupDragState();
  };
}, []);
```

## Files Modified

1. `/src/components/formBuilder/FieldPalette.js`
   - Added `dragTimeoutRef` to track cleanup timeout
   - Created centralized `cleanupDragState()` function
   - Added timeout failsafe in `handleDragStart()`
   - Added `useEffect` cleanup hook

2. `/src/components/formBuilder/DesignCanvas.js`
   - Added cleanup in `handleDrop()`
   - Added cleanup in `handleDragLeave()`

## Testing

To verify the fix works:

1. Navigate to `/admin/categories/{id}/design`
2. Try dragging the "Repeating Group" field from the palette
3. Drop it onto the canvas - cursor should return to normal
4. Try dragging and moving outside the canvas - cursor should return to normal
5. Try dragging and releasing without dropping - cursor should return to normal within 5 seconds

## Prevention

The multi-layered approach ensures that even if one cleanup mechanism fails, others will catch it:
- Immediate cleanup on successful operations
- Timeout-based cleanup for edge cases
- Component lifecycle cleanup for abnormal termination

This defensive programming approach prevents the bug from recurring even if browser behavior changes or new edge cases emerge.
