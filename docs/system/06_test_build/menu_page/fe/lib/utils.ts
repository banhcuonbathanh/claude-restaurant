// P-SYSTEST reference build — formatVND per DESIGN_SYSTEM.md typography rules; not imported by the app.
export function formatVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} ₫`
}
