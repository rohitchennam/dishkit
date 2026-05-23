const express = require('express')
const cors    = require('cors')
const pool    = require('./db')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// ── Dishes ───────────────────────────────────────────
app.get('/dishes', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM dishes WHERE is_active = true ORDER BY name ASC'
    )
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/dishes/:id', async (req, res) => {
  try {
    const dish = await pool.query('SELECT * FROM dishes WHERE id = $1', [req.params.id])
    if (!dish.rows.length) return res.status(404).json({ error: 'Not found' })

    const ingredients = await pool.query(`
      SELECT i.name, i.unit, di.quantity_per_serving
      FROM dish_ingredients di
      JOIN ingredients i ON i.id = di.ingredient_id
      WHERE di.dish_id = $1
    `, [req.params.id])

    res.json({ ...dish.rows[0], ingredients: ingredients.rows })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Orders ───────────────────────────────────────────
app.post('/orders', async (req, res) => {
  const { customer_name, address, items } = req.body
  // items = [{ dish_id, servings }, ...]

  if (!customer_name || !address || !items?.length)
    return res.status(400).json({ error: 'Missing fields' })

  try {
    // Calculate total
    let total = 0
    const dishData = []
    for (const item of items) {
      const d = await pool.query('SELECT * FROM dishes WHERE id = $1', [item.dish_id])
      if (!d.rows.length) return res.status(404).json({ error: `Dish ${item.dish_id} not found` })
      const price = d.rows[0].price * item.servings
      total += price
      dishData.push({ ...item, price_at_order: d.rows[0].price })
    }

    // Create order
    const order = await pool.query(`
      INSERT INTO orders (customer_name, address, total_amount)
      VALUES ($1, $2, $3) RETURNING *
    `, [customer_name, address, total])

    const orderId = order.rows[0].id

    // Insert order items
    for (const item of dishData) {
      await pool.query(`
        INSERT INTO order_items (order_id, dish_id, servings, price_at_order)
        VALUES ($1, $2, $3, $4)
      `, [orderId, item.dish_id, item.servings, item.price_at_order])
    }

    // Return full order
    const full = await getFullOrder(orderId)
    res.status(201).json(full)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/orders', async (req, res) => {
  try {
    const orders = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    )
    const full = await Promise.all(orders.rows.map(o => getFullOrder(o.id)))
    res.json(full)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/orders/:id', async (req, res) => {
  try {
    const order = await getFullOrder(req.params.id)
    if (!order) return res.status(404).json({ error: 'Not found' })
    res.json(order)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body
  const valid = ['PLACED','RECEIVED','PACKING','PACKED','READY','OUT_FOR_DELIVERY','DELIVERED']
  if (!valid.includes(status))
    return res.status(400).json({ error: 'Invalid status' })
  try {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id])
    res.json(await getFullOrder(req.params.id))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Helper ───────────────────────────────────────────
async function getFullOrder(orderId) {
  const order = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId])
  if (!order.rows.length) return null

  const items = await pool.query(`
    SELECT
      oi.*,
      d.name as dish_name,
      d.cuisine,
      d.image_url as emoji,
      d.prep_time,
      d.cook_time
    FROM order_items oi
    JOIN dishes d ON d.id = oi.dish_id
    WHERE oi.order_id = $1
  `, [orderId])

  // Get ingredients for each item
  const itemsWithIngredients = await Promise.all(items.rows.map(async item => {
    const ings = await pool.query(`
      SELECT i.name, i.unit, di.quantity_per_serving
      FROM dish_ingredients di
      JOIN ingredients i ON i.id = di.ingredient_id
      WHERE di.dish_id = $1
    `, [item.dish_id])
    return { ...item, ingredients: ings.rows }
  }))

  return { ...order.rows[0], items: itemsWithIngredients }
}

app.listen(process.env.PORT || 3000, () => {
  console.log('DishKit API running on http://localhost:3000')
})