# Icon Components

This directory contains reusable SVG icon components used throughout the PWV site.

## Available Icons

### BuildingIcon.astro
Company/organization icon used for company cards and navigation.
- **Usage**: Company fallback icon when logo is not available
- **Default size**: `h-6 w-6`
- **Style**: Heroicons outline

### UserIcon.astro
Person/user icon used for people cards.
- **Usage**: Person fallback icon when avatar is not available
- **Default size**: `h-6 w-6`
- **Style**: Heroicons outline

### DocumentIcon.astro
Document icon used for facts.
- **Usage**: Fact cards icon
- **Default size**: `h-6 w-6`
- **Style**: Heroicons outline

### ChartIcon.astro
Bar chart icon used for figures/metrics.
- **Usage**: Figure cards icon
- **Default size**: `h-6 w-6` (or `h-8 w-8` for larger display)
- **Style**: Heroicons outline

## Usage

All icons accept a `class` prop to customize size and styling:

```astro
---
import BuildingIcon from '../icons/BuildingIcon.astro';
---

<!-- Default size -->
<BuildingIcon />

<!-- Custom size -->
<BuildingIcon class="h-4 w-4" />

<!-- With custom color -->
<div class="text-pwv-green">
  <BuildingIcon class="h-8 w-8" />
</div>
```

## Design System

- **Stroke width**: 2px for all icons
- **Style**: Outline (not filled)
- **Color**: Uses `currentColor` to inherit text color
- **Sizing**: Consistent with Tailwind size classes (h-4, h-6, h-8, etc.)

## Navigation Icons

Navigation pills use inline SVG icons for:
- Companies (building icon)
- People (users group icon)
- Quotes (chat bubble icon)
- Facts (document icon)
- Figures (bar chart icon)

These are defined directly in the nav components (`CelebrateNav.astro`, `AmplifyNav.astro`) for better performance.
