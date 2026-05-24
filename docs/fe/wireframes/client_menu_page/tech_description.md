## Technical Architecture Overview

### **Page Structure**
- **10 Zones (A-J)** with layered sticky positioning (`z-10` to `z-30`)
- **Conditional rendering** based on `selectedCategory` and cart state
- **Scrollable content area** between fixed header and bottom FAB

### **Tech Stack**
```
React (Next.js App Router)
├── State: Zustand (cart, user settings) + localStorage persistence
├── Data: TanStack Query (categories, products, combos)
├── Styling: Tailwind CSS (sticky positioning, responsive grid)
└── Types: TypeScript interfaces for all components
```

### **Key Implementation Patterns**

**1. Component Architecture**
- Modular components per zone (`SearchBar`, `ComboCard`, `ProductGridCard`, etc.)
- Props-driven with strict TypeScript contracts
- Inline toppings configuration without modal dialogs

**2. State Management**
```typescript
// Centralized cart store with persistence
cartStore: {
  items: CartItem[]
  drinkConfig: DrinkConfig
  orderNote: string
  // Actions: addItem, updateQuantity, updateToppings
}
```

**3. Data Fetching Strategy**
```typescript
// TanStack Query with 5min staleTime
- Categories: ['categories']
- Products: ['products', categoryId, searchQuery]  
- Combos: ['combos'] (always fetched, conditionally shown)
```

**4. Performance Optimizations**
- **Debounced search** (300ms) to prevent API spam
- **Optimistic UI updates** for cart actions with rollback on error
- **Memoized computed values** (`itemCount`, `total`)
- **Conditional queries** (combos hidden when category selected)

**5. UX Enhancements**
- **Progressive disclosure**: Collapsible order summary, expandable combo details
- **Immediate feedback**: Toast notifications, button state changes
- **Accessibility**: 44px touch targets, ARIA labels, keyboard navigation, reduced motion support

**6. Edge Case Handling**
- Image fallbacks → placeholder SVG
- Network errors → retry banners
- Empty states → contextual CTAs
- Quantity limits (max 99) → disabled buttons

### **File Organization**
```
/(shop)/menu/
├── page.tsx                 # Main page composing zones
├── components/
│   ├── SearchBar.tsx
│   ├── CategoryTabs.tsx
│   ├── FavoritesRail.tsx
│   ├── ComboCard.tsx
│   ├── ProductGridCard.tsx
│   ├── DrinkCustomize.tsx
│   ├── OrderNote.tsx
│   ├── OrderSummary.tsx
│   └── CartFAB.tsx
├── hooks/
│   └── useMenuQueries.ts   # TanStack Query hooks
└── stores/
    └── cartStore.ts        # Zustand store
```

### **Critical Implementation Notes**
- **UUID for cart items** (never use numeric IDs)
- **Price formatting** client-side (raw numbers in state)
- **Version mismatch detection** for concurrent cart edits
- **Auto-collapse** order summary after 10s inactivity
- **Sticky stack management** (3 zones competing for top position)

This architecture prioritizes **performance** (caching, debouncing), **maintainability** (modular components, strict types), and **UX** (immediate feedback, accessibility).