---
tags: [moc]
---

# 🏠 Bánh Cuốn Restaurant — Project Vault

Hệ Thống Quản Lý Quán Bánh Cuốn — QR ordering + POS + kitchen display.
This vault maps the whole project. Open the **graph view** to see how everything connects.

> 🆕 First time here? Read [[Guideline]] — how to navigate, color the graph, and keep the vault in sync.

## Architecture

- [[Architecture - Backend]] — Go 1.25 · Gin · sqlc · MySQL 8.0 · Redis
- [[Architecture - Frontend]] — Next.js 14 App Router · TypeScript · Tailwind · Zustand · TanStack Query
- [[Architecture - Infrastructure]] — Docker Compose · Caddy · GitHub Actions

## Backend domains

- [[BE - Auth]] · [[BE - Products & Menu]] · [[BE - Orders]] · [[BE - Payment]]
- [[BE - Tables & QR]] · [[BE - Staff]] · [[BE - Analytics]] · [[BE - Ingredients]]
- [[BE - Tasks & Todo]] · [[BE - Training]] · [[BE - Marketing]] · [[BE - Chat AI]]
- [[BE - Realtime & Jobs]]

## Frontend pages & features

**Customer (shop):**
[[FE - Customer Menu]] · [[FE - Product & Combo Detail]] · [[FE - Favourites]] · [[FE - Checkout]] · [[FE - Order Tracking]] · [[FE - Table QR Entry]] · [[FE - Chat Widget]]

**Staff (dashboard):**
[[FE - KDS]] · [[FE - POS]] · [[FE - Cashier Payment]]

**Admin:**
[[FE - Admin Overview]] · [[FE - Admin Catalog]] · [[FE - Admin Staff & Training]] · [[FE - Admin Marketing & Analytics]]

**Foundation:**
[[FE - State & Data Layer]]

## Cross-cutting concepts

- [[Concept - Order Lifecycle]] — statuses, cancel rules, payment gate
- [[Concept - RBAC]] — roles and hierarchy
- [[Concept - Combo & Filling Model]] — combo header rows, filling, order payload

## Documentation system (docs/)

- [[Docs - Overview]] — the 3-tier doc map
- [[Docs - Specs]] · [[Docs - Contracts]] · [[Docs - Core Rules]]
- [[Docs - System Handbook]] · [[Docs - Workflows]] · [[Docs - Task Management]]
