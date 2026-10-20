---
name: Tactile Slate Kanban
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#00505f'
  on-tertiary: '#ffffff'
  tertiary-container: '#006a7c'
  on-tertiary-container: '#93e8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

The design system is engineered for modern high-performance product teams, project managers, and cross-functional contributors who demand fluid execution without cognitive clutter. The interface merges crisp, contemporary SaaS utility with a physical, tactile card metaphor. 

The aesthetic is anchored in:
- **Calibrated Precision:** Clean, low-friction layouts where structural geometry and razor-thin borders define zones.
- **Physical Depth:** Interactive items feel tangible, mimicking matte cardstock layered over subtle slate surfaces.
- **Role Transparency:** Immediate, non-intrusive visual semantics communicate permission tiers (Owner vs. Collaborator), making read-only elements, administrative triggers, and interactive cards distinct at a glance.

## Colors

The palette leverages deep indigo (`#4F46E5`) for primary actions and active board states, alongside vivid violet (`#7C3AED`) reserved for elevated permissions and Owner-tier indicators. Neutral slate (`#64748B`) establishes an architectural baseline that prevents visual fatigue across dense multi-column boards.

### Role Semantic Palettes
- **Owner Role:** Grounded in Violet (`#7C3AED`) and Deep Purple shades. Owner badges feature subtle violet ring highlights with light lavender surface fills (`#F5F3FF`).
- **Collaborator Role:** Neutral Slate (`#475569`) with cool slate-gray fills (`#F1F5F9`), maintaining distinct visibility without competing with Owner status.
- **Card States:**
  - *Editable Cards:* Pure white backgrounds (`#FFFFFF`) framed by neutral slate dividers (`#E2E8F0`), yielding high contrast and active drag-hover affordances.
  - *Read-Only Cards:* Slightly tinted, matte cool-slate backgrounds (`#F8FAFC`) with dashed or muted borders (`#CBD5E1`) and an absence of grab indicators.

## Typography

The typography couples the crisp geometric legibility of **Hanken Grotesk** for primary structural interfaces with the utility of **JetBrains Mono** for status chips, card tags, role indicators, and metadata keys.

- **Headlines & Interface UI:** Rendered with tighter letter-spacing (`-0.01em` to `-0.02em`) to maintain optical cohesion in horizontally constrained card headers.
- **Labels & System Status:** JetBrains Mono ensures absolute vertical alignment across pill counters, tag systems, and priority meters without jitter during numerical changes.

## Layout & Spacing

The layout operates on a horizontal fluid column track with auto-scrolling column rails for desktop viewports, paired with a multi-pane horizontal snap carousel on mobile viewports.

- **Canvas Structure:** Fixed-height viewport layout (`100vh`) with an anchored persistent application header (`56px`), a sub-header for active board controls and filters (`48px`), and a fluid horizontal workspace.
- **Column Matrix:** Kanban lanes maintain fixed min/max widths (`280px` min, `320px` max) with `1rem` horizontal gaps between columns. Vertical stacking within columns utilizes `space-sm` (`0.5rem`) between cards.
- **Responsive Adaptations:**
  - *Desktop (>1024px):* Horizontal multi-column rail with native horizontal drag-and-drop.
  - *Tablet (768px - 1023px):* Semi-fluid column widths (`260px`) with edge indicators showing off-screen columns.
  - *Mobile (<768px):* Single active column visible with horizontal page indicators and swipeable column rails. Top toolbar collapses secondary actions into a sheet overlay.

## Elevation & Depth

Visual hierarchy combines physical paper layering with directional ambient lighting.

- **Board Canvas (`Level 0`):** Base slate tone (`#F1F5F9`) with no elevation.
- **Column Containers (`Level 1`):** Subdued surface (`#F8FAFC`) framed with a 1px border (`#E2E8F0`). Flat elevation, functioning as drop troughs.
- **Resting Cards (`Level 2`):** Pure white surface (`#FFFFFF`) with a dual border-shadow treatment: 1px border (`#E2E8F0`) reinforced by `0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Card Hover (`Level 3`):** Subtly lifted via `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)` and translated `-1px` on the Y-axis.
- **Active Dragging (`Level 4`):** Pronounced lift with a light indigo tint: `0 20px 25px -5px rgba(79, 70, 229, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`, rotated slightly at `1.5deg` to simulate physical pickup.
- **Read-Only Elements:** Suppressed elevation; zero ambient shadow, flat `#F8FAFC` fill, and a subtle inset or dashed hairline border (`#CBD5E1`).

## Shapes

The geometric framework uses balanced rounded surfaces (`0.5rem` base border radius):

- **Kanban Columns:** Outer container `rounded-xl` (`1.5rem`) creates distinct macro-regions.
- **Interactive Cards:** `rounded-lg` (`1rem`) balances corner curvature with interior content density.
- **Badges & Role Tags:** Fully rounded pill format for status tags and user roles (`9999px`) to contrast sharply against rectangular card geometry.
- **Dropdowns & Popovers:** `rounded-lg` (`1rem`) with 1px border accents.

## Components

### Header, Board Switcher & Role Badges
- **Header Bar:** Flat structural band with a bottom border in slate (`#E2E8F0`). Features an integrated board switcher dropdown displaying the current board name, star status, and workspace breadcrumb.
- **Role Indicator Badge:** Persistent in the primary header and card headers:
  - *Owner:* Violet pill (`#F5F3FF` background, `#7C3AED` text, 1px `#DDD6FE` border) with a crown glyph.
  - *Collaborator:* Slate pill (`#F1F5F9` background, `#475569` text, 1px `#E2E8F0` border) with an edit or user glyph.

### Kanban Cards
- **Editable Card:**
  - Standard white background with a left accent strip representing priority (Red for Critical, Amber for Medium, Indigo for Low).
  - Hover triggers an action tray on the top right (quick edit pencil, assignees, more actions).
  - Grabbable cursor (`grab`/`grabbing`) with full drag capabilities.
- **Read-Only Card:**
  - Slightly muted background (`#F8FAFC`), standard pointer cursor (no drag handle), and a padlock glyph adjacent to the title.
  - Contextual hover reveals a tooltip: `"Viewing only – permissions managed by Owner"`.

### Buttons
- **Primary:** Solid Indigo (`#4F46E5`), white label, soft hover state (`#4338CA`), with tactile focus ring (`2px offset, #6366F1`).
- **Secondary / Ghost:** Transparent base with `#E2E8F0` hairline border and slate text (`#334155`), transitioning to `#F1F5F9` on hover.
- **Disabled / Read-Only Restricted:** Faded slate fill (`#F1F5F9`), `#94A3B8` label, `not-allowed` cursor, no border highlight.

### Status Chips & Priority Badges
- Minimalist monospace pills rendered in `JetBrains Mono` (`label-sm`).
- Low saturation background fills with high-contrast text to prevent color noise across large boards.

### Inputs & Column Controls
- **Card Input Quick-Add:** Dynamic inline input expanding inside the column base; pure white background, active `#4F46E5` outline, and keyboard accelerator hints (`Return` to create, `Esc` to cancel).
- **Checkboxes & Form Selectors:** Crisp square checkboxes (`4px` radius) with indigo checked fills and white tick marks.