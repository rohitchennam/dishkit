import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { API } from '../constants'

export default function DishScreen({ route, navigation }) {
  const { dish } = route.params
  const [detail,  setDetail]  = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    axios.get(`${API}/dishes/${dish.id}`)
      .then(res => { setDetail(res.data); setLoading(false) })
  }, [])

  if (loading) return (
    <View style={s.centered}><ActivityIndicator size="large" color="#1a1a1a" /></View>
  )

  return (
    <ScrollView style={s.container}>
      <View style={s.hero}>
        <Text style={s.heroEmoji}>{dish.image_url || '🍽️'}</Text>
        <Text style={s.heroName}>{dish.name}</Text>
        <Text style={s.heroDesc}>{dish.description}</Text>
        <View style={s.metaRow}>
          <View style={s.metaBox}>
            <Text style={s.metaVal}>{dish.prep_time}m</Text>
            <Text style={s.metaLabel}>Prep</Text>
          </View>
          <View style={s.metaBox}>
            <Text style={s.metaVal}>{dish.cook_time}m</Text>
            <Text style={s.metaLabel}>Cook</Text>
          </View>
          <View style={s.metaBox}>
            <Text style={s.metaVal}>₹{dish.price}</Text>
            <Text style={s.metaLabel}>Per serving</Text>
          </View>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>What you'll receive</Text>
        <Text style={s.sectionSub}>Fresh, pre-measured ingredients for 1 serving</Text>
        {detail?.ingredients?.map((ing, i) => (
          <View key={i} style={s.ingRow}>
            <Text style={s.ingName}>{ing.name}</Text>
            <Text style={s.ingQty}>{ing.quantity_per_serving} {ing.unit}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.addBtn} onPress={() => { addToCart(dish); navigation.goBack() }}>
        <Text style={s.addBtnText}>+ Add to cart</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  hero: {
    backgroundColor: 'white', padding: 24,
    alignItems: 'center', marginBottom: 12,
  },
  heroEmoji: { fontSize: 64, marginBottom: 12 },
  heroName:  { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  heroDesc:  { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20, marginBottom: 20 },

  metaRow: { flexDirection: 'row', gap: 12 },
  metaBox: {
    backgroundColor: '#f5f5f0', borderRadius: 12,
    padding: 12, alignItems: 'center', minWidth: 80,
  },
  metaVal:   { fontSize: 18, fontWeight: '700' },
  metaLabel: { fontSize: 11, color: '#888', marginTop: 2 },

  section: { backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sectionSub:   { fontSize: 13, color: '#888', marginBottom: 16 },

  ingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  ingName: { fontSize: 14, color: '#333' },
  ingQty:  { fontSize: 14, color: '#888', fontWeight: '600' },

  addBtn: {
    backgroundColor: '#1a1a1a', margin: 16, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 40,
  },
  addBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
})