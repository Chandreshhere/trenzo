import React, {useRef, useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ViewStyle,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {Product, PRODUCTS, formatPrice} from '../data/products';
import {useApp} from '../context/AppContext';
import {useHeroTransition} from '../context/HeroTransitionContext';
import Icon from './Icon';

interface Props {
  product: Product;
  onPress?: () => void;
  style?: ViewStyle;
  compact?: boolean;
  allProducts?: Product[];
}

export default function ProductCard({product, onPress, style, compact, allProducts}: Props) {
  const {state, dispatch} = useApp();
  const {openProduct} = useHeroTransition();
  const imageRef = useRef<View>(null);

  // RN Animated values for press + entrance animations
  const pressScale = useRef(new Animated.Value(1)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceScale = useRef(new Animated.Value(0.95)).current;
  const addScale = useRef(new Animated.Value(1)).current;

  const [justAdded, setJustAdded] = useState(false);

  const isFavorite = state.favorites.includes(product.id);
  const cartItem = state.cart.find(i => i.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(entranceScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entranceOpacity, entranceScale]);

  const handleFavorite = () => {
    dispatch({type: 'TOGGLE_FAVORITE', payload: product.id});
  };

  const handleQuickAdd = () => {
    Animated.sequence([
      Animated.timing(addScale, {toValue: 0.8, duration: 80, useNativeDriver: true}),
      Animated.spring(addScale, {toValue: 1, friction: 4, tension: 100, useNativeDriver: true}),
    ]).start();

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        quantity: 1,
        selectedSize: product.sizes[0],
        selectedColor: product.colors[0],
      },
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleUpdateQuantity = (newQty: number) => {
    dispatch({type: 'UPDATE_QUANTITY', payload: {productId: product.id, quantity: newQty}});
  };

  // Measure image position and open hero transition
  const handlePress = useCallback(() => {
    const productsToPass = allProducts || PRODUCTS;
    if (imageRef.current) {
      imageRef.current.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          openProduct(product, {x, y, width, height}, productsToPass);
        } else {
          openProduct(product, {x: 0, y: 200, width: 200, height: 200}, productsToPass);
        }
      });
    } else {
      openProduct(product, {x: 0, y: 200, width: 200, height: 200}, productsToPass);
    }
  }, [product, openProduct, allProducts]);

  // Press in: scale down with spring
  const onPressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  // Press out: scale back to 1
  const onPressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 6,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  // Combined scale = press * entrance
  const combinedScale = Animated.multiply(pressScale, entranceScale);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: entranceOpacity,
          transform: [{scale: combinedScale}],
        },
      ]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}>
        <View ref={imageRef} collapsable={false} style={styles.imageContainer}>
          <Image
            source={{uri: product.images[0]}}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Badges */}
          {product.discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{product.discount}% OFF</Text>
            </View>
          ) : product.isNew ? (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          ) : null}
          {/* Favorite */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorite}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon
              name={isFavorite ? 'heart' : 'heart'}
              size={14}
              color={isFavorite ? COLORS.primary : COLORS.midGray}
              family={isFavorite ? 'ionicons' : 'feather'}
            />
          </TouchableOpacity>
          {/* Delivery badge */}
          <View style={styles.deliveryBadge}>
            <Icon name="zap" size={10} color={COLORS.primary} />
            <Text style={styles.deliveryBadgeText}>30 min</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.info}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
          </View>
        </TouchableOpacity>
        {/* Rating + Quick Add Row */}
        <View style={styles.bottomRow}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={11} color="#F5A623" family="ionicons" />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviews})</Text>
          </View>
          {/* Quick Add / Quantity Stepper */}
          <Animated.View style={{transform: [{scale: addScale}]}}>
            {quantityInCart > 0 ? (
              <View style={styles.quantityStepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleUpdateQuantity(quantityInCart - 1)}>
                  <Icon name="minus" size={12} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.stepperQty}>{quantityInCart}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleUpdateQuantity(quantityInCart + 1)}>
                  <Icon name="plus" size={12} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={handleQuickAdd}>
                {justAdded ? (
                  <Icon name="check" size={16} color={COLORS.white} />
                ) : (
                  <Icon name="plus" size={16} color={COLORS.white} />
                )}
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
  },
  imageContainer: {
    aspectRatio: 0.9,
    backgroundColor: COLORS.cream,
    overflow: 'hidden',
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.5,
    fontFamily: FONTS.sans,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#1A3B8A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  deliveryBadgeText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.charcoal,
    fontFamily: FONTS.sans,
  },
  info: {
    padding: 10,
  },
  brand: {
    fontSize: 9,
    color: COLORS.midGray,
    fontFamily: FONTS.sans,
    fontWeight: FONT_WEIGHTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: {
    fontSize: SIZES.bodySmall,
    color: COLORS.charcoal,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  price: {
    fontSize: SIZES.body,
    color: COLORS.black,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
  },
  originalPrice: {
    fontSize: SIZES.caption,
    color: COLORS.midGray,
    textDecorationLine: 'line-through',
    fontFamily: FONTS.sans,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.charcoal,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: FONTS.sans,
  },
  reviewCount: {
    fontSize: 10,
    color: COLORS.midGray,
    fontFamily: FONTS.sans,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperQty: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    minWidth: 18,
    textAlign: 'center',
  },
});
