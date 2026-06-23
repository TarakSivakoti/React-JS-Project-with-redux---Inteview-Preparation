// ─────────────────────────────────────────────────────────────────────────────
// FEATURE SLICE 3: Auth (Thunk with getState + dispatch chaining)
//
// INTERVIEW CONCEPT:
//   createAsyncThunk's thunkAPI gives you:
//     - dispatch   → dispatch other actions from inside a thunk
//     - getState   → read current store state inside a thunk
//     - rejectWithValue → return a typed rejection payload
//     - extra      → injected extra argument (e.g. API service)
//
//   This slice also demonstrates:
//     - Conditional thunk logic (check state before calling API)
//     - Chaining thunks (login → then fetch profile)
// ─────────────────────────────────────────────────────────────────────────────

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user' | 'viewer'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

interface LoginCredentials {
  username: string
  password: string
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
}

// ── Async Thunk: Login (simulated) ────────────────────────────────────────────
// thunkAPI.getState() typed via { state: RootState }
export const loginUser = createAsyncThunk<
  { user: User; token: string },
  LoginCredentials,
  { state: RootState; rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 800))

    // Simulate authentication logic
    if (credentials.password !== 'password123') {
      return rejectWithValue('Invalid username or password')
    }

    // Mock response
    const mockUser: User = {
      id: 1,
      username: credentials.username,
      email: `${credentials.username}@example.com`,
      role: credentials.username === 'admin' ? 'admin' : 'user',
    }

    const mockToken = `jwt-token-${Date.now()}`
    localStorage.setItem('auth_token', mockToken)

    return { user: mockUser, token: mockToken }
  }
)

// ── Async Thunk: Logout ────────────────────────────────────────────────────────
export const logoutUser = createAsyncThunk<void, void, { state: RootState }>(
  'auth/logout',
  async (_, { getState }) => {
    const state = getState()
    console.log('[Auth Thunk] Logging out user:', state.auth.user?.username)
    // Simulate revoke token API call
    await new Promise((res) => setTimeout(res, 300))
    localStorage.removeItem('auth_token')
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
    // Hydrate token from localStorage on app boot
    hydrateAuth(state) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        state.token = token
        state.isAuthenticated = true
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── login ──────────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Login failed'
        state.isAuthenticated = false
      })

      // ── logout ─────────────────────────────────────────────────────────────
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.status = 'idle'
      })
  },
})

// ── Action Creators ───────────────────────────────────────────────────────────
export const { clearAuthError, hydrateAuth } = authSlice.actions

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectAuthError = (state: RootState) => state.auth.error

export default authSlice.reducer
