# Assets Directory

This directory contains all static assets for the Admitly web application.

## Directory Structure

```
assets/
├── images/           # Image assets (logos, icons, illustrations)
├── fonts/            # Custom font files (if any)
└── styles/           # Global CSS styles
```

## Images

### Brand Assets

**Location:** `images/`

- **`admitly-logo.png`** - Full Admitly logo with text (33KB)
  - Usage: Website header, marketing materials
  - Features: Blue "A" with green leaf/arrow element + "dmitly" text
  - Transparent background: ✅
  - Colors: Primary Blue (#2563EB), Achievement Green (#16A34A)
  - Optimized for web: ✅

- **`admitly-icon.png`** - Admitly icon/mark only (35KB)
  - Usage: Favicon, app icon, social media, PWA icon
  - Features: Blue "A" with green leaf/arrow element
  - Transparent background: ✅
  - Optimized for web: ✅
  - Also copied to: `public/favicon.png`

### Brand Colors Reference

From `branding-strategy.md`:

- **Primary Blue:** #2563EB (rgb: 37, 99, 235)
  - Trust, intelligence, stability
  - Use: Buttons, headers, links

- **Achievement Green:** #16A34A (rgb: 22, 163, 74)
  - Success, growth, progress
  - Use: Success states, CTAs

- **Energy Orange:** #EA580C (rgb: 234, 88, 12)
  - Urgency, energy, action
  - Use: Alerts, deadlines

## Usage in Code

### Import Logo in React Components

```typescript
import admitlyLogo from '@/assets/images/admitly-logo.png';
import admitlyIcon from '@/assets/images/admitly-icon.png';

function Header() {
  return (
    <header>
      <img src={admitlyLogo} alt="Admitly" className="h-8" />
    </header>
  );
}
```

### Using in index.html

```html
<link rel="icon" type="image/png" href="/src/assets/images/admitly-icon.png" />
```

## Asset Optimization

Before deploying to production, ensure all images are:

1. **Optimized for web**
   - Use tools like TinyPNG, ImageOptim
   - Target: < 100KB for logos

2. **Multiple formats provided**
   - PNG for logos (transparency)
   - WebP for better compression
   - SVG for scalable graphics (preferred)

3. **Responsive variants**
   - Provide @1x, @2x, @3x versions for high-DPI displays

## Future Assets

Planned additions:

- [ ] Hero section illustrations
- [ ] Empty state illustrations
- [ ] Success/error state icons
- [ ] University default placeholder images
- [ ] Social media share images (OG images)

## Related Files

- Brand strategy: `/branding-strategy.md`
- Design system: `/specs/frontend-specification.md`
- Color palette: See brand colors section above
