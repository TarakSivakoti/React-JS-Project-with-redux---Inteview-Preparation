# Advanced Redux Patterns for Interviews

## 🎯 Pattern 1: Conditional Thunk Execution

**Interview Scenario:** "How do you prevent unnecessary API calls?"

```typescript
// ❌ BAD - Always fetches
dispatch(fetchPosts())

// ✅ GOOD - Check state first
const state = getState()
if (state.posts.items.length === 0 && state.posts.status === 'idle') {
  dispatch(fetchPosts())
}

// ✅ BETTER - Inside thunk
export const fetchPostsIfNeeded = createAsyncThunk(
  'posts/fetchIfNeeded',
  async (_, { getState, rejectWithValue }) => {
    const state = getState()
    if (state.posts.items.length > 0) {
      return state.posts.items  // Skip fetch
    }
    // Fetch if empty
    return fetchAPI()
  }
)
```

**Interview Point:** Demonstrates understanding of:
- Store subscriptions and performance
- Preventing redundant network requests
- Conditional logic in thunks

---

## 🎯 Pattern 2: Error Boundaries with Middleware

```typescript
export const errorBoundaryMiddleware: Middleware =
  (store) => (next) => (action) => {
    try {
      return next(action)
    } catch (error) {
      // Dispatch error action to show in UI
      store.dispatch({
        type: 'ui/showError',
        payload: error.message,
      })
      // Or send to error tracking service
      Sentry.captureException(error)
      throw error
    }
  }
```

**Interview Point:**
- Middleware can act as error boundary
- Centralized error handling
- Separation between UI and error logic

---

## 🎯 Pattern 3: Middleware for Authentication

```typescript
export const authMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    const { auth } = store.getState()
    
    // Check if token expired
    if (auth.token && isTokenExpired(auth.token)) {
      store.dispatch(logoutUser())
      return
    }
    
    // Allow action to proceed
    return next(action)
  }
```

**Common Interview Question:**
"How would you handle token refresh?"

```typescript
export const apiMiddleware: Middleware = (store) => (next) => async (action) => {
  if (action.type.endsWith('/pending')) {
    const { auth } = store.getState()
    
    if (isTokenExpired(auth.token)) {
      try {
        const newToken = await refreshToken(auth.refreshToken)
        store.dispatch(setToken(newToken))
      } catch {
        store.dispatch(logoutUser())
      }
    }
  }
  
  return next(action)
}
```

---

## 🎯 Pattern 4: Entity Adapter for Normalization

**Problem:** Storing arrays of objects makes updates difficult

```typescript
// ❌ WITHOUT Entity Adapter
const initialState = {
  posts: [
    { id: 1, title: 'Post 1', content: '...' },
    { id: 2, title: 'Post 2', content: '...' },
  ]
}

// Hard to update one post without spreading
state.posts = state.posts.map(p => 
  p.id === 1 ? { ...p, title: 'New Title' } : p
)

// ✅ WITH Entity Adapter
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

const postsAdapter = createEntityAdapter<Post>({
  selectId: (post) => post.id,
  sortComparer: (a, b) => b.id - a.id,
})

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState(),
  reducers: {
    updatePost: postsAdapter.updateOne,
    addPosts: postsAdapter.addMany,
    removePost: postsAdapter.removeOne,
  },
})

// Provides: selectAll, selectById, selectTotal, selectIds
export const { selectAll, selectById } = postsAdapter.getSelectors(
  (state: RootState) => state.posts
)
```

**Interview Point:**
- Normalized state prevents duplication
- Entity adapter simplifies CRUD operations
- Performance: O(1) lookups instead of O(n) array searches

---

## 🎯 Pattern 5: Async Thunk with Progress Tracking

```typescript
export const uploadFile = createAsyncThunk<
  UploadResult,
  File,
  { rejectValue: ErrorPayload }
>(
  'upload/file',
  async (file, { dispatch, rejectWithValue }) => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await axios.post(
        '/api/upload',
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            // Dispatch progress update
            dispatch(setUploadProgress(percent))
          },
        }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data)
    }
  }
)
```

**Interview Point:**
- Thunks can dispatch other actions
- Real-world progress tracking example
- Error handling with typed rejection

---

## 🎯 Pattern 6: Reselect for Memoized Selectors

```typescript
import { createSelector } from '@reduxjs/toolkit'

// Without memoization - recalculates every render
export const selectExpensivePosts = (state: RootState) => {
  return state.posts.items.filter(p => p.views > 100)
}

// ✅ WITH memoization - only recalculates if posts.items changed
export const selectExpensivePosts = createSelector(
  (state: RootState) => state.posts.items,
  (items) => items.filter(p => p.views > 100)
)

// Multiple inputs
export const selectUserPosts = createSelector(
  (state: RootState) => state.auth.user?.id,
  (state: RootState) => state.posts.items,
  (userId, items) => items.filter(p => p.userId === userId)
)
```

**Performance Impact:**
- Without memoization: Component re-renders on ANY state change
- With memoization: Only re-renders if dependencies changed

**Interview Question:**
"How would you optimize a component that filters 1000 posts?"

Answer: Use `createSelector` to memoize the filtered list.

---

## 🎯 Pattern 7: Immer Deep Dive

```typescript
// ✅ Immer allows "mutating" syntax
const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [], likes: {} },
  reducers: {
    // Looks like mutation, but Immer handles immutability
    addLike(state, action: PayloadAction<string>) {
      state.likes[action.payload] = (state.likes[action.payload] ?? 0) + 1
    },
    
    // Complex nested update - still clean
    updatePostComment(
      state,
      action: PayloadAction<{ postId: number; commentId: number; text: string }>
    ) {
      const post = state.items.find(p => p.id === action.payload.postId)
      if (post) {
        const comment = post.comments.find(
          c => c.id === action.payload.commentId
        )
        if (comment) {
          comment.text = action.payload.text  // ← Looks like mutation!
        }
      }
    },
  },
})

// Under the hood, Immer:
// 1. Creates a draft object
// 2. Records mutations
// 3. Produces new immutable state
// 4. Original state untouched
```

**Interview Point:**
- Immer prevents accidental mutations
- Makes Redux code more readable
- Only RTK uses Immer (not vanilla Redux)

---

## 🎯 Pattern 8: Middleware for Request Cancellation

```typescript
let abortController: AbortController | null = null

export const searchPosts = createAsyncThunk<
  Post[],
  string,
  { rejectValue: ErrorPayload }
>(
  'posts/search',
  async (query, { signal }) => {
    // Cancel previous request if new one starts
    if (abortController) {
      abortController.abort()
    }
    
    abortController = new AbortController()
    
    try {
      const response = await fetch(
        `/api/search?q=${query}`,
        { signal: abortController.signal }
      )
      return response.json()
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled')
        return []
      }
      throw error
    }
  }
)
```

**Interview Point:**
- Prevents memory leaks from pending requests
- Race condition handling
- Better UX for typeahead search

---

## 🎯 Pattern 9: Redux DevTools Time-Travel Debugging

```typescript
// In production, enable Redux DevTools browser extension
export const store = configureStore({
  reducer: { /* ... */ },
  devTools: process.env.NODE_ENV !== 'production',
})

// DevTools powers:
// 1. Time-travel debugging: Click actions to jump to any state
// 2. Action replay: Modify action and replay
// 3. Dispatch history: See all dispatched actions
// 4. State diff: See what changed
// 5. Action type filtering
```

**Interview Power Move:**
"I use Redux DevTools to time-travel through actions to debug state changes"

---

## 🎯 Pattern 10: Thunk Chaining (Advanced)

```typescript
export const loginAndFetchProfile = createAsyncThunk<
  { user: User; profile: UserProfile },
  LoginCredentials
>(
  'auth/loginAndFetchProfile',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      // First thunk
      const loginResult = await dispatch(loginUser(credentials))
      
      if (loginUser.fulfilled.match(loginResult)) {
        // Second thunk - chain after login succeeds
        const profileResult = await dispatch(fetchUserProfile())
        
        if (fetchUserProfile.fulfilled.match(profileResult)) {
          return {
            user: loginResult.payload.user,
            profile: profileResult.payload,
          }
        }
      }
      
      return rejectWithValue('Failed to login or fetch profile')
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)
```

**Interview Point:**
- Demonstrates thunk dependencies
- Conditional logic based on previous results
- Complex async workflows

---

## 🎯 Pattern 11: Adapter for Loading States

```typescript
interface LoadingState {
  idle: boolean
  loading: boolean
  succeeded: boolean
  failed: boolean
}

const getLoadingAdapter = (status: 'idle' | 'loading' | 'succeeded' | 'failed') => ({
  idle: status === 'idle',
  loading: status === 'loading',
  succeeded: status === 'succeeded',
  failed: status === 'failed',
})

// Usage
const { idle, loading, succeeded, failed } = getLoadingAdapter(status)

// Component
{loading && <Skeleton />}
{succeeded && <Posts />}
{failed && <ErrorMessage />}
```

**Interview Point:**
- Clean component logic
- Prevents boolean prop drilling
- Explicit state representation

---

## 🎯 Pattern 12: Preventing State Leaks in Tests

```typescript
// ❌ BAD - State persists between tests
describe('Counter', () => {
  test('increments', () => {
    store.dispatch(increment())
    expect(store.getState().counter.value).toBe(1)
  })
  
  test('decrements from 1', () => {
    // State is still 1 from previous test!
    store.dispatch(decrement())
    expect(store.getState().counter.value).toBe(0)
  })
})

// ✅ GOOD - Fresh store per test
describe('Counter', () => {
  let store: typeof configureStore
  
  beforeEach(() => {
    store = configureStore({ reducer: { /* ... */ } })
  })
  
  test('increments', () => {
    store.dispatch(increment())
    expect(store.getState().counter.value).toBe(1)
  })
})
```

---

## Interview Checklist

- [ ] Explain middleware chain order
- [ ] Demonstrate async thunk with getState()
- [ ] Show normalization with Entity Adapter
- [ ] Mention memoization with Reselect
- [ ] Explain Immer's immutability guarantee
- [ ] Discuss error handling strategies
- [ ] Explain DevTools time-travel debugging
- [ ] Show conditional thunk execution
- [ ] Discuss when to use Context vs Redux
- [ ] Explain RTK Query for data fetching

---

**Master these patterns → Ace the Redux interview! 🚀**
