# Technical Requirements Document (TRD)

# Shivamrit Ayurveda

Version: 1.0

Author: Nikhil Mana

---

# Overview

This document defines the complete technical architecture for Shivamrit Ayurveda.

The website must be built as a premium, highly animated, scalable ecommerce platform that combines immersive storytelling, 3D experiences, and modern web technologies while maintaining exceptional performance.

The application should be modular, reusable, maintainable, SEO-friendly, and production-ready.

---

# Core Tech Stack

Framework

Next.js 15 (App Router)

Language

TypeScript

Package Manager

pnpm

Styling

Tailwind CSS

Component Library

shadcn/ui

Icons

Lucide React

Animations

GSAP

Framer Motion

Lenis

Three.js

React Three Fiber

Drei

State Management

Zustand

Forms

React Hook Form

Validation

Zod

Authentication

Clerk

or

Auth.js

Database

Supabase

CMS

Sanity CMS

Alternative

Payload CMS

Image Optimization

Next Image

Deployment

Vercel

Analytics

Google Analytics

Google Search Console

Microsoft Clarity

Meta Pixel

Payment

Stripe

Future

Razorpay

Email

Resend

or

SendGrid

Fonts

Canela

Cormorant Garamond

Inter

---

# Architecture Philosophy

The project should follow

Component Driven Development

Atomic Design

Server Components by default

Client Components only when necessary

Reusable UI

Minimal prop drilling

Scalable architecture

High performance

---

# Folder Structure

src/

app/

components/

features/

hooks/

lib/

services/

store/

types/

styles/

assets/

config/

constants/

utils/

providers/

animations/

three/

cms/

public/

docs/

---

# App Structure

Home

About

Ingredients

Products

Product Detail

Customization

Journal

Contact

Account

Cart

Checkout

Privacy

Terms

404

---

# Routing

/

about

ingredients

products

products/[slug]

customize

journal

journal/[slug]

contact

cart

checkout

account

login

register

wishlist

faq

privacy

refund

shipping

terms

---

# Layout Architecture

Global Layout

Navbar

Footer

Smooth Scroll Provider

Theme Provider

Analytics

Page Transition Wrapper

Loading Screen

Cursor

Ambient Background

---

# Component Hierarchy

Layout

↓

Navbar

↓

Hero

↓

Section

↓

Cards

↓

Buttons

↓

Footer

Every component must remain independent and reusable.

---

# Core Components

Navbar

Footer

Hero

Buttons

Cards

Section Wrapper

Container

Product Card

Ingredient Card

Feature Card

Testimonial Card

Blog Card

Newsletter

FAQ

Timeline

Gallery

Video Section

Modal

Drawer

Toast

Badge

Accordion

Tabs

Carousel

Breadcrumb

Pagination

Search

Filter

Rating

Review

Wishlist Button

Quantity Selector

Add To Cart

Checkout Form

---

# Feature Modules

Authentication

Product Catalog

CMS

Search

Filtering

Wishlist

Cart

Checkout

Account

Personalization

Blog

Analytics

Newsletter

SEO

---

# Product Module

Gallery

Variants

Price

Ingredients

Benefits

Description

Directions

Reviews

FAQs

Recommendations

Customization

Add to Cart

Wishlist

---

# Personalization Module

Select Product

↓

Choose Label

↓

Choose Engraving

↓

Choose Sticker

↓

Preview

↓

Save

↓

Cart

Live preview updates should happen instantly.

---

# CMS Collections

Products

Categories

Ingredients

Blog

Testimonials

FAQ

Policies

Homepage Content

Media

Navigation

Site Settings

SEO

---

# Product Schema

Product Name

Slug

Category

Description

Short Description

Images

Price

Compare Price

Ingredients

Benefits

Usage

FAQs

Reviews

Tags

SEO

Featured

Stock

Customization Enabled

---

# Blog Schema

Title

Slug

Author

Date

Reading Time

Category

Featured Image

Content

Tags

SEO

---

# API Structure

/api/products

/api/cart

/api/checkout

/api/orders

/api/account

/api/customization

/api/search

/api/newsletter

/api/reviews

---

# State Management

Global

Authentication

Cart

Wishlist

Theme

Search

Filters

Notifications

Customization

Use Zustand.

Avoid Redux.

---

# Performance Requirements

Lighthouse

95+

FCP

Below 1.8s

LCP

Below 2.5s

CLS

Below 0.1

INP

Below 200ms

---

# Image Strategy

Next Image

WebP

AVIF

Responsive Images

Lazy Loading

Blur Placeholder

Priority Images

CDN

---

# SEO

Metadata API

Dynamic Meta

OpenGraph

Twitter Cards

Canonical URLs

Schema.org

Breadcrumb Schema

Product Schema

Article Schema

Organization Schema

Sitemap

Robots.txt

---

# Accessibility

WCAG AA

Keyboard Navigation

Screen Reader Support

Focus States

Semantic HTML

Alt Text

Color Contrast

Reduced Motion

---

# Security

HTTPS

Rate Limiting

CSRF Protection

Secure Cookies

Environment Variables

Input Validation

XSS Protection

Content Security Policy

---

# Ecommerce Flow

Landing

↓

Product

↓

Customization

↓

Cart

↓

Checkout

↓

Payment

↓

Order Success

↓

Dashboard

---

# Animation Stack

GSAP

Primary scroll animations

ScrollTrigger

Pinned sections

Reveal animations

Hero timeline

Framer Motion

Component transitions

Modal animations

Cards

Hover interactions

Lenis

Smooth scrolling

Page movement

Three.js

Forest scene

Product showcase

Particles

Lighting

Camera movement

---

# Three.js Guidelines

Use only where meaningful.

Primary uses

Landing Hero

Floating Ingredients

Product Showcase

Background Particles

Logo Reveal

Avoid excessive GPU usage.

Maintain 60 FPS.

Optimize textures.

Use compressed assets.

---

# Animation Principles

Slow

Elegant

Natural

Purposeful

Never distracting

Every animation should enhance storytelling.

Avoid flashy effects.

---

# Responsive Breakpoints

Mobile

360

390

430

Tablet

768

1024

Desktop

1280

1440

1600

1920

---

# Coding Standards

Strict TypeScript

ESLint

Prettier

Reusable hooks

Reusable utilities

No duplicate code

Meaningful naming

Component documentation

---

# Naming Convention

Components

PascalCase

Hooks

useSomething

Files

kebab-case

Constants

UPPER_CASE

Types

PascalCase

Functions

camelCase

---

# Error Handling

404

500

Network Errors

Form Validation

Payment Failure

CMS Errors

Graceful fallback UI

---

# Logging

Console disabled in production.

Use proper error monitoring.

Future

Sentry Integration

---

# Deployment

Platform

Vercel

Branches

development

staging

production

Automatic Preview Deployments

Environment Variables

Production Secrets

---

# Browser Support

Chrome

Edge

Safari

Firefox

Latest two versions

---

# Future Integrations

AI Skin Analysis

Hair Diagnosis

AR Product Preview

Voice Assistant

Loyalty Program

Referral System

Subscription Engine

Mobile App

International Store

Multi-language

---

# Technical Success Criteria

✓ Lighthouse 95+

✓ SEO Optimized

✓ Mobile First

✓ Accessible

✓ Modular

✓ Fully Responsive

✓ Reusable Components

✓ Optimized Images

✓ Smooth Animations

✓ CMS Driven

✓ Secure

✓ Scalable

✓ Maintainable

✓ Production Ready