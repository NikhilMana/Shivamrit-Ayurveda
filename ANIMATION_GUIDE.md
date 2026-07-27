# Animation Guide

# Shivamrit Ayurveda

Version: 1.0

Author: Nikhil Mana

---

# Animation Philosophy

Animation should never exist purely for decoration.

Every movement must reinforce the feeling of entering a premium Ayurvedic sanctuary.

The website should feel slow, elegant, immersive, organic, and cinematic.

Users should feel as though they are walking through a sacred forest discovering the Shivamrit brand rather than browsing a typical ecommerce website.

Every animation should have purpose.

---

# Core Animation Principles

Animations must be

• Slow
• Elegant
• Premium
• Natural
• Smooth
• Organic
• Responsive
• Performance Optimized

Avoid

❌ Flashy animations

❌ Bouncy effects

❌ Cartoon motion

❌ Fast transitions

❌ Excessive scaling

❌ Excessive rotation

❌ Random floating elements

---

# Animation Stack

Primary

GSAP

ScrollTrigger

Lenis

Secondary

Framer Motion

Three.js

React Three Fiber

Spline (if required)

---

# Global Experience

Page Load

↓

Hero Animation

↓

Scroll Storytelling

↓

Interactive Sections

↓

Product Exploration

↓

Checkout

↓

Confirmation

Everything should feel connected.

---

# Loading Experience

Duration

2–3 seconds maximum

Sequence

Dark background

↓

Soft ambient particles

↓

Shivamrit logo fades in

↓

Golden light sweep

↓

Logo fades

↓

Forest ambience appears

↓

Hero animation starts

No percentage loaders.

No spinning loaders.

Use cinematic fade transitions.

---

# Landing Hero Animation

Frame 1

Use uploaded forest canopy image.

Dense leaves cover entire viewport.

Only a small natural opening is visible.

Sunlight enters through the opening.

Tiny dust particles float.

Soft wind moves leaves.

Camera remains still.

Duration

3–5 seconds

---

Frame 2

On first scroll

Camera slowly begins moving toward the opening.

Parallax layers move independently.

Foreground leaves move faster.

Background trees move slower.

Sunlight intensity gradually increases.

The zoom accelerates naturally.

---

Frame 3

Camera passes through the opening.

Reveal the second forest composition.

Center the Shivamrit logo.

Logo appears with

Fade

Scale

Soft glow

Light rays

Particles

Very subtle breathing animation

---

Frame 4

Headline fades upward.

Subheadline appears.

CTA buttons slide upward.

Navigation fades in.

Scroll indicator appears.

---

# Scroll Behaviour

Use Lenis.

Scrolling should feel

Heavy

Premium

Smooth

Natural

Never abrupt.

---

# Section Reveal Animations

Every section

Fade

Translate

Opacity

Stagger children

Animation Distance

40–80px

Duration

0.8–1.2 seconds

Ease

Power3 Out

---

# Typography Animations

Headings

Reveal using mask animation.

Words appear sequentially.

Paragraphs

Fade Up

Links

Underline Reveal

Buttons

Fade + Lift

---

# Product Cards

Default

Static

Hover

Lift 8px

Increase shadow

Image zoom 5%

Glow border

Tilt 2°

Duration

300ms

---

# Product Images

Every product should

Float slowly

Rotate slightly

React to mouse movement

Have soft lighting

Cast realistic shadows

Hover

Increase lighting

Tiny rotation

Soft scale

---

# Ingredient Sections

Each ingredient should feel alive.

Floating botanical illustration

Slow leaf movement

Soft particles

Light rays

Parallax backgrounds

Text reveals

Image reveals

Pinned storytelling

---

# Parallax System

Background

20%

Middle Layer

50%

Foreground

100%

Leaves

110%

Dust

120%

Never exaggerate.

Movement should remain subtle.

---

# Mouse Interaction

Hero

Very subtle camera movement.

Maximum rotation

3°

Product

Soft follow effect.

Buttons

Magnetic attraction.

Images

Light perspective.

Never create motion sickness.

---

# Navigation

Transparent on hero.

Solid after scrolling.

Height reduces slightly.

Logo scales down.

Background blur increases.

Transition

400ms

---

# Buttons

Hover

Lift

Glow

Soft scale

Arrow moves

Ripple

Press

Scale 0.97

Release

Spring

---

# Cards

Hover

Lift

Soft rotation

Increase shadow

Image zoom

Border glow

---

# Images

Reveal

Mask animation

Hover

Scale 1.05

Slow pan

Parallax

---

# Gallery

Images reveal one after another.

Use stagger animation.

Light fade.

No abrupt transitions.

---

# Testimonials

Cards fade in.

Stagger delay.

Customer image scales slightly.

---

# FAQ

Accordion animation.

Height auto.

Opacity transition.

Chevron rotation.

---

# Personalize Your Ritual

Step transitions

Slide

Fade

Progress indicator animation.

Live preview rotates smoothly.

Sticker placement animates.

Text engraving appears naturally.

Product updates instantly.

---

# Shopping Cart

Drawer slides from right.

Background blur.

Product added

Small floating confirmation.

Cart icon bounce.

Minimal celebration.

---

# Checkout

Step indicator.

Smooth transitions.

Validation animations.

Order summary updates live.

---

# Order Confirmation

Soft celebration.

Floating leaves.

Logo glow.

Order success animation.

Confetti is NOT allowed.

---

# Cursor

Desktop only.

Custom cursor.

Small dot.

Outer ring.

Hover expands.

Clickable objects attract cursor.

Interactive areas glow subtly.

---

# Background Effects

Floating dust

Soft particles

Light rays

Fog

Very subtle grain

Moving botanical silhouettes

No distracting effects.

---

# Three.js Usage

Landing Hero

Forest depth

Floating ingredients

Product showcase

Ambient particles

Logo lighting

Do not create heavy 3D scenes.

Target

60 FPS

---

# GSAP Usage

Hero timeline

Pinned sections

Reveal animations

ScrollTrigger

Parallax

Image reveals

Typography reveals

Page transitions

---

# Framer Motion Usage

Buttons

Cards

Modals

Drawers

Forms

Notifications

Micro interactions

---

# Page Transition

Exit

Fade Out

Blur

Scale 0.98

Enter

Fade In

Translate Y 20px

Duration

700ms

---

# Timing Guidelines

Fast

200ms

Standard

350ms

Luxury

600ms

Cinematic

1000–1800ms

Never exceed 2 seconds unless it's the opening hero.

---

# Easing

Primary

Power3.Out

Secondary

Expo.Out

Luxury

Circ.Out

Avoid

Bounce

Elastic

Back

---

# Accessibility

Respect prefers-reduced-motion.

Provide simplified transitions.

Never rely on animation for usability.

---

# Performance

Target

60 FPS

Avoid layout thrashing.

Use transforms instead of top/left.

Animate opacity and transform only.

Lazy load animations.

Pause offscreen animations.

Compress textures.

---

# Final Experience

The visitor should feel like they have entered a premium Ayurvedic forest where every interaction is calm, intentional, and beautifully crafted.

The website should not simply display products.

It should create an emotional journey that builds trust, curiosity, and appreciation before encouraging a purchase.