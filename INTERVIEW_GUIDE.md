# Redux Interview Prep Guide

## 📚 Project Overview

This is a **React 18 + TypeScript + Redux Toolkit** sample project demonstrating professional Redux patterns with custom middleware. Perfect for FrontEnd/React.js/AI developer interviews.

**Tech Stack:**
- React 18 with TypeScript
- Redux Toolkit (RTK)
- React-Redux Hooks
- Axios for HTTP requests
- Vite (fast build tool)
- Custom Middleware layer

---

## 🏗️ Project Architecture

```
src/
├── store.ts                    # Redux store configuration
├── hooks.ts                    # Typed useAppDispatch, useAppSelector
├── App.tsx                     # Root component with Provider
├── main.tsx                    # Entry point
├── features/                   # Feature slices
│   ├── counter/
│   │   ├── Counter.tsx        # UI Component
│   │   └── counterSlice.ts    # Synchronous actions
│   ├── auth/
│   │   ├── Auth.tsx           # Login component
│   │   └── authSlice.ts       # Async thunks + getState()
│   └── posts/
│       ├── Posts.tsx          # Posts list component
│       └── postsSlice.ts      # Async thunks + API calls
├── middleware/                 # Custom middleware
│   ├── loggerMiddleware.ts    # Logs all actions
│   ├── analyticsMiddleware.ts # Performance timing
│   └── crashReporterMiddleware.ts # Error handling
└── components/
    └── DevPanel.tsx           # Debug state viewer

```

---

## 🎯 Key Interview Concepts

### 1. **Redux Store Configuration** (`store.ts`)

```typescript
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    posts: postsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled'],
      },
    })
      .concat(loggerMiddleware)
      .concat(analyticsMiddleware)
      .concat(crashReporterMiddleware),
  devTools: import.meta.env.DEV,
})
```

**Interview Q&A:**
- **Q: What does `configureStore()` do?**
  - Calls `combineReducers()` internally
  - Includes `redux-thunk` middleware by default
  - Auto-enables Redux DevTools
  - Adds serialization checks

- **Q: How do custom middleware get added?**
  - Use the `middleware` callback
  - Call `getDefaultMiddleware()` to preserve default middleware (thunk, serialization checks)
  - Use `.concat()` to ADD middleware, not replace
  - Order matters: left-to-right execution chain

---

### 2. **Synchronous Actions** (`counterSlice.ts`)

```typescript
export const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0, step: 1, history: [] },
  reducers: {
    increment(state) {
      state.history.push(state.value)
      state.value += state.step
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload
    },
  },
})

export const { increment, incrementByAmount } = counterSlice.actions
export const selectCount = (state: RootState) => state.counter.value
```

**Interview Q&A:**
- **Q: What is Immer and how does it help?**
  - RTK uses Immer under the hood
  - Allows "mutating" syntax inside reducers (state.value += 1)
  - Automatically produces immutable updates
  - Prevents accidental mutations

- **Q: Why co-locate selectors with slices?**
  - Easier to maintain and refactor
  - Reduces coupling between components and state shape
  - Single source of truth for state accessors

---

### 3. **Async Actions with Thunks** (`postsSlice.ts`)

```typescript
export const fetchPosts = createAsyncThunk<Post[], void, { rejectValue: string }>(
  'posts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts')
      return response.data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [], status: 'idle', error: null },
  reducers: { /* sync */ },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})
```

**Interview Q&A:**
- **Q: How does `createAsyncThunk` handle async operations?**
  - Generates 3 lifecycle actions: `pending`, `fulfilled`, `rejected`
  - `rejectWithValue()` lets you return a typed error payload
  - Auto-dispatch pending before fetch, fulfilled/rejected after

- **Q: What's the difference between `reducers` and `extraReducers`?**
  - `reducers`: Handle synchronous actions created by the slice
  - `extraReducers`: Handle external actions (thunks, other slices)

- **Q: When would you use `createAsyncThunk` vs manual thunks?**
  - `createAsyncThunk`: Cleaner, type-safe, handles lifecycle
  - Manual thunks: More control, complex workflows

---

### 4. **Advanced Thunks with getState()** (`authSlice.ts`)

```typescript
export const loginUser = createAsyncThunk<
  { user: User; token: string },
  LoginCredentials,
  { state: RootState; rejectValue: string }
>(
  'auth/login',
  async (credentials, { getState, rejectWithValue }) => {
    const state = getState()  // ← Read current Redux state inside thunk
    
    // Simulated auth logic
    if (credentials.password !== 'password123') {
      return rejectWithValue('Invalid credentials')
    }
    
    // Simulate API call
    await new Promise((res) => setTimeout(res, 800))
    
    return { user: mockUser, token: mockToken }
  }
)
```

**Interview Q&A:**
- **Q: What is `thunkAPI.getState()` used for?**
  - Access current Redux state inside a thunk
  - Conditional logic based on state
  - Example: "Only fetch if not already loaded"

- **Q: What's the difference between `rejectWithValue` and throwing an error?**
  - `rejectWithValue`: Payload passed to rejected action (serializable)
  - Throwing: Uncaught errors (not recommended)

---

### 5. **Custom Middleware**

#### **Logger Middleware** (`loggerMiddleware.ts`)

```typescript
export const loggerMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    const prevState = store.getState()
    console.log('Previous State:', prevState)
    
    const result = next(action)  // ← Pass to next middleware/reducer
    
    const nextState = store.getState()
    console.log('Next State:', nextState)
    
    return result
  }
```

**Middleware Signature Explained:**
- `(store)` → Has `getState()` and `dispatch()`
- `(next)` → Calls the next middleware or reducer
- `(action)` → The dispatched action

**Q: What's the middleware chain execution order?**
```
dispatch(action)
  ↓
loggerMiddleware
  ↓
analyticsMiddleware
  ↓
crashReporterMiddleware
  ↓
redux-thunk (default)
  ↓
reducer
  ↓
store updated
```

#### **Analytics Middleware** (Performance Timing)

```typescript
export const analyticsMiddleware: Middleware<object, RootState> =
  (_store) => (next) => (action) => {
    const start = performance.now()
    const result = next(action)
    const duration = performance.now() - start
    
    if (duration > 50) {
      console.warn(`SLOW ACTION: ${action.type} took ${duration}ms`)
    }
    return result
  }
```

#### **Crash Reporter Middleware** (Error Handling)

```typescript
export const crashReporterMiddleware: Middleware<object, RootState> =
  (_store) => (next) => (action) => {
    try {
      return next(action)
    } catch (err) {
      console.error('Caught exception in reducer!', err)
      // In production: Sentry.captureException(err)
      throw err
    }
  }
```

**Interview Q&A:**
- **Q: How would you implement analytics tracking middleware?**
  - Intercept before/after reducer
  - Extract action type and timestamp
  - Send to analytics service

- **Q: Can middleware modify state directly?**
  - NO! Only reducers modify state
  - Middleware can dispatch new actions

- **Q: What's the difference between `next(action)` and `store.dispatch(action)`?**
  - `next()`: Pass to next middleware in chain
  - `dispatch()`: Start the entire chain from beginning (can cause infinite loops)

---

### 6. **Typed Hooks** (`hooks.ts`)

```typescript
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// Typed useDispatch - knows about async thunks
export const useAppDispatch = () => useDispatch<AppDispatch>()

// Typed useSelector - RootState shape is known
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector)
```

**Why this matters:**
- `useAppDispatch` knows `dispatch(loginUser(...))` returns a Promise
- `useAppSelector` auto-types the selector return value
- Better IDE autocomplete and type safety

**Interview Q&A:**
- **Q: What happens if you use plain `useDispatch` with a thunk?**
  - Works, but TypeScript doesn't know thunks are supported
  - Causes type errors when dispatching async actions

- **Q: How do selectors prevent unnecessary re-renders?**
  - If selector returns same reference, component doesn't re-render
  - Use `reselect` library for derived selectors (e.g., filtered lists)

---

### 7. **Component Integration** (`Counter.tsx`)

```typescript
const Counter: React.FC = () => {
  const dispatch = useAppDispatch()
  const count = useAppSelector(selectCount)
  const history = useAppSelector(selectHistory)
  
  return (
    <>
      <div>{count}</div>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </>
  )
}
```

**Interview Q&A:**
- **Q: Can you useSelector multiple times in a component?**
  - Yes, each call is independent
  - But consider performance: each creates a subscription

- **Q: What's the best practice for selectors?**
  - Always co-locate with slices
  - Use TypeScript types for payloads
  - Memoize derived selectors

---

## 🔍 Testing Scenarios

### **Test 1: Counter (Sync Actions)**
1. Click "+ Step (1)" button
2. Check browser console for middleware logs
3. View state in DevTools panel
4. Click "History" to see state changes

**Expected:** Counter increments, history records, middleware logs both prev/next state

### **Test 2: Auth (Thunk with getState)**
1. Username: `john` (pre-filled)
2. Password: `password123`
3. Click "Login"
4. Check console for thunk execution logs

**Expected:** After ~800ms, shows "Logged in as john" with role badge

### **Test 3: Posts (Async Thunk)**
1. Click "Fetch Posts"
2. Check status changes from `idle` → `loading` → `succeeded`
3. Click post to fetch individual post detail
4. Try search functionality

**Expected:** 10 posts loaded from JSONPlaceholder API, search filters posts

### **Test 4: Middleware Chain**
1. Open browser console
2. Click any button
3. Observe: `loggerMiddleware` logs prev/next state
4. Check: `analyticsMiddleware` measures action duration

**Expected:** Full middleware chain execution visible in console

---

## 💡 Interview Tips

### **What to Explain:**

1. **Redux Flow:**
   ```
   User Action → Dispatch → Middleware Chain → Reducer → State Update → Re-render
   ```

2. **Three Core Concepts:**
   - **Store**: Single source of truth
   - **Reducers**: Pure functions (same input = same output)
   - **Dispatching**: How to trigger state changes

3. **Redux Toolkit Benefits:**
   - Reduces boilerplate
   - Immer for immutable updates
   - Built-in DevTools support
   - Recommended by Redux creators

4. **Middleware Use Cases:**
   - Logging (debugging)
   - Analytics tracking
   - Error reporting
   - Authentication checks
   - API call orchestration

### **Common Questions:**

- **Q: How do you handle side effects in Redux?**
  A: Use middleware or redux-thunk (included in RTK)

- **Q: What's the difference between action and payload?**
  A: Action = entire object {type, payload}, Payload = data passed to reducer

- **Q: Should you store API responses in Redux?**
  A: Yes, for shared state. Use RTK Query for caching/refetching

- **Q: How do you prevent memory leaks with subscriptions?**
  A: React-Redux auto-unsubscribes when component unmounts

- **Q: What's normalization and why does it matter?**
  A: Flatten nested data to avoid duplication and update conflicts

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm build

# Preview production build
npm preview
```

Access: http://localhost:5173/

---

## 📖 Key Files to Study

| File | Purpose | Interview Focus |
|------|---------|-----------------|
| `store.ts` | Store config | Middleware, combineReducers |
| `features/*/Slice.ts` | State logic | createSlice, reducers, extraReducers |
| `features/*/Component.tsx` | UI binding | useSelector, useDispatch |
| `middleware/*.ts` | Middleware | Middleware pattern, side effects |
| `hooks.ts` | Typed hooks | Type safety, AppDispatch |

---

## 🎓 Advanced Topics to Research

1. **Normalized State Shape**
   - Why flatten nested data
   - Use entity adapters in RTK

2. **Reselect Library**
   - Memoized selectors
   - Derived/computed state

3. **RTK Query**
   - Data fetching & caching
   - Replaces Redux Thunk for APIs

4. **Immer Deep Dive**
   - How mutation detection works
   - Performance implications

5. **Redux DevTools**
   - Time-travel debugging
   - Action replay

---

## 📝 Notes for Interview

**Strong Points to Mention:**
- ✅ Middleware pattern for separation of concerns
- ✅ Type-safe Redux with TypeScript
- ✅ Redux Toolkit reduces boilerplate 70%
- ✅ Async thunks handle loading states cleanly
- ✅ Co-located selectors prevent tight coupling

**Potential Questions:**
- Explain each middleware and its purpose
- Walk through action dispatch lifecycle
- Discuss when to use Redux vs Context API
- Explain how getState() enables conditional logic

---

**Good luck with your interview! 🚀**
