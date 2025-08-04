# Google Translate Component

This component adds Google Translate functionality to your application, allowing users to translate the entire page into different languages.

## Features

- Automatic page translation using Google Translate API
- Multiple UI variants: floating, inline, minimal, and header
- Configurable positioning (top-right, top-left, bottom-right, bottom-left)
- Optional label display
- Responsive design
- Hover effects and smooth transitions
- Integrated header button for navigation bars

## Variants

### 1. Floating (Default)
A floating action button that expands to show the translate widget when clicked.

### 2. Header
A compact button designed for integration in navigation headers and top bars.

### 3. Inline
A traditional dropdown-style translate widget.

### 4. Minimal
A hidden widget that appears on hover.

## Usage

### Basic Usage
```tsx
import GoogleTranslate from './components/GoogleTranslate';

// In your component or layout
<GoogleTranslate />
```

### Advanced Usage with Props
```tsx
<GoogleTranslate 
  position="bottom-right"     // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  variant="floating"          // 'floating' | 'inline' | 'minimal' | 'header'
  showLabel={true}            // Show/hide "Translate" label (for inline variant)
  className="custom-class"    // Additional CSS classes
/>
```

### Header Integration
```tsx
// In navigation bars and headers
<GoogleTranslate variant="header" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Position of the translate widget |
| `variant` | `'floating' \| 'inline' \| 'minimal' \| 'header'` | `'floating'` | UI variant of the translate widget |
| `showLabel` | `boolean` | `false` | Whether to show a "Translate" label above the widget |
| `className` | `string` | `''` | Additional CSS classes to apply |

## Supported Languages

The component is configured to support:
- English (en)
- Hindi (hi)
- Marathi (mr)
- Tamil (ta)
- Telugu (te)
- Kannada (kn)
- Gujarati (gu)
- Bengali (bn)
- Malayalam (ml)
- Odia (or)
- Punjabi (pa)
- Assamese (as)
- Urdu (ur)

## Implementation Details

- Uses Google Translate Element API
- Automatically loads the Google Translate script
- Includes proper TypeScript declarations
- Handles cleanup on component unmount
- Responsive design with Tailwind CSS
- Floating variant includes expandable widget with close button
- Header variant integrates seamlessly with navigation bars

## Integration Examples

### Page-Specific Integration
The component is now integrated into individual pages rather than globally:

```tsx
// In page components (e.g., app/login/page.tsx)
import GoogleTranslate from '../components/GoogleTranslate';

<div className="header">
  <GoogleTranslate variant="header" />
  {/* Other header content */}
</div>
```

### Current Integration Points

The GoogleTranslate component is currently integrated in the following pages:

1. **Landing Page** (`app/page.tsx`) - Header variant in top navigation
2. **Login Page** (`app/login/page.tsx`) - Header variant in top navigation  
3. **Register Page** (`app/register/page.tsx`) - Header variant in top-right corner
4. **Student Dashboard** (`app/dashboard/student/page.tsx`) - Header variant in header
5. **Student Onboarding** (`app/student-onboarding/page.tsx`) - Header variant in header
6. **Parent Onboarding** (`app/parent-onboarding/page.tsx`) - Header variant in top-right corner
7. **Module Detail** (`app/modules/[id]/page.tsx`) - Header variant in module header

## Recent Fixes & Improvements

### Latest Update - Fixed Google Translate Button Issues:
- ✅ **Fixed multiple instances conflict** by using unique element IDs for each component instance
- ✅ **Improved script loading** to prevent conflicts when navigating between pages
- ✅ **Added proper error handling** and loading states with console error logging
- ✅ **Enhanced language support** - Added more Indian regional languages
- ✅ **Better CSS styling** with improved dark mode support and responsive design
- ✅ **Fixed click handling** for header variant with fallback mechanisms
- ✅ **Removed Google Translate top banner** for cleaner user experience
- ✅ **Added loading indicators** and better user feedback

## Troubleshooting

### Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Button not clickable** | Click does nothing | Wait for widget to load, check browser console for errors |
| **Dropdown not appearing** | No language options shown | Ensure internet connection, wait 3-5 seconds for Google's script |
| **Translations not working** | Page doesn't translate | Verify Google Translate service is accessible, check network |
| **Styling issues** | Widget looks broken | Ensure `globals.css` includes Google Translate styles |
| **Multiple buttons interfering** | Unexpected behavior with multiple instances | Fixed - each instance now has unique IDs |
| **Script loading errors** | Console shows script errors | Check if `translate.google.com` is blocked by firewall/ad-blocker |

### Debugging Steps

1. **Check Browser Console**: Look for JavaScript errors related to Google Translate
2. **Network Tab**: Verify `translate.google.com` requests are successful
3. **Element Inspection**: Check if `google_translate_element_X` exists in DOM
4. **Test Page**: Use `test-translate.html` in project root for isolated testing
5. **Clear Cache**: Sometimes cached scripts can cause issues

### Browser Compatibility

- ✅ Chrome/Chromium (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (Limited support)

### Performance Notes

- Google Translate script loads asynchronously to avoid blocking page render
- Component uses efficient loading detection to prevent multiple script loads
- Unique element IDs prevent conflicts between multiple component instances
- CSS optimizations ensure smooth user experience

## Notes

- The Google Translate widget will appear on all pages where this component is included
- Translation is performed client-side by Google's service
- The header variant is designed to fit seamlessly in navigation bars
- **Removed global floating button** from `app/layout.tsx` to eliminate duplicate buttons
- **Replaced manual translation systems** with Google Translate in all pages
- The header variant includes a "Powered by Google Translate" attribution 