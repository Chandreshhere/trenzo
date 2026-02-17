import React, {createContext, useContext, useReducer, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Product} from '../data/products';

// Cart item type
export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

// User type
export interface User {
  email: string;
  name: string;
}

// App state
interface AppState {
  cart: CartItem[];
  user: User | null;
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  favorites: string[]; // product IDs
}

// Actions
type Action =
  | {type: 'ADD_TO_CART'; payload: CartItem}
  | {type: 'REMOVE_FROM_CART'; payload: string} // product id
  | {type: 'UPDATE_QUANTITY'; payload: {productId: string; quantity: number}}
  | {type: 'CLEAR_CART'}
  | {type: 'LOGIN'; payload: User}
  | {type: 'LOGOUT'}
  | {type: 'COMPLETE_ONBOARDING'}
  | {type: 'TOGGLE_FAVORITE'; payload: string}
  | {type: 'LOAD_STATE'; payload: Partial<AppState>};

const initialState: AppState = {
  cart: [],
  user: null,
  isLoggedIn: false,
  hasCompletedOnboarding: false,
  favorites: [],
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingIndex = state.cart.findIndex(
        item =>
          item.product.id === action.payload.product.id &&
          item.selectedSize === action.payload.selectedSize,
      );
      if (existingIndex >= 0) {
        const updatedCart = [...state.cart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + action.payload.quantity,
        };
        return {...state, cart: updatedCart};
      }
      return {...state, cart: [...state.cart, action.payload]};
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.product.id !== action.payload),
      };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(
            item => item.product.id !== action.payload.productId,
          ),
        };
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.payload.productId
            ? {...item, quantity: action.payload.quantity}
            : item,
        ),
      };
    }
    case 'CLEAR_CART':
      return {...state, cart: []};
    case 'LOGIN':
      return {...state, user: action.payload, isLoggedIn: true};
    case 'LOGOUT':
      return {...state, user: null, isLoggedIn: false};
    case 'COMPLETE_ONBOARDING':
      return {...state, hasCompletedOnboarding: true};
    case 'TOGGLE_FAVORITE': {
      const isFav = state.favorites.includes(action.payload);
      return {
        ...state,
        favorites: isFav
          ? state.favorites.filter(id => id !== action.payload)
          : [...state.favorites, action.payload],
      };
    }
    case 'LOAD_STATE':
      return {...state, ...action.payload};
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  cartItemCount: number;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = '@trenzo_app_state';

export function AppProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({type: 'LOAD_STATE', payload: parsed});
        }
      } catch (_e) {
        // ignore load errors
      }
    })();
  }, []);

  // Persist state changes
  useEffect(() => {
    const toStore = {
      user: state.user,
      isLoggedIn: state.isLoggedIn,
      hasCompletedOnboarding: state.hasCompletedOnboarding,
      favorites: state.favorites,
      cart: state.cart,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStore)).catch(() => {});
  }, [state.cart, state.user, state.isLoggedIn, state.hasCompletedOnboarding, state.favorites]);

  const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = state.cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <AppContext.Provider value={{state, dispatch, cartItemCount, cartTotal}}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
