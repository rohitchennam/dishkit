import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView
} from 'react-native'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { API } from '../constants'

const CUISINES  = ['All', 'Indian', 'Italian', 'Chinese', 'Mexican', 'Western']
const MEALTYPES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack']

export default function HomeScreen({ navigation }) {
  const [dishes,  setDishes]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [cuisine, setCuisine] = useState('All')
  const [meal,    setMeal]    = useState('All')
  const { cart, addToCart, totalItems } = useCart()

  useEffect(() => {
    axios.get(`${API}/dishes`)
      .then(res => { setDishes(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = dishes.filter(d => {
    const matchCuisine = cuisine === 'All' || d.cuisine === cuisine
    const matchMeal    = meal    === 'All' || d.meal_type === meal
    const matchSearch  = d.name.toLowerCase().includes(search.toLowerCase())
    return matchCuisine && matchMeal && matchSearch
  })

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#1a1a1a" />
      <Text style={styles.loadingText}>Loading dishes...</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search dishes..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
      />

      {/* Cuisine filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {CUISINES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.pill, cuisine === c && styles.pillActive]}
            onPress={() => setCuisine(c)}
          >
            <Text style={[styles.pillText, cuisine === c && styles.pillTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Meal type filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {MEALTYPES.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.pill, meal === m && styles.mealPillActive]}
            onPress={() => setMeal(m)}
          >
            <Text style={[styles.pillText, meal === m && styles.pillTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dish list */}
      <FlatList
        data={filtered}
        keyExtractor={d => d.id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item: dish }) => {
          const inCart = cart.some(i => i.dish.id === dish.id)
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Dish', { dish })}
              activeOpacity={0.85}
            >
              <Text style={styles.cardEmoji}>{dish.image_url || '🍽️'}</Text>
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardName}>{dish.name}</Text>
                  <Text style={styles.cardPrice}>₹{dish.price}</Text>
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{dish.description}</Text>
                <View style={styles.tagRow}>
                  <Text style={[styles.tag, styles.tagCuisine]}>{dish.cuisine}</Text>
                  <Text style={[styles.tag, styles.tagMeal]}>{dish.meal_type}</Text>
                  <Text style={[styles.tag, styles.tagTime]}>
                    {dish.prep_time + dish.cook_time} min
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.addBtn, inCart && styles.addBtnActive]}
                  onPress={() => addToCart(dish)}
                >
                  <Text style={styles.addBtnText}>
                    {inCart ? '✓ Added — tap for more' : '+ Add to cart'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )
        }}
      />

      {/* Floating cart button */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.floatingCartText}>
            🛒 View cart · {totalItems} item{totalItems !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}

      {/* History button */}
      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.historyBtnText}>📋 Orders</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f5f5f0', paddingTop: 12 },
  centered:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText:{ marginTop: 12, color: '#888' },

  search: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: 'white', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, borderWidth: 1.5, borderColor: '#e0e0e0',
  },

  filterRow: { paddingLeft: 16, marginBottom: 8, flexGrow: 0 },
  pill: {
    backgroundColor: '#efefea', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginRight: 8,
  },
  pillActive:     { backgroundColor: '#1a1a1a' },
  mealPillActive: { backgroundColor: '#4f46e5' },
  pillText:       { fontSize: 13, color: '#555' },
  pillTextActive: { color: 'white', fontWeight: '700' },

  card: {
    flexDirection: 'row', backgroundColor: 'white',
    borderRadius: 16, marginHorizontal: 16, marginBottom: 12,
    overflow: 'hidden', elevation: 2,
  },
  cardEmoji: {
    width: 90, fontSize: 40, textAlign: 'center',
    textAlignVertical: 'center', backgroundColor: '#f5f5f0',
  },
  cardBody:  { flex: 1, padding: 14 },
  cardTop:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardName:  { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  cardPrice: { fontSize: 16, fontWeight: '700' },
  cardDesc:  { fontSize: 13, color: '#777', marginBottom: 8, lineHeight: 18 },

  tagRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  tag:       { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagCuisine:{ backgroundColor: '#ede9fe', color: '#5b21b6' },
  tagMeal:   { backgroundColor: '#dbeafe', color: '#1e40af' },
  tagTime:   { backgroundColor: '#f0fdf4', color: '#166534' },

  addBtn: {
    backgroundColor: '#1a1a1a', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
  },
  addBtnActive: { backgroundColor: '#10b981' },
  addBtnText:   { color: 'white', fontSize: 13, fontWeight: '700' },

  floatingCart: {
    position: 'absolute', bottom: 60, left: 20, right: 20,
    backgroundColor: '#1a1a1a', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', elevation: 8,
  },
  floatingCartText: { color: 'white', fontSize: 16, fontWeight: '700' },

  historyBtn: {
    position: 'absolute', bottom: 12, left: 20, right: 20,
    backgroundColor: 'white', borderRadius: 12, borderWidth: 1,
    borderColor: '#e0e0e0', paddingVertical: 10, alignItems: 'center',
  },
  historyBtnText: { fontSize: 14, color: '#555', fontWeight: '600' },
})