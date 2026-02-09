# Image Aspect Ratio Fix

**Date**: 2026-02-09
**Issue**: Featured article images (1000×750px, 4:3 ratio) were being cropped to fit 16:9 containers

## Changes Made

### 1. Featured Article Hero (Homepage)
**File**: `components/hero-grid.tsx`

**Before**:
- Container: `min-h-[400px] md:min-h-[500px]` (fixed height, causing unpredictable aspect ratios)
- Image request: `width(1200).height(675)` (16:9 ratio)
- Result: 4:3 images cropped horizontally

**After**:
- Container: `aspect-[4/3]` (matches uploaded image dimensions)
- Image request: `width(1000).height(750)` (4:3 ratio, matches source)
- Result: Full image displayed without cropping

### 2. Individual Article Page Hero
**File**: `app/[sport]/[slug]/page.tsx`

**Before**:
- Container: `h-[400px] md:h-[500px]` (fixed height)
- Image request: `width(1920).height(1080)` (16:9 ratio)

**After**:
- Container: `aspect-[4/3] w-full` (matches uploaded image dimensions)
- Image request: `width(1600).height(1200)` (4:3 ratio, larger for full-width display)

### 3. Design System Documentation
**File**: `.design-system/system.md`

Updated Hero Article pattern documentation to specify:
- Aspect ratio: 4:3 (matches uploaded image dimensions of 1000×750px)
- Image dimensions: Request at 1000×750px to prevent cropping

## Other Components

**ArticleCard** (grid view): Left as `aspect-video` (16:9)
- Rationale: Card thumbnails in grids benefit from consistent 16:9 ratio for layout uniformity
- Small crop is acceptable for thumbnail presentation

**ArticleCard** (list view): Square thumbnail (128×128px)
- Rationale: Small size, square works well for list layouts

## Image Upload Guidelines

For best results across the site:
- **Featured article images**: Upload at 1000×750px (4:3 ratio)
- **Card thumbnails**: System will crop to 16:9 automatically
- **Hero sections**: Use 4:3 aspect ratio containers to show full image

## Design Principle

**Featured content gets full image treatment** — When an article is featured prominently (homepage hero, article page hero), show the full uploaded image without cropping. Respect the photographer's composition.

**Card grids prioritize layout consistency** — In card grids, consistent 16:9 thumbnails create better visual rhythm than mixed aspect ratios.
