# Mobile Responsive Terminal

## Overview
The PWV Discovery Terminal is now fully responsive and optimized for mobile, tablet, and desktop devices.

## Responsive Features

### 1. **Dynamic Box Width** 📦
The terminal boxes automatically adjust based on viewport size:
- **Mobile (< 640px)**: 40 characters wide
- **Tablet (640-768px)**: 50 characters wide  
- **Desktop (> 768px)**: 64 characters wide

Implementation:
```typescript
// QueryEngine now accepts dynamic width
constructor(data: ExtractedData, boxWidth: number = 64)

// Updates on window resize
const getBoxWidth = (): number => {
  const width = window.innerWidth;
  if (width < 640) return 40;
  if (width < 768) return 50;
  return 64;
};
```

### 2. **Responsive Typography** 📝

#### Font Sizes Scale by Device:
- **Mobile**: `0.5rem` - `0.65rem` (ASCII art and text)
- **Tablet**: `0.75rem` - `xs`
- **Desktop**: `sm` - `base`

#### Key Elements:
- ASCII logo: `text-[0.5rem] sm:text-xs md:text-sm`
- Terminal output: `text-[0.65rem] sm:text-xs md:text-sm`
- Input prompt: `text-xs sm:text-sm md:text-base`
- Boot sequence: `text-[0.65rem] sm:text-xs md:text-sm`

### 3. **Touch-Friendly Improvements** 👆

#### iOS Zoom Prevention:
```css
@media (hover: none) and (pointer: coarse) {
  input {
    font-size: 16px; /* Prevents auto-zoom on iOS */
  }
}
```

#### Mobile Helper Text:
```jsx
<div className="sm:hidden mt-3 text-xs text-pwv-green/50">
  <p>💡 Tap input to type commands</p>
  <p>Try: help, surprise me</p>
</div>
```

### 4. **Optimized Scrolling** 📜

#### Horizontal Overflow:
```css
overflow-x-auto /* For boxes and ASCII art */
max-width: 100%  /* Prevent content from breaking layout */
```

#### Vertical Scrolling:
```css
/* Mobile: More compact */
max-h-[60vh]

/* Desktop: More space */
md:max-h-[70vh]
```

#### Custom Scrollbar (Mobile):
```css
@media (max-width: 768px) {
  .terminal-output::-webkit-scrollbar {
    width: 4px;
  }
  .terminal-output::-webkit-scrollbar-thumb {
    background: rgba(0, 210, 46, 0.3);
  }
}
```

### 5. **Responsive Layout** 📱

#### Padding:
- Mobile: `p-3` (0.75rem)
- Tablet: `sm:p-4` (1rem)
- Desktop: `md:p-8` (2rem)

#### Input Area:
```jsx
<form className="terminal-input flex items-center gap-2">
  <label className="text-xs sm:text-sm md:text-base flex-shrink-0">
    pwv:~$
  </label>
  <input className="flex-1 min-w-0 text-xs sm:text-sm md:text-base" />
</form>
```

#### Prompt Optimization:
- **Desktop**: `pwv:~ visitor$` (full prompt)
- **Mobile**: `pwv:~$` (shorter prompt to save space)

### 6. **Content Wrapping** 🔄

#### Terminal Output:
```jsx
<pre className="whitespace-pre-wrap break-words">
  {/* Ensures long lines wrap instead of causing horizontal scroll */}
</pre>
```

### 7. **Conditional Content** 🎯

#### Desktop-Only Help:
```html
<p class="hidden sm:block">
  Press ↑/↓ to navigate history
</p>
```

#### Mobile-Only Tips:
```html
<p class="sm:hidden">
  Try: help, companies, surprise me
</p>
```

## Testing Checklist

### Mobile (< 640px)
- ✅ Boxes are 40 characters wide
- ✅ Text is readable at small sizes
- ✅ Input doesn't trigger zoom on iOS
- ✅ Horizontal scroll works for overflow
- ✅ Touch targets are large enough
- ✅ Helper text appears

### Tablet (640-768px)
- ✅ Boxes are 50 characters wide
- ✅ Font sizes increase appropriately
- ✅ Layout uses more space

### Desktop (> 768px)
- ✅ Boxes are 64 characters wide
- ✅ Full prompt shows
- ✅ Keyboard shortcuts documented
- ✅ Optimal reading experience

### Cross-Device
- ✅ Window resize updates box width dynamically
- ✅ No horizontal scroll on container
- ✅ Smooth scrolling in output area
- ✅ Links are clickable
- ✅ Commands work consistently

## Browser Support

### Tested On:
- ✅ Safari iOS (iPhone)
- ✅ Chrome Android
- ✅ Safari Desktop (macOS)
- ✅ Chrome Desktop
- ✅ Firefox Desktop

### Features:
- CSS Grid/Flexbox: All modern browsers
- Custom scrollbars: WebKit and Firefox
- Touch events: All mobile browsers
- Window resize: Universal support

## Performance

### Mobile Optimizations:
- Minimal animations on low-end devices
- Efficient resize handlers with cleanup
- No heavy computations in render loop
- Lazy loading for terminal history

### Load Time:
- JavaScript bundle: ~15KB (gzipped)
- No external dependencies beyond React
- Data file: ~50KB (cached)

## Accessibility

### Mobile A11y:
- ✅ Touch targets > 44x44px
- ✅ Readable font sizes (no pinch zoom needed)
- ✅ ARIA labels on ASCII art
- ✅ Semantic HTML structure
- ✅ Keyboard navigation works
- ✅ Screen reader compatible

## Known Limitations

1. **Very small screens (< 320px)**: May require horizontal scroll for some boxes
2. **Landscape mobile**: Works but portrait is optimal
3. **Old browsers**: Requires modern CSS support (CSS Grid, Flexbox)

## Future Enhancements

- [ ] Swipe gestures for history navigation
- [ ] Pull-to-refresh for clearing terminal
- [ ] Haptic feedback on command execution
- [ ] Voice input support
- [ ] Split-screen mode detection
- [ ] PWA support for offline use
