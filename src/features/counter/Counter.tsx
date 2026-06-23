import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
  setStep,
  selectCount,
  selectStep,
  selectHistory,
} from './counterSlice'

const Counter: React.FC = () => {
  const dispatch = useAppDispatch()
  const count = useAppSelector(selectCount)
  const step = useAppSelector(selectStep)
  const history = useAppSelector(selectHistory)
  const [customAmount, setCustomAmount] = useState(5)

  return (
    <section className="card">
      <h2>Counter <span className="badge">Sync Actions</span></h2>
      <p className="hint">
        <strong>Concept:</strong> createSlice + synchronous reducers (Immer-powered).
        Open the browser console to see the <em>logger middleware</em> in action.
      </p>

      <div className="counter-display">{count}</div>

      <div className="btn-row">
        <button onClick={() => dispatch(decrement())}>− Step ({step})</button>
        <button onClick={() => dispatch(increment())}>+ Step ({step})</button>
        <button className="danger" onClick={() => dispatch(reset())}>Reset</button>
      </div>

      <div className="input-row">
        <label>
          Step size:&nbsp;
          <input
            type="number"
            value={step}
            min={1}
            onChange={(e) => dispatch(setStep(Number(e.target.value)))}
          />
        </label>
        <label>
          Custom amount:&nbsp;
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(Number(e.target.value))}
          />
        </label>
        <button onClick={() => dispatch(incrementByAmount(customAmount))}>
          Add {customAmount}
        </button>
      </div>

      {history.length > 0 && (
        <details>
          <summary>History ({history.length} entries)</summary>
          <pre>{history.join(' → ')}</pre>
        </details>
      )}
    </section>
  )
}

export default Counter
