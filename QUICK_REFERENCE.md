# Redux Quick Reference Guide

## 📦 Installation & Setup

```bash
npm install @reduxjs/toolkit react-redux axios
npm install -D @types/react-redux
```

---

## 🏗️ Basic Store Setup

```typescript
// store.ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './features/counter/counterSlice'
import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector } from 'react-redux'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch: () => AppDispatch = () => useDispatch()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

---

## 🧩 Creating a Slice (Synchronous)

```typescript
// features/counter/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0,
}

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // Synchronous action
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

// Selectors
export const selectCounter = (state: RootState) => state.counter.value

export default counterSlice.reducer
```

---

## ⚡ Creating Async Thunk

```typescript
// features/posts/postsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface Post {
  id: number
  title: string
  body: string
}

interface PostsState {
  items: Post[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: PostsState = {
  items: [],
  status: 'idle',
  error: null,
}

// Async thunk
export const fetchPosts = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string }
>(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/posts')
      return response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.message)
      }
      return rejectWithValue('Unknown error')
    }
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
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
        state.error = action.payload || 'Error'
      })
  },
})

export const selectPosts = (state: RootState) => state.posts.items
export const selectPostsStatus = (state: RootState) => state.posts.status

export default postsSlice.reducer
```

---

## 🎣 Using in Components

### **Synchronous Actions**
```typescript
import { useAppDispatch, useAppSelector } from '@/store'
import { increment, selectCounter } from '@/features/counter/counterSlice'

const Counter = () => {
  const dispatch = useAppDispatch()
  const count = useAppSelector(selectCounter)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>Increment</button>
    </div>
  )
}
```

### **Async Thunks**
```typescript
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchPosts, selectPosts, selectPostsStatus } from '@/features/posts/postsSlice'
import { useEffect } from 'react'

const PostsList = () => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectPosts)
  const status = useAppSelector(selectPostsStatus)
  
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPosts())
    }
  }, [dispatch, status])
  
  if (status === 'loading') return <div>Loading...</div>
  
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

---

## 🔧 Custom Middleware

```typescript
// middleware/loggingMiddleware.ts
import { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export const loggingMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    console.log('Dispatching:', action)
    const result = next(action)
    console.log('New State:', store.getState())
    return result
  }

// Add to store
export const store = configureStore({
  reducer: { /* ... */ },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggingMiddleware),
})
```

---

## 🎯 Memoized Selectors (Reselect)

```typescript
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

// Memoized selector - only recalculates if dependency changes
export const selectExpensivePosts = createSelector(
  (state: RootState) => state.posts.items,
  (posts) => posts.filter((p) => p.views > 100)
)

// Multiple inputs
export const selectUserPosts = createSelector(
  (state: RootState) => state.auth.userId,
  (state: RootState) => state.posts.items,
  (userId, posts) => posts.filter((p) => p.userId === userId)
)
```

---

## 🗄️ Entity Adapter (Normalization)

```typescript
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

interface Post {
  id: number
  title: string
}

// Create adapter
const postsAdapter = createEntityAdapter<Post>()

// Initial state from adapter
const initialState = postsAdapter.getInitialState()

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: postsAdapter.addOne,
    postUpdated: postsAdapter.updateOne,
    postRemoved: postsAdapter.removeOne,
    postsReceived: postsAdapter.setAll,
  },
})

// Selectors provided by adapter
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  selectTotal: selectTotalPosts,
} = postsAdapter.getSelectors((state: RootState) => state.posts)

export default postsSlice.reducer
```

---

## ✅ Testing Redux Code

```typescript
import { configureStore } from '@reduxjs/toolkit'
import counterReducer, { increment } from './counterSlice'
import { fetchPosts } from './postsSlice'

describe('Counter Slice', () => {
  // Test synchronous actions
  it('should increment counter', () => {
    const store = configureStore({
      reducer: { counter: counterReducer },
    })
    
    store.dispatch(increment())
    expect(store.getState().counter.value).toBe(1)
  })
  
  // Test async thunks
  it('should handle async thunk', async () => {
    const store = configureStore({
      reducer: { posts: postsReducer },
    })
    
    await store.dispatch(fetchPosts())
    
    const state = store.getState()
    expect(state.posts.status).toBe('succeeded')
  })
})
```

---

## 🚀 Common Patterns

### **Conditional Fetch (Prevent Duplicate Requests)**
```typescript
export const fetchPostsIfNeeded = createAsyncThunk(
  'posts/fetchIfNeeded',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (state.posts.items.length > 0) {
      return state.posts.items
    }
    
    try {
      const response = await axios.get('/api/posts')
      return response.data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)
```

### **Dispatch Chain (Dependent Thunks)**
```typescript
export const loginAndFetch = createAsyncThunk(
  'auth/loginAndFetch',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const loginResult = await dispatch(loginUser(credentials))
      if (loginUser.fulfilled.match(loginResult)) {
        const dataResult = await dispatch(fetchUserData())
        return dataResult.payload
      }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)
```

### **Error Handling**
```typescript
const slice = createSlice({
  name: 'auth',
  initialState: { error: null },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.rejected, (state, action) => {
      state.error = action.payload
    })
  },
})
```

---

## 📊 Redux DevTools

**Enable in store:**
```typescript
configureStore({
  reducer: { /* ... */ },
  devTools: process.env.NODE_ENV !== 'production',
})
```

**Use browser extension:**
1. Install "Redux DevTools" browser extension
2. Open DevTools (F12)
3. Look for "Redux" tab
4. See action history, state changes, time-travel debugging

---

## 🎓 TypeScript Best Practices

```typescript
// Infer types from store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Type async thunk properly
createAsyncThunk<
  ReturnType,      // What thunk returns
  ArgType,         // What thunk accepts
  {
    state: RootState
    rejectValue: ErrorType
  }
>

// Type PayloadAction
reducer: {
  updateUser: (state, action: PayloadAction<User>) => {
    state.user = action.payload
  },
}
```

---

## 🔍 Debugging Tips

```typescript
// Log state changes
const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat((store) => (next) => (action) => {
      console.log('ACTION:', action.type)
      console.log('STATE BEFORE:', store.getState())
      const result = next(action)
      console.log('STATE AFTER:', store.getState())
      return result
    }),
})

// Check if thunk succeeded
if (fetchPosts.fulfilled.match(action)) {
  // Action was fulfilled
}
```

---

## 📋 Checklist for Redux Implementation

- [ ] Create store with configureStore()
- [ ] Define RootState and AppDispatch types
- [ ] Create typed hooks (useAppDispatch, useAppSelector)
- [ ] Create feature slices with createSlice()
- [ ] Co-locate selectors with slices
- [ ] Create async thunks with createAsyncThunk()
- [ ] Add custom middleware if needed
- [ ] Add error handling in extraReducers
- [ ] Test reducers and thunks
- [ ] Enable Redux DevTools
- [ ] Memoize expensive selectors
- [ ] Document action types

---

**Keep this guide handy during development! 📚**
