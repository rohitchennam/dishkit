import { useState } from 'react'
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet, Alert
} from 'react-native'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { API } from '../constants'

export default function CartScreen({ navigation }) {
  const { cart, updateServings, removeFromCart, clearCart, totalPrice } = useCart()
  const [name,    setName]    = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  async function placeOrder() {
    if (!name.trim() || !address.trim())
      return Alert.alert('Missing info', 'Please enter your name and address')

    setLoading(true)
    try {
      const res = await axios.post(`${API}/orders`, {
        customer_name: name,
        address,
        items: cart.map(i => ({ dish_id: i.dish.id, servings: i.servings }))
      })
      clearCart()
      navigation.replace('Order', { order: res.data })
    } catch {
      Alert.alert('Error', 'Could not place order. Check your connection.')
      setLoading(false)
    }
  }

  if (cart.length === 0) return (
    <View style={s.centered}>
      <Text style={s.emptyText}>Your cart is empty</Text>
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <Text style={s.backBtnText}>Browse dishes</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <ScrollView style={s.container}>
      {cart.map(({ dish, servings }) => (
        <View key={dish.id} style={s.cartRow}>
          <Text style={s.cartEmoji}>{dish.image_url || '🍽️'}</Text>
          <View style={s.cartInfo}>
            <Text style={s.cartName}>{dish.name}</Text>
            <Text style={s.cartPrice}>₹{(dish.price * servings).toFixed(0)}</Text>
          </View>
          <View style={s.qtyRow}>
            <TouchableOpacity style={s.qtyBtn} onPress={() => updateServings(dish.id, servings - 1)}>
              <Text style={s.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={s.qtyNum}>{servings}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={() => updateServings(dish.id, servings + 1)}>
              <Text style={s.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={s.form}>
        <Text style={s.label}>Your name</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="e.g. Ravi Kumar" />

        <Text style={s.label}>Delivery address</Text>
        <TextInput
          style={[s.input, s.textarea]} value={address} onChangeText={setAddress}
          placeholder="e.g. 12 MG Road, Hyderabad" multiline numberOfLines={3}
        />
      </View>

      <View style={s.totalRow}>
        <Text style={s.totalLabel}>{cart.length} dish{cart.length > 1 ? 'es' : ''}</Text>
        <Text style={s.totalAmount}>₹{totalPrice.toFixed(0)}</Text>
      </View>

      <TouchableOpacity style={s.orderBtn} onPress={placeOrder} disabled={loading}>
        <Text style={s.orderBtnText}>
          {loading ? 'Placing order...' : `Place order — ₹${totalPrice.toFixed(0)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { fontSize: 18, color: '#888', marginBottom: 20 },
  backBtn:   { backgroundColor: '#1a1a1a', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  backBtnText: { color: 'white', fontWeight: '700' },

  cartRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 14,
  },
  cartEmoji: { fontSize: 32, marginRight: 12 },
  cartInfo:  { flex: 1 },
  cartName:  { fontSize: 15, fontWeight: '600' },
  cartPrice: { fontSize: 14, color: '#888', marginTop: 2 },

  qtyRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn:    { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f0f0eb', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText:{ fontSize: 18, fontWeight: '700', color: '#333' },
  qtyNum:    { fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },

  form: { backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 15 },
  textarea: { height: 80, textAlignVertical: 'top' },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 12 },
  totalLabel: { fontSize: 15, color: '#888' },
  totalAmount: { fontSize: 26, fontWeight: '700' },

  orderBtn: { backgroundColor: '#1a1a1a', margin: 16, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 40 },
  orderBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
})