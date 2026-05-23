const pool = require('./db')

async function setup() {
  await pool.query(`
    -- Add user table
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Update orders table to support cart (multiple dishes)
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;

    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      customer_name TEXT,
      address TEXT,
      status TEXT DEFAULT 'PLACED',
      total_amount NUMERIC(8,2),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE order_items (
      id SERIAL PRIMARY KEY,
      order_id INT REFERENCES orders(id) ON DELETE CASCADE,
      dish_id INT REFERENCES dishes(id),
      servings INT NOT NULL DEFAULT 1,
      price_at_order NUMERIC(8,2)
    );
  `)

  console.log('Tables updated!')
  process.exit()
}

setup()