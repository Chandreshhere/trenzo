import React, {useRef, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import {SIZES} from '../utils/theme';
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette} from '../context/GenderPaletteContext';
import {formatPrice} from '../data/products';
import GenderGradientBg from '../components/GenderGradientBg';
import BlurView from '../components/BlurFallback';
import Icon from '../components/Icon';

const PAD = SIZES.screenPadding;

interface Props {
  navigation: any;
}

export default function CartScreen({navigation}: Props) {
  const {isDark} = useTheme();
  const {palette: gp, activeGender} = useGenderPalette();
  const {state, dispatch, cartTotal, cartItemCount} = useApp();
  const accent = isDark ? (activeGender === 'Men' ? '#CDF564' : gp.mid) : gp.mid;
  const accentText = isDark ? '#000' : '#FFF';

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fadeAnim, {toValue: 1, friction: 10, tension: 50, useNativeDriver: true}).start();
  }, [fadeAnim]);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    dispatch({type: 'UPDATE_QUANTITY', payload: {productId, quantity: newQuantity}});
  };

  const handleRemoveItem = (productId: string) => {
    dispatch({type: 'REMOVE_FROM_CART', payload: productId});
  };

  const handleCheckout = () => {
    if (!state.isLoggedIn) {
      navigation.navigate('Auth', {returnTo: 'Checkout'});
    } else {
      navigation.navigate('Checkout');
    }
  };

  if (state.cart.length === 0) {
    return (
      <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40}}>
        <GenderGradientBg />
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, {position: 'absolute', top: Platform.OS === 'ios' ? 60 : 44, left: PAD}]} activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color={isDark ? '#FFF' : '#1A1A1A'} />
        </TouchableOpacity>
        <View style={[s.emptyIcon, {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}]}>
          <Icon name="shopping-bag" size={36} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} />
        </View>
        <Text style={[s.emptyTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Your cart is empty</Text>
        <Text style={[s.emptyText, {color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}]}>
          Looks like you haven't added{'\n'}anything to your cart yet
        </Text>
        <TouchableOpacity
          style={[s.shopBtn, {backgroundColor: accent}]}
          onPress={() => navigation.navigate('HomeTab')}>
          <Text style={{fontSize: 14, fontWeight: '700', fontFamily: 'Helvetica', color: accentText}}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA'}}>
      <GenderGradientBg />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color={isDark ? '#FFF' : '#1A1A1A'} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Cart</Text>
        <Text style={[s.itemCount, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>{cartItemCount} items</Text>
      </View>

      <Animated.ScrollView
        style={{opacity: fadeAnim, transform: [{translateY: fadeAnim.interpolate({inputRange: [0, 1], outputRange: [20, 0]})}]}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: PAD}}>

        {state.cart.map(item => (
          <View key={item.product.id + item.selectedSize} style={[s.cartItem, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}]}>
            <View>
              <Image
                source={{uri: item.product.images[0]}}
                style={s.itemImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={[s.removeBtn, {backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.45)'}]}
                onPress={() => handleRemoveItem(item.product.id)}>
                <Icon name="x" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={s.itemInfo}>
              <Text style={[s.itemBrand, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>{item.product.brand}</Text>
              <Text style={[s.itemName, {color: isDark ? '#FFF' : '#1A1A1A'}]} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={[s.itemMeta, {color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'}]}>
                Size: {item.selectedSize}
              </Text>
              <Text style={[s.itemPrice, {color: isDark ? '#FFF' : '#1A1A1A'}]}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
            <View style={s.rightCol}>
              <View style={s.quantityContainer}>
                <TouchableOpacity
                  style={[s.qtyBtn, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}]}
                  onPress={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}>
                  <Icon name="minus" size={14} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[s.qtyText, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{item.quantity}</Text>
                <TouchableOpacity
                  style={[s.qtyBtn, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}]}
                  onPress={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}>
                  <Icon name="plus" size={14} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Order summary */}
        <View style={[s.summary, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}]}>
          <Text style={[s.summaryTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Order Summary</Text>
          <View style={s.summaryRow}>
            <Text style={[s.summaryLabel, {color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}]}>Subtotal</Text>
            <Text style={[s.summaryValue, {color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}]}>{formatPrice(cartTotal)}</Text>
          </View>
          <View style={s.summaryRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon name="truck" size={13} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
              <Text style={[s.summaryLabel, {color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}]}>Delivery</Text>
            </View>
            <Text style={{fontSize: 13, fontWeight: '700', fontFamily: 'Helvetica', color: '#34C759'}}>FREE</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={[s.summaryLabel, {color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}]}>Tax</Text>
            <Text style={[s.summaryValue, {color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}]}>{formatPrice(cartTotal * 0.08)}</Text>
          </View>
          <View style={[s.divider, {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}]} />
          <View style={s.summaryRow}>
            <Text style={[s.totalLabel, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Total</Text>
            <Text style={[s.totalValue, {color: accent}]}>{formatPrice(cartTotal * 1.08)}</Text>
          </View>
        </View>

        <View style={{height: 140}} />
      </Animated.ScrollView>

      {/* Bottom checkout bar */}
      <View style={s.bottomBar}>
        <BlurView
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={25}
          style={StyleSheet.absoluteFill}
        />
        <View style={[s.bottomBarInner, {borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}]}>
          <TouchableOpacity
            style={[s.checkoutBtn, {backgroundColor: accent}]}
            onPress={handleCheckout}
            activeOpacity={0.8}>
            <Text style={[s.checkoutText, {color: accentText}]}>Checkout</Text>
            <Text style={[s.checkoutAmount, {color: accentText}]}>{formatPrice(cartTotal * 1.08)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Rondira-Medium',
  },
  itemCount: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Helvetica',
    marginLeft: 'auto',
  },
  // Empty
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    lineHeight: 22,
  },
  shopBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 100,
    marginTop: 28,
  },
  // Cart items
  cartItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemBrand: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Helvetica',
    marginTop: 4,
  },
  rightCol: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    marginVertical: 4,
  },
  // Summary
  summary: {
    borderRadius: 18,
    padding: 20,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Helvetica',
  },
  // Bottom
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  bottomBarInner: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
  },
  checkoutBtn: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  checkoutAmount: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Helvetica',
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
});
