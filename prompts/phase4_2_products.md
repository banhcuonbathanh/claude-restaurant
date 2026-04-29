# Phase 4.2 — Products Backend
> Dependency: Task 4.1 auth middleware working ✅

## Paste These Docs

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §3 §8 (RBAC, Redis cache keys)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`
- [ ] `fe/spec/Spec_2_Products_API_v2_CORRECTED.docx`
- [ ] `Task/Task 1 data base/001_auth_sql_v1.2.docx` (002_products + 004_combos)
- [ ] `Task/BanhCuon_DB_SCHEMA_SUMMARY.md`
- [ ] `contract/API_CONTRACT_v1.1.docx` §3

---

## Prompt

```
You are the BE Dev for the BanhCuon system.

I have pasted CLAUDE.md, MASTER §3+§8, ERROR_CONTRACT, Spec_2_Products, 
002_products.sql, 004_combos.sql, DB_SCHEMA_SUMMARY, and API_CONTRACT §3 above.

## Task: Build products backend (Task 4.2)

### Step 1: be/internal/repository/product_repo.go
Wrap all sqlc queries for categories, products, toppings, product_toppings, combos, combo_items.

### Step 2: be/internal/service/product_service.go
Redis cache pattern for every list/get:
1. Build cache key: products:list:{filter} or products:{id}
2. GET from Redis → if hit, return cached JSON
3. If miss: query via repo
4. SET Redis TTL 5min
5. Invalidate on every POST/PATCH/DELETE

Methods: ListCategories, ListProducts, GetProductByID, CreateProduct, UpdateProduct,
SoftDeleteProduct, ToggleAvailability, ListToppings, CreateTopping, UpdateTopping,
SoftDeleteTopping, AttachTopping, DetachTopping, ListCombos, GetComboByID,
CreateCombo, UpdateCombo, SoftDeleteCombo.

### Step 3: be/internal/handler/product_handler.go
Wire all endpoints per API_CONTRACT §3. Role guards:
- GET (list/detail): no auth required (public)
- POST/PATCH/DELETE: RequireRole(4) = Manager+
- PATCH /:id/availability: RequireRole(4)

## Critical Rules
🚨 Field names — verify generated sqlc code uses:
   price (NOT base_price), image_path (NOT image_url)
   No slug field exists in any migration

## Definition of Done
- [ ] GET /products returns toppings with price (NOT price_delta)
- [ ] GET /combos includes category_id and sort_order
- [ ] Soft delete sets deleted_at — product stays in DB
- [ ] is_available=false hides from public GET, visible to Manager GET
- [ ] Redis cache invalidated on every POST/PATCH/DELETE
- [ ] All IDs in response are UUID strings (not integers)
- [ ] image_path returns relative path (object_path), NOT full URL
- [ ] Manager CRUD works; Chef/Cashier/Customer get 403
- [ ] go build ./... passes
```
