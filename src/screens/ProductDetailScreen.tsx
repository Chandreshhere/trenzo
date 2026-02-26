import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import ReAnimated, {FadeInUp, FadeInDown} from 'react-native-reanimated';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {Product, formatPrice} from '../data/products';
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';
import Icon from '../components/Icon';

const {width} = Dimensions.get('window');

interface Props {
  route: any;
  navigation: any;
}

export default function ProductDetailScreen({route, navigation}: Props) {
  const {product} = route.params as {product: Product};
  const {dispatch, state} = useApp();
  const {colors, isDark} = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isFavorite = state.favorites.includes(product.id);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleAddToCart = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        quantity: 1,
        selectedSize,
        selectedColor,
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleFavorite = () => {
    dispatch({type: 'TOGGLE_FAVORITE', payload: product.id});
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={handleToggleFavorite}>
          <Icon
            name={isFavorite ? 'heart' : 'heart'}
            size={22}
            color={isFavorite ? '#FF4757' : colors.textSecondary}
            family={isFavorite ? 'ionicons' : 'feather'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(idx);
            }}>
            {product.images.map((image, index) => (
              <Image
                key={index}
                source={{uri: image}}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.imageDots}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.imageDot,
                  currentImageIndex === index && styles.imageDotActive,
                ]}
              />
            ))}
          </View>
        </View>

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
                <Text style={styles.originalPrice}>
                  {formatPrice(product.originalPrice)}
                </Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>
                    SAVE {formatPrice(product.originalPrice - product.price)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Delivery info */}
          <View style={styles.deliveryRow}>
            <Icon name="zap" size={16} color={colors.accentForeground} />
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
            {product.colors.map(color => (
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
              <Text style={styles.metaValue}>{product.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Type</Text>
              <Text style={styles.metaValue}>{product.subcategory}</Text>
            </View>
          </View>
        </ReAnimated.View>

        <View style={{height: 120}} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceSection}>
          <Text style={styles.bottomPriceLabel}>Total Price</Text>
          <Text style={styles.bottomPrice}>{formatPrice(product.price)}</Text>
        </View>
        <Animated.View style={{transform: [{scale: scaleAnim}], flex: 1}}>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              addedToCart && styles.addedButton,
            ]}
            onPress={handleAddToCart}
            activeOpacity={0.8}>
            {addedToCart ? (
              <View style={styles.addedRow}>
                <Icon name="check" size={18} color={colors.accentText} />
                <Text style={styles.addToCartText}> Added to Cart</Text>
              </View>
            ) : (
              <View style={styles.addedRow}>
                <Icon name="shopping-bag" size={18} color={colors.accentText} />
                <Text style={styles.addToCartText}> Add to Cart</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
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
    height: width * 1.1,
    backgroundColor: colors.glassLight,
  },
  productImage: {
    width,
    height: width * 1.1,
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
    backgroundColor: colors.accent,
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
  },
  reviews: {
    fontSize: SIZES.caption,
    color: colors.textTertiary,
    fontFamily: 'Poppins',
  },
  productName: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.serif,
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
    fontFamily: 'Poppins',
  },
  originalPrice: {
    fontSize: SIZES.body,
    color: colors.textTertiary,
    marginLeft: 10,
    textDecorationLine: 'line-through',
    fontFamily: 'Poppins',
  },
  saveBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  saveText: {
    fontSize: SIZES.tiny,
    color: colors.accentText,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
  },
  descriptionTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.serif,
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
    fontFamily: 'Poppins',
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
    borderColor: colors.glassLight,
    backgroundColor: colors.glassLight,
  },
  sizeButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  sizeText: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.medium,
    color: colors.textPrimary,
    fontFamily: 'Poppins',
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
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  metaValue: {
    fontSize: SIZES.bodySmall,
    color: colors.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 2,
    fontFamily: 'Poppins',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
  },
  bottomPriceSection: {
    marginRight: 20,
  },
  bottomPriceLabel: {
    fontSize: SIZES.caption,
    color: colors.textTertiary,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  bottomPrice: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    color: colors.textPrimary,
    fontFamily: 'Poppins',
  },
  addToCartButton: {
    backgroundColor: colors.accent,
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
    color: colors.accentText,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
});
