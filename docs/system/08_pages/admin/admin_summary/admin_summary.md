# Admin Summary — `/admin/summary`

> **TL;DR:** ✅ implemented · manager+ · "Tổng kết nhà hàng" reports page with a range switcher
> (day/week/month): revenue KPI summary, top-selling dishes, staff performance, and a low-stock
> alert section with quick restock. Each section is its own query keyed by the selected range.

---

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ (admin shell: tab nav)                                           │
├──────────────────────────────────────────────────────────────────┤
│ Tổng kết nhà hàng              [Hôm nay][Tuần][Tháng] ← range    │
├──────────────────────────────────────────────────────────────────┤
│ A  ┌Doanh thu┐ ┌Số đơn┐ ┌TB/đơn┐ ┌Đơn huỷ┐   (KPI summary)       │
│    │ 4.250k  │ │  86  │ │ 49k  │ │   3   │                       │
├──────────────────────────────────────────────────────────────────┤
│ B  Món bán chạy                                                  │
│    1. Bánh cuốn thịt      ×120   ▓▓▓▓▓▓▓▓▓▓                      │
│    2. Canh mọc            ×95    ▓▓▓▓▓▓▓                         │
│    3. Combo Đầy Đặn       ×40    ▓▓▓                             │
├──────────────────────────────────────────────────────────────────┤
│ C  Hiệu suất nhân viên                                           │
│    Nhân viên     Đơn xử lý   Doanh thu                           │
│    chef01           45        2.100k                             │
│    cash02           41        2.150k                             │
├──────────────────────────────────────────────────────────────────┤
│ D  Cảnh báo tồn kho                                              │
│    ⚠ Mộc nhĩ  còn 0.3 kg     [Nhập thêm]                         │
│    ⚠ Tôm tươi còn 0 kg       [Nhập thêm]                         │
└──────────────────────────────────────────────────────────────────┘
```

## Zones

| Zone | Component | Data source |
|---|---|---|
| Range switcher | inline tabs in `admin/summary/page.tsx` | local `SummaryRange` state |
| A KPI summary | inline section | `['admin','summary', range]` query |
| B Top dishes | inline section ("Món bán chạy") | `['admin','top-dishes', range]` query |
| C Staff performance | inline section ("Hiệu suất nhân viên") | `['admin','staff-performance', range]` query |
| D Low stock | inline section ("Cảnh báo tồn kho") + restock form (RHF + Zod) | `['admin','low-stock']` query; restock invalidates `low-stock` + `ingredients` |

## Key Interactions

- Switch range → all range-keyed sections refetch.
- **Nhập thêm** on a low-stock row → quick stock-in (posts a movement, refreshes both the alert
  list and `/admin/ingredients` data).
- Each section has its own loading skeleton; `formatVND` for all money.

## Business Logic Used

- Revenue counts only completed payments → [../02_spec/BUSINESS_RULES.md §4 Payment Rules](../02_spec/BUSINESS_RULES.md#4-payment-rules)
- Cancelled orders excluded from revenue → [../02_spec/BUSINESS_RULES.md §3 Cancel Rules](../02_spec/BUSINESS_RULES.md#3-cancel-rules)
- Low-stock feeds the 🔮 PLANNED [/admin/storage](../admin_storage/admin_storage.md) page →
  [../07_business_logic/LOGIC_FE.md](../07_business_logic/LOGIC_FE.md) (admin queries)
