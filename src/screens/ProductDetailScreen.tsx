import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated as RNAnimated,
  Dimensions,
  StatusBar,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import ReAnimated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES} from '../utils/theme';
import {Product, PRODUCTS, formatPrice} from '../data/products';
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette} from '../context/GenderPaletteContext';
import GenderGradientBg from '../components/GenderGradientBg';
import BlurView from '../components/BlurFallback';
import Icon from '../components/Icon';

const {width} = Dimensions.get('window');
const IMG_H = width * 1.1;

// ─── Zoomable Image Component ───
function ZoomableImage({uri, w, h}: {uri: string; w: number; h: number}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
        savedScale.value = 3;
      } else {
        savedScale.value = scale.value;
      }
    });

  const pan = Gesture.Pan()
    .onUpdate(e => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <ReAnimated.View style={[{width: w, height: h, overflow: 'hidden'}, animStyle]}>
        <Image source={{uri}} style={{width: w, height: h}} resizeMode="cover" />
      </ReAnimated.View>
    </GestureDetector>
  );
}

// ─── Main Screen ───
interface Props {
  route: any;
  navigation: any;
}

export default function ProductDetailScreen({route, navigation}: Props) {
  const {product} = route.params as {product: Product};
  const {dispatch, state} = useApp();
  const {colors, isDark} = useTheme();
  const {palette: gp, activeGender} = useGenderPalette();
  const accent = isDark ? (activeGender === 'Men' ? '#CDF564' : gp.mid) : gp.mid;
  const accentText = isDark ? '#000' : '#FFF';
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const scaleAnim = useRef(new RNAnimated.Value(1)).current;
  const isFavorite = state.favorites.includes(product.id);

  // Similar products: same category, different product
  const similarProducts = useMemo(() =>
    PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 10),
    [product.id, product.category],
  );

  const handleAddToCart = () => {
    RNAnimated.sequence([
      RNAnimated.timing(scaleAnim, {toValue: 0.9, duration: 100, useNativeDriver: true}),
      RNAnimated.spring(scaleAnim, {toValue: 1, friction: 3, tension: 80, useNativeDriver: true}),
    ]).start();
    dispatch({type: 'ADD_TO_CART', payload: {product, quantity: 1, selectedSize, selectedColor}});
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleFavorite = () => {
    dispatch({type: 'TOGGLE_FAVORITE', payload: product.id});
  };

  const handleImageScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(idx);
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        <GenderGradientBg />
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topButton} onPress={handleToggleFavorite}>
            <Icon
              name="heart"
              size={22}
              color={isFavorite ? '#FF4757' : colors.textSecondary}
              family={isFavorite ? 'ionicons' : 'feather'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Image Carousel — swipable + pinch-to-zoom */}
          <View style={styles.imageSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleImageScroll}
              scrollEventThrottle={16}>
              {product.images.map((image, index) => (
                <ZoomableImage key={index} uri={image} w={width} h={IMG_H} />
              ))}
            </ScrollView>
            <View style={styles.imageDots}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageDot,
                    currentImageIndex === index && [styles.imageDotActive, {backgroundColor: accent}],
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Product Info */}
          <ReAnimated.View
            entering={FadeInUp.delay(150).duration(450).springify()}
            style={styles.infoContainer}>
            <View style={styles.brandRow}>
              <Text style={styles.brand}>{product.brand}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color="#F5A623" family="ionicons" />
                <Text style={styles.rating}>{product.rating}</Text>
                <Text style={styles.reviews}>({product.reviews} reviews)</Text>
              </View>
            </View>

            <Text style={styles.productName}>{product.name}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              {product.originalPrice && (
                <>
                  <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
                  <View style={[styles.saveBadge, {backgroundColor: accent}]}>
                    <Text style={[styles.saveText, {color: accentText}]}>
                      SAVE {formatPrice(product.originalPrice - product.price)}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Delivery info */}
            <View style={styles.deliveryRow}>
              <Icon name="zap" size={16} color={accent} />
              <Text style={styles.deliveryText}>Express delivery in 30 min</Text>
            </View>

            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>

            <Text style={styles.optionTitle}>Size</Text>
            <View style={styles.optionsRow}>
              {product.sizes.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && [styles.sizeButtonActive, {borderColor: accent, backgroundColor: accent}],
                  ]}
                  onPress={() => setSelectedSize(size)}>
                  <Text style={[styles.sizeText, selectedSize === size && {color: accentText}]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.optionTitle}>Color</Text>
            <View style={styles.optionsRow}>
              {product.colors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    {backgroundColor: color},
                    selectedColor === color && [styles.colorButtonActive, {borderColor: accent}],
                  ]}
                  onPress={() => setSelectedColor(color)}>
                  {selectedColor === color && (
                    <Icon name="check" size={14} color={colors.textPrimary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={styles.metaValue}>{product.category}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Type</Text>
                <Text style={styles.metaValue}>{product.subcategory}</Text>
              </View>
            </View>
          </ReAnimated.View>

          {/* Similar Products Carousel */}
          {similarProducts.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.similarTitle}>You May Also Like</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingHorizontal: SIZES.screenPadding, gap: 12}}>
                {similarProducts.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.similarCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.push('ProductDetail', {product: item})}>
                    <Image source={{uri: item.images[0]}} style={styles.similarImage} resizeMode="cover" />
                    <View style={styles.similarInfo}>
                      <Text style={styles.similarBrand}>{item.brand}</Text>
                      <Text style={styles.similarName} numberOfLines={1}>{item.name}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <Text style={styles.similarPrice}>{formatPrice(item.price)}</Text>
                        {item.originalPrice && (
                          <Text style={styles.similarOldPrice}>{formatPrice(item.originalPrice)}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{height: 120}} />
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <BlurView
            blurType={isDark ? 'dark' : 'light'}
            blurAmount={25}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bottomBarInner}>
            <View style={styles.bottomPriceSection}>
              <Text style={styles.bottomPriceLabel}>Total Price</Text>
              <Text style={styles.bottomPrice}>{formatPrice(product.price)}</Text>
            </View>
            <RNAnimated.View style={{transform: [{scale: scaleAnim}], flex: 1}}>
              <TouchableOpacity
                style={[styles.addToCartButton, {backgroundColor: accent}, addedToCart && styles.addedButton]}
                onPress={handleAddToCart}
                activeOpacity={0.8}>
                <View style={styles.addedRow}>
                  <Icon name={addedToCart ? 'check' : 'shopping-bag'} size={18} color={accentText} />
                  <Text style={[styles.addToCartText, {color: accentText}]}>
                    {addedToCart ? ' Added to Cart' : ' Add to Cart'}
                  </Text>
                </View>
              </TouchableOpacity>
            </RNAnimated.View>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    height: IMG_H,
    backgroundColor: colors.glassLight,
  },
  imageDots: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
    marginHorizontal: 4,
  },
  imageDotActive: {
    width: 24,
  },
  infoContainer: {
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 24,
    backgroundColor: colors.background,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    marginTop: -24,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: SIZES.bodySmall,
    color: colors.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Helvetica',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: SIZES.bodySmall,
    color: colors.textPrimary,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Helvetica',
  },
  reviews: {
    fontSize: SIZES.caption,
    color: colors.textTertiary,
    fontFamily: 'Helvetica',
  },
  productName: {
    fontSize: SIZES.h2,
    fontFamily: 'Rondira-Medium',
    fontWeight: FONT_WEIGHTS.bold,
    color: colors.textPrimary,
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    fontSize: SIZES.h3,
    fontWeight: FONT_WEIGHTS.bold,
    color: colors.textPrimary,
    fontFamily: 'Helvetica',
  },
  originalPrice: {
    fontSize: SIZES.body,
    color: colors.textTertiary,
    marginLeft: 10,
    textDecorationLine: 'line-through',
    fontFamily: 'Helvetica',
  },
  saveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  saveText: {
    fontSize: SIZES.tiny,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Helvetica',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: colors.glassLight,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: SIZES.radiusMd,
  },
  deliveryText: {
    fontSize: SIZES.bodySmall,
    color: colors.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Helvetica',
  },
  descriptionTitle: {
    fontSize: SIZES.body,
    fontFamily: 'Rondira-Medium',
    fontWeight: FONT_WEIGHTS.semiBold,
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: SIZES.bodySmall,
    color: colors.textTertiary,
    lineHeight: 22,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Helvetica',
  },
  optionTitle: {
    fontSize: SIZES.body,
    fontFamily: 'Rondira-Medium',
    fontWeight: FONT_WEIGHTS.semiBold,
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sizeButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    borderColor: colors.glassLight,
    backgroundColor: colors.glassLight,
  },
  sizeButtonActive: {},
  sizeText: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.medium,
    color: colors.textPrimary,
    fontFamily: 'Helvetica',
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderWidth: 3,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 24,
  },
  metaItem: {},
  metaLabel: {
    fontSize: SIZES.caption,
    color: colors.textTertiary,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Helvetica',
  },
  metaValue: {
    fontSize: SIZES.bodySmall,
    color: colors.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 2,
    fontFamily: 'Helvetica',
  },
  // Similar Products
  similarSection: {
    marginTop: 32,
    paddingBottom: 8,
  },
  similarTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    color: colors.textPrimary,
    marginBottom: 16,
    paddingHorizontal: SIZES.screenPadding,
  },
  similarCard: {
    width: 150,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
  },
  similarImage: {
    width: 150,
    height: 180,
  },
  similarInfo: {
    padding: 10,
  },
  similarBrand: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  similarName: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    color: colors.textPrimary,
    marginTop: 3,
  },
  similarPrice: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Helvetica',
    color: colors.textPrimary,
    marginTop: 4,
  },
  similarOldPrice: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    overflow: 'hidden',
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  },
  bottomPriceSection: {
    marginRight: 20,
  },
  bottomPriceLabel: {
    fontSize: SIZES.caption,
    color: colors.textTertiary,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Helvetica',
  },
  bottomPrice: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    color: colors.textPrimary,
    fontFamily: 'Helvetica',
  },
  addToCartButton: {
    paddingVertical: 16,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedButton: {
    backgroundColor: COLORS.success,
  },
  addedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Helvetica',
  },
});
