import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  StatusBar,
  Modal,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {useApp} from '../context/AppContext';
import {formatPrice} from '../data/products';
import Icon from '../components/Icon';

interface Props {
  navigation: any;
}

export default function CheckoutScreen({navigation}: Props) {
  const {state, dispatch, cartTotal} = useApp();
  const [address, setAddress] = useState('123 Fashion Street, Suite 4');
  const [city, setCity] = useState('New York, NY 10001');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showSuccess, setShowSuccess] = useState(false);

  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const totalWithTax = cartTotal * 1.08;

  const handlePlaceOrder = () => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSuccessDone = () => {
    dispatch({type: 'CLEAR_CART'});
    setShowSuccess(false);
    navigation.navigate('HomeTab');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Icon name="map-pin" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.addressInfo}>
              <TextInput
                style={styles.addressInput}
                value={address}
                onChangeText={setAddress}
                placeholder="Street address"
                placeholderTextColor={COLORS.midGray}
              />
              <TextInput
                style={styles.addressInput}
                value={city}
                onChangeText={setCity}
                placeholder="City, State, ZIP"
                placeholderTextColor={COLORS.midGray}
              />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'card' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('card')}>
            <View style={styles.paymentIconContainer}>
              <Icon name="credit-card" size={20} color={paymentMethod === 'card' ? COLORS.primary : COLORS.charcoal} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Credit/Debit Card</Text>
              <Text style={styles.paymentDetail}>**** **** **** 4242</Text>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === 'card' && styles.radioActive,
              ]}>
              {paymentMethod === 'card' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'apple' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('apple')}>
            <View style={styles.paymentIconContainer}>
              <Icon name="smartphone" size={20} color={paymentMethod === 'apple' ? COLORS.primary : COLORS.charcoal} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Apple Pay</Text>
              <Text style={styles.paymentDetail}>Express checkout</Text>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === 'apple' && styles.radioActive,
              ]}>
              {paymentMethod === 'apple' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('cod')}>
            <View style={styles.paymentIconContainer}>
              <Icon name="dollar-sign" size={20} color={paymentMethod === 'cod' ? COLORS.primary : COLORS.charcoal} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Cash on Delivery</Text>
              <Text style={styles.paymentDetail}>Pay when delivered</Text>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === 'cod' && styles.radioActive,
              ]}>
              {paymentMethod === 'cod' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Order Items ({state.cart.length})
          </Text>
          {state.cart.map(item => (
            <View key={item.product.id} style={styles.orderItem}>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.orderItemQty}>x{item.quantity}</Text>
              <Text style={styles.orderItemPrice}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Price breakdown */}
        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatPrice(cartTotal)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery</Text>
            <Text style={[styles.priceValue, {color: COLORS.success}]}>FREE</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (8%)</Text>
            <Text style={styles.priceValue}>
              {formatPrice(cartTotal * 0.08)}
            </Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalAmount}>{formatPrice(totalWithTax)}</Text>
          </View>
        </View>

        <View style={{height: 120}} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          activeOpacity={0.8}>
          <Text style={styles.placeOrderText}>Place Order</Text>
          <Text style={styles.placeOrderAmount}>
            {formatPrice(totalWithTax)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.successModal,
              {
                opacity: successOpacity,
                transform: [{scale: successScale}],
              },
            ]}>
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={48} color={COLORS.success} />
            </View>
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successSubtitle}>
              Your order has been placed successfully.{'\n'}
              You'll receive a confirmation shortly.
            </Text>
            <Text style={styles.orderId}>
              Order ID: #TRZ{Math.random().toString(36).substring(2, 8).toUpperCase()}
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessDone}>
              <Text style={styles.successButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
  },
  placeholder: {width: 40},
  content: {
    paddingHorizontal: SIZES.screenPadding,
  },
  section: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    marginBottom: 16,
  },
  // Address
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressInput: {
    fontSize: SIZES.bodySmall,
    color: COLORS.charcoal,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    marginBottom: 4,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  // Payment
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    marginBottom: 10,
  },
  paymentOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.charcoal,
    fontFamily: 'Poppins',
  },
  paymentDetail: {
    fontSize: SIZES.caption,
    color: COLORS.midGray,
    marginTop: 2,
    fontFamily: 'Poppins',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  // Order items
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.offWhite,
  },
  orderItemName: {
    flex: 1,
    fontSize: SIZES.bodySmall,
    color: COLORS.charcoal,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  orderItemQty: {
    fontSize: SIZES.caption,
    color: COLORS.midGray,
    marginHorizontal: 12,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
  },
  orderItemPrice: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.black,
    fontFamily: 'Poppins',
  },
  // Price breakdown
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: SIZES.bodySmall,
    color: COLORS.darkGray,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  priceValue: {
    fontSize: SIZES.bodySmall,
    color: COLORS.charcoal,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
  },
  totalDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 10,
  },
  totalText: {
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    fontFamily: 'Poppins',
  },
  totalAmount: {
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
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: SIZES.radiusFull,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
  placeOrderAmount: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    fontFamily: 'Poppins',
  },
  // Success modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusXl,
    padding: 36,
    marginHorizontal: 32,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: SIZES.bodySmall,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  orderId: {
    fontSize: SIZES.caption,
    color: COLORS.midGray,
    marginTop: 16,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
  },
  successButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: SIZES.radiusFull,
    marginTop: 24,
  },
  successButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
});
