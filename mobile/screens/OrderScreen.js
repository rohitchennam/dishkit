import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'

export default function OrderScreen({ route, navigation }) {
  const { order } = route.params

  return (
    <ScrollView style={s.container}>
      <View style={s.hero}>
        <Text style={s.icon}>✅</Text>
        <Text style={s.title}>Order placed!</Text>
        <Text style={s.sub}>Order #{order.id} is being prepared</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Your order</Text>
        {order.items?.map((item, i) => (
          <View key={i} style={s.itemRow}>
            <Text style={s.itemEmoji}>{item.emoji}</Text>
            <View style={s.itemInfo}>
              <Text style={s.itemName}>{item.dish_name}</Text>
              <Text style={s.itemServings}>{item.servings} serving{item.servings > 1 ? 's' : ''}</Text>
            </View>
            <Text style={s.itemPrice}>₹{(item.price_at_order * item.servings).toFixed(0)}</Text>
          </View>
        ))}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>What you'll receive</Text>
        {order.items?.map((item, i) => (
          <View key={i} style={s.ingGroup}>
            <Text style={s.ingGroupTitle}>{item.emoji} {item.dish_name}</Text>
            {item.ingredients?.map((ing, j) => (
              <View key={j} style={s.ingRow}>
                <Text style={s.ingName}>{ing.name}</Text>
                <Text style={s.ingQty}>
                  {(ing.quantity_per_serving * item.servings).toFixed(0)} {ing.unit}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total paid</Text>
        <Text style={s.totalAmount}>₹{Number(order.total_amount).toFixed(0)}</Text>
      </View>

      <TouchableOpacity style={s.doneBtn} onPress={() => navigation.replace('Home')}>
        <Text style={s.doneBtnText}>Order more dishes</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },
  hero: { backgroundColor: 'white', padding: 32, alignItems: 'center', marginBottom: 12 },
  icon:  { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  sub:   { fontSize: 14, color: '#888' },

  section: { backgroundColor: 'white', margin: 16, marginBottom: 0, borderRadius: 16, padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  itemEmoji: { fontSize: 28, marginRight: 12 },
  itemInfo:  { flex: 1 },
  itemName:  { fontSize: 15, fontWeight: '600' },
  itemServings: { fontSize: 13, color: '#888' },
  itemPrice: { fontSize: 15, fontWeight: '700' },

  ingGroup: { marginBottom: 16 },
  ingGroupTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  ingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f9f9f6' },
  ingName: { fontSize: 13, color: '#444' },
  ingQty:  { fontSize: 13, color: '#888', fontWeight: '600' },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16, marginTop: 20 },
  totalLabel:  { fontSize: 15, color: '#888' },
  totalAmount: { fontSize: 26, fontWeight: '700' },

  doneBtn: { backgroundColor: '#1a1a1a', margin: 16, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 40 },
  doneBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
})