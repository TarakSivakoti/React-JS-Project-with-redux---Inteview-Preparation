// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM MIDDLEWARE 2: Error / Crash Reporter Middleware
//
// INTERVIEW CONCEPT:
//   Wraps next(action) in try/catch so unhandled reducer errors are caught.
//   You can swap console.error for a real service like Sentry here.
// ─────────────────────────────────────────────────────────────────────────────

import { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export const crashReporterMiddleware: Middleware<object, RootState> =
  (_store) => (next) => (action) => {
    try {
      return next(action)
    } catch (err) {
      console.error('Caught an exception in reducer!', err)
      // In production → Sentry.captureException(err)
      throw err
    }
  }
