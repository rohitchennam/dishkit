import { useState } from 'react'
import DishList   from './components/DishList'
// import Cart       from './components/Cart'
import OrderForm  from './components/OrderForm'
import OrderHistory from './components/OrderHistory'
import './App.css'

function App() {
  const [cart,     setCart]     = useState([])   // [{dish, servings}]
  const [screen,   setScreen]   = useState('browse') // browse | checkout | confirmation | history
  const [lastOrder, setLastOrder] = useState(null)

  function addToCart(dish) {
    setCart(prev => {
      const existing = prev.find(i => i.dish.id === dish.id)
      if (existing)
        return prev.map(i => i.dish.id === dish.id ? { ...i, servings: Math.min(4, i.servings + 1) } : i)
      return [...prev, { dish, servings: 1 }]
    })
  }

  function removeFromCart(dishId) {
    setCart(prev => prev.filter(i => i.dish.id !== dishId))
  }

  function updateServings(dishId, servings) {
    if (servings < 1) return removeFromCart(dishId)
    setCart(prev => prev.map(i => i.dish.id === dishId ? { ...i, servings } : i))
  }

  const totalItems = cart.reduce((sum, i) => sum + i.servings, 0)

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>DishKit</h1>
          <p>Order fresh ingredients, cook tonight</p>
        </div>
        <div className="header-right">
          <button className="history-btn" onClick={() => setScreen('history')}>
            Orders
          </button>
          {cart.length > 0 && (
            <button className="cart-btn" onClick={() => setScreen('checkout')}>
              🛒 {totalItems} item{totalItems !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </header>

      <main className="main">
        {screen === 'browse' && (
          <DishList
            cart={cart}
            onAddToCart={addToCart}
          />
        )}

        {screen === 'checkout' && (
          <OrderForm
            cart={cart}
            onUpdateServings={updateServings}
            onRemove={removeFromCart}
            onBack={() => setScreen('browse')}
            onOrderPlaced={(order) => {
              setLastOrder(order)
              setCart([])
              setScreen('confirmation')
            }}
          />
        )}

        {screen === 'confirmation' && lastOrder && (
          <Confirmation
            order={lastOrder}
            onDone={() => setScreen('browse')}
          />
        )}

        {screen === 'history' && (
          <OrderHistory onBack={() => setScreen('browse')} />
        )}
      </main>
    </div>
  )
}

function Confirmation({ order, onDone }) {
  return (
    <div className="confirmation">
      <div className="confirm-icon">✅</div>
      <h2>Order placed!</h2>
      <p className="confirm-sub">Order #{order.id} is being prepared</p>

      <div className="confirm-items">
        {order.items?.map((item, i) => (
          <div key={i} className="confirm-item">
            <span className="confirm-emoji">{item.emoji}</span>
            <div className="confirm-item-info">
              <strong>{item.dish_name}</strong>
              <span>{item.servings} serving{item.servings > 1 ? 's' : ''}</span>
            </div>
            <span className="confirm-item-price">
              ₹{(item.price_at_order * item.servings).toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      <div className="confirm-ingredients">
        <h3>What you'll receive</h3>
        {order.items?.map((item, i) => (
          <div key={i} className="ing-group">
            <p className="ing-group-dish">{item.emoji} {item.dish_name}</p>
            {item.ingredients?.map((ing, j) => (
              <div key={j} className="ing-row">
                <span>{ing.name}</span>
                <span className="ing-qty">
                  {(ing.quantity_per_serving * item.servings).toFixed(0)} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="confirm-total">
        Total paid: <strong>₹{Number(order.total_amount).toFixed(0)}</strong>
      </div>

      <button onClick={onDone}>Order more dishes</button>
    </div>
  )
}

export default App