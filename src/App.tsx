import React from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import Counter from './features/counter/Counter'
import Posts from './features/posts/Posts'
import Auth from './features/auth/Auth'
import DevPanel from './components/DevPanel'
import './App.css'

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW CONCEPT: <Provider store={store}>
//   Makes the Redux store available to ALL components in the tree via React
//   Context under the hood. Every useSelector/useDispatch call reaches this.
// ─────────────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="app">
        <header className="app-header">
          <h1>Redux Interview Prep</h1>
          <p>React 18 · TypeScript · Redux Toolkit · Middleware</p>
        </header>

        {/* ── Middleware Architecture Diagram ─────────────────────────────── */}
        <div className="architecture-box">
          <strong>Middleware chain (left → right):</strong>
          <code>
            dispatch(action)
            {' → '}loggerMiddleware
            {' → '}analyticsMiddleware
            {' → '}crashReporterMiddleware
            {' → '}redux-thunk (default)
            {' → '}reducer
          </code>
        </div>

        <main className="grid">
          <Counter />
          <Auth />
          <Posts />
        </main>

        <DevPanel />
      </div>
    </Provider>
  )
}

export default App
