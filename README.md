# Demo Board

A modern demo playground built with **TanStack Start**, **Convex**, **React 19**, and **Tailwind CSS**. This project showcases interactive tools and demos that leverage cutting-edge browser APIs and real-time backend capabilities.

## Tech Stack

- **TanStack Start** - Full-stack React meta-framework with file-based routing
- **Convex** - Real-time backend-as-a-service
- **React 19** - Latest React with compiler support
- **Tailwind CSS v4** - Utility-first styling
- **Tiptap** - Rich text editing
- **TypeScript** - End-to-end type safety

---

## Existing Demos

| Demo | Description |
|------|-------------|
| **Gradient Generator** | Create CSS gradients with interactive color stops and position controls |
| **Webcam Tester** | Live webcam stream with device selection and photo capture |
| **Notebook** | Real-time collaborative notebook with per-page password protection |
| **Winter Steps** | Isometric 3D cube animation with CSS transforms |
| **Convex Todos** | Real-time todo list demonstrating Convex mutations |

---

## Demo Ideas

Future tools and demos to build. Each showcases different browser APIs and capabilities.

### 1. QR Code Generator

Generate QR codes for URLs, text, WiFi credentials, and contact cards (vCard).

**Features:**
- Customizable colors (foreground/background)
- Adjustable size and error correction level
- Logo/image embedding in center
- Export as PNG or SVG
- Bulk generation mode

**Browser APIs:** Canvas, Blob/Download

---

### 2. JSON Formatter & Validator

Paste messy JSON and get pretty-printed output with syntax highlighting.

**Features:**
- Real-time validation with error location highlighting
- Collapsible tree view for exploring nested data
- Convert to/from YAML
- Minify option
- Path copying (click a key to copy its JSON path)
- Diff mode to compare two JSON objects

**Use case:** Essential developer utility for daily API work

---

### 3. Color Palette Generator

Generate harmonious color palettes using color theory principles.

**Features:**
- Palette modes: complementary, triadic, analogous, split-complementary, tetradic
- Extract palettes from uploaded images (dominant colors)
- Adjust saturation/lightness across the palette
- Export as CSS variables, Tailwind config, or design tokens
- Save favorite palettes (Convex persistence)
- Accessibility contrast checker

**Complements:** Gradient Generator

---

### 4. Regex Tester

Live regular expression testing with educational features.

**Features:**
- Real-time match highlighting in test text
- Capture group visualization with colors
- Regex explanation (breaks down what each part does)
- Library of common patterns (email, URL, phone, date, etc.)
- Replace mode with substitution preview
- Flags toggle (g, i, m, s, u)
- Share regex via URL

**Browser APIs:** RegExp

---

### 5. Image Compressor & Converter

Client-side image processing - no server upload required.

**Features:**
- Drag-and-drop or paste images
- Convert between PNG, JPG, WebP, AVIF
- Adjustable quality slider with live preview
- Resize by percentage or dimensions
- Batch processing multiple images
- Before/after file size comparison
- Strip EXIF data option

**Browser APIs:** Canvas, OffscreenCanvas, createImageBitmap, Blob

---

### 6. CSS Box Shadow Generator

Visual editor for creating layered box shadows.

**Features:**
- Add multiple shadow layers
- Per-layer controls: X/Y offset, blur, spread, color, opacity
- Inset shadow toggle
- Presets library (subtle, medium, dramatic, neumorphism)
- Live preview on customizable element shapes
- Copy CSS with vendor prefixes option
- Tailwind class output

**Complements:** Gradient Generator (CSS toolkit section)

---

### 7. Audio Visualizer

Visualize audio input with multiple stunning visualization styles.

**Features:**
- Input sources: microphone, uploaded audio files, system audio
- Visualization modes:
  - Waveform (oscilloscope)
  - Frequency bars (equalizer)
  - Circular spectrum
  - Particle effects
- Customizable colors and sensitivity
- Record visualization as video/GIF
- Audio playback controls

**Browser APIs:** Web Audio API (AnalyserNode, AudioContext), Canvas/WebGL, MediaRecorder

---

### 8. Screen Recorder

Record your screen, window, or browser tab with optional audio.

**Features:**
- Source selection: entire screen, application window, browser tab
- Optional microphone audio overlay
- Recording indicator with timer
- Preview before saving
- Basic trim (start/end points)
- Download as WebM
- Configurable resolution and frame rate

**Browser APIs:** getDisplayMedia, getUserMedia, MediaRecorder, Blob

**Use case:** Quick tutorials, bug reports, demos

---

### 9. Diff Checker

Compare two text blocks with visual highlighting of changes.

**Features:**
- Side-by-side and inline diff views
- Line-level and character-level diff modes
- Syntax highlighting for code
- Ignore whitespace option
- Line numbers
- Jump to next/previous change
- Copy individual changes
- Share diff via URL

**Use case:** Code comparison, config file changes, text editing

---

### 10. Timestamp Converter

Convert between various time formats instantly.

**Features:**
- Input formats:
  - Unix timestamp (seconds and milliseconds)
  - ISO 8601
  - Human-readable date strings
  - Relative time ("3 days ago")
- Live "now" display updating every second
- Multiple timezone display
- Calculate duration between two timestamps
- Copy any format to clipboard
- Date picker for easy input

**Use case:** Essential for developers working with APIs and logs

---

## Bonus Ideas

Additional tools for future consideration:

| Tool | Description | Key APIs |
|------|-------------|----------|
| **Markdown Preview** | Live editor with GitHub Flavored Markdown, export to HTML | - |
| **Hash Generator** | Generate SHA-256, SHA-1, MD5 for text and files | Web Crypto API |
| **UUID Generator** | Bulk generate UUIDs (v4), nanoids, ULIDs, CUIDs | crypto.randomUUID() |
| **Favicon Generator** | Create favicons from text, emoji, or images in all required sizes | Canvas |
| **Code Screenshot** | Beautiful code images with syntax highlighting (like Carbon/Ray.so) | Canvas, html2canvas |
| **Pomodoro Timer** | Work/break timer with statistics tracking | Notifications API, Convex |
| **Base64 Encoder** | Encode/decode text and files, create data URLs | btoa/atob, FileReader |
| **SVG Path Editor** | Visual editor for SVG paths with draggable control points | SVG DOM |
| **Aspect Ratio Calculator** | Calculate and visualize aspect ratios, find common ratios | - |
| **Lorem Ipsum Generator** | Generate placeholder text in various styles and lengths | - |

---

## Getting Started

```bash
# Install dependencies
bun install

# Set up Convex (creates .env.local with VITE_CONVEX_URL)
npx convex dev

# Start development server (in another terminal)
bun dev
```

## Building for Production

```bash
bun run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing:

```bash
bun run test
```

## Linting & Formatting

Uses [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) with [TanStack config](https://tanstack.com/config/latest/docs/eslint):

```bash
bun run lint     # Check for issues
bun run format   # Format code
bun run check    # Run all checks
```

## Adding Shadcn Components

```bash
pnpm dlx shadcn@latest add button
```

---

## Project Structure

```
src/
├── routes/
│   ├── demo/           # Demo pages
│   │   ├── gradient.tsx
│   │   ├── webcam.tsx
│   │   ├── notebook.tsx
│   │   └── ...
│   └── __root.tsx      # Root layout with providers
├── components/         # Reusable components
│   ├── Header.tsx      # Navigation sidebar
│   └── notebook/       # Notebook-specific components
├── styles/             # Global styles
└── convex/             # Convex backend functions
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding a New Demo

1. Create a new file in `src/routes/demo/` (e.g., `my-tool.tsx`)
2. TanStack will auto-generate the route
3. Add navigation link in `src/components/Header.tsx`
4. Follow the existing dark theme with gradient backgrounds
5. Use Lucide icons for consistency
6. Update this README with the new demo

### Navigation Links

```tsx
import { Link } from "@tanstack/react-router";

<Link to="/demo/my-tool">My Tool</Link>
```

---

## Contributing

When adding new demos:

1. **Read existing demos** for patterns and conventions
2. **Use the dark gradient theme** - slate backgrounds with cyan/blue accents
3. **Add proper TypeScript types** - the project is strictly typed
4. **Include Lucide icons** - maintain visual consistency
5. **Consider Convex integration** - for persistence or real-time features
6. **Update the README** - document what you built

---

Built with modern web technologies to showcase what's possible in the browser.
