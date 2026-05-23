import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import axios from 'axios'
import { API } from '../constants'

const STATUS_COLOR = {
  PLACED: '#f59e0b', RECEIVED: '#3b82f6', PACKING: '#8b5cf6',
  PACKED: '#06b6d4', READY: '#10b981', OUT_FOR_DELIVERY: '#f97316',
  DELIVERED: '#22c55e', CANCELLED: '#ef4444',
}

export default function HistoryScreen({ navigation }) {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    axios.get(`${API}/orders`)
      .then(res => { setOrders(res.data); setLoading(false) })
  }, [])

  if (loading) return (
    <View style={s.centered}><ActivityIndicator size="large" color="#1a1a1a" /></View>
  )

  return (
    <FlatList
      style={s.container}
      data={orders}
      keyExtractor={o => o.id.toString()}
      ListEmptyComponent={<Text style={s.empty}>No orders yet</Text>}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item: order }) => (
        <TouchableOpacity
          style={s.card}
          onPress={() => setExpanded(expanded === order.id ? null : order.id)}
        >
          <View style={s.cardTop}>
            <View>
              <Text style={s.orderId}>Order #{order.id}</Text>
              {order.items?.map((item, i) => (
                <Text key={i} style={s.dishName}>{item.emoji} {item.dish_name}</Text>
              ))}
            </View>
            <View style={s.cardRight}>
              <View style={[s.statusBadge, { backgroundColor: (STATUS_COLOR[order.status] || '#888') + '22' }]}>
                <Text style={[s.statusText, { color: STATUS_COLOR[order.status] || '#888' }]}>
                  {order.status.replace(/_/g, ' ')}
                </Text>
              </View>
              <Text style={s.amount}>₹{Number(order.total_amount).toFixed(0)}</Text>
              <Text style={s.date}>
                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>

          {expanded === order.id && (
            <View style={s.detail}>
              {order.items?.map((item, i) => (
                <View key={i} style={s.detailItem}>
                  <Text style={s.detailDish}>{item.emoji} {item.dish_name} · {item.servings} serving{item.servings > 1 ? 's' : ''}</Text>
                  {item.ingredients?.map((ing, j) => (
                    <View key={j} style={s.ingRow}>
                      <Text style={s.ingName}>{ing.name}</Text>
                      <Text style={s.ingQty}>{(ing.quantity_per_serving * item.servings).toFixed(0)} {ing.unit}</Text>
                    </View>
                  ))}
                </View>
              ))}
              <Text style={s.address}>📍 {order.address}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:     { textAlign: 'center', color: '#888', marginTop: 60, fontSize: 16 },

  card: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  orderId:  { fontSize: 11, color: '#aaa', marginBottom: 4 },
  dishName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },

  cardRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText:  { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  amount: { fontSize: 18, fontWeight: '700' },
  date:   { fontSize: 11, color: '#aaa' },

  detail: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  detailItem: { marginBottom: 12 },
  detailDish: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  ingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  ingName: { fontSize: 13, color: '#555' },
  ingQty:  { fontSize: 13, color: '#888' },
  address: { fontSize: 13, color: '#888', marginTop: 8 },
})