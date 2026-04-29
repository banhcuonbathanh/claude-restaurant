# Phase 5.2 — Menu & Cart
> Dependency: Task 5.1 auth FE ✅ + Task 4.2 products API ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §2 (design tokens)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `fe/spec/Spec_3_Menu_Checkout_UI_v2.docx`
- [ ] `claude/CLAUDE_FE.docx`
- [ ] `contract/API_CONTRACT_v1.1.docx` §3
- [ ] `Task/BanhCuon_DB_SCHEMA_SUMMARY.md`
- [ ] `fe/PROMPT_menu_page.md` (detailed component spec)

---

## Prompt

```
You are the FE Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §2, ERROR_CONTRACT, Spec_3_Menu, CLAUDE_FE.docx, 
API_CONTRACT §3, DB_SCHEMA_SUMMARY, and PROMPT_menu_page.md above.

## Task: Build menu page + cart (Task 5.2)

### Step 1: fe/src/types/product.ts
Define TypeScript interfaces exactly:
interface Topping { id: string; name: string; price: number; is_available: boolean }
interface Product { id: string; category_id: string; name: string; description: string | null;
  price: number; image_path: string | null; is_available: boolean; sort_order: number; toppings: Topping[] }
interface ComboItem { product_id: string; product_name: string; quantity: number }
interface Combo { id: string; category_id: string | null; name: string; price: number;
  image_path: string | null; sort_order: number; is_available: boolean; items: ComboItem[] }
interface Category { id: string; name: string; sort_order: number }
🚨 NO slug, NO base_price, NO image_url, NO price_delta fields — they don't exist in DB

### Step 2: fe/src/lib/utils.ts
- formatVND(amount: number): string — Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND'})
- formatDateTime(date: string): string — output: "14:30 · 09/04/2026"
- cn(...classes: string[]): string — clsx + tailwind-merge

### Step 3: fe/src/store/cart.ts
Zustand CartStore:
- State: items: CartItem[], tableId: string | null
- Actions: addItem (same product+toppings combo → increment qty, not duplicate), 
  removeItem, updateQty, clearCart, setTableId
- Computed: total (sum unit_price × qty), itemCount (sum quantities)
CartItem: { id, productId, name, unitPrice, quantity, toppings: snapshot, note }
🚨 toppings are SNAPSHOTS at time of add — never reference live price

### Step 4: Menu components in fe/src/components/menu/
Build per PROMPT_menu_page.md spec:
- CategoryTabs.tsx — sticky, horizontal scroll, scroll-spy with IntersectionObserver
- ProductCard.tsx — image, formatVND(price) in orange, "+Thêm" button, "Hết" overlay if unavailable
- ToppingModal.tsx — checkbox list, footer shows total = product.price + sum(toppings.price) × qty
- ComboModal.tsx — combo items list, qty control, "Chọn Combo" button
- CartDrawer.tsx — slide-in, item list with qty stepper, total, "Thanh toán" → /checkout

### Step 5: fe/src/app/(shop)/menu/page.tsx
Use TanStack Query (useQuery) — never useState for API data:
- GET /api/v1/categories → Category[]
- GET /api/v1/products?is_available=true → Product[]
- GET /api/v1/combos?is_available=true → Combo[]
Show Skeleton loading state while fetching.

Note: fe/app/table/[tableId]/page.tsx is BLOCKED — do NOT implement it yet (Issue #7).

## Definition of Done
- [ ] Product TypeScript types have NO slug, base_price, image_url fields
- [ ] addItem with same product+toppings → qty incremented, not duplicated
- [ ] Toppings saved as price snapshot in CartItem (not live reference)
- [ ] CategoryTabs scroll-spy highlights correct tab when scrolling
- [ ] Unavailable products show "HẾT HÀNG" overlay, not clickable
- [ ] formatVND formats prices correctly (e.g. 45.000 ₫)
- [ ] All images built as STORAGE_BASE_URL + image_path (never raw image_path as URL)
- [ ] No color hex in code — Tailwind classes only
- [ ] npx tsc --noEmit passes
```
