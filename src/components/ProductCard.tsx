import React, {useRef, useEffect, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  Animated,
  ViewStyle,
  Platform,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {Product, PRODUCTS, formatPrice} from '../data/products';
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette, GenderPalette} from '../context/GenderPaletteContext';
import {useHeroTransition} from '../context/HeroTransitionContext';
import Icon from './Icon';

interface Props {
  product: Product;
  onPress?: () => void;
  style?: ViewStyle;
  compact?: boolean;
  allProducts?: Product[];
}

function ProductCard({product, onPress, style, compact, allProducts}: Props) {
  const {state, dispatch} = useApp();
  const {colors, isDark} = useTheme();
  const {activeGender, palette: gp} = useGenderPalette();
  const {openProduct} = useHeroTransition();
  const imageRef = useRef<View>(null);

  const styles = useMemo(() => createStyles(colors, isDark, gp), [colors, isDark, activeGender]);

  // RN Animated values for press + entrance animations
  const pressScale = useRef(new Animated.Value(1)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceScale = useRef(new Animated.Value(0.95)).current;
  const addScale = useRef(new Animated.Value(1)).current;

  const [justAdded, setJustAdded] = useState(false);

  const isFavorite = state.favorites.includes(product.id);
  const cartItem = state.cart.find(i => i.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // Entrance animation — skip on Android to reduce lag
  useEffect(() => {
    if (Platform.OS === 'android') {
      entranceOpacity.setValue(1);
      entranceScale.setValue(1);
      return;
    }
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

  // Press in: scale down with spring (simpler on Android)
  const onPressIn = () => {
    if (Platform.OS === 'android') {
      Animated.timing(pressScale, {toValue: 0.97, duration: 80, useNativeDriver: true}).start();
    } else {
      Animated.spring(pressScale, {toValue: 0.95, friction: 8, tension: 200, useNativeDriver: true}).start();
    }
  };

  // Press out: scale back to 1
  const onPressOut = () => {
    if (Platform.OS === 'android') {
      Animated.timing(pressScale, {toValue: 1, duration: 100, useNativeDriver: true}).start();
    } else {
      Animated.spring(pressScale, {toValue: 1, friction: 6, tension: 150, useNativeDriver: true}).start();
    }
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
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        android_ripple={Platform.OS === 'android' ? {color: 'rgba(0,0,0,0.08)', borderless: false} : undefined}>
        <View ref={imageRef} collapsable={false} style={styles.imageContainer}>
          <Image
            source={{uri: product.images[0]}}
            style={styles.image}
            resizeMode="cover"
            {...(Platform.OS === 'android' ? {fadeDuration: 0} : {})}
          />
          {/* Badges */}
          {product.isNew ? (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          ) : null}
          {/* Favorite */}
          <TouchableOpacity
            style={[styles.favoriteButton, {backgroundColor: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)'}]}
            onPress={handleFavorite}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon
              name={isFavorite ? 'heart' : 'heart'}
              size={14}
              color={isFavorite ? '#FF4757' : 'rgba(0,0,0,0.4)'}
              family={isFavorite ? 'ionicons' : 'feather'}
            />
          </TouchableOpacity>
          {/* Delivery badge */}
          <View style={styles.deliveryBadge}>
            <Icon name="zap" size={10} color={gp.light} />
            <Text style={styles.deliveryBadgeText}>30 min</Text>
          </View>
        </View>
      </Pressable>

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
                  <Icon name="minus" size={12} color={gp.lightest} />
                </TouchableOpacity>
                <Text style={styles.stepperQty}>{quantityInCart}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleUpdateQuantity(quantityInCart + 1)}>
                  <Icon name="plus" size={12} color={gp.lightest} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={handleQuickAdd}>
                {justAdded ? (
                  <Icon name="check" size={16} color={gp.lightest} />
                ) : (
                  <Icon name="plus" size={16} color={gp.lightest} />
                )}
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

export default React.memo(ProductCard);

const createStyles = (colors: any, isDark: boolean, gp: GenderPalette) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? gp.lightest + '15' : '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...(isDark ? {} : {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2}),
  },
  imageContainer: {
    aspectRatio: 0.9,
    backgroundColor: gp.dark,
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
    backgroundColor: gp.mid,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#111111',
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.5,
    fontFamily: FONTS.sans,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: gp.dark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: COLORS.white,
    fontSize: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  deliveryBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    fontFamily: FONTS.sans,
  },
  info: {
    padding: 10,
  },
  brand: {
    fontSize: 10,
    color: isDark ? gp.light : 'rgba(0,0,0,0.5)',
    fontFamily: FONTS.sans,
    fontWeight: FONT_WEIGHTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: {
    fontSize: SIZES.bodySmall,
    color: isDark ? gp.lightest : '#1A1A1A',
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
    color: isDark ? gp.lightest : '#1A1A1A',
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
  },
  originalPrice: {
    fontSize: SIZES.caption,
    color: isDark ? gp.light : 'rgba(0,0,0,0.4)',
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
    color: isDark ? gp.light : 'rgba(0,0,0,0.6)',
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: FONTS.sans,
  },
  reviewCount: {
    fontSize: 10,
    color: isDark ? gp.light : 'rgba(0,0,0,0.45)',
    fontFamily: FONTS.sans,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: gp.mid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: gp.mid,
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
    color: isDark ? gp.lightest : '#FFFFFF',
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    minWidth: 18,
    textAlign: 'center',
  },
});
