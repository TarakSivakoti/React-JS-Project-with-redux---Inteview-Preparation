// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM MIDDLEWARE 3: Analytics / Timing Middleware
//
// INTERVIEW CONCEPT:
//   Measures how long each reducer takes and logs slow operations.
//   Shows that middleware can intercept BEFORE and AFTER an action completes.
// ─────────────────────────────────────────────────────────────────────────────

import { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'

const SLOW_THRESHOLD_MS = 50

export const analyticsMiddleware: Middleware<object, RootState> =
  (_store) => (next) => (action) => {
    const start = performance.now()
    const result = next(action)
    const duration = performance.now() - start

    if (duration > SLOW_THRESHOLD_MS) {
      console.warn(
        `[Analytics] SLOW ACTION — ${String((action as { type: string }).type)} took ${duration.toFixed(2)}ms`
      )
    }

    // Simulate sending to an analytics service
    // analyticsService.track((action as { type: string }).type, { duration })

    return result
  }
