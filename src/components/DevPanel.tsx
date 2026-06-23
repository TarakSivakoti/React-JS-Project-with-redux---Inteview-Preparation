// ─────────────────────────────────────────────────────────────────────────────
// REDUX DEVTOOLS DEBUG PANEL
//
// INTERVIEW CONCEPT:
//   Shows how to access the entire store state in the UI for debugging.
//   In real projects use Redux DevTools browser extension instead.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react'
import { useAppSelector } from '../hooks'

const DevPanel: React.FC = () => {
  const state = useAppSelector((s) => s)
  const [open, setOpen] = useState(false)
  
  // Memoize the stringified state to prevent unnecessary rerenders
  const stateString = useMemo(() => JSON.stringify(state, null, 2), [state])

  return (
    <div className="dev-panel">
      <button className="dev-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '▼ Hide' : '▶ Show'} Store State (DevTools)
      </button>
      {open && (
        <pre className="dev-pre">
          {stateString}
        </pre>
      )}
    </div>
  )
}

export default DevPanel
