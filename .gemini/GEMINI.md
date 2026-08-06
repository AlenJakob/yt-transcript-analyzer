# Project Guidelines & Agent Instructions

## Overview
This repository (**yt-transcript-analyzer**) is a Next.js web application built with React 19, TypeScript, and Material UI (MUI v9). It fetches YouTube video transcripts, parses them, and analyzes them using AI prompt templates.

---

## 1. Language & Documentation
- **Language**: All code, comments, docstrings, variable names, function names, types, and commit messages MUST be in **English**.

---

## 2. TypeScript & Component Architecture
- Use functional React components (`React.FC` or standard function declarations with typed props).
- **Strict Typing**: Never use `any`. Explicitly define interfaces and types for props, API responses, and state objects.
- Keep components modular, focused, and organized within `src/components/`.
- Use Next.js App Router conventions (`'use client'` directive only when client-side hooks/state are required).

---

## 3. Material UI (MUI v9) & Layout Best Practices

### Grid Component Syntax (CRITICAL)
- **Do NOT use legacy Grid syntax**: Avoid `<Grid item xs={12} md={6}>`.
- **ALWAYS use MUI v9 Grid syntax**:
  ```tsx
  // ✅ Correct (MUI v9)
  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item.id}>
    <CardComponent item={item} />
  </Grid>

  // ❌ Legacy Syntax (Do NOT use)
  <Grid item xs={12} md={6}>
    <CardComponent item={item} />
  </Grid>
  ```

### Styling Guidelines
- Use the `sx` prop for component styling and layout adjustments.
- Avoid plain CSS / external stylesheet hacks when MUI theme tokens or `sx` props are available.
- Maintain consistent dark/light theme tokens using `@mui/material/styles`.

---

## 4. Code Formatting & Quality
- Keep code formatted according to Prettier and ESLint rules configured in the project (`npm run format` / `npm run lint`).
- Ensure proper error handling in API routes (`src/app/api/...`) and return typed JSON responses with standard status codes.
