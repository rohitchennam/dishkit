const API = 'https://dishkit-backend.onrender.com'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './OrderCard.css'

// const API = 'http://localhost:3000'

function Timer({ createdAt }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(createdAt).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [createdAt])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const isUrgent = elapsed > 600

  return (
    <span className={`timer ${isUrgent ? 'urgent' : ''}`}>
      {mins}:{secs.toString().padStart(2, '0')} ago
    </span>
  )
}

function OrderCard({ order, onAction, actionLabel, showChecklist }) {
  // Collect all ingredients across all items in the order
  const allIngredients = []
  order.items?.forEach(item => {
    item.ingredients?.forEach(ing => {
      const qty = (ing.quantity_per_serving * item.servings).toFixed(0)
      allIngredients.push({
        key:   `${item.dish_id}-${ing.name}`,
        label: ing.name,
        qty:   `${qty} ${ing.unit}`,
        dish:  item.dish_name,
      })
    })
  })

  const [checked, setChecked] = useState({})
  const allChecked = allIngredients.length > 0 &&
    allIngredients.every(ing => checked[ing.key])

  function toggle(key) {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Summary of dishes in this order
  const dishSummary = order.items?.map(item =>
    `${item.emoji || '🍽️'} ${item.dish_name} ×${item.servings}`
  ).join('  ·  ')

  return (
    <div className="order-card">
      <div className="card-top">
        <div>
          <span className="order-id">#{order.id}</span>
          <span className="dish-name">{dishSummary}</span>
        </div>
        <Timer createdAt={order.created_at} />
      </div>

      <div className="card-meta">
        <span>{order.items?.length} dish{order.items?.length !== 1 ? 'es' : ''}</span>
        <span>{order.customer_name}</span>
        <span>₹{Number(order.total_amount).toFixed(0)}</span>
      </div>

      {showChecklist && allIngredients.length > 0 && (
        <div className="checklist">
          {allIngredients.map(ing => (
            <label key={ing.key} className={`check-item ${checked[ing.key] ? 'done' : ''}`}>
              <input
                type="checkbox"
                checked={!!checked[ing.key]}
                onChange={() => toggle(ing.key)}
              />
              <span className="check-label">
                {ing.label}
                <span className="check-qty">{ing.qty}</span>
              </span>
            </label>
          ))}
        </div>
      )}

      <button
        className="action-btn"
        onClick={() => onAction(order.id)}
        disabled={showChecklist && !allChecked}
      >
        {showChecklist && !allChecked
          ? `Tick all items (${Object.values(checked).filter(Boolean).length}/${allIngredients.length})`
          : actionLabel
        }
      </button>
    </div>
  )
}

export default OrderCard