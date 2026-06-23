# Redux Interview Q&A Cheat Sheet

## Easy Questions

### Q1: What is Redux?
**A:** Redux is a predictable state management library for JavaScript. It centralizes application state in a single store, making state changes traceable and easier to debug.

**Key Points:**
- Single source of truth (store)
- Actions describe what happened
- Reducers specify how state changes
- Predictable state updates

---

### Q2: What are the three core principles of Redux?
**A:**
1. **Single Source of Truth** - One store holds all state
2. **State is Read-Only** - Only way to change state is dispatch actions
3. **Changes are Made with Pure Functions** - Reducers must be pure (same input = same output)

---

### Q3: What's the difference between Redux and Context API?
**A:**

| Feature | Redux | Context API |
|---------|-------|-------------|
| **Learning Curve** | Steeper | Easier |
| **Performance** | Better (opt-in subscribes) | Causes full re-render |
| **DevTools** | Excellent time-travel debugging | None |
| **Best For** | Large, complex apps | Simple state |
| **Middleware** | Built-in | Not available |
| **Boilerplate** | More (actions, reducers) | Less |

**When to use Redux:**
- Large app with complex state
- Multiple features sharing state
- Time-travel debugging needed
- Team already knows Redux

**When to use Context:**
- Simple theme/user state
- Small to medium app
- Avoid extra dependencies

---

### Q4: What is an action?
**A:** An action is a plain JavaScript object describing what happened. It must have a `type` property.

```typescript
// Basic action
{ type: 'INCREMENT' }

// Action with payload
{ type: 'INCREMENT_BY', payload: 5 }

// Action with metadata
{ type: 'FETCH_POSTS', payload: 'tech', meta: { timestamp: 1234567 } }
```

---

### Q5: What is a reducer?
**A:** A pure function that takes current state and an action, returning new state.

```typescript
function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
```

**Rules:**
- Must be pure (no API calls, mutations)
- No side effects
- Same input must produce same output
- Reducers must handle undefined state (return initial state)

---

### Q6: What is a store?
**A:** The store holds the entire state tree. It has methods:
- `getState()` - Get current state
- `dispatch(action)` - Trigger state change
- `subscribe(listener)` - Listen to state changes
- `replaceReducer(nextReducer)` - Hot reload

```typescript
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

store.getState()           // { counter: 0 }
store.dispatch({ type: 'INCREMENT' })
store.subscribe(() => console.log(store.getState()))
```

---

### Q7: What is a selector?
**A:** A function that extracts a piece of state for a component. Selectors:
- Decouple components from state shape
- Can memoize expensive computations
- Make state shape refactoring easier

```typescript
// Co-located with reducer
export const selectCount = (state: RootState) => state.counter.value

// Usage in component
const count = useAppSelector(selectCount)
```

---

## Intermediate Questions

### Q8: What is middleware?
**A:** Middleware intercepts actions between dispatch and reducer. It's a function: `(store) => (next) => (action) => result`

```typescript
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('Before:', store.getState())
  const result = next(action)
  console.log('After:', store.getState())
  return result
}

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware),
})
```

**Common middleware uses:**
- Logging (debugging)
- Error tracking (Sentry)
- Analytics
- API calls (redux-thunk)
- Authentication checks

---

### Q9: What is Redux Thunk?
**A:** Middleware that lets you dispatch functions (thunks) instead of just objects. Used for async operations.

```typescript
// ❌ Without thunk - Can't do this
dispatch(() => {
  fetch('/api/posts').then(data => dispatch(setPosts(data)))
})

// ✅ With redux-thunk middleware
const fetchPosts = () => (dispatch) => {
  dispatch({ type: 'FETCH_START' })
  fetch('/api/posts')
    .then(data => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
    .catch(err => dispatch({ type: 'FETCH_ERROR', payload: err }))
}

dispatch(fetchPosts())
```

---

### Q10: What is Redux Toolkit (RTK)?
**A:** Official Redux library that makes Redux easier with:
- `configureStore()` - Pre-configured store
- `createSlice()` - Combines reducer + action creators
- `createAsyncThunk()` - Async actions with lifecycle
- Immer integration - "Mutate" state immutably
- Built-in DevTools support

```typescript
const counterSlice = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
  },
})

export const { increment } = counterSlice.actions
export default counterSlice.reducer
```

---

### Q11: What is createSlice?
**A:** Utility that bundles initial state, reducer, and action creators. Automatically generates action types.

```typescript
const slice = createSlice({
  name: 'posts',
  initialState: [],
  reducers: {
    addPost: (state, action) => {
      state.push(action.payload)  // Looks like mutation!
    },
    removePost: (state, action) => {
      return state.filter(p => p.id !== action.payload)
    },
  },
})

// Auto-generated:
slice.actions.addPost    // Action creator
slice.actions.removePost // Action creator
slice.reducer            // Reducer function

// Action types auto-generated: 'posts/addPost', 'posts/removePost'
```

**Benefits:**
- Less boilerplate
- Type-safe by default
- Immer-powered "mutations"
- Co-located reducer + actions

---

### Q12: What is createAsyncThunk?
**A:** Creates an async thunk with automatic lifecycle actions (pending, fulfilled, rejected).

```typescript
export const fetchPosts = createAsyncThunk<
  Post[],           // Return type
  void,             // Argument type
  { rejectValue: ErrorPayload }  // ThunkAPI config
>(
  'posts/fetch',    // Action type prefix
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/posts')
      return res.json()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// Auto-generates:
// - fetchPosts.pending   → type: 'posts/fetch/pending'
// - fetchPosts.fulfilled → type: 'posts/fetch/fulfilled'
// - fetchPosts.rejected  → type: 'posts/fetch/rejected'

// Handle in extraReducers:
extraReducers: (builder) => {
  builder
    .addCase(fetchPosts.pending, (state) => {
      state.status = 'loading'
    })
    .addCase(fetchPosts.fulfilled, (state, action) => {
      state.items = action.payload
      state.status = 'succeeded'
    })
    .addCase(fetchPosts.rejected, (state, action) => {
      state.error = action.payload
      state.status = 'failed'
    })
}
```

---

### Q13: What's the difference between reducers and extraReducers?
**A:**
- **reducers**: Handle synchronous actions created by the slice
- **extraReducers**: Handle external actions (thunks, other slices)

```typescript
createSlice({
  reducers: {
    // ← Slice's own actions
    synchronousAction: (state, action) => {
      state.value = action.payload
    },
  },
  extraReducers: (builder) => {
    // ← Other slices' or thunks' actions
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.items = action.payload
    })
  },
})
```

---

### Q14: How do you prevent unnecessary re-renders in Redux?
**A:** Use precise selectors that return only what the component needs:

```typescript
// ❌ BAD - Returns entire state, re-renders on ANY change
const state = useSelector(state => state)

// ✅ GOOD - Returns only counter, re-renders only if counter changes
const count = useSelector(state => state.counter.value)

// ✅ BETTER - Memoized selector for derived state
export const selectExpensiveComputation = createSelector(
  state => state.items,
  state => state.filter,
  (items, filter) => items.filter(i => i.type === filter)
)
```

---

### Q15: What is Immer and how does Redux Toolkit use it?
**A:** Immer is a library that lets you write immutable updates using "mutating" syntax.

```typescript
// Without Immer (ugly spread syntax)
return {
  ...state,
  user: {
    ...state.user,
    address: {
      ...state.user.address,
      zip: newZip,
    },
  },
}

// With Immer (inside Redux Toolkit reducers)
state.user.address.zip = newZip  // Looks like mutation!
```

**How it works:**
1. Creates a draft object
2. Records mutations
3. Produces immutable state
4. Original state untouched

---

## Advanced Questions

### Q16: What is getState() in a thunk and when would you use it?
**A:** `getState()` reads current Redux state inside a thunk. Use it for conditional logic:

```typescript
export const fetchPostsIfNeeded = createAsyncThunk(
  'posts/fetchIfNeeded',
  async (_, { getState, rejectWithValue }) => {
    const state = getState()
    const { items, status } = state.posts
    
    // Don't fetch if already loading or already have data
    if (status === 'loading' || items.length > 0) {
      return items
    }
    
    // Fetch only if needed
    try {
      const res = await fetch('/api/posts')
      return res.json()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)
```

---

### Q17: What is normalization and why does it matter?
**A:** Storing data in a flat structure instead of nested, reducing duplication and simplifying updates.

```typescript
// ❌ UNNORMALIZED - Hard to update, duplicated data
{
  posts: [
    {
      id: 1,
      title: 'Post 1',
      author: { id: 1, name: 'John', email: 'john@example.com' },
    },
  ],
}

// ✅ NORMALIZED - Easy to update, no duplication
{
  posts: { 1: { id: 1, title: 'Post 1', authorId: 1 } },
  authors: { 1: { id: 1, name: 'John', email: 'john@example.com' } },
}
```

**Benefits:**
- Simpler updates (no nested spreading)
- Prevents duplication
- Faster lookups (O(1) vs O(n))

---

### Q18: How would you handle token refresh with Redux?
**A:** Use middleware to intercept failed requests and refresh token:

```typescript
export const tokenRefreshMiddleware: Middleware = (store) => (next) => async (action) => {
  if (action.type.includes('/rejected')) {
    const { auth } = store.getState()
    
    if (auth.error?.includes('Unauthorized')) {
      try {
        const newToken = await refreshToken(auth.refreshToken)
        store.dispatch(setToken(newToken))
        // Retry original action
        return next(action)
      } catch {
        store.dispatch(logoutUser())
      }
    }
  }
  
  return next(action)
}
```

---

### Q19: What's the difference between action and action creator?
**A:**
- **Action**: Plain object describing what happened
- **Action Creator**: Function that returns an action

```typescript
// Action (plain object)
const incrementAction = { type: 'INCREMENT' }

// Action creator (function)
const increment = () => ({ type: 'INCREMENT' })

// PayloadAction creator
const incrementByAmount = (amount: number) => ({
  type: 'INCREMENT',
  payload: amount,
})

// In RTK, action creators are auto-generated
const { increment, incrementByAmount } = counterSlice.actions
```

---

### Q20: How do you test Redux code?
**A:**

```typescript
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'

describe('Counter Slice', () => {
  it('should increment', () => {
    const store = configureStore({ reducer: { counter: counterReducer } })
    
    store.dispatch(increment())
    
    expect(store.getState().counter.value).toBe(1)
  })
  
  it('should handle async thunks', async () => {
    const store = configureStore({ reducer: { posts: postsReducer } })
    
    await store.dispatch(fetchPosts())
    
    const state = store.getState()
    expect(state.posts.status).toBe('succeeded')
    expect(state.posts.items.length).toBeGreaterThan(0)
  })
})
```

---

## Tips for Interview

### 🎯 Strong Opening
"Redux is a state management library that centralizes application state with predictable updates through actions and pure reducer functions."

### 🎯 Show Knowledge of RTK
"I use Redux Toolkit which dramatically reduces boilerplate and includes built-in Immer support for immutable updates."

### 🎯 Mention DevTools
"I use Redux DevTools for time-travel debugging to step through state changes and identify issues quickly."

### 🎯 Real-World Example
"I've implemented custom middleware for analytics tracking and error reporting in production apps."

### 🎯 Performance Considerations
"I use selectors and memoization to prevent unnecessary re-renders in large applications."

### 🎯 When to Challenge
"Context API is simpler for most apps, but Redux shines with complex state and multiple feature teams."

---

## Quick Reference: Redux Data Flow

```
1. User interaction (click, input, etc.)
       ↓
2. dispatch(action)
       ↓
3. Middleware chain
       ↓
4. Reducer processes action
       ↓
5. Store state updated
       ↓
6. Subscribers notified (useSelector)
       ↓
7. Component re-renders with new state
```

---

## Common Mistakes to Avoid

❌ **Mutating state in reducer**
```typescript
// WRONG
state.items.push(newItem)  // without Immer in RTK
state.value = 5           // in vanilla Redux
```

❌ **Using non-serializable values**
```typescript
// WRONG
{ type: 'SET_USER', payload: new User() }
{ type: 'SET_CALLBACK', payload: () => {} }
```

❌ **Side effects in reducer**
```typescript
// WRONG
const reducer = (state, action) => {
  fetch('/api')  // ← Reducer should be pure!
}
```

❌ **Selecting entire state**
```typescript
// WRONG
const state = useSelector(s => s)  // Re-renders on any state change
```

---

**Practice these Q&A → Crush your Redux interview! 💪**
