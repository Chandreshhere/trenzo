import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {useApp} from '../context/AppContext';
import {formatPrice} from '../data/products';
import Icon from '../components/Icon';

// CartScreen uses Icon component for all visual elements - no emojis

interface Props {
  navigation: any;
}

export default function CartScreen({navigation}: Props) {
  const {state, dispatch, cartTotal, cartItemCount} = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
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
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyIconContainer}>
          <Icon name="shopping-bag" size={36} color={COLORS.midGray} />
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Looks like you haven't added{'\n'}anything to your cart yet
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('HomeTab')}>
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        <Text style={styles.itemCount}>{cartItemCount} items</Text>
      </View>

      <Animated.ScrollView
        style={{opacity: fadeAnim}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartList}>
        {state.cart.map(item => (
          <View key={item.product.id + item.selectedSize} style={styles.cartItem}>
            <Image
              source={{uri: item.product.images[0]}}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemBrand}>{item.product.brand}</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.itemMeta}>
                Size: {item.selectedSize}
              </Text>
              <Text style={styles.itemPrice}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  handleUpdateQuantity(item.product.id, item.quantity - 1)
                }>
                <Icon name="minus" size={14} color={COLORS.charcoal} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  handleUpdateQuantity(item.product.id, item.quantity + 1)
                }>
                <Icon name="plus" size={14} color={COLORS.charcoal} />
              </TouchableOpacity>
            </View>
            {/* Remove button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item.product.id)}>
              <Icon name="x" size={14} color={COLORS.midGray} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Order summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.deliveryRow}>
              <Icon name="truck" size={14} color={COLORS.darkGray} />
              <Text style={styles.summaryLabel}>  Delivery</Text>
            </View>
            <Text style={[styles.summaryValue, styles.freeText]}>FREE</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(cartTotal * 0.08)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatPrice(cartTotal * 1.08)}
            </Text>
          </View>
        </View>

        <View style={{height: 120}} />
      </Animated.ScrollView>

      {/* Bottom checkout bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>
            {formatPrice(cartTotal * 1.08)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          activeOpacity={0.8}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
          <View style={styles.checkoutArrow}>
            <Icon name="arrow-right" size={18} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: SIZES.body,
    color: COLORS.midGray,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: SIZES.radiusFull,
    marginTop: 32,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    letterSpacing: 0.3,
  },
  itemCount: {
    fontSize: SIZES.bodySmall,
    color: COLORS.midGray,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
  },
  // Cart list
  cartList: {
    paddingHorizontal: SIZES.screenPadding,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.cream,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemBrand: {
    fontSize: SIZES.tiny,
    color: COLORS.midGray,
    fontWeight: FONT_WEIGHTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Poppins',
  },
  itemName: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.charcoal,
    marginTop: 2,
    fontFamily: 'Poppins',
  },
  itemMeta: {
    fontSize: SIZES.caption,
    color: COLORS.midGray,
    marginTop: 2,
    fontFamily: 'Poppins',
  },
  itemPrice: {
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    marginTop: 4,
    fontFamily: 'Poppins',
  },
  quantityContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    marginVertical: 4,
    fontFamily: 'Poppins',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Summary
  summaryContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    padding: 20,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.2,
    color: COLORS.black,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: SIZES.bodySmall,
    color: COLORS.darkGray,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  summaryValue: {
    fontSize: SIZES.bodySmall,
    color: COLORS.charcoal,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
  },
  freeText: {
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    fontFamily: 'Poppins',
  },
  totalValue: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    fontFamily: 'Poppins',
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
  },
  bottomTotal: {
    marginRight: 20,
  },
  bottomTotalLabel: {
    fontSize: SIZES.caption,
    color: COLORS.midGray,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  bottomTotalValue: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    fontFamily: 'Poppins',
  },
  checkoutButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
  checkoutArrow: {
    marginLeft: 8,
  },
});
