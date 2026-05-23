import { useEffect, useState } from 'react'
import axios from 'axios'
import './OrderHistory.css'

const API = process.env.REACT_APP_API_URL

const STATUS_COLOR = {
  PLACED:           '#f59e0b',
  RECEIVED:         '#3b82f6',
  PACKING:          '#8b5cf6',
  PACKED:           '#06b6d4',
  READY:            '#10b981',
  OUT_FOR_DELIVERY: '#f97316',
  DELIVERED:        '#22c55e',
  CANCELLED:        '#ef4444',
}

export default function OrderHistory({ onBack }) {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    axios.get(`${API}/orders`)
      .then(res => { setOrders(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="state-msg">Loading your orders...</p>

  return (
    <div className="history">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <h2 className="history-title">Order history</h2>

      {orders.length === 0 ? (
        <p className="state-msg">No orders yet</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="history-card"
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
            <div className="history-row">
              <div>
                <span className="history-id">Order #{order.id}</span>
                <div className="history-dishes">
                  {order.items?.map((item, i) => (
                    <span key={i}>{item.emoji} {item.dish_name}</span>
                  ))}
                </div>
              </div>
              <div className="history-right">
                <span className="history-status"
                  style={{ background: STATUS_COLOR[order.status] + '22',
                           color: STATUS_COLOR[order.status] }}>
                  {order.status.replace(/_/g, ' ')}
                </span>
                <span className="history-total">₹{Number(order.total_amount).toFixed(0)}</span>
                <span className="history-date">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {expanded === order.id && (
              <div className="history-detail">
                {order.items?.map((item, i) => (
                  <div key={i} className="history-item">
                    <p className="history-item-name">
                      {item.emoji} {item.dish_name} — {item.servings} serving{item.servings > 1 ? 's' : ''}
                    </p>
                    <div className="history-ings">
                      {item.ingredients?.map((ing, j) => (
                        <span key={j} className="history-ing">
                          {ing.name} · {(ing.quantity_per_serving * item.servings).toFixed(0)}{ing.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="history-address">📍 {order.address}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}