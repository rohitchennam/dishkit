import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  function addToCart(dish) {
    setCart(prev => {
      const existing = prev.find(i => i.dish.id === dish.id)
      if (existing)
        return prev.map(i =>
          i.dish.id === dish.id ? { ...i, servings: Math.min(4, i.servings + 1) } : i
        )
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

  function clearCart() { setCart([]) }

  const totalItems = cart.reduce((sum, i) => sum + i.servings, 0)
  const totalPrice = cart.reduce((sum, i) => sum + i.dish.price * i.servings, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateServings, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)