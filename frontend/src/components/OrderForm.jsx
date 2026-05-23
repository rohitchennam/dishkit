// import { useState } from 'react'
// import axios from 'axios'
// import './OrderForm.css'

// function OrderForm({ dish, onBack, onOrderPlaced }) {
//   const [servings, setServings]     = useState(1)
//   const [name, setName]             = useState('')
//   const [address, setAddress]       = useState('')
//   const [loading, setLoading]       = useState(false)
//   const [error, setError]           = useState(null)

//   const total = (dish.price * servings).toFixed(2)

//   async function placeOrder() {
//     if (!name.trim() || !address.trim()) {
//       setError('Please fill in your name and address')
//       return
//     }
//     setLoading(true)
//     setError(null)
//     try {
//       const res = await axios.post(`${process.env.REACT_APP_API_URL}/orders`, {
//         dish_id: dish.id,
//         servings,
//         customer_name: name,
//         address
//       })
//       onOrderPlaced({ ...res.data, dish_name: dish.name })
//     } catch {
//       setError('Could not place order. Is the backend running?')
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="order-form">
//       <button className="back-btn" onClick={onBack}>← Back</button>

//       <div className="order-dish-header">
//         <span className="order-emoji">
//           {dish.cuisine === 'Indian' ? '🍛' : '🍽️'}
//         </span>
//         <div>
//           <h2>{dish.name}</h2>
//           <p>{dish.description}</p>
//         </div>
//       </div>

//       <div className="form-section">
//         <label>Servings</label>
//         <div className="servings-row">
//           <button className="qty-btn" onClick={() => setServings(s => Math.max(1, s - 1))}>−</button>
//           <span className="qty-num">{servings}</span>
//           <button className="qty-btn" onClick={() => setServings(s => Math.min(4, s + 1))}>+</button>
//           <span className="qty-label">person{servings > 1 ? 's' : ''}</span>
//         </div>
//       </div>

//       <div className="form-section">
//         <label>Your name</label>
//         <input
//           value={name}
//           onChange={e => setName(e.target.value)}
//           placeholder="e.g. Ravi Kumar"
//         />
//       </div>

//       <div className="form-section">
//         <label>Delivery address</label>
//         <textarea
//           value={address}
//           onChange={e => setAddress(e.target.value)}
//           placeholder="e.g. 12 MG Road, Banjara Hills, Hyderabad"
//           rows={3}
//         />
//       </div>

//       <div className="order-summary">
//         <span>Total</span>
//         <span className="order-total">₹{total}</span>
//       </div>

//       {error && <p className="form-error">{error}</p>}

//       <button
//         className="place-order-btn"
//         onClick={placeOrder}
//         disabled={loading}
//       >
//         {loading ? 'Placing order...' : `Place order — ₹${total}`}
//       </button>
//     </div>
//   )
// }

// export default OrderForm



import { useState } from 'react'
import axios from 'axios'
import './OrderForm.css'

const API = process.env.REACT_APP_API_URL

export default function OrderForm({ cart, onUpdateServings, onRemove, onBack, onOrderPlaced }) {
  const [name,    setName]    = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const total = cart.reduce((sum, i) => sum + i.dish.price * i.servings, 0)

  async function placeOrder() {
    if (!name.trim() || !address.trim())
      return setError('Please fill in your name and address')

    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API}/orders`, {
        customer_name: name,
        address,
        items: cart.map(i => ({ dish_id: i.dish.id, servings: i.servings }))
      })
      onOrderPlaced(res.data)
    } catch {
      setError('Could not place order. Is the backend running?')
      setLoading(false)
    }
  }

  return (
    <div className="order-form">
      <button className="back-btn" onClick={onBack}>← Back to dishes</button>
      <h2 className="form-title">Your cart</h2>

      <div className="cart-items">
        {cart.map(({ dish, servings }) => (
          <div key={dish.id} className="cart-row">
            <span className="cart-emoji">{dish.image_url || '🍽️'}</span>
            <div className="cart-info">
              <span className="cart-name">{dish.name}</span>
              <div className="cart-ing-preview">
                {dish.ingredients?.slice(0, 3).map((ing, i) => (
                  <span key={i} className="cart-ing-tag">
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="cart-qty">
              <button onClick={() => onUpdateServings(dish.id, servings - 1)}>−</button>
              <span>{servings}</span>
              <button onClick={() => onUpdateServings(dish.id, servings + 1)}>+</button>
            </div>
            <div className="cart-price">
              <span>₹{(dish.price * servings).toFixed(0)}</span>
              <button className="remove-btn" onClick={() => onRemove(dish.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="form-section">
        <label>Your name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar" />
      </div>

      <div className="form-section">
        <label>Delivery address</label>
        <textarea value={address} onChange={e => setAddress(e.target.value)}
          placeholder="e.g. 12 MG Road, Banjara Hills, Hyderabad" rows={3} />
      </div>

      <div className="order-summary">
        <span>{cart.length} dish{cart.length > 1 ? 'es' : ''}</span>
        <span className="order-total">₹{total.toFixed(0)}</span>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button className="place-order-btn" onClick={placeOrder} disabled={loading}>
        {loading ? 'Placing order...' : `Place order — ₹${total.toFixed(0)}`}
      </button>
    </div>
  )
}