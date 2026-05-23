import { useEffect, useState } from 'react'
import axios from 'axios'
import './DishList.css'

const CUISINES = ['All', 'Indian', 'Italian', 'Chinese', 'Mexican', 'Western']
const MEALS    = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack']

function DishList({ onAddToCart, cart }) {
  const [dishes,  setDishes]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [cuisine, setCuisine] = useState('All')
  const [meal,    setMeal]    = useState('All')
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/dishes`)
      .then(res => { setDishes(res.data); setLoading(false) })
      .catch(() => { setError('Could not load dishes'); setLoading(false) })
  }, [])

  const filtered = dishes.filter(d => {
    const matchCuisine = cuisine === 'All' || d.cuisine === cuisine
    const matchMeal    = meal    === 'All' || d.meal_type === meal
    const matchSearch  = d.name.toLowerCase().includes(search.toLowerCase())
    return matchCuisine && matchMeal && matchSearch
  })

  if (loading) return <p className="state-msg">Loading dishes...</p>
  if (error)   return <p className="state-msg error">{error}</p>

  return (
    <div>
      <div className="search-bar">
        <input
          placeholder="Search dishes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-row">
        {CUISINES.map(c => (
          <button
            key={c}
            className={`filter-pill ${cuisine === c ? 'active' : ''}`}
            onClick={() => setCuisine(c)}
          >{c}</button>
        ))}
      </div>

      <div className="filter-row">
        {MEALS.map(m => (
          <button
            key={m}
            className={`filter-pill meal ${meal === m ? 'active' : ''}`}
            onClick={() => setMeal(m)}
          >{m}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="state-msg">No dishes match your filters</p>
      ) : (
        <div className="dish-grid">
          {filtered.map(dish => (
            <DishCard
              key={dish.id}
              dish={dish}
              onSelect={() => {}}
              inCart={cart.some(i => i.dish.id === dish.id)}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DishCard({ dish, onSelect, inCart, onAddToCart }) {
  const totalTime = dish.prep_time + dish.cook_time

  return (
    <div className="dish-card">
      <div className="dish-emoji-box" onClick={() => onSelect(dish)}>
        <span className="dish-emoji">{dish.image_url || '🍽️'}</span>
      </div>
      <div className="dish-body">
        <div className="dish-top" onClick={() => onSelect(dish)}>
          <div>
            <h3 className="dish-name">{dish.name}</h3>
            <p className="dish-desc">{dish.description}</p>
          </div>
          <span className="dish-price">₹{dish.price}</span>
        </div>
        <div className="dish-tags">
          <span className="tag cuisine">{dish.cuisine}</span>
          <span className="tag meal">{dish.meal_type}</span>
          <span className="tag time">{totalTime} min</span>
        </div>
        <button
          className={`add-cart-btn ${inCart ? 'in-cart' : ''}`}
          onClick={() => onAddToCart(dish)}
        >
          {inCart ? '✓ Added — tap to add more' : '+ Add to cart'}
        </button>
      </div>
    </div>
  )
}

export default DishList