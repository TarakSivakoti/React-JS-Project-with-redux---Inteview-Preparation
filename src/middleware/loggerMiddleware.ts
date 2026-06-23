// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM MIDDLEWARE 1: Logger Middleware
//
// INTERVIEW CONCEPT:
//   Middleware sits between dispatching an action and the reducer receiving it.
//   Signature: (store) => (next) => (action) => { ... }
//   - store  : gives access to getState() and dispatch()
//   - next   : calls the next middleware (or the reducer if none left)
//   - action : the dispatched action object
// ─────────────────────────────────────────────────────────────────────────────

import { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export const loggerMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    const prevState = store.getState()
    console.group(`%c ACTION: ${String((action as { type: string }).type)}`, 'color: #4CAF50; font-weight: bold')
    console.log('%c Prev State:', 'color: #9E9E9E', prevState)
    console.log('%c Action:', 'color: #03A9F4', action)

    const result = next(action) // ← pass action to next middleware / reducer

    const nextState = store.getState()
    console.log('%c Next State:', 'color: #4CAF50', nextState)
    console.groupEnd()

    return result
  }
