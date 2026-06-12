// P-SYSTEST reference build — mirrors fe/src/lib/storage-keys.ts; not imported by the app.
// ALL localStorage keys live here — no string literals in components (handbook rule 5).
export const STORAGE_KEYS = {
  COOKIE_CONSENT:    'cookie_consent_accepted',
  ORDER_CACHE:       'order_cache_',   // prefix — append orderId
  FAVOURITES:        'favourites',
  CUSTOMER_SETTINGS: 'customer-settings',
  CART_CONFIG:       'cart-config-v3',
} as const
