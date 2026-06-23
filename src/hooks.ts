// ─────────────────────────────────────────────────────────────────────────────
// TYPED HOOKS
//
// INTERVIEW CONCEPT:
//   Instead of using plain `useDispatch` and `useSelector`, we create typed
//   wrappers so TypeScript automatically knows:
//     - useAppDispatch returns an AppDispatch that handles thunks
//     - useAppSelector knows the shape of RootState (no need to annotate)
//
//   This is the RTK recommended pattern.
// ─────────────────────────────────────────────────────────────────────────────

import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// Use throughout your app instead of plain `useDispatch`
export const useAppDispatch = () => useDispatch<AppDispatch>()

// Use throughout your app instead of plain `useSelector`
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector)
