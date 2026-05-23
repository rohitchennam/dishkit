const pool = require('./db')

async function seed() {
  // Clear existing data first
  await pool.query('DELETE FROM dish_ingredients')
  await pool.query('DELETE FROM orders')
  await pool.query('DELETE FROM dishes')
  await pool.query('DELETE FROM ingredients')

  // ── Ingredients ─────────────────────────────────────
  const ing = {}
  const addIng = async (name, unit) => {
    const r = await pool.query(
      'INSERT INTO ingredients (name, unit) VALUES ($1, $2) RETURNING id',
      [name, unit]
    )
    ing[name] = r.rows[0].id
  }

  await addIng('Basmati rice', 'g')
  await addIng('Chicken thighs', 'g')
  await addIng('Whole spice kit', 'pack')
  await addIng('Ghee', 'ml')
  await addIng('Yoghurt', 'ml')
  await addIng('Onions', 'g')
  await addIng('Tomatoes', 'g')
  await addIng('Ginger garlic paste', 'tsp')
  await addIng('Paneer', 'g')
  await addIng('Bell peppers', 'g')
  await addIng('Cream', 'ml')
  await addIng('Butter', 'g')
  await addIng('Pasta', 'g')
  await addIng('Eggs', 'pcs')
  await addIng('Parmesan cheese', 'g')
  await addIng('Bacon', 'g')
  await addIng('Black pepper', 'tsp')
  await addIng('Garlic cloves', 'pcs')
  await addIng('Olive oil', 'ml')
  await addIng('Soy sauce', 'ml')
  await addIng('Noodles', 'g')
  await addIng('Cabbage', 'g')
  await addIng('Carrots', 'g')
  await addIng('Spring onions', 'g')
  await addIng('Chicken breast', 'g')
  await addIng('Lemon', 'pcs')
  await addIng('Dal (toor)', 'g')
  await addIng('Turmeric', 'tsp')
  await addIng('Mustard seeds', 'tsp')
  await addIng('Curry leaves', 'g')
  await addIng('Coconut milk', 'ml')
  await addIng('Fish fillets', 'g')
  await addIng('Tamarind paste', 'tsp')
  await addIng('Tortillas', 'pcs')
  await addIng('Kidney beans', 'g')
  await addIng('Cheddar cheese', 'g')
  await addIng('Sour cream', 'ml')
  await addIng('Avocado', 'pcs')

  // ── Helper to add a dish ─────────────────────────────
  const addDish = async (dish, ingredients) => {
    const r = await pool.query(`
      INSERT INTO dishes (name, cuisine, meal_type, description, prep_time, cook_time, price, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
    `, [dish.name, dish.cuisine, dish.mealType, dish.description,
        dish.prepTime, dish.cookTime, dish.price, dish.emoji])

    const dishId = r.rows[0].id
    for (const [name, qty] of ingredients) {
      await pool.query(
        'INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity_per_serving) VALUES ($1, $2, $3)',
        [dishId, ing[name], qty]
      )
    }
    console.log(`Added: ${dish.name}`)
  }

  // ── Dishes ───────────────────────────────────────────

  await addDish({
    name: 'Chicken Biryani',
    cuisine: 'Indian', mealType: 'Dinner',
    description: 'Fragrant basmati rice layered with spiced chicken, slow-cooked to perfection',
    prepTime: 20, cookTime: 45, price: 249, emoji: '🍛'
  }, [
    ['Basmati rice', 150], ['Chicken thighs', 200],
    ['Whole spice kit', 1], ['Ghee', 30], ['Yoghurt', 60], ['Onions', 80]
  ])

  await addDish({
    name: 'Paneer Butter Masala',
    cuisine: 'Indian', mealType: 'Dinner',
    description: 'Soft paneer cubes in a rich, creamy tomato-butter gravy',
    prepTime: 15, cookTime: 25, price: 199, emoji: '🧆'
  }, [
    ['Paneer', 150], ['Tomatoes', 120], ['Onions', 80],
    ['Cream', 60], ['Butter', 30], ['Ginger garlic paste', 2],
    ['Whole spice kit', 1]
  ])

  await addDish({
    name: 'Spaghetti Carbonara',
    cuisine: 'Italian', mealType: 'Dinner',
    description: 'Classic Roman pasta with eggs, crispy bacon and aged parmesan',
    prepTime: 10, cookTime: 20, price: 279, emoji: '🍝'
  }, [
    ['Pasta', 120], ['Eggs', 2], ['Bacon', 80],
    ['Parmesan cheese', 40], ['Black pepper', 1], ['Garlic cloves', 2],
    ['Olive oil', 15]
  ])

  await addDish({
    name: 'Veg Hakka Noodles',
    cuisine: 'Chinese', mealType: 'Lunch',
    description: 'Stir-fried noodles with crunchy vegetables in a savory soy glaze',
    prepTime: 10, cookTime: 15, price: 149, emoji: '🍜'
  }, [
    ['Noodles', 120], ['Cabbage', 60], ['Carrots', 40],
    ['Bell peppers', 50], ['Spring onions', 30],
    ['Soy sauce', 20], ['Garlic cloves', 3], ['Olive oil', 15]
  ])

  await addDish({
    name: 'Chicken Hakka Noodles',
    cuisine: 'Chinese', mealType: 'Lunch',
    description: 'Stir-fried noodles with tender chicken strips and fresh vegetables',
    prepTime: 10, cookTime: 15, price: 179, emoji: '🍜'
  }, [
    ['Noodles', 120], ['Chicken breast', 100], ['Cabbage', 50],
    ['Carrots', 40], ['Spring onions', 30],
    ['Soy sauce', 20], ['Garlic cloves', 3], ['Olive oil', 15]
  ])

  await addDish({
    name: 'Dal Tadka',
    cuisine: 'Indian', mealType: 'Lunch',
    description: 'Comforting yellow lentils tempered with mustard, cumin and curry leaves',
    prepTime: 10, cookTime: 30, price: 129, emoji: '🫕'
  }, [
    ['Dal (toor)', 150], ['Onions', 60], ['Tomatoes', 80],
    ['Ginger garlic paste', 1], ['Turmeric', 1],
    ['Mustard seeds', 1], ['Curry leaves', 5], ['Ghee', 20]
  ])

  await addDish({
    name: 'Kerala Fish Curry',
    cuisine: 'Indian', mealType: 'Dinner',
    description: 'Tangy, spiced fish curry cooked in coconut milk with tamarind',
    prepTime: 15, cookTime: 25, price: 299, emoji: '🐟'
  }, [
    ['Fish fillets', 200], ['Coconut milk', 100],
    ['Tomatoes', 80], ['Onions', 60], ['Tamarind paste', 2],
    ['Turmeric', 1], ['Curry leaves', 5], ['Ginger garlic paste', 2]
  ])

  await addDish({
    name: 'Chicken Quesadilla',
    cuisine: 'Mexican', mealType: 'Snack',
    description: 'Crispy tortillas stuffed with grilled chicken, cheese and peppers',
    prepTime: 10, cookTime: 15, price: 219, emoji: '🌮'
  }, [
    ['Tortillas', 2], ['Chicken breast', 100], ['Bell peppers', 60],
    ['Cheddar cheese', 60], ['Sour cream', 30], ['Onions', 40]
  ])

  await addDish({
    name: 'Paneer Tikka',
    cuisine: 'Indian', mealType: 'Snack',
    description: 'Marinated paneer and peppers grilled until charred and smoky',
    prepTime: 20, cookTime: 15, price: 189, emoji: '🍢'
  }, [
    ['Paneer', 150], ['Bell peppers', 80], ['Onions', 60],
    ['Yoghurt', 60], ['Ginger garlic paste', 2],
    ['Whole spice kit', 1], ['Lemon', 1]
  ])

  await addDish({
    name: 'Avocado Egg Toast',
    cuisine: 'Western', mealType: 'Breakfast',
    description: 'Creamy smashed avocado on toast topped with a perfectly poached egg',
    prepTime: 5, cookTime: 10, price: 159, emoji: '🥑'
  }, [
    ['Avocado', 1], ['Eggs', 2], ['Lemon', 1],
    ['Black pepper', 1], ['Olive oil', 10]
  ])

  console.log('\nAll dishes seeded!')
  process.exit()
}

seed()