# 🔥 BurnPast - Design System & Brand Guidelines

> **Version:** 1.0.0
> **Last Updated:** January 2025
> **Maintained by:** Hope
> **Purpose:** Single source of truth for BurnPast's visual identity, components, and UX patterns

---

## Table of Contents
1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Logo & Visual Identity](#4-logo--visual-identity)
5. [Mascot: Burnie](#5-mascot-burnie)
6. [Spacing & Layout](#6-spacing--layout)
7. [Components Library](#7-components-library)
8. [Page Templates](#8-page-templates)
9. [Micro-interactions](#9-micro-interactions)
10. [Accessibility](#10-accessibility)
11. [Dark/Light Mode](#11-darklight-mode)
12. [Implementation Guide](#12-implementation-guide)

---

## 1. Brand Identity

### Core Values
- **Privacy-First**: Zero-knowledge architecture, user data sovereignty
- **Simplicity**: Minimal friction, instant gratification
- **Ephemeral**: Temporary by design, no digital footprint
- **Trustworthy**: Transparent security, open about limitations

### Brand Personality
| Trait | Expression |
|-------|------------|
| **Tone** | Confident but not cocky, helpful but not hand-holding |
| **Voice** | Direct, technical when needed, human-first |
| **Humor** | Dry, subtle (fire puns allowed in moderation 🔥) |
| **Emotion** | Calm urgency - serious about security, relaxed about usage |

### Mission Statement
> "Enable secure, ephemeral communication without compromise. Share secrets knowing they'll disappear forever."

### Taglines
- **Primary**: "Share once. Disappear forever."
- **Secondary**: "Zero-knowledge secret sharing"
- **Technical**: "End-to-end encrypted ephemeral paste service"

### Brand Vibe Keywords
`Minimalist` • `Urgent` • `Secure` • `Ephemeral` • `Terminal-aesthetic` • `Hacker-friendly` • `Privacy-first`

---

## 2. Color System

### Philosophy
Dark mode default to emphasize security, privacy, and reduce eye strain. The palette evokes fire (destruction), ash (aftermath), and terminal aesthetics (technical trust).

### Primary Palette

| Color Name | Hex | RGB | HSL | Tailwind | Usage |
|------------|-----|-----|-----|----------|-------|
| **Void Black** | `#0a0a0a` | `10, 10, 10` | `0°, 0%, 4%` | `bg-void` | Main background, base layer |
| **Ash Gray** | `#1a1a1a` | `26, 26, 26` | `0°, 0%, 10%` | `bg-ash` | Cards, surfaces, input backgrounds |
| **Shadow Gray** | `#2a2a2a` | `42, 42, 42` | `0°, 0%, 16%` | `border-shadow` | Borders, dividers, subtle separators |
| **Smoke White** | `#f5f5f5` | `245, 245, 245` | `0°, 0%, 96%` | `text-smoke` | Primary text, high contrast |
| **Fog Gray** | `#a0a0a0` | `160, 160, 160` | `0°, 0%, 63%` | `text-fog` | Secondary text, muted content |
| **Ember Red** | `#ff4444` | `255, 68, 68` | `0°, 100%, 63%` | `accent-ember` | Primary CTA, warnings, destructive actions |
| **Plasma Orange** | `#ff8800` | `255, 136, 0` | `32°, 100%, 50%` | `accent-plasma` | Secondary accent, gradients, hovers |
| **Code Green** | `#00ff9d` | `0, 255, 157` | `157°, 100%, 50%` | `accent-code` | Success states, terminal vibes, confirmations |

### Gradient Definitions

```css
/* Fire Gradient - Primary CTA */
.gradient-fire {
  background: linear-gradient(135deg, #ff4444 0%, #ff8800 100%);
}

/* Burn Effect - Hover states */
.gradient-burn {
  background: linear-gradient(180deg, #ff8800 0%, #ff4444 50%, #0a0a0a 100%);
}

/* Glow Effect - Focus states */
.glow-ember {
  box-shadow: 0 0 20px rgba(255, 68, 68, 0.4);
}
```

### Semantic Colors

| Semantic | Color | Hex | Usage |
|----------|-------|-----|-------|
| **Success** | Code Green | `#00ff9d` | Paste created, copy confirmed |
| **Warning** | Plasma Orange | `#ff8800` | Expiring soon, rate limit approaching |
| **Error** | Ember Red | `#ff4444` | Validation errors, burn confirmation |
| **Info** | Fog Gray | `#a0a0a0` | Helper text, metadata |

### Accessibility Contrast Ratios

| Foreground | Background | Ratio | WCAG Level |
|------------|------------|-------|------------|
| Smoke White | Void Black | 19.5:1 | AAA ✅ |
| Smoke White | Ash Gray | 14.2:1 | AAA ✅ |
| Fog Gray | Void Black | 8.1:1 | AAA ✅ |
| Ember Red | Void Black | 5.8:1 | AA ✅ |
| Code Green | Void Black | 12.3:1 | AAA ✅ |

---

## 3. Typography

### Philosophy
Legibility first. Inter for UI (humanist sans-serif), JetBrains Mono for code (designed for developers).

### Font Stack

```css
/* UI & Marketing */
--font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code & Secrets */
--font-code: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Type Scale

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **Display** | 48px | 700 | 1.1 | -0.02em | Hero headlines |
| **H1** | 36px | 700 | 1.2 | -0.01em | Page titles |
| **H2** | 28px | 600 | 1.3 | 0 | Section headers |
| **H3** | 20px | 600 | 1.4 | 0 | Subsections |
| **Body Large** | 18px | 400 | 1.6 | 0 | Lead paragraphs |
| **Body** | 16px | 400 | 1.5 | 0 | Default text |
| **Body Small** | 14px | 400 | 1.5 | 0 | Helper text, labels |
| **Caption** | 12px | 500 | 1.4 | 0.02em | Metadata, timestamps |
| **Code** | 15px | 400 | 1.6 | 0 | Monospace content |

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['36px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2': ['28px', { lineHeight: '1.3' }],
        'h3': ['20px', { lineHeight: '1.4' }],
        'body-lg': ['18px', { lineHeight: '1.6' }],
        'body': ['16px', { lineHeight: '1.5' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
    },
  },
}
```

### Font Loading Strategy

```html
<!-- Preload critical fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## 4. Logo & Visual Identity

### Logo Concept

**Primary Mark**: Stylized flame 🔥 consuming a document 📄

#### Design Specifications

```
┌─────────────────────────┐
│    ╱╲                   │
│   ╱  ╲     🔥           │
│  ╱ __ ╲   ↓             │
│ │ │  │ │  Document      │
│ │ │  │ │  being         │
│ │ │__│ │  consumed      │
│ ╲______╱                │
│                         │
│  Geometric, flat style  │
└─────────────────────────┘
```

#### Logo Variants

| Variant | Usage | Min Size |
|---------|-------|----------|
| **Full Logo** | Landing page, marketing | 120px width |
| **Icon + Wordmark** | Header, navigation | 100px width |
| **Icon Only** | Favicon, app icon, tight spaces | 32px × 32px |
| **Monochrome** | Print, single-color contexts | N/A |

#### Favicon Specifications

```html
<!-- Standard Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android -->
<link rel="manifest" href="/site.webmanifest">
```

#### Logo Animation

**Trigger**: On "Burn" action completion

```css
@keyframes burn-logo {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2) rotate(10deg); opacity: 0.8; }
  100% { transform: scale(0.8); opacity: 0; filter: blur(4px); }
}

.logo-burning {
  animation: burn-logo 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

### Clear Space

Minimum clear space around logo: **X = height of flame**

```
     X
   ←---→

X  🔥📄  X  ← Minimum padding

     X
```

### Incorrect Usage

❌ Don't stretch or skew
❌ Don't change colors (except monochrome variant)
❌ Don't add effects (drop shadows, outlines)
❌ Don't place on busy backgrounds
❌ Don't rotate (except animation)

---

## 5. Mascot: Burnie 🔥

### Character Design

**Personality**: Mischievous but trustworthy. A helpful little flame who loves keeping secrets by destroying them.

**Visual Characteristics**:
- **Shape**: Teardrop flame body (organic, friendly)
- **Eyes**: Large, expressive, often narrowed in suspicion or winking
- **Accessories**: Occasionally wears sunglasses 😎 or detective hat 🕵️
- **Size**: Small and cute, non-threatening

### Character Poses & Emotional States

| Pose | Context | Visual Description | Animation |
|------|---------|-------------------|-----------|
| **Idle** | Default, waiting | Gentle hover with slight bounce | `translateY: -5px to 5px, 2s ease-in-out` |
| **Eating** | Loading state | Chomping on paper, mouth opens/closes | `rotate: -10deg to 10deg, 0.5s` |
| **Celebrating** | Success (paste created) | Jumping with sparkles ✨ | `scale: 1 to 1.2, confetti particles` |
| **Shushing** | Paste viewed (secret mode) | Finger over lips (or flame tendril) "🤫" | `opacity pulse on finger` |
| **Sleeping** | Expired paste | ZZZ bubbles, low flame | `opacity: 0.5, gentle breathing` |
| **Ash Pile** | Burned paste | Eyes peeking from ash pile | `blink animation every 3s` |
| **Detective** | Password-protected | Magnifying glass, suspicious look | `magnifying glass follows cursor` |

### Usage Guidelines

**When to show Burnie**:
- ✅ Empty states (no paste created yet)
- ✅ Loading states (processing)
- ✅ Success confirmations
- ✅ 404/Gone pages
- ✅ Easter eggs (10 clicks on ash pile)

**When NOT to show Burnie**:
- ❌ During secret viewing (don't distract)
- ❌ Error states (use clear text instead)
- ❌ Mobile (optional, space-constrained)

### Accessibility

- Burnie is **decorative** (`aria-hidden="true"`)
- Never convey critical info through Burnie alone
- Always pair with text alternatives

---

## 6. Spacing & Layout

### Spacing Scale (8px base unit)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing, icon padding |
| `sm` | 8px | Compact elements, inline spacing |
| `md` | 16px | Default spacing, card padding |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Component separation |
| `2xl` | 48px | Page sections |
| `3xl` | 64px | Hero sections |

### Grid System

**Desktop (≥1024px)**:
- Max width: 1200px
- Columns: 12
- Gutter: 24px
- Margin: 48px

**Tablet (768px - 1023px)**:
- Max width: 100%
- Columns: 8
- Gutter: 16px
- Margin: 32px

**Mobile (<768px)**:
- Max width: 100%
- Columns: 4
- Gutter: 16px
- Margin: 16px

### Breakpoints

```css
/* Mobile first approach */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## 7. Components Library

### 7.1 Buttons

#### Primary Button (CTA)

```vue
<template>
  <button class="btn-primary">
    <span>🔥</span>
    Create Burn Link
  </button>
</template>

<style>
.btn-primary {
  @apply px-8 py-4 rounded-lg font-semibold text-lg;
  @apply bg-gradient-to-r from-ember to-plasma;
  @apply text-smoke shadow-lg;
  @apply transition-all duration-300;
  @apply hover:scale-105 hover:shadow-ember;
  @apply active:scale-95;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
```

**Variants**:
- **Primary**: Fire gradient, high emphasis
- **Secondary**: Outline only, medium emphasis
- **Ghost**: Text only, low emphasis
- **Danger**: Solid red, destructive actions

#### Button States

| State | Visual | Implementation |
|-------|--------|----------------|
| **Default** | Fire gradient | Base styles |
| **Hover** | Scale 1.05, glow | `hover:scale-105 hover:shadow-ember` |
| **Active** | Scale 0.95 | `active:scale-95` |
| **Focus** | Ring outline | `focus:ring-4 focus:ring-ember/50` |
| **Disabled** | 50% opacity | `disabled:opacity-50` |
| **Loading** | Spinner + pulse | Custom component |

### 7.2 Input Fields

#### Text Input

```vue
<template>
  <div class="input-group">
    <label class="input-label">Secret Content</label>
    <input
      type="text"
      class="input-field"
      placeholder="Enter your secret..."
    />
    <span class="input-helper">Max 100KB</span>
  </div>
</template>

<style>
.input-group {
  @apply space-y-2;
}

.input-label {
  @apply text-sm font-medium text-fog;
}

.input-field {
  @apply w-full px-4 py-3 rounded-lg;
  @apply bg-ash border-2 border-shadow;
  @apply text-smoke font-mono text-base;
  @apply transition-all duration-200;
  @apply focus:border-ember focus:outline-none focus:ring-4 focus:ring-ember/20;
  @apply placeholder:text-fog/50;
}

.input-helper {
  @apply text-xs text-fog;
}
</style>
```

#### Textarea (Secret Input)

```vue
<template>
  <textarea
    class="secret-textarea"
    placeholder="Paste your secret here... (passwords, API keys, sensitive data)"
    rows="12"
  ></textarea>
</template>

<style>
.secret-textarea {
  @apply w-full px-6 py-4 rounded-lg;
  @apply bg-ash border-2 border-shadow;
  @apply text-smoke font-mono text-base leading-relaxed;
  @apply resize-none;
  @apply transition-all duration-200;
  @apply focus:border-ember focus:outline-none focus:ring-4 focus:ring-ember/20;
  @apply placeholder:text-fog/40;
}
</style>
```

### 7.3 Cards

```vue
<template>
  <div class="card">
    <div class="card-icon">🔐</div>
    <h3 class="card-title">End-to-End Encrypted</h3>
    <p class="card-description">
      Your secret is encrypted in your browser. We never see it.
    </p>
  </div>
</template>

<style>
.card {
  @apply p-6 rounded-xl bg-ash border border-shadow;
  @apply transition-all duration-300;
  @apply hover:border-ember/50 hover:shadow-lg;
}

.card-icon {
  @apply text-4xl mb-4;
}

.card-title {
  @apply text-xl font-semibold text-smoke mb-2;
}

.card-description {
  @apply text-fog text-sm leading-relaxed;
}
</style>
```

### 7.4 Toggle Switch

```vue
<template>
  <label class="toggle-container">
    <input type="checkbox" class="toggle-input" v-model="enabled" />
    <span class="toggle-switch"></span>
    <span class="toggle-label">Burn after reading</span>
  </label>
</template>

<style>
.toggle-container {
  @apply flex items-center gap-3 cursor-pointer select-none;
}

.toggle-input {
  @apply sr-only;
}

.toggle-switch {
  @apply relative w-12 h-6 rounded-full bg-shadow;
  @apply transition-colors duration-200;
}

.toggle-switch::after {
  content: '';
  @apply absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-fog;
  @apply transition-transform duration-200;
}

.toggle-input:checked + .toggle-switch {
  @apply bg-ember;
}

.toggle-input:checked + .toggle-switch::after {
  @apply transform translate-x-6 bg-smoke;
}

.toggle-label {
  @apply text-smoke font-medium;
}
</style>
```

### 7.5 Modal / Overlay

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <div class="modal-header">
            <h2>⚠️ Warning</h2>
            <button @click="close" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div class="modal-footer">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.modal-overlay {
  @apply fixed inset-0 z-50;
  @apply bg-void/90 backdrop-blur-sm;
  @apply flex items-center justify-center p-4;
}

.modal-container {
  @apply bg-ash border-2 border-shadow rounded-2xl;
  @apply max-w-lg w-full max-h-[90vh] overflow-auto;
  @apply shadow-2xl;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-shadow;
}

.modal-close {
  @apply text-3xl text-fog hover:text-smoke transition-colors;
}

.modal-body {
  @apply p-6 text-smoke;
}

.modal-footer {
  @apply p-6 border-t border-shadow flex gap-3 justify-end;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-300;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  @apply scale-95;
}
</style>
```

### 7.6 Toast Notifications

```vue
<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" :class="typeClass">
      <span class="toast-icon">{{ icon }}</span>
      <p class="toast-message">{{ message }}</p>
    </div>
  </Transition>
</template>

<style>
.toast {
  @apply fixed bottom-8 right-8 z-50;
  @apply px-6 py-4 rounded-lg shadow-2xl;
  @apply flex items-center gap-3;
  @apply max-w-md;
}

.toast-success {
  @apply bg-code/20 border-2 border-code;
}

.toast-error {
  @apply bg-ember/20 border-2 border-ember;
}

.toast-icon {
  @apply text-2xl;
}

.toast-message {
  @apply text-smoke font-medium;
}

.toast-enter-active,
.toast-leave-active {
  @apply transition-all duration-300;
}

.toast-enter-from {
  @apply opacity-0 transform translate-y-4;
}

.toast-leave-to {
  @apply opacity-0 transform translate-x-4;
}
</style>
```

### 7.7 Copy Button

```vue
<template>
  <button @click="copyToClipboard" class="copy-btn" :class="{ copied }">
    <span v-if="!copied">📋 Copy</span>
    <span v-else>✅ Copied!</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const copied = ref(false)

async function copyToClipboard() {
  // Copy logic
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<style>
.copy-btn {
  @apply px-4 py-2 rounded-lg;
  @apply bg-shadow border-2 border-shadow;
  @apply text-smoke font-medium;
  @apply transition-all duration-200;
  @apply hover:border-code hover:shadow-lg;
}

.copy-btn.copied {
  @apply border-code bg-code/20;
}
</style>
```

---

## 8. Page Templates

### 8.1 Home / Create (`/`)

#### Layout Structure

```
┌─────────────────────────────────────────────┐
│  Header (Logo + Nav)                        │
├─────────────────────────────────────────────┤
│                                             │
│  [Hero Section]                             │
│  Title: "Share Secrets. Burn Evidence."    │
│  Subtitle: "E2E encrypted, self-destruct"  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  [Large Textarea]                   │   │
│  │  "Paste your secret..."             │   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Options Row]                              │
│  🔥 Burn after reading    ⏱ 1 hour         │
│  🔒 Password (optional)                     │
│                                             │
│  [🔥 CREATE BURN LINK]  ← Big CTA          │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  [Features Cards - 3 columns]               │
│  🔐 E2E Encrypted | 🚫 No Logs | ⚡ Instant │
│                                             │
├─────────────────────────────────────────────┤
│  Footer                                     │
└─────────────────────────────────────────────┘
```

#### Responsive Behavior

**Desktop (≥1024px)**:
- Centered container, max-width 800px
- Textarea height: 400px
- 3-column features grid

**Tablet (768px - 1023px)**:
- Full width with padding
- Textarea height: 350px
- 3-column features grid (smaller cards)

**Mobile (<768px)**:
- Full width, minimal padding
- Textarea height: 300px
- 1-column features stack

### 8.2 View / Burn (`/:id`)

#### Pre-Reveal State

```
┌─────────────────────────────────────────────┐
│                                             │
│         ⚠️ ONE-TIME SECRET                  │
│                                             │
│  This message will self-destruct           │
│  after you reveal it.                      │
│                                             │
│  🔥 Created: 5 minutes ago                 │
│  💀 Single view only                       │
│  ⏱️  Expires in: 55 minutes                │
│                                             │
│  ┌──────────┐  ┌─────────────────────┐    │
│  │ ❌ Cancel │  │ 🔓 Reveal Secret    │    │
│  └──────────┘  └─────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

#### Post-Reveal State

```
┌─────────────────────────────────────────────┐
│  ✅ Secret Revealed                         │
│  🔥 Will self-destruct when you leave      │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │                                       │ │
│  │  [Secret Content with Syntax          │ │
│  │   Highlighting if code detected]      │ │
│  │                                       │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [📋 Copy to Clipboard]                    │
│                                             │
│  💡 Tip: Closing this tab will destroy    │
│     this secret permanently.               │
│                                             │
└─────────────────────────────────────────────┘
```

### 8.3 Gone (`/gone`)

```
┌─────────────────────────────────────────────┐
│                                             │
│           💨 💨 💨                          │
│          . . . . .                          │
│         . ° ° ° ° .                         │
│        ___________                          │
│                                             │
│       🔥 Burned to Ashes                   │
│                                             │
│   This secret has been destroyed.          │
│   It no longer exists anywhere.            │
│                                             │
│   [🆕 Create New Secret]                   │
│                                             │
│   ───────────────────────────                │
│   🔥 12,547 secrets burned today           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 9. Micro-interactions

### Philosophy
Interactions should feel **fast**, **responsive**, and **delightful** without being distracting. Fire metaphor throughout.

### 9.1 Button Interactions

#### Hover

```css
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 68, 68, 0.4); }
  50% { box-shadow: 0 0 30px rgba(255, 136, 0, 0.6); }
}

.btn-primary:hover {
  animation: glow 2s ease-in-out infinite;
  transform: scale(1.05);
}
```

#### Click (Active)

```css
.btn-primary:active {
  transform: scale(0.95);
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.2);
}
```

### 9.2 Copy Feedback

**Sequence**:
1. User clicks "Copy" button
2. Button text changes: "📋 Copy" → "✅ Copied!"
3. Small flame icon 🔥 animates upward and fades
4. Toast notification appears: "Secret copied to clipboard"
5. After 2s, button reverts to "📋 Copy"

```css
@keyframes flame-rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px) scale(1.5);
    opacity: 0;
  }
}

.flame-particle {
  animation: flame-rise 0.8s ease-out forwards;
}
```

### 9.3 Burn Animation

**Trigger**: When secret is destroyed (after viewing or manual burn)

**Sequence**:
1. Screen flashes orange (200ms)
2. Content dissolves from bottom to top
3. Flame particles rise from dissolution point
4. Transition to `/gone` page

```css
@keyframes burn-dissolve {
  0% {
    clip-path: inset(0 0 0 0);
    filter: brightness(1);
  }
  30% {
    filter: brightness(1.5) saturate(2);
  }
  100% {
    clip-path: inset(0 0 100% 0);
    filter: brightness(0.5) blur(4px);
    opacity: 0;
  }
}

.burning {
  animation: burn-dissolve 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

### 9.4 Loading States

#### Spinner (Generic)

```vue
<template>
  <div class="spinner">
    <div class="flame">🔥</div>
  </div>
</template>

<style>
@keyframes spin-flame {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

.flame {
  animation: spin-flame 1.5s ease-in-out infinite;
}
</style>
```

#### Burnie Eating (Paste creation)

```css
@keyframes chomp {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.8); }
}

.burnie-mouth {
  animation: chomp 0.5s ease-in-out infinite;
}
```

### 9.5 Focus States

**All interactive elements must have visible focus indicators for keyboard navigation.**

```css
.focusable:focus-visible {
  outline: 3px solid rgba(255, 68, 68, 0.5);
  outline-offset: 2px;
}
```

### 9.6 Page Transitions

```css
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
```

### 9.7 Easter Eggs

#### Ash Pile Click (10x)

**Behavior**: After 10 clicks on ash pile in `/gone`, Burnie appears with a wink and says:

> "Looking for something? It's gone. Forever. 😉"

```javascript
let clickCount = 0

function handleAshClick() {
  clickCount++
  if (clickCount === 10) {
    showBurnieEasterEgg()
    clickCount = 0
  }
}
```

---

## 10. Accessibility

### WCAG 2.1 AA Compliance Checklist

- [x] **Color Contrast**: All text meets 4.5:1 ratio minimum
- [x] **Keyboard Navigation**: All interactive elements focusable with Tab
- [x] **Focus Indicators**: Visible focus states on all elements
- [x] **ARIA Labels**: Proper labels on form inputs and buttons
- [x] **Semantic HTML**: Headings hierarchy, landmarks
- [x] **Screen Reader**: All content accessible via screen reader
- [x] **Alt Text**: Descriptive alt text for images (decorative = `alt=""`)
- [x] **Form Labels**: All inputs have associated labels
- [x] **Error Messages**: Clear, specific error messages linked to inputs

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate forward |
| `Shift + Tab` | Navigate backward |
| `Enter` | Activate button/link |
| `Space` | Toggle checkbox/switch |
| `Esc` | Close modal/dialog |
| `Ctrl + C` (Mac: `Cmd + C`) | Copy secret (when revealed) |

### Screen Reader Announcements

```html
<!-- Live region for dynamic updates -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  {{ statusMessage }}
</div>

<!-- Example: After paste creation -->
<div role="status" aria-live="polite">
  Burn link created successfully. Press Ctrl+C to copy.
</div>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Dark/Light Mode

### Current Implementation
**Default**: Dark mode only (initial launch)

### Future Light Mode (Optional)

If implementing light mode later, maintain brand consistency:

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Background | `#0a0a0a` | `#ffffff` |
| Surface | `#1a1a1a` | `#f5f5f5` |
| Text | `#f5f5f5` | `#0a0a0a` |
| Accent | `#ff4444` | `#ff4444` (same) |
| Code Green | `#00ff9d` | `#00cc7a` (slightly darker for contrast) |

**Recommendation**: Stay dark-mode only for MVP. It's part of the brand identity.

---

## 12. Implementation Guide

### 12.1 Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0a',
        ash: '#1a1a1a',
        shadow: '#2a2a2a',
        smoke: '#f5f5f5',
        fog: '#a0a0a0',
        ember: '#ff4444',
        plasma: '#ff8800',
        code: '#00ff9d',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'ember': '0 0 20px rgba(255, 68, 68, 0.4)',
        'plasma': '0 0 20px rgba(255, 136, 0, 0.4)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'burn': 'burn-dissolve 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 68, 68, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 136, 0, 0.6)' },
        },
        'burn-dissolve': {
          '0%': {
            clipPath: 'inset(0 0 0 0)',
            filter: 'brightness(1)',
          },
          '100%': {
            clipPath: 'inset(0 0 100% 0)',
            filter: 'brightness(0.5) blur(4px)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

### 12.2 Component Structure

```
components/
├── ui/              # Base UI components
│   ├── Button.vue
│   ├── Input.vue
│   ├── Textarea.vue
│   ├── Card.vue
│   ├── Toggle.vue
│   └── Toast.vue
├── paste/           # Paste-specific components
│   ├── PasteForm.vue
│   ├── PasteViewer.vue
│   └── PasteOptions.vue
├── brand/           # Brand elements
│   ├── Logo.vue
│   └── Burnie.vue
└── animations/      # Animation components
    ├── BurnEffect.vue
    └── FlameParticles.vue
```

### 12.3 CSS Architecture

**Approach**: Tailwind utility-first with custom components for complex patterns

```css
/* assets/css/main.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-void text-smoke font-sans antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply px-8 py-4 rounded-lg font-semibold;
    @apply bg-gradient-to-r from-ember to-plasma;
    @apply text-smoke shadow-lg;
    @apply transition-all duration-300;
    @apply hover:scale-105 hover:shadow-ember;
    @apply active:scale-95;
  }
}

@layer utilities {
  .glow-ember {
    box-shadow: 0 0 20px rgba(255, 68, 68, 0.4);
  }
}
```

### 12.4 Animation Implementation

Create reusable animation composables:

```typescript
// composables/useAnimations.ts
export function useBurnAnimation() {
  const triggerBurn = (element: HTMLElement) => {
    element.classList.add('burning')

    return new Promise(resolve => {
      element.addEventListener('animationend', () => {
        resolve(true)
      }, { once: true })
    })
  }

  return { triggerBurn }
}
```

---

## Appendix

### A. Design Tokens (JSON)

```json
{
  "colors": {
    "void": "#0a0a0a",
    "ash": "#1a1a1a",
    "shadow": "#2a2a2a",
    "smoke": "#f5f5f5",
    "fog": "#a0a0a0",
    "ember": "#ff4444",
    "plasma": "#ff8800",
    "code": "#00ff9d"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  "typography": {
    "fontFamily": {
      "ui": "Inter, sans-serif",
      "code": "JetBrains Mono, monospace"
    },
    "fontSize": {
      "display": "48px",
      "h1": "36px",
      "h2": "28px",
      "h3": "20px",
      "body-lg": "18px",
      "body": "16px",
      "body-sm": "14px",
      "caption": "12px"
    }
  }
}
```

### B. Figma / Design File Structure

**Recommended layers**:
1. 🎨 **Color Palette** (swatches)
2. 📝 **Typography** (text styles)
3. 🧩 **Components** (buttons, inputs, cards)
4. 📱 **Page Templates** (home, view, gone)
5. 🔥 **Brand Assets** (logo, Burnie variations)

### C. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2025 | Initial comprehensive design system |

---

**Maintainer**: BurnPast contributors

**License**: MIT, same as the project

**Last Review**: June 2026

**Questions?** Open a GitHub issue.

🔥 **Remember**: Good design is invisible. Great design is ephemeral. Perfect design burns after reading.
