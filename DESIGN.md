# nummyGo – UX & UI Design Specifications

This document serves as the design foundation for nummyGo, detailing the core architecture, visual identity, and user flows. A ready-to-use prompt for AI UI/UX generators (like Midjourney, v0, or similar tools) is provided at the bottom.

---

## 1. Project Overview
**nummyGo** is a premium, real-time food ordering platform that functions as both a B2C customer marketplace and a B2B SaaS Point-of-Sale (POS) dashboard for restaurant tenants.
The defining characteristic is **real-time synchronization**. Customers see their food progress instantly without refreshing, while restaurant kitchens manage incoming queues live via WebSocket connections.

## 2. Target Audiences
- **Hungry Customers:** Users who want a frictionless, high-end browsing experience. They need an easy way to build a multi-vendor cart, seamlessly check out, and track their order status live.
- **Restaurant Vendors (Tenants):** Staff or owners managing high-stress kitchen environments. They need a highly legible, dark-mode kitchen display system (KDS) and a seamless onboarding portal to set up their digital storefront.

## 3. Visual Identity & Brand Guidelines
The platform must deviate from standard, flat SAAS designs and embrace a highly engaging, modern, premium aesthetic.

* **Base Theme:** Dark Mode default (Deep space/slate backgrounds like `#0D1117`).
* **Accent Colors:** 
  * Vibrant Amber / Orange glow for primary actions (ordering, checkout).
  * Indigo / Violet glows for interactive elements and WebSocket pulse indicators.
* **UI Paradigms:**
  * **Glassmorphism:** Frosted glass navbars, floating action buttons, and side-drawers (backdrop blurs).
  * **Borders & Highlights:** Glossy gradient-borders on menu item cards to make the imagery "pop."
  * **Micro-interactions:** Smooth animations on cart counter changes and live tracking status bars.

## 4. Core Workflows & Key Screens

### Customer Facing
1. **Platform Landing Page:** A high-conversion homepage highlighting benefits. Features a prominent, glowing vendor/restaurant search bar.
2. **Partner Storefront (`/[slug]`):** 
   - A sticky, frosted-glass top navbar and a sticky floating cart action button.
   - A full-viewport stunning hero banner displaying the restaurant brand.
   - A minimalist vendor info section (business hours, availability).
   - A menu grid composed of glossy gradient-border cards with local quantity selectors (`−`/`+`).
3. **Multi-Partner Cart Drawer:** A slide-out panel that intelligently groups items by `tenantId`. Allows the user to select fulfillment methods (pickup/delivery) and payment methods (pay at counter/card) independently for each restaurant.
4. **Universal Checkout Page:** A pristine, schema-driven order summary page with dynamic payment integrations (triggering card modals only when required).
5. **Real-time Order Tracker (`/track/[sessionId]`):** A beautiful tracking dashboard showcasing an animated, glowing progress bar moving through `Pending → Preparing → Ready → Completed` as it listens to live WebSocket events. 

### Partner/Tenant Facing
1. **B2B Authentication & Onboarding:** A premium login portal utilizing Google OAuth followed by a smooth vendor onboarding flow (setting up slugs, business hours).
2. **Kitchen Dashboard (POS / KDS):** A highly functional yet sleek dashboard that receives incoming orders automatically. Features easy-to-tap status buttons (`Accept`, `Mark Ready`, `Cancel`) with large, readable fonts tailored for tablets and touchscreens in busy kitchens. 
3. **Storefront Configuration Suite:** Settings interface for the vendor to update banners, branding, payment thresholds, and cancellation rules. Includes a real-time browser-chrome preview mockup of their resulting storefront.

---

## 5. AI Prompt for UX/UI Generation

**Copy and paste the prompt below into your preferred AI UI/UX generator or pass it to a designer.**

> **Context:** Create high-fidelity UI design mockups for a premium web application named "nummyGo". nummyGo is a real-time food ordering platform connecting customers to multiple restaurant tenants. The app uses WebSockets for instant, no-refresh order tracking and kitchen queue management. 
> 
> **Aesthetic & Vibe:** The design MUST use a sleek, modern Dark Mode aesthetic (deep backgrounds like #0D1117). Use cutting-edge web design trends: subtle glassmorphism (frosted backgrounds), glossy gradient borders on cards, and vivid accent glows (Amber/Orange gradients for primary actions, Indigo/Violet for decorative or live-status indicators). Avoid basic, flat utility designs—aim for a dynamic, premium, high-converting "wow" factor similar to top-tier Dribbble shots, Stripe, or Linear.
> 
> **Screens requested:**
> 
> 1. **Customer Partner Storefront (Mobile & Desktop):** 
>    - A stunning full-width hero banner at the top for the restaurant.
>    - A sticky, frosted-glass header with a floating cart icon that has a glowing notification badge.
>    - A grid of beautiful menu item cards. Each card must have a glossy, thin gradient border, an appetizing high-quality photo of the food, title, price, and intuitive `+` and `-` quantity selectors.
> 
> 2. **Multi-Partner Slide-Out Cart:**
>    - A side drawer (with a blurred backdrop obscuring the main page) displaying grouped items by restaurant.
>    - Sleek toggles for each restaurant group showing "Pickup vs Delivery" and "Pay at Store vs Card". 
>    - A bold, glowing "Proceed to Checkout" button anchored at the bottom.
> 
> 3. **Real-Time Live Order Tracker:**
>    - A focused view showing the live status of the order. 
>    - Include a dominant, visually striking glowing progress bar with 4 stages: "Pending", "Preparing" (animating with subtle pulsing indicator), "Ready", and "Completed".
> 
> 4. **Tenant Kitchen POS Dashboard (Tablet/Desktop focus):**
>    - A practical but sleek interface mapping a Kanban-style queue or a clear grid of incoming order tickets.
>    - Order tickets must be highly legible, displaying items, quantities, and large, easily tappable buttons to advance the order state (e.g., a bright green "Accept" button and an orange "Mark Preparing" button). 
> 
> Please generate UI mockups that feel cohesive, expensive, developer-ready (with clear spacing), and highly responsive. Focus heavily on rich typography and harmonious, high-contrast dark space execution.
