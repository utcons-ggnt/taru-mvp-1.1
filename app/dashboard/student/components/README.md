# Custom Icons for Sidebar

This directory contains the custom icon system for the student dashboard sidebar.

## How to Use Custom Icons

### Option 1: Image Files (PNG, JPG, etc.)
Place your icon images in the `public/icons/` directory and update the `navItems` array in `Sidebar.tsx`:

```typescript
const navItems = [
  { id: 'overview', label: 'Overview', icon: '/icons/overview.png' },
  { id: 'modules', label: 'My Learning Modules', icon: '/icons/modules.png' },
  // ... more items
];
```

### Option 2: Emojis (Fallback)
If no image is found, the system falls back to emojis:

```typescript
const navItems = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'modules', label: 'My Learning Modules', icon: '📦' },
  // ... more items
];
```

## Icon Sizing

Icons automatically scale based on the `size` prop:
- Mobile: 24px
- Desktop: 20px
- AI Buddy: 32px (mobile), 24px (desktop)

## Adding New Icons

### To add a new image icon:

1. Place your image file in `public/icons/`
2. Update the `navItems` array with the path:
```typescript
{ id: 'new-feature', label: 'New Feature', icon: '/icons/new-feature.png' }
```

## Fallback System

The icon system has a robust fallback mechanism:
1. First tries to load image files
2. Falls back to emojis if image fails to load
3. Shows a default document icon as final fallback

This ensures your sidebar always has icons, even if some files are missing or fail to load.

## Collapsed Sidebar Support

Image icons are now visible in both expanded and collapsed sidebar states. The `IconRenderer` component automatically handles image display regardless of the sidebar's expansion state. 