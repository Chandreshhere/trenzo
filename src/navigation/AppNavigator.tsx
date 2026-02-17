import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryProductsScreen from '../screens/CategoryProductsScreen';
import CartScreen from '../screens/CartScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import AuthScreen from '../screens/AuthScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ForHerScreen from '../screens/ForHerScreen';
import ForHimScreen from '../screens/ForHimScreen';
import CustomTabBar from '../components/CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="CategoriesTab" component={CategoriesScreen} />
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} />
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="CartTab" component={CartScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {backgroundColor: '#FDF3F3'},
        }}>
        <Stack.Screen name="Main" component={HomeTabs} />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{animation: 'slide_from_bottom'}}
        />
        <Stack.Screen
          name="CategoryProducts"
          component={CategoryProductsScreen}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen
          name="ForHer"
          component={ForHerScreen}
          options={{contentStyle: {backgroundColor: '#FFF5F6'}}}
        />
        <Stack.Screen
          name="ForHim"
          component={ForHimScreen}
          options={{contentStyle: {backgroundColor: '#F4F6FA'}}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
