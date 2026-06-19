'use client'

/**
 * iOS 14 Safari compatibility polyfills (COMPAT-IOS14-1).
 *
 * Next.js 14 (SWC) transpiles SYNTAX down to Safari 12+, but it does NOT
 * polyfill missing RUNTIME built-ins. Safari 14.0–14.8 lacks the ES2022 set
 * (shipped natively in Safari 15.4), which crashes the app with
 * "Application error: a client-side exception has occurred".
 *
 * Each import below is the `core-js` polyfill for one ES2022 built-in. core-js
 * is FEATURE-DETECTED: it installs the polyfill only when the native method is
 * absent or broken, so iPad / iOS 15+ are never overridden. This module is
 * imported FIRST in app/layout.tsx so it runs before any application code.
 *
 * Scope is the ES2022 baseline (the real crash cause); add a line here if a new
 * Safari-14-unsupported built-in ever surfaces.
 */

// Object.hasOwn — Safari 15.4
import 'core-js/features/object/has-own'

// Array.prototype.at / String.prototype.at — Safari 15.4
import 'core-js/features/array/at'
import 'core-js/features/string/at'

// Array.prototype.findLast / findLastIndex — Safari 15.4
import 'core-js/features/array/find-last'
import 'core-js/features/array/find-last-index'

// structuredClone — Safari 15.4
import 'core-js/features/structured-clone'

// Error cause (`new Error(msg, { cause })`) — Safari 15
import 'core-js/features/error/constructor'

export {}
