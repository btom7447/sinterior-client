# Sintherior — North Star (web client)

_Last updated: 2026-07-27_

## Vision

**The visual front door to Nigerian construction and interior design.** People plan builds and renovations with pictures — saved WhatsApp images, Instagram screenshots — disconnected from anyone who can actually do the work. Sintherior closes that gap: every image on the platform is attached to a verified artisan you can hire, a product you can buy, or a property you can view. Inspiration and transaction in one loop.

## North-star metric

**Weekly Commerce Actions from Feed (WCAF):** quote requests + orders + viewing bookings that originate from a pin.

## This surface's role

`sinterior-client` (Next.js on Vercel, sintherior.com) is the **primary product** — feed-first after the Pinterest-style pivot. sintherior.com lands on the masonry feed; every pin terminates in a commerce CTA wired to the existing quote/cart/viewing flows. Built for Nigerian mobile reality: data-cost-aware media (poster frames, tap-to-play video), WhatsApp-shareable pin URLs, mobile-first layouts.

Other surfaces (server API, planned mobile app, shelved WhatsApp bot) are described in the platform docs.

> **Platform-canonical version:** server repo `/docs/north-star.md` (btom7447/sinterior-server).
