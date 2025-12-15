# Theme System & Page Builder – SaaS Platform

This document describes how the theme, color palette, section system, and responsive design work across the SaaS platform.

---

## 1. Overview

Each site in the SaaS platform is powered by a **theme**.  
Themes define the site's visual identity, layouts, and reusable content sections.

### Key Goals
- Reusable UI and layout across multiple tenants.
- Fully dynamic customization via Payload CMS.
- Responsive design on all devices.
- Support for light/dark modes and color palettes.
- i18n-ready (text, labels, and section titles).

---

## 2. Structure

Themes live in `packages/themes/`.

Example:
```
packages/themes/company-industrial/
 ├─ theme.config.ts
 ├─ layouts/
 ├─ sections/
 ├─ components/
 ├─ styles/
 ├─ locales/
 │   ├─ vi.json
 │   ├─ en.json
 │   └─ ja.json
 └─ index.ts
```

---

## 3. Theme Configuration

Example `theme.config.ts`:

```ts
export const themeConfig = {
  id: "company-industrial",
  name: "Company Industrial",
  palette: {
    primary: "#1E4D92",
    secondary: "#FFD200",
    accent: "#F56C3F"
  },
  font: {
    body: "Inter, sans-serif",
    heading: "Inter Variable"
  },
  supports: {
    darkMode: true,
    animations: true
  },
  defaults: {
    layout: "default",
    sections: ["hero", "services", "projects", "contact"]
  }
};
```

Themes can define their own assets, typography, and animation rules.

---

## 4. Color Palette Generator

When a user sets a **primary color**, the system automatically generates a color scale:

| Variant | Description |
|----------|-------------|
| `primary-50` to `primary-900` | Generated shades |
| `accent` | Complementary color |
| `neutral` | Background and border tones |

Implemented with `tailwindcss/colors` and custom generator:

```ts
import { generatePalette } from "@/packages/frontend/utils/colors";
const palette = generatePalette("#1E4D92");
```

---

## 5. Section System

Sections are modular UI components registered globally.

Example directory:
```
packages/frontend/sections/
 ├─ HeroSection.tsx
 ├─ ServicesGrid.tsx
 ├─ ProjectsCarousel.tsx
 ├─ PartnersCarousel.tsx
 ├─ CTASection.tsx
 ├─ ContactForm.tsx
 └─ index.ts
```

Each section exports metadata:

```ts
export const SectionMeta = {
  id: "hero",
  name: "Hero Banner",
  group: "Header",
  props: [
    { name: "title", type: "string", translatable: true },
    { name: "subtitle", type: "string", translatable: true },
    { name: "image", type: "image" },
    { name: "ctaText", type: "string", translatable: true }
  ]
};
```

---

## 6. Page Builder Integration

Pages reference sections in Payload CMS:

```json
{
  "slug": "home",
  "title": "Trang chủ",
  "sections": [
    {
      "type": "hero",
      "title": "Chào mừng đến với An Vinh",
      "ctaText": "Xem thêm"
    },
    {
      "type": "servicesGrid",
      "title": "Dịch vụ chính"
    }
  ]
}
```

Frontend renders them dynamically:

```tsx
{page.sections.map((section) => renderSection(section))}
```

---

## 7. Responsive Layout Engine

### Features:
- Auto grid breakpoints (xs/sm/md/lg/xl/2xl).
- Per-device visibility toggles.
- Smart slider/grid switch on small screens.
- CSS Grid + Flex fallback.
- Optimized for Lighthouse 90+.

Example:

```ts
<Section visible={{ desktop: true, mobile: false }} />
```

---

## 8. Animations

Theme-level animation presets:

| Preset | Effect |
|---------|---------|
| `fadeIn` | opacity transition |
| `slideUp` | y-translate with easing |
| `zoomIn` | scale-up transition |
| `parallax` | scroll-based movement |
| `rotate` | subtle rotation |

Built with **Framer Motion**.

```ts
<motion.div variants={fadeInUp}>
  <h2>{title}</h2>
</motion.div>
```

---

## 9. Theme i18n

Each theme has its own translation namespace:  
`/packages/themes/{theme}/locales/{lang}.json`

Example `vi.json`:

```json
{
  "hero": {
    "welcome": "Chào mừng đến với {{company}}"
  },
  "cta": {
    "learnMore": "Xem thêm"
  }
}
```

These are merged with global site translations at runtime.

---

## 10. Theme Versioning

Themes can be versioned in `ThemeSettings` collection:

| Field | Description |
|--------|-------------|
| `theme` | Reference to theme ID |
| `version` | Version tag (e.g., 1.2.0) |
| `overrides` | Custom colors, fonts, or layouts |

When a theme updates, sites can re-sync or lock their version.

---

## 11. Theme Overrides

Per-site overrides are stored in `ThemeOverrides` collection.  
They allow non-destructive customization:

- Colors, spacing, typography overrides.  
- Section visibility toggles.  
- Custom scripts or tracking codes.  

---

## 12. Performance Optimization

- Dynamic import for heavy sections.  
- Tailwind JIT mode + runtime class merge.  
- CSS caching & minification.  
- Reduced re-renders via React.memo.  
- Image optimization (sharp + next/image).

---

## 13. Future Enhancements

- Theme marketplace (downloadable packs).  
- Live preview & version diff.  
- Section composability (nested sections).  
- AI-assisted layout recommendations.

---

## 14. Contacts

- **Theme Lead:** theme@yourdomain.com  
- **UI/UX Designer:** ux@yourdomain.com
