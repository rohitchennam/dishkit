import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { CartProvider } from './context/CartContext'
import { registerRootComponent } from 'expo'
import HomeScreen    from './screens/HomeScreen'
import DishScreen    from './screens/DishScreen'
import CartScreen    from './screens/CartScreen'
import OrderScreen   from './screens/OrderScreen'
import HistoryScreen from './screens/HistoryScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <SafeAreaProvider>
        <CartProvider>
            <NavigationContainer>
                <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: '#1a1a1a' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700' },
                }}
                >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'DishKit 🍛' }}
                />
                <Stack.Screen
                    name="Dish"
                    component={DishScreen}
                    options={{ title: 'Dish details' }}
                />
                <Stack.Screen
                    name="Cart"
                    component={CartScreen}
                    options={{ title: 'Your cart' }}
                />
                <Stack.Screen
                    name="Order"
                    component={OrderScreen}
                    options={{ title: 'Order confirmed' }}
                />
                <Stack.Screen
                    name="History"
                    component={HistoryScreen}
                    options={{ title: 'Order history' }}
                />
                </Stack.Navigator>
            </NavigationContainer>
        </CartProvider>
    </SafeAreaProvider>
  )
}


registerRootComponent(App)