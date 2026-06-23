import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import {
  loginUser,
  logoutUser,
  clearAuthError,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError,
} from './authSlice'

const Auth: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const status = useAppSelector(selectAuthStatus)
  const error = useAppSelector(selectAuthError)

  const [username, setUsername] = useState('john')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (error) dispatch(clearAuthError())
    dispatch(loginUser({ username, password }))
  }

  const handleLogout = () => dispatch(logoutUser())

  return (
    <section className="card">
      <h2>Auth <span className="badge">Thunk + getState</span></h2>
      <p className="hint">
        <strong>Concept:</strong> thunkAPI.getState() reads current state inside a thunk.
        Simulated login — use <code>password123</code> as the password.
      </p>

      {isAuthenticated && user ? (
        <div className="user-info">
          <p>
            Logged in as <strong>{user.username}</strong>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
          </p>
          <p>{user.email}</p>
          <button className="danger" onClick={handleLogout} disabled={status === 'loading'}>
            Logout
          </button>
        </div>
      ) : (
        <div className="login-form">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password (hint: password123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {error && <div className="error-text">{error}</div>}
          <button onClick={handleLogin} disabled={status === 'loading'}>
            {status === 'loading' ? 'Logging in…' : 'Login'}
          </button>
        </div>
      )}
    </section>
  )
}

export default Auth
