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

// ── Admin: Dishes CRUD ──────────────────────────────
app.post('/admin/dishes', async (req, res) => {
  const { name, cuisine, meal_type, description, prep_time, cook_time, price, image_url } = req.body
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' })
  try {
    const result = await pool.query(`
      INSERT INTO dishes (name, cuisine, meal_type, description, prep_time, cook_time, price, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [name, cuisine, meal_type, description, prep_time || 0, cook_time || 0, price, image_url || '🍽️'])
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.put('/admin/dishes/:id', async (req, res) => {
  const { name, cuisine, meal_type, description, prep_time, cook_time, price, image_url, is_active } = req.body
  try {
    const result = await pool.query(`
      UPDATE dishes SET
        name = $1, cuisine = $2, meal_type = $3, description = $4,
        prep_time = $5, cook_time = $6, price = $7, image_url = $8, is_active = $9
      WHERE id = $10 RETURNING *
    `, [name, cuisine, meal_type, description, prep_time, cook_time, price, image_url, is_active, req.params.id])
    if (!result.rows.length) return res.status(404).json({ error: 'Dish not found' })
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/admin/dishes/:id', async (req, res) => {
  try {
    await pool.query('UPDATE dishes SET is_active = false WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Admin: Ingredients ──────────────────────────────
app.get('/admin/ingredients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingredients ORDER BY name ASC')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/admin/ingredients', async (req, res) => {
  const { name, unit } = req.body
  if (!name || !unit) return res.status(400).json({ error: 'Name and unit required' })
  try {
    const result = await pool.query(
      'INSERT INTO ingredients (name, unit) VALUES ($1, $2) RETURNING *', [name, unit]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/admin/dishes/:id/ingredients', async (req, res) => {
  const { ingredient_id, quantity_per_serving } = req.body
  try {
    const result = await pool.query(`
      INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity_per_serving)
      VALUES ($1, $2, $3) RETURNING *
    `, [req.params.id, ingredient_id, quantity_per_serving])
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/admin/dish-ingredients/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM dish_ingredients WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Admin: Analytics ──────────────────────────────
app.get('/admin/analytics', async (req, res) => {
  try {
    const topDishes = await pool.query(`
      SELECT d.name, d.image_url, COUNT(oi.id) as order_count, SUM(oi.servings) as total_servings
      FROM order_items oi
      JOIN dishes d ON d.id = oi.dish_id
      GROUP BY d.id, d.name, d.image_url
      ORDER BY order_count DESC
      LIMIT 5
    `)

    const orderStats = await pool.query(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM orders
    `)

    const statusBreakdown = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `)

    const ordersByDay = await pool.query(`
      SELECT DATE(created_at) as day, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `)

    res.json({
      topDishes: topDishes.rows,
      stats: orderStats.rows[0],
      statusBreakdown: statusBreakdown.rows,
      ordersByDay: ordersByDay.rows
    })
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