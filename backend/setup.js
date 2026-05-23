const pool = require('./db')

async function setup() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS dishes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      cuisine TEXT,
      meal_type TEXT,
      description TEXT,
      prep_time INT,
      cook_time INT,
      price NUMERIC(8,2),
      image_url TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      unit TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dish_ingredients (
      id SERIAL PRIMARY KEY,
      dish_id INT REFERENCES dishes(id),
      ingredient_id INT REFERENCES ingredients(id),
      quantity_per_serving NUMERIC(8,2)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      customer_name TEXT,
      address TEXT,
      status TEXT DEFAULT 'PLACED',
      total_amount NUMERIC(8,2),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INT REFERENCES orders(id) ON DELETE CASCADE,
      dish_id INT REFERENCES dishes(id),
      servings INT NOT NULL DEFAULT 1,
      price_at_order NUMERIC(8,2)
    );
  `)

  console.log('Tables created!')
  process.exit()
}

setup()