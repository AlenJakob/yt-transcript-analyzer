#!/usr/bin/env bash

# Check environment variables for build/CI pipeline

if [ -n "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
  echo "✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set"
else
  echo "⚠️ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing (using fallback in layout.tsx)"
fi

if [ -n "$OPENAI_API_KEY" ]; then
  echo "✅ OPENAI_API_KEY is set"
else
  echo "⚠️ OPENAI_API_KEY is missing"
fi
