# Redux Interview Prep Project

> 🚀 A comprehensive React + TypeScript + Redux Toolkit sample project designed for **FrontEnd/React.js developer interviews**

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Features](#features)
- [What You'll Learn](#what-youll-learn)
- [Key Concepts](#key-concepts)
- [Testing the App](#testing-the-app)
- [Documentation](#documentation)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
http://localhost:5173/

# 4. Open DevTools to see middleware logging
F12 → Console tab
```

---

## 📦 Publish to GitHub

Use this flow to push the project to your personal repo:

```bash
# 1. Create a local repo if needed
git init

# 2. Add your personal remote
git remote add origin https://github.com/<your-username>/<your-repo>.git

# 3. Review and stage the project
git status
git add .

# 4. Commit the current state
git commit -m "Initial Redux interview prep project"

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

If you already have a remote configured, skip `git remote add origin` and just push to the existing remote.

---

## 🖼 UI Screenshots

Add a few screenshots to the repo after the app is running. A simple convention is:

- `docs/screenshots/home.png` - Landing view with the feature cards
- `docs/screenshots/counter.png` - Counter section after a few clicks
- `docs/screenshots/posts.png` - Posts list after loading data
- `docs/screenshots/devtools.png` - Store state panel opened at the bottom

Recommended capture order:

1. Open the app with `npm run dev`.
2. Capture the full page at the default landing state.
3. Trigger the counter, auth, and posts flows.
4. Capture the DevTools panel showing live Redux state.
5. Commit the screenshots along with the README update.

---

## 📁 Project Structure

```
redux-interview-prep/
├── src/
│   ├── store.ts                      # ⭐ Redux store configuration
│   ├── hooks.ts                      # ⭐ Typed useAppDispatch, useAppSelector
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Entry point
│   │
│   ├── features/                     # 🎯 Feature-based organization
│   │   ├── counter/
│   │   │   ├── Counter.tsx          # UI component (sync actions)
│   │   │   └── counterSlice.ts      # Slice: reducers + selectors
│   │   │
│   │   ├── auth/
│   │   │   ├── Auth.tsx             # UI component (thunk with getState)
│   │   │   └── authSlice.ts         # Slice: async login/logout
│   │   │
│   │   └── posts/
│   │       ├── Posts.tsx             # UI component (async thunk + search)
│   │       └── postsSlice.ts         # Slice: async CRUD operations
│   │
│   ├── middleware/                   # 🔧 Custom middleware
│   │   ├── loggerMiddleware.ts       # ← Logs all action/state changes
│   │   ├── analyticsMiddleware.ts    # ← Tracks slow actions
│   │   └── crashReporterMiddleware.ts# ← Catches reducer errors
│   │
│   ├── components/
│   │   └── DevPanel.tsx              # Debug store state viewer
│   │
│   ├── App.css                       # Component styles
│   └── index.css                     # Global styles
│
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── vite.config.ts                    # Vite bundler config
├── index.html                        # HTML entry
│
└── 📚 Documentation Files:
    ├── INTERVIEW_GUIDE.md            # ⭐ Detailed Redux concepts
    ├── ADVANCED_PATTERNS.md          # Advanced techniques
    ├── REDUX_QA.md                   # Q&A interview prep
    └── QUICK_REFERENCE.md            # Quick lookup guide
```

---

## ✨ Features

### 1. **Counter** - Synchronous Actions
- Demonstrates `createSlice` with simple reducers
- Shows how Immer makes immutable updates look mutable
- Illustrates action history tracking

### 2. **Auth** - Async Thunk with getState()
- Shows `createAsyncThunk` for login flow
- Demonstrates `thunkAPI.getState()` for conditional logic
- Simulates API call with error handling
- Displays user role-based badges

### 3. **Posts** - Complex Async Operations
- Fetches data from JSONPlaceholder API
- Implements search/filter functionality
- Shows loading states (idle → loading → succeeded/failed)
- Demonstrates async CRUD (Create, Read, Update, Delete)

### 4. **Middleware Chain**
- **Logger Middleware** - Logs prev/next state for every action
- **Analytics Middleware** - Measures action duration and warns on slow operations
- **Crash Reporter Middleware** - Catches and logs reducer errors

### 5. **DevTools Panel**
- Displays entire Redux store state in real-time
- Shows state after each action dispatch
- Useful for debugging complex state trees

---

## 🎯 What You'll Learn

### **Fundamentals**
✅ Redux store setup and configuration  
✅ Reducers and pure functions  
✅ Actions and action creators  
✅ Dispatching and state updates  

### **Redux Toolkit**
✅ `createSlice()` - Reduce boilerplate 70%  
✅ `createAsyncThunk()` - Handle async with lifecycle actions  
✅ `extraReducers()` - Handle external actions  
✅ `configureStore()` - Smart store configuration  

### **Advanced Patterns**
✅ Custom middleware architecture  
✅ Conditional thunk execution with `getState()`  
✅ Error handling strategies  
✅ Performance optimization with selectors  
✅ Immer for immutable updates  

### **Best Practices**
✅ Co-locate selectors with slices  
✅ Type-safe Redux with TypeScript  
✅ DevTools time-travel debugging  
✅ Testing Redux code  

---

## 🧠 Key Concepts

### **Redux Flow**
```
User Action
    ↓
dispatch(action)
    ↓
Middleware Chain
    ↓
Reducer (pure function)
    ↓
State Updated
    ↓
useSelector Triggers
    ↓
Component Re-renders
```

### **Middleware Chain** (in this project)
```
dispatch(action)
    ↓
loggerMiddleware (logs action)
    ↓
analyticsMiddleware (measures duration)
    ↓
crashReporterMiddleware (error handling)
    ↓
redux-thunk (included by default)
    ↓
reducer (updates state)
```

### **Three Core Principles**

1. **Single Source of Truth**
   - All state lives in one Redux store
   - Easy to debug and inspect

2. **State is Read-Only**
   - Can't mutate state directly
   - Must dispatch actions to change state

3. **Changes with Pure Functions**
   - Reducers are pure functions
   - Same input = Same output
   - No side effects allowed

---

## 🧪 Testing the App

### **Test 1: Counter (Sync Actions)**
```
1. Click "+ Step (1)" button
2. Counter increments from 0 to 1
3. Open DevTools Console
4. See loggerMiddleware output with prev/next state
5. Click "History" dropdown to see state changes
```

**Expected Output in Console:**
```
ACTION: counter/increment
  Prev State: { counter: { value: 0, step: 1, history: [] } }
  Next State: { counter: { value: 1, step: 1, history: [ 0 ] } }
```

---

### **Test 2: Auth (Thunk with getState)**
```
1. Username field shows "john" (pre-filled)
2. Enter password: password123
3. Click "Login"
4. Button shows "Logging in…" (loading state)
5. After ~800ms, displays "Logged in as john" with ROLE badge
6. Check Console for thunk execution logs
```

**Mock Credentials:**
- Username: `john` or `admin` or any username
- Password: `password123`
- Admin only if username is `admin`

---

### **Test 3: Posts (Async Thunk)**
```
1. Click "Fetch Posts" button
2. Status changes: idle → loading → succeeded
3. 10 posts appear from JSONPlaceholder API
4. Search box appears
5. Type to filter posts by title/body
6. Click a post to fetch individual post detail
```

**API Being Used:**
```
GET https://jsonplaceholder.typicode.com/posts?_limit=10
```

---

### **Test 4: Middleware Chain**
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click any button in the app
4. Observe middleware logs in sequence:
   - loggerMiddleware: "ACTION: ..."
   - loggerMiddleware: "Prev State: ..."
   - loggerMiddleware: "Next State: ..."
   - analyticsMiddleware: action duration
```

---

### **Test 5: DevTools Panel**
```
1. Scroll to bottom of page
2. Click "▶ Show Store State (DevTools)" button
3. See entire Redux state as JSON
4. Perform actions and watch state update in real-time
5. Note how state structure mirrors features/slice structure
```

---

## 📚 Documentation

### **For Beginners:** Start with `INTERVIEW_GUIDE.md`
- Redux fundamentals explained clearly
- Each middleware documented with "why"
- Concept-by-concept breakdown
- Interview Q&A for each feature

### **For Advanced:** Read `ADVANCED_PATTERNS.md`
- 12 advanced Redux patterns
- Real-world examples
- Performance optimization techniques
- Interview power moves

### **For Quick Lookup:** Use `REDUX_QA.md`
- 20 common interview questions
- Answers with code examples
- Easy/Intermediate/Advanced sections
- Interview tips and checklist

### **For Development:** Reference `QUICK_REFERENCE.md`
- Copy-paste code snippets
- Common Redux patterns
- TypeScript best practices
- Testing examples

---

## 💻 Key Files to Study

| File | Purpose | Why It Matters |
|------|---------|-----------------|
| `src/store.ts` | Redux store setup | Shows middleware configuration & store combination |
| `src/features/counter/counterSlice.ts` | Sync actions | Demonstrates createSlice & Immer |
| `src/features/auth/authSlice.ts` | Async thunk | Shows getState() & error handling |
| `src/features/posts/postsSlice.ts` | API integration | Real API calls with loading states |
| `src/middleware/loggerMiddleware.ts` | Middleware pattern | Core middleware concept |
| `src/hooks.ts` | Typed hooks | Type safety best practice |
| `src/App.tsx` | Provider setup | Redux integration with React |

---

## 🎓 Interview Talking Points

### **"Tell me about your Redux project"**

> "I built a React + TypeScript + Redux Toolkit project demonstrating professional patterns. It features three components:
> 
> 1. **Counter** - Synchronous actions using createSlice with Immer-powered immutable updates
> 
> 2. **Auth** - Async thunks with getState() for conditional login logic and simulated token storage
> 
> 3. **Posts** - Complex async operations with real API calls, search filtering, and loading state management
>
> The project includes a custom middleware chain that logs all actions, measures performance, and handles errors. I also use TypeScript for type-safe Redux with properly typed hooks and selectors."

---

### **"How does your middleware work?"**

> "I have three custom middleware in the chain:
>
> 1. **Logger** - Intercepts every action and logs prev/next state for debugging
> 2. **Analytics** - Measures how long each action takes and warns if > 50ms
> 3. **Crash Reporter** - Wraps the reducer in try/catch to handle errors
>
> Middleware signature is (store) => (next) => (action). The 'next' function passes to the next middleware. This gives me full control over when actions execute and lets me add cross-cutting concerns like logging and error tracking."

---

### **"Why Redux over Context API?"**

> "For this project, Redux is better because:
> - **DevTools** - Time-travel debugging is invaluable
> - **Middleware** - I can track actions and side effects systematically  
> - **Performance** - Redux only notifies components that selected data changed
> - **Scalability** - With Context, prop drilling becomes an issue at scale
> 
> However, for simple theme/auth state, Context is perfectly fine and has less boilerplate."

---

## 🚀 Commands

```bash
# Development
npm run dev          # Start Vite dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Utilities
npm fund            # Show funding info
```

---

## 🔗 Resources

**Official Documentation:**
- [Redux.js.org](https://redux.js.org)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [React-Redux Hooks](https://react-redux.js.org/api/hooks)

**In This Project:**
- `INTERVIEW_GUIDE.md` - Detailed concepts
- `ADVANCED_PATTERNS.md` - 12 advanced patterns
- `REDUX_QA.md` - Interview Q&A
- `QUICK_REFERENCE.md` - Code snippets

---

## 📊 Project Stats

- **Lines of Code:** ~500 (excluding styles)
- **TypeScript:** 100% typed
- **Components:** 4 feature components + 1 debug component
- **Middleware:** 3 custom middleware
- **Features:** Counter, Auth, Posts, DevTools
- **Patterns:** Sync/Async actions, thunks, selectors, middleware

---

## ✅ Interview Checklist

Use this to prepare:

- [ ] Understand Redux flow (action → middleware → reducer → state)
- [ ] Explain difference between actions and action creators
- [ ] Know when to use reducers vs extraReducers
- [ ] Understand createSlice and why it's better than vanilla Redux
- [ ] Explain async thunks and lifecycle actions
- [ ] Show getState() usage for conditional logic
- [ ] Demonstrate custom middleware pattern
- [ ] Discuss performance optimization (selectors, memoization)
- [ ] Explain Immer integration and why it matters
- [ ] Know Redux DevTools capabilities
- [ ] Compare Redux vs Context API
- [ ] Discuss error handling strategies
- [ ] Explain normalization and Entity Adapters
- [ ] Show testing examples
- [ ] Mention RTK Query for data fetching (next step)

---

## 🎯 Next Steps After Mastering This

1. **RTK Query** - Built-in data fetching & caching for Redux Toolkit
2. **Redux Persist** - Save Redux state to localStorage
3. **Redux Saga** - Alternative to thunks for complex side effects
4. **Immer Patterns** - Deep dive into immutable update patterns
5. **Performance Tuning** - Reselect, normalization, code splitting

---

## 🤝 Interview Tips

- **Explain while coding** - Walk through the code as you explain Redux
- **Discuss tradeoffs** - "Redux adds complexity but provides DevTools debugging"
- **Show the logs** - Open console and demonstrate middleware logging in action
- **Mention scalability** - "This pattern scales well as the app grows"
- **Discuss testing** - "I test reducers separately from components"
- **Be honest** - "I'd use Context for simple state, Redux for complex apps"

---

## 📝 License

This project is created for educational purposes and interview preparation.

---

## 🎓 Good Luck! 🚀

This project covers ~80% of what you'll be asked about Redux in interviews. Master these patterns and you'll be well-prepared.

**Happy coding! 💪**

---

**Questions or improvements? Check the documentation files for more details.**
