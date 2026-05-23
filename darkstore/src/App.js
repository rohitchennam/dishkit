import { useState, useEffect } from 'react'
import axios from 'axios'
import OrderCard from './components/OrderCard'
import './App.css'

const API = 'http://localhost:3000'

function App() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  function fetchOrders() {
    axios.get(`${API}/orders`)
      .then(res => {
        const active = res.data.filter(o =>
          !['DELIVERED', 'CANCELLED'].includes(o.status)
        )
        setOrders(active)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  async function updateStatus(orderId, newStatus) {
    await axios.patch(`${API}/orders/${orderId}/status`, { status: newStatus })
    fetchOrders()
  }

  const byStatus = (statuses) => orders.filter(o => statuses.includes(o.status))

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>DishKit — Dark Store</h1>
          <span className="live-badge">● LIVE</span>
        </div>
        <div className="header-right">
          {orders.length} active order{orders.length !== 1 ? 's' : ''}
        </div>
      </header>

      {loading ? (
        <p className="state-msg">Connecting to kitchen...</p>
      ) : orders.length === 0 ? (
        <p className="state-msg">No active orders right now</p>
      ) : (
        <div className="board">
          <Column
            title="New orders"
            color="#f59e0b"
            orders={byStatus(['PLACED', 'RECEIVED'])}
            onAction={(id) => updateStatus(id, 'PACKING')}
            actionLabel="Start packing"
          />
          <Column
            title="Packing"
            color="#3b82f6"
            orders={byStatus(['PACKING'])}
            onAction={(id) => updateStatus(id, 'PACKED')}
            actionLabel="Mark packed"
            showChecklist
          />
          <Column
            title="Ready for pickup"
            color="#10b981"
            orders={byStatus(['PACKED', 'READY'])}
            onAction={(id) => updateStatus(id, 'OUT_FOR_DELIVERY')}
            actionLabel="Out for delivery"
          />
        </div>
      )}
    </div>
  )
}

function Column({ title, color, orders, onAction, actionLabel, showChecklist }) {
  return (
    <div className="column">
      <div className="column-header" style={{ borderColor: color }}>
        <span className="column-title" style={{ color }}>{title}</span>
        <span className="column-count" style={{ background: color }}>{orders.length}</span>
      </div>
      {orders.length === 0 ? (
        <p className="empty-col">Nothing here</p>
      ) : (
        orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onAction={onAction}
            actionLabel={actionLabel}
            showChecklist={showChecklist}
          />
        ))
      )}
    </div>
  )
}

export default App