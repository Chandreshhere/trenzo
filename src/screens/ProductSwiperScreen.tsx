import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
  Platform,
  PanResponder,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {Product, PRODUCTS, formatPrice} from '../data/products';
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';
import Icon from '../components/Icon';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const CARD_HORIZONTAL_MARGIN = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const CARD_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.38;
const SNAP_POINT = CARD_WIDTH + 12;
const EXPAND_DRAG_THRESHOLD = 60;
const COLLAPSE_DRAG_THRESHOLD = 80;

interface Props {
  route: any;
  navigation: any;
}

export default function ProductSwiperScreen({route, navigation}: Props) {
  const {product, products: passedProducts} = route.params as {
    product: Product;
    products?: Product[];
  };
  const {dispatch, state} = useApp();
  const {colors, isDark} = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const allProducts: Product[] = passedProducts || PRODUCTS;
  const initialIndex = Math.max(
    0,
    allProducts.findIndex(p => p.id === product.id),
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [expanded, setExpanded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const dragAnim = useRef(new Animated.Value(0)).current;
  const collapseDragAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const expandedScrollRef = useRef<ScrollView>(null);
  const isCollapsingRef = useRef(false);
  const expandCallbackRef = useRef<() => void>(() => {});

  const currentProduct = allProducts[currentIndex] || product;
  const isFavorite = state.favorites.includes(currentProduct.id);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    setSelectedSize(currentProduct.sizes[0]);
    setSelectedColor(currentProduct.colors[0]);
    setCurrentImageIndex(0);
    setAddedToCart(false);
  }, [currentIndex, currentProduct.sizes, currentProduct.colors]);

  const handleExpand = useCallback(() => {
    setExpanded(true);
    dragAnim.setValue(0);
    Animated.spring(expandAnim, {
      toValue: 1,
      friction: 10,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [expandAnim, dragAnim]);

  const handleCollapse = useCallback(() => {
    if (isCollapsingRef.current) {return;}
    isCollapsingRef.current = true;
    collapseDragAnim.setValue(0);
    Animated.spring(expandAnim, {
      toValue: 0,
      friction: 10,
      tension: 60,
      useNativeDriver: true,
    }).start(() => {
      setExpanded(false);
      isCollapsingRef.current = false;
    });
  }, [expandAnim, collapseDragAnim]);

  // Keep refs updated for PanResponder closures
  useEffect(() => {
    expandCallbackRef.current = handleExpand;
  }, [handleExpand]);

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product: currentProduct,
        quantity: 1,
        selectedSize,
        selectedColor,
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleFavorite = () => {
    dispatch({type: 'TOGGLE_FAVORITE', payload: currentProduct.id});
  };

  // PanResponder for the card's info area — detects downward swipe to expand
  const cardPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 12 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.5
        );
      },
      onPanResponderMove: (_, gestureState) => {
        dragAnim.setValue(Math.max(0, gestureState.dy));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > EXPAND_DRAG_THRESHOLD) {
          expandCallbackRef.current();
        } else {
          Animated.spring(dragAnim, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: Array<{index: number | null}>}) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  // Handle expanded scroll — pull down at top to collapse
  const handleExpandedScroll = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    if (offsetY < -COLLAPSE_DRAG_THRESHOLD && !isCollapsingRef.current) {
      handleCollapse();
    }
  };

  // Card drag progress interpolation (subtle scale hint)
  const cardDragScale = dragAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.96],
    extrapolate: 'clamp',
  });

  const renderCardProduct = ({
    item,
    index,
  }: {
    item: Product;
    index: number;
  }) => {
    const isActive = index === currentIndex;
    return (
      <View style={styles.cardWrapper}>
        <Animated.View
          style={[
            styles.cardOuter,
            isActive && {transform: [{scale: cardDragScale}]},
          ]}>
          {/* Top bar inside card */}
          <View style={styles.cardTopBar}>
            <TouchableOpacity
              style={styles.cardTopBtn}
              onPress={() => navigation.goBack()}>
              <Icon name="chevron-down" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.cardTopRight}>
              <TouchableOpacity
                style={styles.cardTopBtn}
                onPress={() =>
                  dispatch({type: 'TOGGLE_FAVORITE', payload: item.id})
                }>
                <Icon
                  name="heart"
                  size={18}
                  color={
                    state.favorites.includes(item.id)
                      ? colors.accentForeground
                      : colors.textTertiary
                  }
                  family={
                    state.favorites.includes(item.id) ? 'ionicons' : 'feather'
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product image */}
          <View style={styles.cardImageWrap}>
            <Image
              source={{uri: item.images[0]}}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>

          {/* Info area below image (with pan responder for drag to expand) */}
          <View
            {...(isActive ? cardPanResponder.panHandlers : {})}
            style={styles.cardInfo}>
            {/* Delivery badge + image dots row */}
            <View style={styles.cardBadgeRow}>
              <View style={styles.deliveryBadge}>
                <Icon name="clock" size={12} color={COLORS.success} family="feather" />
                <Text style={styles.deliveryBadgeText}>30 MINS</Text>
              </View>
              {item.images.length > 1 && (
                <View style={styles.cardDotsRow}>
                  {item.images.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.cardDot,
                        i === 0 && styles.cardDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Product name */}
            <Text style={styles.cardProductName} numberOfLines={1}>
              {item.name}
            </Text>

            {/* Price row */}
            <View style={styles.cardPriceRow}>
              <Text style={styles.cardPrice}>
                {formatPrice(item.price)}
              </Text>
              {item.originalPrice && (
                <>
                  <Text style={styles.cardOrigPrice}>
                    MRP {formatPrice(item.originalPrice)}
                  </Text>
                  <View style={styles.cardDiscountBadge}>
                    <Text style={styles.cardDiscountText}>
                      {item.discount || Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Size chips */}
            <View style={styles.cardSizes}>
              {item.sizes.map(size => (
                <TouchableOpacity
                  key={size}
                  onPress={() => isActive && setSelectedSize(size)}
                  style={[
                    styles.cardSizeChip,
                    isActive &&
                      selectedSize === size &&
                      styles.cardSizeChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.cardSizeText,
                      isActive &&
                        selectedSize === size &&
                        styles.cardSizeTextActive,
                    ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* View product details — tap or drag down */}
            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={handleExpand}
              activeOpacity={0.7}>
              <Text style={styles.viewDetailsBtnText}>
                View product details
              </Text>
              <Icon
                name="chevron-down"
                size={16}
                color={colors.accentForeground}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  // Full-screen expanded detail
  const renderExpandedDetail = () => {
    const translateY = expandAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [SCREEN_HEIGHT, 0],
    });

    return (
      <Animated.View
        style={[
          styles.expandedContainer,
          {transform: [{translateY}]},
        ]}
        pointerEvents={expanded ? 'auto' : 'none'}>
        <ScrollView
          ref={expandedScrollRef}
          showsVerticalScrollIndicator={false}
          bounces={true}
          onScroll={handleExpandedScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.expandedScroll}>
          {/* Pull-down collapse handle */}
          <View style={styles.collapseHandle}>
            <View style={styles.collapseHandleBar} />
          </View>

          {/* Top bar inside expanded card */}
          <View style={styles.expandedTopBar}>
            <TouchableOpacity
              style={styles.expandedTopBtn}
              onPress={handleCollapse}>
              <Icon name="chevron-down" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.expandedTopRight}>
              <TouchableOpacity
                style={styles.expandedTopBtn}
                onPress={handleToggleFavorite}>
                <Icon
                  name="heart"
                  size={18}
                  color={isFavorite ? colors.accentForeground : colors.textTertiary}
                  family={isFavorite ? 'ionicons' : 'feather'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image carousel */}
          <View style={styles.expandedImageSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                );
                setCurrentImageIndex(idx);
              }}>
              {currentProduct.images.map((image, idx) => (
                <Image
                  key={idx}
                  source={{uri: image}}
                  style={styles.expandedImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>

          {/* Badge + dots row */}
          <View style={styles.expandedBadgeRow}>
            <View style={styles.deliveryBadge}>
              <Icon name="clock" size={12} color={COLORS.success} family="feather" />
              <Text style={styles.deliveryBadgeText}>30 MINS</Text>
            </View>
            <View style={styles.cardDotsRow}>
              {currentProduct.images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.expandedDot,
                    currentImageIndex === idx && styles.expandedDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Product info */}
          <View style={styles.expandedInfo}>
            <Text style={styles.expandedName}>{currentProduct.name}</Text>

            <View style={styles.expandedPriceRow}>
              <Text style={styles.expandedPrice}>
                {formatPrice(currentProduct.price)}
              </Text>
              {currentProduct.originalPrice && (
                <>
                  <Text style={styles.expandedOrigPrice}>
                    MRP {formatPrice(currentProduct.originalPrice)}
                  </Text>
                  <View style={styles.cardDiscountBadge}>
                    <Text style={styles.cardDiscountText}>
                      {currentProduct.discount || Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)}% OFF
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Rating */}
            <View style={styles.expandedRatingRow}>
              <Icon name="star" size={14} color="#F5A623" family="ionicons" />
              <Text style={styles.expandedRating}>
                {currentProduct.rating}
              </Text>
              <Text style={styles.expandedReviews}>
                ({currentProduct.reviews} reviews)
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.descText}>
              {currentProduct.description}
            </Text>

            <Text style={styles.optionTitle}>Size</Text>
            <View style={styles.optionsRow}>
              {currentProduct.sizes.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => setSelectedSize(size)}>
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextActive,
                    ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.optionTitle}>Color</Text>
            <View style={styles.optionsRow}>
              {currentProduct.colors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    {backgroundColor: color},
                    selectedColor === color && styles.colorButtonActive,
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
                <Text style={styles.metaValue}>
                  {currentProduct.category}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Type</Text>
                <Text style={styles.metaValue}>
                  {currentProduct.subcategory}
                </Text>
              </View>
            </View>

            <View style={{height: 140}} />
          </View>
        </ScrollView>

        {/* Bottom add to cart bar */}
        <View style={styles.expandedBottomBar}>
          <View style={styles.bottomPriceSection}>
            <Text style={styles.bottomPriceLabel}>Total Price</Text>
            <Text style={styles.bottomPrice}>
              {formatPrice(currentProduct.price)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addToCartBtn, addedToCart && styles.addedBtn]}
            onPress={handleAddToCart}
            activeOpacity={0.8}>
            {addedToCart ? (
              <View style={styles.addedRow}>
                <Icon name="check" size={18} color={COLORS.white} />
                <Text style={styles.addToCartText}> Added!</Text>
              </View>
            ) : (
              <View style={styles.addedRow}>
                <Icon name="shopping-bag" size={18} color={colors.accentText} />
                <Text style={styles.addToCartText}> Add to Cart</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Card swiper */}
      <Animated.View
        style={[styles.swiperContainer, {opacity: fadeAnim}]}
        pointerEvents={expanded ? 'none' : 'auto'}>
        <FlatList
          ref={flatListRef}
          data={allProducts}
          renderItem={renderCardProduct}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_POINT}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: CARD_HORIZONTAL_MARGIN - 6,
          }}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SNAP_POINT,
            offset: SNAP_POINT * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        {/* Product counter */}
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {allProducts.length}
          </Text>
        </View>
      </Animated.View>

      {/* Bottom bar with add to cart */}
      {!expanded && (
        <Animated.View style={[styles.bottomBar, {opacity: fadeAnim}]}>
          <TouchableOpacity
            style={[
              styles.addToCartBottomBtn,
              addedToCart && styles.addedBottomBtn,
            ]}
            onPress={handleAddToCart}
            activeOpacity={0.8}>
            <View style={styles.addToCartBottomInner}>
              <View
                style={[
                  styles.addToCartIconWrap,
                  addedToCart && {backgroundColor: COLORS.success},
                ]}>
                {addedToCart ? (
                  <Icon name="check" size={20} color={COLORS.white} />
                ) : (
                  <Icon
                    name="chevrons-right"
                    size={20}
                    color={colors.accentText}
                  />
                )}
              </View>
              <Text style={styles.addToCartBottomText}>
                {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Expanded detail overlay */}
      {renderExpandedDetail()}
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Swiper
  swiperContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  cardWrapper: {
    width: SNAP_POINT,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  cardOuter: {
    backgroundColor: colors.glassLight,
    borderRadius: 24,
    overflow: 'hidden',
  },
  // Card top bar (inside the card)
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cardTopBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTopRight: {
    flexDirection: 'row',
    gap: 8,
  },
  // Card image
  cardImageWrap: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: colors.glassLight,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  // Card info
  cardInfo: {
    padding: 16,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  deliveryBadgeText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
    fontFamily: FONTS.sans,
  },
  cardDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.glassHeavy,
  },
  cardDotActive: {
    backgroundColor: colors.accent,
    width: 16,
  },
  cardProductName: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: colors.textPrimary,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  cardPrice: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    color: colors.textPrimary,
    fontFamily: FONTS.sans,
  },
  cardOrigPrice: {
    fontSize: SIZES.bodySmall,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
    fontFamily: FONTS.sans,
  },
  cardDiscountBadge: {
    backgroundColor: 'rgba(52,199,89,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardDiscountText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
    fontFamily: FONTS.sans,
  },
  cardSizes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  cardSizeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.glassHeavy,
    backgroundColor: colors.glassLight,
  },
  cardSizeChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  cardSizeText: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.medium,
    color: colors.textTertiary,
    fontFamily: FONTS.sans,
  },
  cardSizeTextActive: {
    color: colors.accentText,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.glassMedium,
  },
  viewDetailsBtnText: {
    fontSize: SIZES.body,
    color: colors.accentForeground,
    fontFamily: FONTS.sans,
    fontWeight: FONT_WEIGHTS.medium,
  },
  navArrow: {
    position: 'absolute',
    top: '45%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowLeft: {
    left: 10,
  },
  navArrowRight: {
    right: 10,
  },
  // Counter
  counter: {
    alignSelf: 'center',
    backgroundColor: colors.glassMedium,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  counterText: {
    fontSize: SIZES.caption,
    color: colors.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: FONTS.sans,
  },
  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 10,
  },
  addToCartBottomBtn: {
    backgroundColor: colors.accent,
    borderRadius: 30,
    height: 58,
    overflow: 'hidden',
  },
  addedBottomBtn: {
    backgroundColor: COLORS.success,
  },
  addToCartBottomInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  addToCartIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accentText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartBottomText: {
    flex: 1,
    textAlign: 'center',
    color: colors.accentText,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: FONTS.sans,
    marginRight: 50,
  },
  // Expanded view
  expandedContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 100,
  },
  collapseHandle: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingBottom: 6,
  },
  collapseHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassHeavy,
  },
  expandedTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  expandedTopBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.glassLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedTopRight: {
    flexDirection: 'row',
    gap: 8,
  },
  expandedScroll: {
    paddingBottom: 100,
  },
  expandedImageSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.0,
    backgroundColor: colors.glassLight,
  },
  expandedImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.0,
  },
  expandedBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  expandedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.glassHeavy,
  },
  expandedDotActive: {
    backgroundColor: colors.accent,
    width: 16,
  },
  expandedInfo: {
    paddingHorizontal: SIZES.screenPadding,
  },
  expandedName: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: colors.textPrimary,
  },
  expandedPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  expandedPrice: {
    fontSize: SIZES.h3,
    fontWeight: FONT_WEIGHTS.bold,
    color: colors.textPrimary,
  },
  expandedOrigPrice: {
    fontSize: SIZES.body,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  expandedRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  expandedRating: {
    fontSize: SIZES.bodySmall,
    color: colors.textPrimary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  expandedReviews: {
    fontSize: SIZES.caption,
    color: colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glassMedium,
    marginVertical: 16,
  },
  descTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  descText: {
    fontSize: SIZES.bodySmall,
    color: colors.textTertiary,
    lineHeight: 22,
  },
  optionTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.serif,
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
    borderColor: colors.glassHeavy,
    backgroundColor: colors.glassLight,
  },
  sizeButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  sizeText: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.medium,
    color: colors.textTertiary,
  },
  sizeTextActive: {
    color: colors.accentText,
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
    borderColor: colors.accent,
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
  },
  metaValue: {
    fontSize: SIZES.bodySmall,
    color: colors.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 2,
  },
  // Expanded bottom bar
  expandedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
  },
  bottomPriceSection: {
    marginRight: 20,
  },
  bottomPriceLabel: {
    fontSize: SIZES.caption,
    color: colors.textTertiary,
  },
  bottomPrice: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    color: colors.textPrimary,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedBtn: {
    backgroundColor: COLORS.success,
  },
  addedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToCartText: {
    color: colors.accentText,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});
