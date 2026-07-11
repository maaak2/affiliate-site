# CLAUDE.md — MahmoudTries Affiliate Review Site

This file is project memory for Claude Code. Read it at the start of every session and keep it up to date as the project evolves.

## Project Overview
A personal affiliate review website. The owner (Mahmoud) posts honest reviews of products, services, and hotels he has personally used, with affiliate links so visitors can purchase/book through his referral.

## Target Market
- Primary: Saudi Arabia
- Secondary: MENA region (Arabic-speaking countries)

## Languages
- Full bilingual site: Arabic and English
- Arabic renders right-to-left (RTL); English left-to-right (LTR)
- Language switcher on every page

## Tech Stack
- Next.js + Tailwind CSS, npm
- Hosted on Netlify (chosen because its free tier explicitly allows commercial use — Vercel's free "Hobby" tier does not)
- Code backed up on GitHub
- Domain: mahmoudtries.com

## Content Model (per review item)
- **Category**: owner-expandable list (e.g. Electronics, Hotels, Services, Home Goods), not a fixed enum. Every item has a category tag. Category listing pages exist.
- **Media**: one or more items, each a photo or a video.
- **Review text**: short paragraph, owner's own written review, in both languages.
- **Rating**: out of 5 (current scale — keep as is, do not change to out of 10).
- **Price paid**: single field — the price Mahmoud actually paid, not a live/current price. Includes a currency selector, default SAR, also supporting at minimum USD and AED. Currency is stored alongside the amount and displayed with it (e.g. "450 SAR").
- **Affiliate links**: up to two per item, each with its own label (e.g. retailer/site name) and URL.
  - First link is required.
  - Second link is optional — used when the same item is listed on a second site/retailer. Do not require it or show an empty slot when unused.
- **Discount/promo code**: optional field, shown on the item page only if present.

## Admin
Simple form-based admin panel (no code editing required) to add/edit items and categories, in both languages.

## SEO & Marketing
- Meta titles/descriptions, clean URLs, sitemap, fast page loads
- schema.org Product/Review structured data (reviewRating bestRating: 5)
- Bilingual SEO: separate keyword optimization for Arabic and English
- Structured so AI-driven search/assistants can surface items well
- Analytics/tracking on affiliate link clicks

## Working Conventions
- The item schema fields (category, links, media, price) are interrelated — when changing one, check whether the admin form, display templates, and structured data (JSON-LD) all need updating together, not piecemeal.
- Mobile-responsive design required.
- Site should scale cleanly as more categories and items are added over time.
