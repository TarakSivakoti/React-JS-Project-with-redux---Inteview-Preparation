// ─────────────────────────────────────────────────────────────────────────────
// REDUX STORE CONFIGURATION
//
// INTERVIEW CONCEPT:
//   configureStore() from RTK:
//     1. Calls combineReducers() internally
//     2. Adds redux-thunk middleware by DEFAULT
//     3. Adds Redux DevTools Extension support automatically
//     4. Accepts a `middleware` callback to ADD or REPLACE middleware
//
//   getDefaultMiddleware() returns [thunk, immutabilityMiddleware, serializabilityMiddleware]
//   We CONCAT our custom middleware to preserve the defaults.
//   (Never use .concat() on plain arrays — use the builder pattern provided)
// ─────────────────────────────────────────────────────────────────────────────

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import counterReducer from './features/counter/counterSlice'
import postsReducer from './features/posts/postsSlice'
import authReducer from './features/auth/authSlice'
import { loggerMiddleware } from './middleware/loggerMiddleware'
import { crashReporterMiddleware } from './middleware/crashReporterMiddleware'
import { analyticsMiddleware } from './middleware/analyticsMiddleware'

export const rootReducer = combineReducers({
  counter: counterReducer,
  posts: postsReducer,
  auth: authReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializability check for non-serializable values if needed
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled'],
      },
    })
      .concat(loggerMiddleware)       // ← custom logger
      .concat(analyticsMiddleware)    // ← custom analytics/timing
      .concat(crashReporterMiddleware), // ← custom error boundary

  // devTools: only enable in development
  devTools: import.meta.env.DEV,
})

// AppDispatch is aware of thunks (async actions)
export type AppDispatch = typeof store.dispatch
