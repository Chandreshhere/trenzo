import React, {useRef, useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  TextInput,
  StatusBar,
  ImageBackground,
  Modal,
  RefreshControl,
  Platform,
} from 'react-native';
import ReAnimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useFrameCallback,
  withRepeat,
  withTiming,
  Easing,
  SensorType,
  useAnimatedSensor,
  runOnJS,
} from 'react-native-reanimated';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES} from '../utils/theme';
import {PRODUCTS, BANNERS, CATEGORIES, BRANDS, Product, formatPrice} from '../data/products';
import {useApp} from '../context/AppContext';
import {useHeroTransition} from '../context/HeroTransitionContext';
import {useTabBar} from '../context/TabBarContext';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette, GENDER_PALETTES} from '../context/GenderPaletteContext';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';
import SearchOverlay from '../components/SearchOverlay';
import AnimatedSection from '../components/AnimatedSection';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BlurView from '../components/BlurFallback';
import Svg, {Defs, ClipPath, Path, Image as SvgImage, Text as SvgText, TextPath, LinearGradient as SvgLinearGradient, Stop} from 'react-native-svg';
import Video from 'react-native-video';

const REEL_VIDEO = require('../../assets/video/v1.mp4');

const HERO_BANNER_IMG = require('../../assets/banner.jpg');
const CAROUSEL_IMAGES_MEN = [
  require('../../assets/images /cur.jpeg'),
  require('../../assets/images /cur2.jpeg'),
  require('../../assets/images /cur3.jpeg'),
  require('../../assets/images /cur4.jpeg'),
];
const CAROUSEL_IMAGES_WOMEN = [
  require('../../assets/images /w.jpeg'),
  require('../../assets/images /w2.jpeg'),
  require('../../assets/images /w3.jpeg'),
  require('../../assets/images /w4.jpeg'),
  require('../../assets/images /w5.jpeg'),
];

const {width, height: screenHeight} = Dimensions.get('window');
// Scale factor relative to iPhone 14 Pro (393pt wide) — keeps layout proportional across devices
const S = width / 393;

// Shoe carousel inside circle — images from babel.config folder
const SHOE_CAROUSEL = [
  {id: 'sc1', image: require('../../assets/images /babel.config/1.png'), brand: 'Nike'},
  {id: 'sc2', image: require('../../assets/images /babel.config/2.png'), brand: 'Adidas'},
  {id: 'sc3', image: require('../../assets/images /babel.config/3.png'), brand: 'Puma'},
  {id: 'sc4', image: require('../../assets/images /babel.config/4.png'), brand: 'Converse'},
  {id: 'sc5', image: require('../../assets/images /babel.config/5.png'), brand: 'Zara'},
];
const SHOE_CIRCLE_TEXT_MEN = 'STEP INTO STYLE  \u2022  SNEAKER DROP  \u2022  FRESH KICKS  \u2022  THE EDIT  \u2022  SOLE CULTURE  \u2022  ';
const SHOE_CIRCLE_TEXT_WOMEN = 'STEP INTO ELEGANCE  \u2022  THE HEEL EDIT  \u2022  SOLE ICONS  \u2022  WALK IN STYLE  \u2022  THE COLLECTION  \u2022  ';
const SHOE_CIRCLE_R = 140;
const SHOE_CIRCLE_SIZE = SHOE_CIRCLE_R * 2 + 50; // 330 — extra padding so text doesn't clip
const SHOE_CIRCLE_LOCAL = SHOE_CIRCLE_SIZE / 2;   // circle center inside that square
const SHOE_CIRCLE_PATH = `M ${SHOE_CIRCLE_LOCAL} ${SHOE_CIRCLE_LOCAL - SHOE_CIRCLE_R} A ${SHOE_CIRCLE_R} ${SHOE_CIRCLE_R} 0 0 1 ${SHOE_CIRCLE_LOCAL} ${SHOE_CIRCLE_LOCAL + SHOE_CIRCLE_R} A ${SHOE_CIRCLE_R} ${SHOE_CIRCLE_R} 0 0 1 ${SHOE_CIRCLE_LOCAL} ${SHOE_CIRCLE_LOCAL - SHOE_CIRCLE_R}`;
const BANNER_CARD_WIDTH = width * 0.65;
const BANNER_SPACING = 2;
const BANNER_SNAP = BANNER_CARD_WIDTH + BANNER_SPACING;
const BANNER_SIDE_PADDING = (width - BANNER_CARD_WIDTH) / 2;
const MEN_BANNER_TEXT = [
  {quote: 'Suit Up,\nStand Out', subtitle: 'Premium menswear essentials', issueTag: 'THE MEN\'S EDIT'},
  {quote: 'Street Ready\nAlways', subtitle: 'Urban styles for every day', issueTag: 'STREET STYLE'},
  {quote: 'Built for\nthe Bold', subtitle: 'New season accessories', issueTag: 'ACCESSORIES DROP'},
  {quote: 'Own the\nSidewalk', subtitle: 'Modern fits, classic edge', issueTag: 'STREET CULTURE'},
  {quote: 'Redefine\nYour Edge', subtitle: 'Luxury picks for him', issueTag: 'LUXE EDITION'},
];
const WOMEN_BANNER_TEXT = [
  {quote: 'Dress the\nMood', subtitle: 'Trending styles for her', issueTag: 'THE WOMEN\'S EDIT'},
  {quote: 'Elegance\nRedefined', subtitle: 'Curated looks for every occasion', issueTag: 'STYLE GUIDE'},
  {quote: 'Shine in\nEvery Detail', subtitle: 'Statement accessories & more', issueTag: 'ACCESSORIES SPECIAL'},
  {quote: 'Bold, Chic\n& Unstoppable', subtitle: 'Street-to-party essentials', issueTag: 'PARTY EDIT'},
  {quote: 'Grace Meets\nGlamour', subtitle: 'Designer picks for her', issueTag: 'LUXE EDITION'},
];
const LOOP_BANNERS = [
  {...BANNERS[BANNERS.length - 1], id: 'clone-last'},
  ...BANNERS,
  {...BANNERS[0], id: 'clone-first'},
];


// Hero banner clip path dimensions
const HERO_W = width - (SIZES.screenPadding * 2);
const HERO_H = 160;
const HERO_R = 22; // corner radius

// Static data for Style Occasions
const OCCASION_MEN_IMGS = [
  require('../../assets/images /Untitled design 3/men/1.png'),
  require('../../assets/images /Untitled design 3/men/2.png'),
  require('../../assets/images /Untitled design 3/men/3.png'),
  require('../../assets/images /Untitled design 3/men/4.png'),
  require('../../assets/images /Untitled design 3/men/5.png'),
  require('../../assets/images /Untitled design 3/men/6.png'),
  require('../../assets/images /Untitled design 3/men/7.png'),
  require('../../assets/images /Untitled design 3/men/8.png'),
  require('../../assets/images /Untitled design 3/men/9.png'),
  require('../../assets/images /Untitled design 3/men/10.png'),
  require('../../assets/images /Untitled design 3/men/11.png'),
  require('../../assets/images /Untitled design 3/men/12.png'),
];
const OCCASION_WOMEN_IMGS = [
  require('../../assets/images /Untitled design 3/1.png'),
  require('../../assets/images /Untitled design 3/2.png'),
  require('../../assets/images /Untitled design 3/3.png'),
  require('../../assets/images /Untitled design 3/4.png'),
  require('../../assets/images /Untitled design 3/5.png'),
  require('../../assets/images /Untitled design 3/6.png'),
  require('../../assets/images /Untitled design 3/7.png'),
  require('../../assets/images /Untitled design 3/8.png'),
  require('../../assets/images /Untitled design 3/9.png'),
  require('../../assets/images /Untitled design 3/10.png'),
  require('../../assets/images /Untitled design 3/11.png'),
  require('../../assets/images /Untitled design 3/12.png'),
];
const OCCASIONS = [
  {id: 'oc1', label: 'STREET'},
  {id: 'oc2', label: 'NIGHT OUT'},
  {id: 'oc3', label: 'WEDDING'},
  {id: 'oc4', label: 'OFFICE'},
  {id: 'oc5', label: 'BRUNCH'},
  {id: 'oc6', label: 'VACATION'},
  {id: 'oc7', label: 'GYM'},
  {id: 'oc8', label: 'DATE NIGHT'},
  {id: 'oc9', label: 'FESTIVAL'},
  {id: 'oc10', label: 'CASUAL'},
  {id: 'oc11', label: 'FORMAL'},
  {id: 'oc12', label: 'COCKTAIL'},
];

// 3D Stacked Card Deck
// Watch Bento Grid
const WATCH_IMG = require('../../assets/images /Untitled design/watchs.png');
const WATCH_GRID_GAP = 8;
const WATCH_GRID_W = width - SIZES.screenPadding * 2;
const WATCH_R = 18;

// Reels 3D Carousel
const REEL_CARD_WIDTH = width * 0.52;
const REEL_CARD_HEIGHT = REEL_CARD_WIDTH * 1.5;
const REEL_SNAP = REEL_CARD_WIDTH;
const REEL_SIDE_PADDING = (width - REEL_CARD_WIDTH) / 2;

const REELS_MEN = [
  {id: 'rm1', title: 'Street Style Drop', creator: '@stylevault', thumbnail: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=700', video: REEL_VIDEO},
  {id: 'rm2', title: 'Sneaker Unboxing', creator: '@kicksculture', thumbnail: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=700', video: REEL_VIDEO},
  {id: 'rm3', title: 'Summer Fits 2026', creator: '@trenzoofficial', thumbnail: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&h=700', video: REEL_VIDEO},
  {id: 'rm4', title: 'Layer Like a Pro', creator: '@urbanedge', thumbnail: 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=400&h=700', video: REEL_VIDEO},
  {id: 'rm5', title: 'Minimal Menswear', creator: '@cleanfits', thumbnail: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=700', video: REEL_VIDEO},
  {id: 'rm6', title: 'Suit Styling Tips', creator: '@dapperdan', thumbnail: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=700', video: REEL_VIDEO},
  {id: 'rm7', title: 'Weekend Casuals', creator: '@effortlessman', thumbnail: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&h=700', video: REEL_VIDEO},
];

const REELS_WOMEN = [
  {id: 'rw1', title: 'Date Night Looks', creator: '@glowup', thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=700', video: REEL_VIDEO},
  {id: 'rw2', title: 'Resort Wear Edit', creator: '@vacayvibes', thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=700', video: REEL_VIDEO},
  {id: 'rw3', title: 'OOTD Inspo', creator: '@trenzoofficial', thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=700', video: REEL_VIDEO},
  {id: 'rw4', title: 'Party Edit', creator: '@glamqueen', thumbnail: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=700', video: REEL_VIDEO},
  {id: 'rw5', title: 'Boho Chic Vibes', creator: '@bohobabe', thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=700', video: REEL_VIDEO},
  {id: 'rw6', title: 'Office to Evening', creator: '@powerdresser', thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=700', video: REEL_VIDEO},
  {id: 'rw7', title: 'Brunch Ready', creator: '@stylebrunch', thumbnail: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&h=700', video: REEL_VIDEO},
];

// Infinite loop: clone last 2 at start, first 2 at end
const makeLoopReels = (arr: typeof REELS_MEN) => [
  {...arr[arr.length - 2], id: 'clone-pre2'},
  {...arr[arr.length - 1], id: 'clone-pre1'},
  ...arr,
  {...arr[0], id: 'clone-post1'},
  {...arr[1], id: 'clone-post2'},
];

// Pre-compute grain dots once (subtle film grain texture)
const GRAIN_DOTS = Array.from({length: 80}, (_, i) => ({
  key: `g${i}`,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 1 + Math.random() * 1.5,
  opacity: 0.03 + Math.random() * 0.07,
}));

const GrainOverlay = React.memo(() => {
  // Skip grain on Android — 80 absolutely positioned Views kills perf
  if (Platform.OS === 'android') return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {GRAIN_DOTS.map(d => (
        <View
          key={d.key}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            borderRadius: d.size / 2,
            backgroundColor: '#FFFFFF',
            opacity: d.opacity,
          }}
        />
      ))}
    </View>
  );
});

interface Props {
  navigation: any;
}

export default function HomeScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {cartItemCount, cartTotal, state, dispatch} = useApp();
  const {openProduct} = useHeroTransition();
  const {tabBarTranslateY} = useTabBar();
  const {colors, isDark, toggleTheme} = useTheme();
  const {activeGender, palette: genderPalette, setActiveGender, genderMix, animatedColors} = useGenderPalette();
  const genderProducts = activeGender === 'Men'
    ? PRODUCTS.filter(p => p.gender === 'men' || p.gender === 'unisex')
    : PRODUCTS.filter(p => p.gender === 'women' || p.gender === 'unisex');
  const styles = useMemo(() => createStyles(colors, isDark, genderPalette), [colors, isDark, activeGender]);

  // Quick add to cart — works for both full Product objects and inline data
  const quickAddToCart = useCallback((item: any) => {
    // If it's a full Product (has sizes array), use it directly
    const product: Product = item.sizes ? item : {
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      description: item.name,
      category: 'General',
      subcategory: 'General',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black'],
      images: [item.image || item.images?.[0] || ''],
      rating: item.rating || 4.5,
      reviews: item.reviews || 0,
      isFeatured: false,
      isNew: false,
      discount: item.discount,
      gender: activeGender === 'Men' ? 'men' : 'women',
    };
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        quantity: 1,
        selectedSize: product.sizes[1] || product.sizes[0],
        selectedColor: product.colors[0],
      },
    });
  }, [dispatch, activeGender]);

  // Navigate to product detail — finds real product or builds one from inline data
  const goToProduct = useCallback((item: any) => {
    if (item.sizes) {
      navigation.navigate('ProductDetail', {product: item});
      return;
    }
    // Try to find matching real product by name+brand
    const real = PRODUCTS.find(p => p.name === item.name && p.brand === item.brand);
    if (real) {
      navigation.navigate('ProductDetail', {product: real});
      return;
    }
    // Build a product object from inline data
    const product: Product = {
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      description: item.name,
      category: 'General',
      subcategory: 'General',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#2C2C2C'],
      images: [item.image || item.images?.[0] || ''],
      rating: item.rating || 4.5,
      reviews: item.reviews || 0,
      discount: item.discount,
      gender: activeGender === 'Men' ? 'men' : 'women',
    };
    navigation.navigate('ProductDetail', {product});
  }, [navigation, activeGender]);

  // Theme-aware colors
  const T = useMemo(() => ({
    bg: isDark ? '#000000' : '#FAFAFA',
    bgCard: isDark ? '#0A0A14' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSec: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)',
    textTer: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)',
    border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    borderLight: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
    glass: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
    glassBorder: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
    blurType: (isDark ? 'dark' : 'light') as 'dark' | 'light',
    overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)',
    overlayLight: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)',
    gradientTop: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.6)',
    iconColor: isDark ? genderPalette.lightest : '#1A1A1A',
    chipBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    chipBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    chipText: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
  }), [isDark, genderPalette]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchOverlayVisible, setSearchOverlayVisible] = useState(false);
  const searchOverlayProgress = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholderFade = useRef(new Animated.Value(1)).current;
  const placeholderSlide = useRef(new Animated.Value(0)).current;
  const searchPlaceholders = ['brands', 'products', 'categories', 'deals', 'trending'];
  const [refreshing, setRefreshing] = useState(false);
  const [photoSearchModal, setPhotoSearchModal] = useState(false);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerScrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const floatingCartAnim = useRef(new Animated.Value(0)).current;
  const lastScrollYRef = useRef(0);
  const isTabBarHidden = useRef(false);
  const scrollY = useSharedValue(0);
  const exploreSectionY = useSharedValue(0);

  // Reels 3D carousel
  const reelsScrollX = useRef(new Animated.Value(0)).current;
  const reelsScrollRef = useRef<ScrollView>(null);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // Shoe circle continuous rotation — frame-driven, never resets
  const shoeCircleRot = useSharedValue(0);
  useFrameCallback((info) => {
    'worklet';
    if (_isAndroid) return; // Skip on Android — use simple withRepeat instead
    const dt = info.timeSincePreviousFrame ?? 16;
    shoeCircleRot.value = (shoeCircleRot.value + dt * 0.018) % 360;
  });
  // Android: use a simple withRepeat rotation instead of frame callback
  useEffect(() => {
    if (Platform.OS === 'android') {
      shoeCircleRot.value = withRepeat(
        withTiming(360, {duration: 20000, easing: Easing.linear}),
        -1,
        false,
      );
    }
  }, []);
  const shoeCircleAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {perspective: 600},
      {rotateX: '30deg'},
      {rotate: `${shoeCircleRot.value}deg`},
    ],
  }));

  // Bouncing ball — runs entirely on UI thread via Reanimated
  const BALL_R = 12;
  const ballW = width - SIZES.screenPadding * 2;
  const ballH = 220;
  const ballCutW = ballW * 0.65;
  const ballCutY = ballH * 0.30;
  const ballX = useSharedValue(ballW * 0.7);
  const ballY = useSharedValue(ballH - BALL_R);
  const ballVX = useSharedValue(0);
  const ballVY = useSharedValue(0);
  const ballAX = useSharedValue(0);
  const ballAY = useSharedValue(0);

  // Real device accelerometer + physics tick — single frame callback for performance
  // On Android, skip sensor + physics to save CPU (runs every frame)
  const _isAndroid = Platform.OS === 'android';
  // On Android: read sensor at lower rate, run physics every other frame
  const animatedSensor = useAnimatedSensor(SensorType.ACCELEROMETER, {interval: _isAndroid ? 50 : 32});
  const ballFrameSkip = useSharedValue(0);
  useFrameCallback(() => {
    'worklet';
    // On Android, run physics every 2nd frame to save CPU
    if (_isAndroid) {
      ballFrameSkip.value = (ballFrameSkip.value + 1) % 2;
      if (ballFrameSkip.value !== 0) return;
    }
    // Read sensor
    const data = animatedSensor.sensor.value;
    if (data) {
      const ax = _isAndroid ? -data.x : data.x;
      const ay = data.y;
      ballAX.value = ax * 1.3;
      ballAY.value = -(ay + 0.5) * 2.2;
    }

    // Physics tick
    const r = BALL_R;
    const w = ballW;
    const h = ballH;
    const cutW = ballCutW;
    const cutY = ballCutY;
    const BF = 0.82;
    const FR = 0.98;

    let vx = (ballVX.value + ballAX.value * 0.2) * FR;
    let vy = (ballVY.value + ballAY.value * 0.2 + 0.12) * FR;
    let x = ballX.value + vx;
    let y = ballY.value + vy;

    if (y + r > h) { y = h - r; vy = -Math.abs(vy) * BF; }
    if (y - r < 0 && x >= cutW) { y = r; vy = Math.abs(vy) * BF; }
    if (x + r > w) { x = w - r; vx = -Math.abs(vx) * BF; }
    if (x - r < 0 && y >= cutY) { x = r; vx = Math.abs(vx) * BF; }
    if (x < cutW && y < cutY + r && y > cutY - r && vy < 0) { y = cutY + r; vy = Math.abs(vy) * BF; }
    if (y < cutY && x < cutW + r && x > cutW - r && vx < 0) { x = cutW + r; vx = Math.abs(vx) * BF; }

    ballVX.value = vx;
    ballVY.value = vy;
    ballX.value = x;
    ballY.value = y;
  });

  const ballAnimStyle = useAnimatedStyle(() => ({
    transform: [{translateX: ballX.value - BALL_R}, {translateY: ballY.value - BALL_R}],
  }));
  // Glitch animation for the "X" — chromatic aberration / TV glitch
  const glitchRedX = useRef(new Animated.Value(0)).current;
  const glitchCyanX = useRef(new Animated.Value(0)).current;
  const glitchRedOpacity = useRef(new Animated.Value(0)).current;
  const glitchCyanOpacity = useRef(new Animated.Value(0)).current;
  const glitchMainOpacity = useRef(new Animated.Value(1)).current;
  const glitchAlive = useRef(true);
  useEffect(() => {
    // Skip glitch on Android — constant setTimeout + Animated.parallel loops kill JS thread
    if (Platform.OS === 'android') return;
    glitchAlive.current = true;
    const runGlitch = () => {
      if (!glitchAlive.current) return;
      const burstCount = 3 + Math.floor(Math.random() * 4);
      let step = 0;
      const glitchStep = () => {
        if (!glitchAlive.current) return;
        const splitR = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 3);
        const splitC = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 3);
        const mainFlicker = Math.random() > 0.4 ? 1 : 0.2;
        Animated.parallel([
          Animated.timing(glitchRedX, {toValue: splitR, duration: 25, useNativeDriver: true}),
          Animated.timing(glitchCyanX, {toValue: splitC, duration: 25, useNativeDriver: true}),
          Animated.timing(glitchRedOpacity, {toValue: 0.6 + Math.random() * 0.4, duration: 20, useNativeDriver: true}),
          Animated.timing(glitchCyanOpacity, {toValue: 0.6 + Math.random() * 0.4, duration: 20, useNativeDriver: true}),
          Animated.timing(glitchMainOpacity, {toValue: mainFlicker, duration: 15, useNativeDriver: true}),
        ]).start(() => {
          step++;
          if (step < burstCount) {
            setTimeout(glitchStep, 40 + Math.random() * 80);
          } else {
            Animated.parallel([
              Animated.timing(glitchRedX, {toValue: 0, duration: 40, useNativeDriver: true}),
              Animated.timing(glitchCyanX, {toValue: 0, duration: 40, useNativeDriver: true}),
              Animated.timing(glitchRedOpacity, {toValue: 0, duration: 40, useNativeDriver: true}),
              Animated.timing(glitchCyanOpacity, {toValue: 0, duration: 40, useNativeDriver: true}),
              Animated.timing(glitchMainOpacity, {toValue: 1, duration: 40, useNativeDriver: true}),
            ]).start(() => {
              if (glitchAlive.current) setTimeout(runGlitch, 3000 + Math.random() * 4000);
            });
          }
        });
      };
      glitchStep();
    };
    const t = setTimeout(runGlitch, 2000);
    return () => { glitchAlive.current = false; clearTimeout(t); };
  }, []);

  const [exploreSearchQuery, setExploreSearchQuery] = useState('');
  const [exploreFilter, setExploreFilter] = useState('All');
  const [commOccIdx, setCommOccIdx] = useState(0);


  const handleTabBarScroll = useCallback((y: number) => {
    const isDown = y > lastScrollYRef.current;
    if (isDown && y > 60 && !isTabBarHidden.current) {
      isTabBarHidden.current = true;
      Animated.timing(tabBarTranslateY, {
        toValue: 160,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (!isDown && isTabBarHidden.current) {
      isTabBarHidden.current = false;
      Animated.timing(tabBarTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    lastScrollYRef.current = y;
  }, [tabBarTranslateY]);

  const reanimatedScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
      runOnJS(handleTabBarScroll)(event.contentOffset.y);
    },
  });

  const filteredProducts = searchQuery
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : PRODUCTS;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 500, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 500, useNativeDriver: true}),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    setTimeout(() => {
      bannerScrollRef.current?.scrollTo({x: BANNER_SNAP, animated: false});
    }, 100);
  }, []);

  const bannerIdxRef = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (bannerIdxRef.current + 1) % BANNERS.length;
      bannerIdxRef.current = next;
      if (next === 0) {
        const cloneIdx = LOOP_BANNERS.length - 1;
        bannerScrollRef.current?.scrollTo({x: cloneIdx * BANNER_SNAP, animated: true});
        setTimeout(() => {
          bannerScrollRef.current?.scrollTo({x: BANNER_SNAP, animated: false});
        }, 450);
      } else {
        bannerScrollRef.current?.scrollTo({x: (next + 1) * BANNER_SNAP, animated: true});
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.spring(floatingCartAnim, {
      toValue: cartItemCount > 0 ? 1 : 0,
      friction: 8, tension: 60, useNativeDriver: true,
    }).start();
  }, [cartItemCount, floatingCartAnim]);

  useEffect(() => {
    if (searchQuery || searchFocused || searchOverlayVisible) return;
    // Longer interval on Android to reduce JS thread work
    const intervalMs = Platform.OS === 'android' ? 4000 : 2000;
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(placeholderFade, {toValue: 0, duration: 300, useNativeDriver: true}),
        Animated.timing(placeholderSlide, {toValue: -10, duration: 300, useNativeDriver: true}),
      ]).start(() => {
        setPlaceholderIndex(prev => (prev + 1) % searchPlaceholders.length);
        placeholderSlide.setValue(10);
        Animated.parallel([
          Animated.timing(placeholderFade, {toValue: 1, duration: 300, useNativeDriver: true}),
          Animated.timing(placeholderSlide, {toValue: 0, duration: 300, useNativeDriver: true}),
        ]).start();
      });
    }, intervalMs);
    return () => clearInterval(interval);
  }, [searchQuery, searchFocused, searchOverlayVisible, placeholderFade, placeholderSlide, searchPlaceholders.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const openSearchOverlay = useCallback(() => {
    setSearchOverlayVisible(true);
    Animated.timing(searchOverlayProgress, {
      toValue: 1, duration: 350, useNativeDriver: false,
    }).start();
    Animated.timing(tabBarTranslateY, {
      toValue: 160, duration: 250, useNativeDriver: true,
    }).start();
  }, [searchOverlayProgress, tabBarTranslateY]);

  const closeSearchOverlay = useCallback(() => {
    setSearchQuery('');
    Animated.timing(searchOverlayProgress, {
      toValue: 0, duration: 300, useNativeDriver: false,
    }).start(() => {
      setSearchOverlayVisible(false);
    });
    Animated.timing(tabBarTranslateY, {
      toValue: 0, duration: 250, useNativeDriver: true,
    }).start();
  }, [searchOverlayProgress, tabBarTranslateY]);

  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    closeSearchOverlay();
    setSearchQuery('');
    navigation.navigate('CategoryProducts', {
      categoryName: `"${trimmed}"`,
      products: PRODUCTS.filter(
        (p: Product) =>
          p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          p.brand.toLowerCase().includes(trimmed.toLowerCase()) ||
          p.category.toLowerCase().includes(trimmed.toLowerCase()),
      ),
    });
  }, [searchQuery, closeSearchOverlay, navigation]);

  const handleBannerScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const idx = Math.round(x / BANNER_SNAP);
    if (idx <= 0) {
      bannerScrollRef.current?.scrollTo({x: BANNERS.length * BANNER_SNAP, animated: false});
      bannerIdxRef.current = BANNERS.length - 1;
    } else if (idx >= LOOP_BANNERS.length - 1) {
      bannerScrollRef.current?.scrollTo({x: BANNER_SNAP, animated: false});
      bannerIdxRef.current = 0;
    } else {
      bannerIdxRef.current = idx - 1;
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    navigation.navigate('CategoryDetail', {categoryType: categoryName});
  };

  const handleSeeAll = (title: string, _products: Product[]) => {
    navigation.navigate('CategoryDetail', {categoryType: title});
  };

  const handleBrandPress = (brandName: string) => {
    navigation.navigate('CategoryDetail', {categoryType: brandName});
  };

  // Gender switch line animation
  const genderLineHim = useRef(new Animated.Value(activeGender === 'Men' ? 1 : 0)).current;
  const genderLineHer = useRef(new Animated.Value(activeGender === 'Women' ? 1 : 0)).current;

  const handleGenderCard = (gender: 'Men' | 'Women') => {
    setActiveGender(gender);
    const dur = Platform.OS === 'android' ? 250 : 500;
    Animated.parallel([
      Animated.timing(genderLineHim, {toValue: gender === 'Men' ? 1 : 0, duration: dur, useNativeDriver: true}),
      Animated.timing(genderLineHer, {toValue: gender === 'Women' ? 1 : 0, duration: dur, useNativeDriver: true}),
    ]).start();
  };

  // --- RENDER HELPERS ---

  const renderBanner = (banner: typeof BANNERS[0], loopIndex: number) => {
    const inputRange = [
      (loopIndex - 1) * BANNER_SNAP,
      loopIndex * BANNER_SNAP,
      (loopIndex + 1) * BANNER_SNAP,
    ];
    const scale = bannerScrollX.interpolate({inputRange, outputRange: [0.82, 1, 0.82], extrapolate: 'clamp'});
    const cardOpacity = bannerScrollX.interpolate({inputRange, outputRange: [0.5, 1, 0.5], extrapolate: 'clamp'});
    const translateX = bannerScrollX.interpolate({inputRange, outputRange: [-15, 0, 15], extrapolate: 'clamp'});

    return (
      <Animated.View key={`${banner.id}-${loopIndex}`} style={{width: BANNER_CARD_WIDTH, marginRight: BANNER_SPACING, transform: [{scale}, {translateX}], opacity: cardOpacity}}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.bannerCard, {backgroundColor: banner.color}]}
          onPress={() => {
            navigation.navigate('CategoryDetail', {categoryType: 'Trending'});
          }}>
          <Image source={(activeGender === 'Women' ? CAROUSEL_IMAGES_WOMEN : CAROUSEL_IMAGES_MEN)[((loopIndex - 1 + BANNERS.length) % BANNERS.length) % (activeGender === 'Women' ? CAROUSEL_IMAGES_WOMEN : CAROUSEL_IMAGES_MEN).length]} style={styles.bannerBgImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.65)']}
            locations={[0, 0.4, 1]}
            style={styles.bannerGradientOverlay}>
            {banner.season && (
              <View style={styles.magHeader}>
                <View style={styles.magSeasonBadge}>
                  <Text style={styles.magSeasonText}>{banner.season}</Text>
                </View>
              </View>
            )}
            <Text style={styles.magIssueTag}>{(activeGender === 'Women' ? WOMEN_BANNER_TEXT : MEN_BANNER_TEXT)[((loopIndex - 1 + BANNERS.length) % BANNERS.length) % (activeGender === 'Women' ? WOMEN_BANNER_TEXT : MEN_BANNER_TEXT).length].issueTag}</Text>
            <View style={styles.magBottom}>
              <Text style={styles.magQuote} numberOfLines={2}>{(activeGender === 'Women' ? WOMEN_BANNER_TEXT : MEN_BANNER_TEXT)[((loopIndex - 1 + BANNERS.length) % BANNERS.length) % (activeGender === 'Women' ? WOMEN_BANNER_TEXT : MEN_BANNER_TEXT).length].quote}</Text>
              <Text style={styles.magSubtitle}>{(activeGender === 'Women' ? WOMEN_BANNER_TEXT : MEN_BANNER_TEXT)[((loopIndex - 1 + BANNERS.length) % BANNERS.length) % (activeGender === 'Women' ? WOMEN_BANNER_TEXT : MEN_BANNER_TEXT).length].subtitle}</Text>
              <View style={styles.magShopBtn}>
                <Text style={styles.magShopBtnText}>SHOP NOW</Text>
                <Icon name="arrow-right" size={12} color={activeGender === 'Men' ? '#000' : COLORS.white} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const heroClipPath = useMemo(() => {
    const w = HERO_W;
    const h = HERO_H;
    const r = HERO_R;
    const stepX = w * 0.56;   // where the step/notch begins horizontally
    const stepY = 39;          // fixed so top stays same, only bottom grows
    const curve = 28;         // smooth concave curve radius at the step
    // Shape: full height left side, then at stepX the top drops to stepY via a smooth inward curve
    return [
      `M ${r} 0`,                                         // start after top-left radius
      `L ${stepX - curve} 0`,                              // top edge to just before step
      `C ${stepX} 0 ${stepX} ${stepY} ${stepX + curve} ${stepY}`, // smooth concave curve dropping down
      `L ${w - r} ${stepY}`,                               // top edge of right (lower) portion
      `Q ${w} ${stepY} ${w} ${stepY + r}`,                // top-right rounded corner
      `L ${w} ${h - r}`,                                   // right edge down
      `Q ${w} ${h} ${w - r} ${h}`,                        // bottom-right corner
      `L ${r} ${h}`,                                       // bottom edge
      `Q 0 ${h} 0 ${h - r}`,                              // bottom-left corner
      `L 0 ${r}`,                                          // left edge up
      `Q 0 0 ${r} 0`,                                     // top-left corner
      'Z',
    ].join(' ');
  }, []);

  const renderHeroBanner = () => (
    <View style={styles.heroBannerWrap}>
      {/* Banner with SVG clip — diagonal top-right cut */}
      <Svg width={HERO_W} height={HERO_H}>
        <Defs>
          <ClipPath id="heroBannerClip">
            <Path d={heroClipPath} />
          </ClipPath>
        </Defs>
        <SvgImage
          href={HERO_BANNER_IMG}
          width={HERO_W}
          height={HERO_H}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#heroBannerClip)"
        />
      </Svg>
      {/* ClosetX sits in the cropped cut-out area top-right */}
      <View style={styles.closetXRow}>
        <Animated.Text style={[styles.closetXText, isDark ? {color: animatedColors.lightest} : {}]}>Closet</Animated.Text>
        <Animated.View style={{opacity: glitchMainOpacity}}>
          <Animated.Text style={[styles.closetXAccent, {color: animatedColors.textAccent}]}>X</Animated.Text>
        </Animated.View>
        <Animated.View style={{position: 'absolute', right: 0, top: 0, opacity: glitchRedOpacity, transform: [{translateX: glitchRedX}]}}>
          <Text style={[styles.closetXAccent, {color: '#FF3333'}]}>X</Text>
        </Animated.View>
        <Animated.View style={{position: 'absolute', right: 0, top: 0, opacity: glitchCyanOpacity, transform: [{translateX: glitchCyanX}]}}>
          <Text style={[styles.closetXAccent, {color: '#00FFFF'}]}>X</Text>
        </Animated.View>
      </View>
      <View style={styles.genderCardsRow}>
        {/* FOR HIM — left card */}
        <TouchableOpacity
          style={[styles.genderCard, styles.genderCardGlass, {height: 72 * S}]}
          activeOpacity={0.9}
          onPress={() => handleGenderCard('Men')}>
          <BlurView blurType={T.blurType} blurAmount={20} style={StyleSheet.absoluteFill} />
          <Animated.View style={[styles.genderCardActiveLine, {backgroundColor: GENDER_PALETTES.Men.mid, opacity: genderLineHim, transform: [{scaleX: genderLineHim}]}]} />
          <View style={styles.genderCardContent}>
            <View>
              <Text style={styles.genderCardFor}>FOR</Text>
              <Text style={styles.genderCardLabel}>HIM</Text>
            </View>
            <Animated.View style={[styles.genderCardArrow, {backgroundColor: isDark ? genderMix.interpolate({inputRange: [0, 1], outputRange: [GENDER_PALETTES.Men.mid, 'rgba(255,255,255,0.15)']}) : '#CDF564'}]}>
              <Icon name="arrow-right" size={12} color={isDark ? '#fff' : '#000'} />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* FOR HER — right card */}
        <TouchableOpacity
          style={[styles.genderCard, styles.genderCardGlass, {height: 72 * S}]}
          activeOpacity={0.9}
          onPress={() => handleGenderCard('Women')}>
          <BlurView blurType={T.blurType} blurAmount={20} style={StyleSheet.absoluteFill} />
          <Animated.View style={[styles.genderCardActiveLine, {backgroundColor: GENDER_PALETTES.Women.mid, opacity: genderLineHer, transform: [{scaleX: genderLineHer}]}]} />
          <View style={styles.genderCardContent}>
            <View>
              <Text style={styles.genderCardFor}>FOR</Text>
              <Text style={styles.genderCardLabel}>HER</Text>
            </View>
            <Animated.View style={[styles.genderCardArrow, {backgroundColor: isDark ? genderMix.interpolate({inputRange: [0, 1], outputRange: ['rgba(255,255,255,0.15)', GENDER_PALETTES.Women.mid]}) : '#CDF564'}]}>
              <Icon name="arrow-right" size={12} color={isDark ? '#fff' : '#000'} />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- NEW KNOTNOW-STYLE SECTIONS ---

  const MEN_CATEGORIES = [
    {id: 'mc1', name: 'Oversized Tees', image: require('../../assets/images /Untitled design/tshirt.png')},
    {id: 'mc2', name: 'Jeans', image: require('../../assets/images /Untitled design/jeans.png')},
    {id: 'mc3', name: 'Sneakers', image: require('../../assets/images /Untitled design/shoes.png')},
    {id: 'mc4', name: 'Jackets', image: require('../../assets/images /Untitled design/jackets.png')},
    {id: 'mc5', name: 'Watches', image: require('../../assets/images /Untitled design/watchs.png')},
    {id: 'mc6', name: 'Shirts', image: require('../../assets/images /Untitled design/shirt.png')},
    {id: 'mc7', name: 'Shorts', image: require('../../assets/images /Untitled design/short.png')},
    {id: 'mc8', name: 'Caps', image: require('../../assets/images /Untitled design/cap.png')},
  ];

  const WOMEN_CATEGORIES = [
    {id: 'wc1', name: 'Dresses', image: require('../../assets/images /Untitled design 2/dress.png')},
    {id: 'wc2', name: 'Heels', image: require('../../assets/images /Untitled design 2/heels.png')},
    {id: 'wc3', name: 'Pants', image: require('../../assets/images /Untitled design 2/pants.png')},
    {id: 'wc4', name: 'Tops', image: require('../../assets/images /Untitled design 2/top.png')},
    {id: 'wc5', name: 'Jewellery', image: require('../../assets/images /Untitled design 2/jwellery.png')},
    {id: 'wc6', name: 'Skirts', image: require('../../assets/images /Untitled design 2/skirts.png')},
    {id: 'wc7', name: 'Sunglasses', image: require('../../assets/images /Untitled design 2/glasses.png'), rotate: '15deg', size: 90},
    {id: 'wc8', name: 'Ethnic Wear', image: require('../../assets/images /Untitled design 2/ethenic.png')},
  ];

  // 1. Ticket Categories Grid
  const renderTicketCategories = () => {
    const cats = activeGender === 'Men' ? MEN_CATEGORIES : WOMEN_CATEGORIES;
    return (
      <View style={styles.ticketSection}>
        <View style={styles.ticketGrid}>
          {cats.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.ticketItem}
              activeOpacity={0.8}
              onPress={() => handleCategoryPress(cat.name)}>
              <View style={styles.ticketCard}>
                {/* Top portion with image */}
                <View style={styles.ticketTop}>
                  <View style={styles.ticketImageShadow}>
                    {cat.image && <Image source={cat.image} style={[styles.ticketImage, (cat as any).rotate && {transform: [{rotate: (cat as any).rotate}]}, (cat as any).size && {width: (cat as any).size, height: (cat as any).size}]} resizeMode="contain" />}
                  </View>
                </View>
                {/* Perforated line */}
                <View style={styles.ticketPerforation}>
                  <View style={styles.ticketNotchLeft} />
                  <View style={styles.ticketDashedLine}>
                    {[...Array(8)].map((_, i) => (
                      <View key={i} style={styles.ticketDash} />
                    ))}
                  </View>
                  <View style={styles.ticketNotchRight} />
                </View>
                {/* Bottom portion with label */}
                <View style={styles.ticketBottom}>
                  <Text style={styles.ticketLabel} numberOfLines={1}>{cat.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* See all Categories CTA */}
        <TouchableOpacity
          style={styles.ctaBar}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CategoriesTab')}>
          <Text style={styles.ctaBarText}>See all Categories</Text>
          <Icon name="chevron-right" size={16} color={genderPalette.lightest} />
        </TouchableOpacity>
      </View>
    );
  };

  // 2. Full-width Banner
  // Trend card dimensions
  const TREND_W = width - SIZES.screenPadding * 2;
  const TREND_WHITE_H = 240;
  const TREND_DARK_H = 220;
  const TR = 24;  // corner radius
  const TC = 26;  // concave curve size

  // White card path: bottom-LEFT cutout
  const whiteCardPath = useMemo(() => {
    const w = TREND_W;
    const h = TREND_WHITE_H;
    const r = TR;
    const c = TC;
    const cutW = w * 0.65;   // cutout width from left
    const cutY = h * 0.70;   // horizontal ledge Y position
    return [
      `M ${r} 0`,
      `L ${w - r} 0`,
      `Q ${w} 0 ${w} ${r}`,
      `L ${w} ${h - r}`,
      `Q ${w} ${h} ${w - r} ${h}`,
      `L ${cutW + r} ${h}`,
      `Q ${cutW} ${h} ${cutW} ${h - r}`,
      `L ${cutW} ${cutY + c}`,
      `C ${cutW} ${cutY} ${cutW} ${cutY} ${cutW - c} ${cutY}`,
      `L ${c} ${cutY}`,
      `C 0 ${cutY} 0 ${cutY} 0 ${cutY - c}`,
      `L 0 ${r}`,
      `Q 0 0 ${r} 0`,
      'Z',
    ].join(' ');
  }, [TREND_W]);

  // Dark card path: top-LEFT cutout (outline only)
  const darkCardPath = useMemo(() => {
    const w = TREND_W;
    const h = TREND_DARK_H;
    const r = TR;
    const c = TC;
    const cutW = w * 0.65;   // cutout width from left
    const cutY = h * 0.30;   // horizontal ledge Y position
    return [
      `M ${cutW + r} 0`,
      `L ${w - r} 0`,
      `Q ${w} 0 ${w} ${r}`,
      `L ${w} ${h - r}`,
      `Q ${w} ${h} ${w - r} ${h}`,
      `L ${r} ${h}`,
      `Q 0 ${h} 0 ${h - r}`,
      `L 0 ${cutY + c}`,
      `C 0 ${cutY} 0 ${cutY} ${c} ${cutY}`,
      `L ${cutW - c} ${cutY}`,
      `C ${cutW} ${cutY} ${cutW} ${cutY} ${cutW} ${cutY - c}`,
      `L ${cutW} ${r}`,
      `Q ${cutW} 0 ${cutW + r} 0`,
      'Z',
    ].join(' ');
  }, [TREND_W]);

  const renderPromoBanner = () => {
    const isWomen = activeGender === 'Women';
    const accent = isWomen ? '#F037A5' : '#4100F5';
    const accentText = isWomen ? genderPalette.mid : genderPalette.mid; // blue for men text
    const accentIcon = isWomen ? '#fff' : '#000';
    return (
      <View style={styles.trendSection}>
        {/* Top white card — SVG clipped shape with model image */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Trending'})}>
          <View style={{width: TREND_W, height: TREND_WHITE_H}}>
            <Svg width={TREND_W} height={TREND_WHITE_H} style={StyleSheet.absoluteFill}>
              <Defs>
                <ClipPath id="whiteCardClip">
                  <Path d={whiteCardPath} />
                </ClipPath>
              </Defs>
              {/* Landscape model image */}
              <SvgImage
                href={{uri: isWomen
                  ? 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200'
                  : 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200'}}
                x={0}
                y={0}
                width={TREND_W}
                height={TREND_WHITE_H}
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#whiteCardClip)"
              />
              {/* Dark overlay for text readability */}
              <Path d={whiteCardPath} fill="rgba(0,0,0,0.35)" />
            </Svg>
            {/* Title at bottom */}
            <Text style={styles.trendCardWhiteTitle}>
              Beat <Text style={{color: accentText, fontFamily: 'Rondira-Medium'}}>the trend</Text>
            </Text>
          </View>
        </TouchableOpacity>

        {/* Middle text overlay */}
        <View style={styles.trendTextSection}>
          <Text style={styles.trendBigText}>
            Unveil your{'\n'}
            <Text style={{color: accentText, fontFamily: 'Rondira-Medium'}}>authentic self</Text> &{'\n'}
            dress your{'\n'}
            <Text style={{color: accentText, fontFamily: 'Rondira-Medium'}}>ambitions</Text> with{'\n'}
            <Text style={{color: accentText, fontFamily: 'Rondira-Medium'}}>unique fashion</Text>
          </Text>
          <TouchableOpacity
            style={[styles.trendArrowFloat, {backgroundColor: accent}]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'New Arrivals'})}>
            <Icon name="arrow-up-right" size={18} color={accentIcon} />
          </TouchableOpacity>
        </View>

        {/* Bottom dark card — SVG outline only, top-right cutout */}
        <View style={{marginTop: -8}} />
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Trending Looks'})}>
          <View style={{width: TREND_W, height: TREND_DARK_H}}>
            {/* Outline */}
            <Svg width={TREND_W} height={TREND_DARK_H} style={StyleSheet.absoluteFill}>
              <Path d={darkCardPath} fill="none" stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} strokeWidth={1.5} />
            </Svg>
            {/* Bouncing ball */}
            <ReAnimated.View
              style={[{
                position: 'absolute',
                width: BALL_R * 2,
                height: BALL_R * 2,
                borderRadius: BALL_R,
                backgroundColor: activeGender === 'Men' ? '#4100F5' : '#F037A5',
                opacity: 0.85,
              }, ballAnimStyle]}
            />
            {/* Content on top */}
            <View style={styles.trendCardDarkHeader} />
            <View style={{flex: 1}} />
            <View style={styles.trendCardDarkBottom}>
              <Text style={styles.trendCardDarkTitle}>
                Roll into{'\n'}
                <Text style={{color: accentText}}>your style</Text>
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bottom action cards */}
        <View style={[styles.trendChips, {marginTop: 8}]}>
          <TouchableOpacity
            style={styles.trendChipCard}
            activeOpacity={0.6}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Hot Drops'})}>
            <BlurView blurType={T.blurType} blurAmount={18} style={StyleSheet.absoluteFill} />
            <View style={styles.trendChipInner}>
              <View style={styles.trendChipRow}>
                <Text style={styles.trendChipLabel}>DROP{'\n'}ZONE</Text>
                <View style={[styles.trendChipArrow, {borderColor: accent}]}>
                  <Icon name="chevron-right" size={10} color={accent} />
                </View>
              </View>
              <Text style={[styles.trendChipSub, {color: accentText}]}>New balls in play</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.trendChipCard}
            activeOpacity={0.6}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Curated For You'})}>
            <BlurView blurType={T.blurType} blurAmount={18} style={StyleSheet.absoluteFill} />
            <View style={styles.trendChipInner}>
              <View style={styles.trendChipRow}>
                <Text style={styles.trendChipLabel}>ON A{'\n'}ROLL</Text>
                <View style={[styles.trendChipArrow, {borderColor: accent}]}>
                  <Icon name="chevron-right" size={10} color={accent} />
                </View>
              </View>
              <Text style={[styles.trendChipSub, {color: accentText}]}>Styled picks</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.trendChipCard}
            activeOpacity={0.6}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Bestsellers'})}>
            <BlurView blurType={T.blurType} blurAmount={18} style={StyleSheet.absoluteFill} />
            <View style={styles.trendChipInner}>
              <View style={styles.trendChipRow}>
                <Text style={styles.trendChipLabel}>BOUNCE{'\n'}BACK</Text>
                <View style={[styles.trendChipArrow, {borderColor: accent}]}>
                  <Icon name="chevron-right" size={10} color={accent} />
                </View>
              </View>
              <Text style={[styles.trendChipSub, {color: accentText}]}>Restocked hits</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 3. Discover Brands — horizontal snap scroll, 12 per page (4 cols x 3 rows)
  const BRANDS_PER_PAGE = 12;
  const brandPages = useMemo(() => {
    const pages = [];
    for (let i = 0; i < BRANDS.length; i += BRANDS_PER_PAGE) {
      pages.push(BRANDS.slice(i, i + BRANDS_PER_PAGE));
    }
    return pages;
  }, []);
  const brandCardSize = (width - SIZES.screenPadding * 2 - 30) / 4;

  const renderDiscoverBrands = () => {
    return (
      <View style={styles.brandsSection}>
        <Text style={styles.brandsSectionTitle}>Discover Brands</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={width}
          snapToAlignment="start"
          directionalLockEnabled
          nestedScrollEnabled>
          {brandPages.map((page, pageIdx) => (
            <View
              key={`bp-${pageIdx}`}
              style={{
                width: width,
                paddingHorizontal: SIZES.screenPadding,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 10,
              }}>
              {page.map(brand => (
                <TouchableOpacity
                  key={brand.id}
                  style={[styles.brandGridCard, {width: brandCardSize, height: brandCardSize}]}
                  activeOpacity={0.8}
                  onPress={() => handleBrandPress(brand.name)}>
                  <Image source={{uri: brand.logo}} style={styles.brandGridLogo} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
        {/* See all Brands CTA */}
        <TouchableOpacity
          style={styles.ctaBar}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CategoriesTab')}>
          <Text style={styles.ctaBarText}>See all Brands</Text>
          <Icon name="chevron-right" size={16} color={genderPalette.lightest} />
        </TouchableOpacity>
      </View>
    );
  };

  // 3.5 Shoe Showcase — SVG shaped card + 3D rotating circle text
  const SHOE_CARD_W = width - SIZES.screenPadding * 2;
  const SHOE_CARD_H = 200;
  const shoeCardPath = useMemo(() => {
    const w = SHOE_CARD_W;
    const h = SHOE_CARD_H;
    const r = TR;
    const c = TC;
    const cutW = w * 0.45;  // cutout from right side
    const cutY = h * 0.55;  // horizontal ledge Y
    return [
      `M ${r} 0`,
      `L ${w - cutW - c} 0`,
      `C ${w - cutW} 0 ${w - cutW} 0 ${w - cutW} ${c}`,
      `L ${w - cutW} ${cutY - c}`,
      `C ${w - cutW} ${cutY} ${w - cutW} ${cutY} ${w - cutW + c} ${cutY}`,
      `L ${w - r} ${cutY}`,
      `Q ${w} ${cutY} ${w} ${cutY + r}`,
      `L ${w} ${h - r}`,
      `Q ${w} ${h} ${w - r} ${h}`,
      `L ${r} ${h}`,
      `Q 0 ${h} 0 ${h - r}`,
      `L 0 ${r}`,
      `Q 0 0 ${r} 0`,
      'Z',
    ].join(' ');
  }, [SHOE_CARD_W]);

  const renderShoeBanner = () => {
    const circleText = activeGender === 'Women' ? SHOE_CIRCLE_TEXT_WOMEN : SHOE_CIRCLE_TEXT_MEN;
    const accent = activeGender === 'Men' ? '#CDF564' : genderPalette.mid;
    const shoeTextAccent = activeGender === 'Men' ? genderPalette.mid : genderPalette.mid;

    return (
      <View style={{backgroundColor: T.bg}}>
        {/* SVG shaped shoe card */}
        <View style={styles.shoeHeroRow}>
          <View style={{width: SHOE_CARD_W, height: SHOE_CARD_H}}>
            {/* Glass outline shape */}
            <Svg width={SHOE_CARD_W} height={SHOE_CARD_H} style={StyleSheet.absoluteFill}>
              <Defs>
                <ClipPath id="shoeCardClip">
                  <Path d={shoeCardPath} />
                </ClipPath>
              </Defs>
              <Path d={shoeCardPath} fill={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'} stroke={isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)'} strokeWidth={1.2} />
            </Svg>
            {/* Card content */}
            <View style={styles.shoeCardContent}>
              <View style={styles.shoeCardTextSide}>
                <Text style={styles.shoeGlassTitle}>
                  {activeGender === 'Women' ? 'Step into' : 'Walk the'}{'\n'}
                  <Text style={{color: shoeTextAccent, fontFamily: 'Rondira-Medium'}}>
                    {activeGender === 'Women' ? 'elegance' : 'hype'}
                  </Text>
                </Text>
                <Text style={[styles.shoeGlassSub, {color: shoeTextAccent}]}>
                  {activeGender === 'Women' ? 'Heels, flats & more' : 'Sneakers, loafers & more'}
                </Text>
                <TouchableOpacity
                  style={[styles.shoeGlassBtn, {backgroundColor: accent}]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Shoes'})}>
                  <Text style={styles.shoeGlassBtnText}>SHOP NOW</Text>
                  <Icon name="arrow-right" size={10} color={activeGender === 'Men' ? '#000' : '#fff'} />
                </TouchableOpacity>
              </View>
            </View>
            {/* Shoe image floating on top-right cutout area */}
            <Image
              source={require('../../assets/images /box.png')}
              style={styles.shoeHeroImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Circle text + carousel inside */}
        <View style={[styles.shoeShowcaseWrap, {backgroundColor: T.bg}]}>
          {/* Rotating circle text */}
          <ReAnimated.View style={[styles.shoeShowcaseCircle, shoeCircleAnimStyle]}>
            <Svg width={SHOE_CIRCLE_SIZE} height={SHOE_CIRCLE_SIZE}>
              <Defs>
                <Path id="shoeCirclePath" d={SHOE_CIRCLE_PATH} />
              </Defs>
              <SvgText fill={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)'} fontSize={20} fontWeight="800" letterSpacing={6}>
                <TextPath href="#shoeCirclePath">
                  {circleText}
                </TextPath>
              </SvgText>
            </Svg>
          </ReAnimated.View>

          {/* Top solid overlay — circle goes behind */}
          <View pointerEvents="none" style={{position: 'absolute', top: 0, left: 0, right: 0, height: 70, zIndex: 4, backgroundColor: T.bg}} />
          {/* Top fade */}
          <LinearGradient
            colors={isDark ? ['rgba(0,0,0,1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0)'] : ['rgba(250,250,250,1)', 'rgba(250,250,250,0.5)', 'rgba(250,250,250,0)']}
            locations={[0, 0.4, 1]}
            style={{position: 'absolute', top: 70, left: 0, right: 0, height: 50, zIndex: 4}}
            pointerEvents="none"
          />
          {/* Bottom fade */}
          <LinearGradient
            colors={isDark ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,1)'] : ['rgba(250,250,250,0)', 'rgba(250,250,250,0.5)', 'rgba(250,250,250,1)']}
            locations={[0, 0.4, 1]}
            style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, zIndex: 4}}
            pointerEvents="none"
          />

          {/* Swipable product carousel centered in circle */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.shoeCarouselWrap}
            contentContainerStyle={styles.shoeCarouselContent}
            decelerationRate="fast"
            snapToInterval={width}
          >
            {SHOE_CAROUSEL.map(item => (
              <View key={item.id} style={styles.shoeCarouselSlide}>
                <Image source={item.image} style={styles.shoeCarouselImg} resizeMode="contain" />
                <Text style={styles.shoeCarouselBrand}>{item.brand}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };


  // SVG shoe card dimensions
  const SC_W = 170;
  const SC_H = 240;
  const SC_CUT = 40; // square cutout size for plus button
  const SC_R = 16;
  const scCardPath = useMemo(() => {
    const w = SC_W; const h = SC_H; const r = SC_R; const c = SC_CUT;
    // Rectangle with bottom-right square cutout (with inner radius)
    const ir = 10; // inner concave radius at the cutout corner
    return [
      `M ${r} 0`,
      `L ${w - r} 0`,
      `Q ${w} 0 ${w} ${r}`,
      `L ${w} ${h - c - ir}`,
      // concave curve into the cutout (top-right of cutout)
      `C ${w} ${h - c} ${w} ${h - c} ${w - ir} ${h - c}`,
      `L ${w - c + r} ${h - c}`,
      `Q ${w - c} ${h - c} ${w - c} ${h - c + r}`,
      // concave curve at inner corner
      `L ${w - c} ${h - ir}`,
      `C ${w - c} ${h} ${w - c} ${h} ${w - c - ir} ${h}`,
      `L ${r} ${h}`,
      `Q 0 ${h} 0 ${h - r}`,
      `L 0 ${r}`,
      `Q 0 0 ${r} 0`,
      'Z',
    ].join(' ');
  }, []);

  const SHOE_CARD_DATA = useMemo(() => {
    const isWomen = activeGender === 'Women';
    return [
      {id: 'sk1', brand: 'Nike', name: 'Air Max 90', price: 3499, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'},
      {id: 'sk2', brand: 'Adidas', name: 'Ultraboost 22', price: 4299, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400'},
      {id: 'sk3', brand: 'Converse', name: 'Chuck Taylor', price: 1999, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400'},
      {id: 'sk4', brand: 'Nike', name: isWomen ? 'Court Vision' : 'Air Jordan 1', price: 4499, image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400'},
      {id: 'sk5', brand: 'Puma', name: 'RS-X Bold', price: 2799, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400'},
      {id: 'sk6', brand: 'New Balance', name: '550', price: 3899, image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400'},
    ];
  }, [activeGender]);

  const renderShoeCards = () => (
    <View style={styles.shoeCardsSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shoeCardsList}
        decelerationRate="fast"
        snapToInterval={SC_W + 12}
      >
        {SHOE_CARD_DATA.map(item => (
          <TouchableOpacity key={item.id} style={styles.shoeCard} activeOpacity={0.85} onPress={() => goToProduct(item)}>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Svg width={SC_W} height={SC_H} style={StyleSheet.absoluteFill}>
                <Defs>
                  <ClipPath id={`scClip-${item.id}`}>
                    <Path d={scCardPath} />
                  </ClipPath>
                </Defs>
                <SvgImage
                  href={{uri: item.image}}
                  x={0} y={0} width={SC_W} height={SC_H * 0.6}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#scClip-${item.id})`}
                />
                <Path d={scCardPath} fill="none" stroke={isDark ? T.borderLight : 'rgba(0,0,0,0.08)'} strokeWidth={1} />
              </Svg>
            </View>
            <View style={styles.shoeCardInfo} pointerEvents="none">
              <Text style={styles.shoeCardBrand}>{item.brand}</Text>
              <Text style={styles.shoeCardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.shoeCardPrice}>{formatPrice(item.price)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.shoeCardPlus, {backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}]}
              activeOpacity={0.8}
              onPress={() => quickAddToCart(item)}>
              <Icon name="plus" size={16} color={activeGender === 'Men' ? '#000' : '#fff'} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // --- Community / Editorial Bento Grid (full viewport) ---
  const screenH = Dimensions.get('window').height;
  const COMM_PAD = SIZES.screenPadding;
  const COMM_GAP = 10;
  const COMM_FULL_W = width - COMM_PAD * 2;
  const COMM_LEFT_W = COMM_FULL_W * 0.46;
  const COMM_RIGHT_W = COMM_FULL_W - COMM_LEFT_W - COMM_GAP;
  const COMM_SECTION_H = screenH * 0.82;
  const COMM_LEFT_H = screenH * 0.58;
  const COMM_RIGHT_TOP_H = COMM_SECTION_H * 0.32;
  const COMM_CUT = 30;
  const COMM_R = 20;
  const COMM_IR = 12;

  // Left card: top-right concave cutout
  const commLeftPath = useMemo(() => {
    const w = COMM_LEFT_W; const h = COMM_LEFT_H; const r = COMM_R; const c = COMM_CUT; const ir = COMM_IR;
    return [
      `M ${r} 0`, `L ${w - c - ir} 0`,
      `C ${w - c} 0 ${w - c} 0 ${w - c} ${ir}`,
      `L ${w - c} ${c - r}`, `Q ${w - c} ${c} ${w - c + r} ${c}`,
      `L ${w - ir} ${c}`,
      `C ${w} ${c} ${w} ${c} ${w} ${c + ir}`,
      `L ${w} ${h - r}`, `Q ${w} ${h} ${w - r} ${h}`,
      `L ${r} ${h}`, `Q 0 ${h} 0 ${h - r}`,
      `L 0 ${r}`, `Q 0 0 ${r} 0`, 'Z',
    ].join(' ');
  }, []);







  // Top-right card: concave cutout at top-right (same technique as left card & product cards)
  const COMM_TOP_CUT = 72; // cutout size for the circle
  const COMM_CIRCLE = 28; // circle radius
  const commTopCardPath = useMemo(() => {
    const w = COMM_RIGHT_W; const h = COMM_RIGHT_TOP_H; const r = COMM_R; const c = COMM_TOP_CUT; const ir = COMM_IR;
    return [
      `M ${r} 0`, `L ${w - c - ir} 0`,
      // concave curve into cutout
      `C ${w - c} 0 ${w - c} 0 ${w - c} ${ir}`,
      `L ${w - c} ${c - r}`, `Q ${w - c} ${c} ${w - c + r} ${c}`,
      `L ${w - ir} ${c}`,
      // concave curve out of cutout
      `C ${w} ${c} ${w} ${c} ${w} ${c + ir}`,
      `L ${w} ${h - r}`, `Q ${w} ${h} ${w - r} ${h}`,
      `L ${r} ${h}`, `Q 0 ${h} 0 ${h - r}`,
      `L 0 ${r}`, `Q 0 0 ${r} 0`, 'Z',
    ].join(' ');
  }, []);

  const commOccasionImgs = activeGender === 'Women' ? OCCASION_WOMEN_IMGS : OCCASION_MEN_IMGS;
  const commOccasion = OCCASIONS[commOccIdx];

  const commScrollRef = useRef<ScrollView>(null);
  const handleCommScroll = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / COMM_LEFT_W);
    if (idx !== commOccIdx && idx >= 0 && idx < OCCASIONS.length) {
      setCommOccIdx(idx);
    }
  }, [commOccIdx]);




  const renderCommunitySection = () => {
    const label = commOccasion.label;
    // Scale down text and padding for smaller screens
    const commCardPadTop = Math.min(82, 82 * S);
    const commLabelSize = Math.round(Math.min(24, 24 * S));
    const commBulletSize = Math.round(Math.min(11, 11 * S));
    const commDescSize = Math.round(Math.min(13, 13 * S));

    return (
      <View style={styles.commSection}>
        {/* Section title */}
        <Text style={styles.commSectionTitle}>What's your next iconic look?</Text>

        <View style={styles.commRow}>
          {/* ======= LEFT tall card — swipable carousel ======= */}
          <View style={{width: COMM_LEFT_W, height: COMM_LEFT_H, borderRadius: COMM_R, overflow: 'hidden'}}>
            {/* Glass border */}
            <View style={styles.commLeftGlassBorder} />
            {/* Swipable image carousel */}
            <ScrollView
              ref={commScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleCommScroll}
              decelerationRate="fast"
              style={[StyleSheet.absoluteFill, {zIndex: 3}]}
            >
              {commOccasionImgs.map((img, i) => (
                <View key={`comm-img-${i}`} style={{width: COMM_LEFT_W, height: COMM_LEFT_H}}>
                  <Image
                    source={img}
                    style={{
                      position: 'absolute',
                      top: -110 * S,
                      left: i === 2 ? -COMM_LEFT_W * 0.1 : -COMM_LEFT_W * 0.3,
                      width: COMM_LEFT_W * 1.7,
                      height: COMM_LEFT_H * 1.4,
                      zIndex: 3,
                    }}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
            {/* Swipe hint on top */}
            <View style={{position: 'absolute', top: 12, alignSelf: 'center', zIndex: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12}} pointerEvents="none">
              <Icon name="chevrons-right" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={{color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600', marginLeft: 4, letterSpacing: 1}}>SWIPE</Text>
            </View>
          </View>

          {/* ======= RIGHT column ======= */}
          <View style={{width: COMM_RIGHT_W, height: Platform.OS === 'android' ? COMM_LEFT_H : COMM_SECTION_H, gap: COMM_GAP}}>

            {/* RIGHT TOP — dark card / blue gradient in light mode */}
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Occasion', {occasionLabel: label})} style={{width: COMM_RIGHT_W, height: COMM_RIGHT_TOP_H}}>
              <Svg width={COMM_RIGHT_W} height={COMM_RIGHT_TOP_H} style={StyleSheet.absoluteFill}>
                <Defs>
                  <SvgLinearGradient id="commCardGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={isDark ? '#1A1A1A' : (activeGender === 'Men' ? '#B499FF' : '#FF99CC')} />
                    <Stop offset="1" stopColor={isDark ? '#1A1A1A' : (activeGender === 'Men' ? '#D4C6FF' : '#FFBDD9')} />
                  </SvgLinearGradient>
                </Defs>
                <Path d={commTopCardPath} fill="url(#commCardGrad)" />
                <Path d={commTopCardPath} fill="none" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'} strokeWidth={1.2} />
              </Svg>
              {/* Accent circle sitting in the concave cutout */}
              <View style={{
                position: 'absolute', top: -(COMM_CIRCLE - COMM_TOP_CUT / 2), right: -(COMM_CIRCLE - COMM_TOP_CUT / 2),
                width: COMM_CIRCLE * 2, height: COMM_CIRCLE * 2, borderRadius: COMM_CIRCLE,
                backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid,
                justifyContent: 'center', alignItems: 'center',
              }}>
                <Icon name="arrow-up-right" size={Math.round(22 * S)} color={activeGender === 'Men' ? '#000' : '#fff'} />
              </View>
              {/* Card content — flex layout prevents overflow */}
              <View style={{flex: 1, paddingHorizontal: 14 * S, paddingTop: commCardPadTop, paddingBottom: 10, justifyContent: 'space-between'}}>
                <Text style={{color: '#fff', fontSize: commLabelSize, fontWeight: '900', fontFamily: 'Helvetica', letterSpacing: 1}} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {label}
                </Text>
                <View style={{gap: 3}}>
                  <Text style={{color: 'rgba(255,255,255,0.75)', fontSize: commDescSize, fontFamily: 'Helvetica', lineHeight: commDescSize + 5}} numberOfLines={1}>
                    Dress the moment
                  </Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                    <View style={{width: 5, height: 5, borderRadius: 2.5, backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}} />
                    <Text style={{color: 'rgba(255,255,255,0.6)', fontSize: commBulletSize, fontFamily: 'Helvetica'}} numberOfLines={1}>
                      Curated for your vibe
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                    <View style={{width: 5, height: 5, borderRadius: 2.5, backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}} />
                    <Text style={{color: 'rgba(255,255,255,0.6)', fontSize: commBulletSize, fontFamily: 'Helvetica'}} numberOfLines={1}>
                      Trending this season
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                    <View style={{width: 5, height: 5, borderRadius: 2.5, backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}} />
                    <Text style={{color: 'rgba(255,255,255,0.6)', fontSize: commBulletSize, fontFamily: 'Helvetica'}} numberOfLines={1}>
                      32+ styles available
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* MIDDLE — big text */}
            <View style={{flex: 1, justifyContent: 'center', paddingRight: 4}}>
              <Text style={styles.commMidText} adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={4}>
                Be a{'\n'}part of{'\n'}community{'\n'}of fashion
              </Text>
              {/* "enthusiasts" with accent strip behind it */}
              <View style={{marginTop: 2, overflow: 'visible'}}>
                <View style={{position: 'absolute', left: -width, right: -width, top: '25%', height: 28, backgroundColor: '#CDF564', zIndex: 0}} />
                <Text style={[styles.commMidAccent, {zIndex: 1}]} adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1}>enthusiasts</Text>
              </View>
            </View>



          </View>
        </View>
      </View>
    );
  };

  // ── Reels 3D Carousel ──
  const baseReels = activeGender === 'Women' ? REELS_WOMEN : REELS_MEN;
  const loopReels = makeLoopReels(baseReels);
  const CLONE_OFFSET = 2; // 2 clones prepended
  const reelAccent = activeGender === 'Men' ? '#CDF564' : genderPalette.mid;
  const reelTextAccent = genderPalette.mid;

  // Set initial scroll to first real item on mount
  useEffect(() => {
    setTimeout(() => {
      reelsScrollRef.current?.scrollTo({x: CLONE_OFFSET * REEL_SNAP, animated: false});
    }, 100);
  }, []);

  const handleReelsScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const idx = Math.round(x / REEL_SNAP);
    // Jump to real items when hitting clone boundaries
    if (idx <= 1) {
      reelsScrollRef.current?.scrollTo({x: (baseReels.length + CLONE_OFFSET - 1) * REEL_SNAP, animated: false});
      setActiveReelIndex(baseReels.length - 1);
    } else if (idx >= loopReels.length - 2) {
      reelsScrollRef.current?.scrollTo({x: CLONE_OFFSET * REEL_SNAP, animated: false});
      setActiveReelIndex(0);
    } else {
      setActiveReelIndex(idx - CLONE_OFFSET);
    }
  };

  const renderReelCard = (reel: typeof REELS_MEN[0], index: number) => {
    const inputRange = [
      (index - 2) * REEL_SNAP,
      (index - 1) * REEL_SNAP,
      index * REEL_SNAP,
      (index + 1) * REEL_SNAP,
      (index + 2) * REEL_SNAP,
    ];

    const scale = reelsScrollX.interpolate({
      inputRange,
      outputRange: [0.65, 0.78, 1, 0.78, 0.65],
      extrapolate: 'clamp',
    });

    const rotateY = reelsScrollX.interpolate({
      inputRange,
      outputRange: ['50deg', '30deg', '0deg', '-30deg', '-50deg'],
      extrapolate: 'clamp',
    });

    const translateX = reelsScrollX.interpolate({
      inputRange,
      outputRange: [-30, -15, 0, 15, 30],
      extrapolate: 'clamp',
    });

    const cardOpacity = reelsScrollX.interpolate({
      inputRange,
      outputRange: [0.4, 0.7, 1, 0.7, 0.4],
      extrapolate: 'clamp',
    });

    // Real index in the original array (accounting for clones)
    const realIdx = index - CLONE_OFFSET;
    const isActive = activeReelIndex === realIdx || activeReelIndex === realIdx + baseReels.length || activeReelIndex === realIdx - baseReels.length;

    return (
      <Animated.View
        key={`${reel.id}-${index}`}
        style={{
          width: REEL_CARD_WIDTH,
          height: REEL_CARD_HEIGHT,
          transform: [
            {perspective: 800},
            {translateX},
            {rotateY},
            {scale},
          ],
          opacity: cardOpacity,
        }}>
        <View style={{flex: 1, borderRadius: 18, overflow: 'hidden', backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0'}}>
          {/* Video — paused when not center, plays when center. On Android use thumbnail only for perf */}
          {Platform.OS === 'android' ? (
            <Image source={{uri: reel.thumbnail}} style={StyleSheet.absoluteFill} resizeMode="cover" fadeDuration={0} />
          ) : (
            <Video
              source={reel.video}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              repeat
              muted
              paused={!isActive}
            />
          )}
          {/* Bottom info */}
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            paddingHorizontal: 14, paddingBottom: 16, paddingTop: 10,
          }}>
            <Text style={{
              color: '#fff', fontSize: 15, fontWeight: '700',
              fontFamily: 'Helvetica', lineHeight: 20,
              textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 3,
            }} numberOfLines={2}>
              {reel.title}
            </Text>
            <Text style={{
              color: reelTextAccent, fontSize: 11, fontWeight: '500',
              fontFamily: 'Helvetica', marginTop: 3, letterSpacing: 0.5,
            }}>
              {reel.creator}
            </Text>
          </View>
          {/* Glass border */}
          <View style={[StyleSheet.absoluteFill, {
            borderRadius: 18,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
          }]} />
        </View>
      </Animated.View>
    );
  };

  const renderReelsSection = () => (
    <View style={{paddingBottom: 20, backgroundColor: T.bg, marginTop: Platform.OS === 'android' ? 0 : -180}}>
      <View style={{paddingHorizontal: SIZES.screenPadding, marginBottom: 14}}>
        <Text style={{
          color: reelTextAccent, fontSize: 10, fontWeight: '700',
          fontFamily: 'Helvetica', letterSpacing: 4,
          textTransform: 'uppercase', marginBottom: 4,
        }}>
          TRENDING NOW
        </Text>
        <Text style={{
          color: T.text, fontSize: Math.min(24, 24 * S), fontWeight: '800',
          fontFamily: 'Helvetica', letterSpacing: -0.5,
        }}>
          Fashion Reels
        </Text>
      </View>

      <Animated.ScrollView
        ref={reelsScrollRef as any}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={REEL_SNAP}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: REEL_SIDE_PADDING,
          alignItems: 'center',
        }}
        contentOffset={{x: CLONE_OFFSET * REEL_SNAP, y: 0}}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: reelsScrollX}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={Platform.OS === 'android' ? 16 : 1}
        onMomentumScrollEnd={handleReelsScroll}>
        {loopReels.map((reel, index) => renderReelCard(reel, index))}
      </Animated.ScrollView>

      <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 14, gap: 4}}>
        {baseReels.map((_, i) => (
          <View
            key={`reel-dot-${i}`}
            style={{
              width: activeReelIndex === i ? 20 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: activeReelIndex === i ? reelAccent : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'),
            }}
          />
        ))}
      </View>
    </View>
  );

  // ── Accessories Bento Grid ──
  const watchAccent = activeGender === 'Men' ? '#CDF564' : genderPalette.mid;
  const watchBg = activeGender === 'Men' ? '#E8E0D8' : '#E8D8E0';
  const watchBg2 = activeGender === 'Men' ? '#D4CBB8' : '#D8C0D0';

  const bentoData = useMemo(() => {
    const isWomen = activeGender === 'Women';
    if (isWomen) {
      return {
        bigImg: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
        midTop: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=400',
        midBot: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400',
        brands: [{label: 'T', name: 'Tiffany'}, {label: 'G', name: 'Gucci'}, {label: 'P', name: 'Pandora'}],
        statsText: 'Jewellery, bags &\nmore to explore',
        row3Left: {img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500', cat: 'Accessories'},
        row3Right: {img: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500', cat: 'Bags'},
        bannerImg: 'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800',
        bannerTitle: 'Style is in\nthe details',
        bannerSub: 'From statement jewellery to everyday essentials — accessories that complete your look.',
      };
    }
    return {
      bigImg: WATCH_IMG,
      midTop: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      midBot: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400',
      brands: [{label: 'R', name: 'Rolex'}, {label: 'Ω', name: 'Omega'}, {label: 'C', name: 'Casio'}],
      statsText: 'Watches, shades &\nessentials collection',
      row3Left: {img: 'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=500', cat: 'Accessories'},
      row3Right: {img: 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=500', cat: 'Accessories'},
      bannerImg: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800',
      bannerTitle: 'We follow\ntrends',
      bannerSub: 'Discover cutting-edge styles and timeless classics that define the season.',
    };
  }, [activeGender]);

  const renderWatchGrid = () => {
    const g = WATCH_GRID_GAP;
    const fw = WATCH_GRID_W;
    const leftW = fw * 0.44;
    const midW = fw * 0.36;
    const rightW = fw - leftW - midW - g * 2;
    const row1H = fw * 0.85;
    const midTopH = row1H * 0.45;
    const midBotH = row1H - midTopH - g;
    const row3H = fw * 0.5;
    const bannerH = fw * 0.65;

    return (
      <View style={{paddingHorizontal: SIZES.screenPadding, paddingVertical: 24}}>
        {/* Row 1: 3 columns */}
        <View style={{flexDirection: 'row', gap: g, height: row1H}}>
          {/* Left — big accessory card */}
          <TouchableOpacity
            style={{width: leftW, borderRadius: WATCH_R, overflow: 'hidden', backgroundColor: watchBg}}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Accessories'})}>
            <Image source={typeof bentoData.bigImg === 'number' ? bentoData.bigImg : {uri: bentoData.bigImg}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
          </TouchableOpacity>
          {/* Middle — 2 stacked lifestyle cards */}
          <View style={{width: midW, gap: g}}>
            <TouchableOpacity
              style={{flex: midTopH, borderRadius: WATCH_R, overflow: 'hidden'}}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CategoryDetail', {categoryType: activeGender === 'Women' ? 'Trending' : 'Accessories'})}>
              <Image
                source={{uri: bentoData.midTop}}
                style={{width: '100%', height: '100%'}} resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{flex: midBotH, borderRadius: WATCH_R, overflow: 'hidden'}}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CategoryDetail', {categoryType: activeGender === 'Women' ? 'Accessories' : 'Accessories'})}>
              <Image
                source={{uri: bentoData.midBot}}
                style={{width: '100%', height: '100%'}} resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
          {/* Right — gradient peek */}
          <TouchableOpacity
            style={{width: rightW, borderRadius: WATCH_R, overflow: 'hidden'}}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Accessories'})}>
            <LinearGradient
              colors={activeGender === 'Men'
                ? ['#4100F5', '#8B72FF', '#B8A9FF']
                : ['#F037A5', '#FF6EB4', '#FFB8D9']}
              start={{x: 0, y: 0}}
              end={{x: 0.5, y: 1}}
              style={{width: rightW + 30, height: '100%'}}
            />
          </TouchableOpacity>
        </View>

        {/* Row 2: Avatars + Stats */}
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: g, gap: g}}>
          {/* Brand logos */}
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            {bentoData.brands.map((brand, i) => (
              <View key={`wb-${i}`} style={{
                width: 40, height: 40, borderRadius: 20,
                borderWidth: 2, borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                overflow: 'hidden', marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i,
                backgroundColor: '#fff',
                justifyContent: 'center', alignItems: 'center',
              }}>
                <Text style={{fontSize: 16, fontWeight: '900', color: '#000', fontFamily: 'Helvetica'}}>
                  {brand.label}
                </Text>
              </View>
            ))}
          </View>
          {/* Glass stats card */}
          <View style={{
            borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
            flex: 1.2, overflow: 'hidden',
            backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
            borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
          }}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType={T.blurType}
              blurAmount={20}
              reducedTransparencyFallbackColor={isDark ? 'rgba(40,36,45,0.6)' : 'rgba(255,255,255,0.8)'}
            />
            <Text style={{fontSize: Math.min(22, 22 * S), fontWeight: '800', color: isDark ? '#fff' : '#1A1A1A', fontFamily: 'Helvetica'}}>
              500 +
            </Text>
            <Text style={{fontSize: 11, color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)', fontFamily: 'Helvetica', marginTop: 2, lineHeight: 15}}>
              {bentoData.statsText}
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 8, backgroundColor: watchAccent,
                borderRadius: 12, paddingVertical: 6, paddingHorizontal: 14,
                alignSelf: 'flex-start',
              }}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Accessories'})}>
              <Text style={{fontSize: 11, fontWeight: '700', fontFamily: 'Helvetica', color: activeGender === 'Men' ? '#000' : '#fff'}}>
                EXPLORE
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 3: 2 accessory cards — clickable with arrow buttons */}
        <View style={{flexDirection: 'row', gap: g, marginTop: g, height: row3H}}>
          <TouchableOpacity
            style={{flex: 1, borderRadius: WATCH_R, overflow: 'hidden'}}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: bentoData.row3Left.cat})}>
            <Image
              source={{uri: bentoData.row3Left.img}}
              style={{width: '100%', height: '100%'}} resizeMode="cover"
            />
            <View style={{
              position: 'absolute', bottom: 12, right: 12,
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: watchAccent,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Icon name="arrow-up-right" size={18} color={activeGender === 'Men' ? '#000' : '#fff'} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flex: 1, borderRadius: WATCH_R, overflow: 'hidden'}}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: bentoData.row3Right.cat})}>
            <Image
              source={{uri: bentoData.row3Right.img}}
              style={{width: '100%', height: '100%'}} resizeMode="cover"
            />
            <View style={{
              position: 'absolute', bottom: 12, right: 12,
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: watchAccent,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Icon name="arrow-up-right" size={18} color={activeGender === 'Men' ? '#000' : '#fff'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 4: Full-width banner */}
        <TouchableOpacity
          style={{
            marginTop: g, borderRadius: WATCH_R + 4, overflow: 'hidden',
            height: bannerH, backgroundColor: watchBg2,
          }}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Accessories'})}>
          <Image
            source={{uri: bentoData.bannerImg}}
            style={{width: '100%', height: '100%', position: 'absolute'}} resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.8)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={{flex: 1, justifyContent: 'flex-end', padding: 22}}>
            <Text style={{
              color: '#fff', fontSize: Math.min(34, 34 * S), fontWeight: '800',
              fontFamily: 'Helvetica', lineHeight: Math.min(38, 38 * S), letterSpacing: -0.5,
            }}>
              {bentoData.bannerTitle}
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Helvetica',
              lineHeight: 18, marginTop: 8, maxWidth: '75%',
            }}>
              {bentoData.bannerSub}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // 7. Style Occasions Grid
  const renderStyleOccasions = () => (
    <View style={styles.occasionsSection}>
      <Text style={styles.occasionsTitle}>What's your next iconic look?</Text>
      <View style={styles.occasionsGrid}>
        {OCCASIONS.map((occ, index) => (
          <TouchableOpacity
            key={occ.id}
            style={styles.occasionCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Occasion', {occasionLabel: occ.label})}>
            <Image
              source={activeGender === 'Women' ? OCCASION_WOMEN_IMGS[index] : OCCASION_MEN_IMGS[index]}
              style={styles.occasionImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.65)']}
              style={styles.occasionGradient}
            />
            <View style={styles.occasionTextWrap}>
              <Text style={styles.occasionLabel}>{occ.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // 8.5 Accessories Banner
  const renderAccessoriesBanner = () => {
    const isWomen = activeGender === 'Women';
    const bannerUri = isWomen
      ? 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=900'
      : 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=900';
    const bannerTitle = isWomen ? 'Accessorize\nYour Vibe' : 'Gear Up\nin Style';
    const bannerSub = isWomen ? 'Jewellery, bags & more' : 'Watches, caps & essentials';
    const bannerCta = isWomen ? 'SHOP ACCESSORIES' : 'SHOP ACCESSORIES';
    return (
      <View style={styles.shoeBannerWrap}>
        <Image source={{uri: bannerUri}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
        />
        <LinearGradient
          colors={isDark ? [genderPalette.dark, genderPalette.dark + 'CC', genderPalette.dark + '50', 'transparent'] : ['#FAFAFA', '#FAFAFACC', '#FAFAFA50', 'transparent']}
          locations={[0, 0.3, 0.65, 1]}
          style={styles.shoeBannerTopFade}
        />
        <View style={{position: 'absolute', bottom: 24, left: 20}}>
          <Text style={styles.promoBannerTitle}>{bannerTitle}</Text>
          <Text style={styles.promoBannerSub}>{bannerSub}</Text>
          <TouchableOpacity
            style={[styles.promoBannerBtn, {backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Accessories'})}>
            <Text style={styles.promoBannerBtnText}>{bannerCta}</Text>
            <Icon name="arrow-right" size={12} color={activeGender === 'Men' ? '#000' : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 8.6 Accessories Products Horizontal Scroll — curated per subcategory
  const ACCESSORY_CARDS = useMemo(() => {
    const isWomen = activeGender === 'Women';
    if (isWomen) {
      return [
        {id: 'ac-w1', brand: 'Tiffany', name: 'Layered Gold Necklace', price: 1299, image: 'https://images.unsplash.com/photo-1515562141589-67f0d4e55daa?w=600', subcategory: 'Jewelry'},
        {id: 'ac-w2', brand: 'Gucci', name: 'Oversized Sunglasses', price: 2499, image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600', subcategory: 'Sunglasses'},
        {id: 'ac-w3', brand: 'Coach', name: 'Mini Crossbody Bag', price: 3499, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600', subcategory: 'Bags'},
        {id: 'ac-w4', brand: 'Daniel Wellington', name: 'Petite Watch', price: 3999, image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600', subcategory: 'Watches'},
        {id: 'ac-w5', brand: 'Zara', name: 'Silk Hair Scarf', price: 599, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600', subcategory: 'Scarves'},
        {id: 'ac-w6', brand: 'Pandora', name: 'Silver Charm Bracelet', price: 1799, image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600', subcategory: 'Jewelry'},
        {id: 'ac-w7', brand: 'H&M', name: 'Straw Tote Bag', price: 899, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600', subcategory: 'Bags'},
        {id: 'ac-w8', brand: 'Ray-Ban', name: 'Cat-Eye Frames', price: 4299, image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600', subcategory: 'Sunglasses'},
      ];
    }
    return [
      {id: 'ac-m1', brand: 'Fossil', name: 'Chronograph Watch', price: 5499, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600', subcategory: 'Watches'},
      {id: 'ac-m2', brand: 'Ray-Ban', name: 'Aviator Sunglasses', price: 4999, image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600', subcategory: 'Sunglasses'},
      {id: 'ac-m3', brand: 'Adidas', name: 'Running Cap', price: 799, image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600', subcategory: 'Caps'},
      {id: 'ac-m4', brand: 'Tommy Hilfiger', name: 'Leather Belt', price: 1499, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a45?w=600', subcategory: 'Belts'},
      {id: 'ac-m5', brand: 'Herschel', name: 'Classic Backpack', price: 2999, image: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600', subcategory: 'Bags'},
      {id: 'ac-m6', brand: 'Daniel Wellington', name: 'Minimalist Watch', price: 3999, image: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600', subcategory: 'Watches'},
      {id: 'ac-m7', brand: 'Nike', name: 'Tech Crossbody', price: 1799, image: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600', subcategory: 'Bags'},
      {id: 'ac-m8', brand: 'Oakley', name: 'Sport Sunglasses', price: 3499, image: 'https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=600', subcategory: 'Sunglasses'},
    ];
  }, [activeGender]);

  const renderAccessoryCards = () => (
    <View style={styles.shoeCardsSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shoeCardsList}
        decelerationRate="fast"
        snapToInterval={SC_W + 12}
      >
        {ACCESSORY_CARDS.map(item => (
          <TouchableOpacity key={item.id} style={styles.shoeCard} activeOpacity={0.85} onPress={() => navigation.navigate('CategoryDetail', {categoryType: item.subcategory === 'Watches' ? 'Accessories' : item.subcategory === 'Bags' ? 'Bags' : 'Accessories'})}>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Svg width={SC_W} height={SC_H} style={StyleSheet.absoluteFill}>
                <Defs>
                  <ClipPath id={`accClip-${item.id}`}>
                    <Path d={scCardPath} />
                  </ClipPath>
                </Defs>
                <SvgImage
                  href={{uri: item.image}}
                  x={0} y={0} width={SC_W} height={SC_H * 0.6}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#accClip-${item.id})`}
                />
                <Path d={scCardPath} fill="none" stroke={isDark ? T.borderLight : 'rgba(0,0,0,0.08)'} strokeWidth={1} />
              </Svg>
            </View>
            <View style={styles.shoeCardInfo} pointerEvents="none">
              <Text style={styles.shoeCardBrand}>{item.brand}</Text>
              <Text style={styles.shoeCardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.shoeCardPrice}>{formatPrice(item.price)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.shoeCardPlus, {backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Accessories'})}>
              <Icon name="arrow-right" size={16} color={activeGender === 'Men' ? '#000' : '#fff'} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ========== Shared product card renderer (SVG-clipped cards like shoes) ==========
  const renderProductCards = (products: {id: string; name: string; brand: string; price: number; originalPrice?: number; discount?: number; image: string}[], keyPrefix: string) => (
    <View style={styles.shoeCardsSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shoeCardsList}
        decelerationRate="fast"
        snapToInterval={SC_W + 12}
      >
        {products.map(p => (
          <TouchableOpacity key={`${keyPrefix}-${p.id}`} style={styles.shoeCard} activeOpacity={0.85} onPress={() => goToProduct(p)}>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Svg width={SC_W} height={SC_H} style={StyleSheet.absoluteFill}>
                <Defs>
                  <ClipPath id={`pcClip-${keyPrefix}-${p.id}`}>
                    <Path d={scCardPath} />
                  </ClipPath>
                </Defs>
                <SvgImage
                  href={{uri: p.image}}
                  x={0} y={0} width={SC_W} height={SC_H * 0.6}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#pcClip-${keyPrefix}-${p.id})`}
                />
                <Path d={scCardPath} fill="none" stroke={isDark ? T.borderLight : 'rgba(0,0,0,0.08)'} strokeWidth={1} />
              </Svg>
            </View>
            <View style={styles.shoeCardInfo} pointerEvents="none">
              <Text style={styles.shoeCardBrand}>{p.brand}</Text>
              <Text style={styles.shoeCardName} numberOfLines={1}>{p.name}</Text>
              <View style={styles.shoeCardPriceRow}>
                <Text style={styles.shoeCardPrice}>{formatPrice(p.price)}</Text>
                {p.originalPrice && (
                  <Text style={styles.shoeCardOldPrice}>{formatPrice(p.originalPrice)}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.shoeCardPlus, {backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}]}
              activeOpacity={0.8}
              onPress={() => quickAddToCart(p)}>
              <Icon name="plus" size={16} color={activeGender === 'Men' ? '#000' : '#fff'} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ========== TOPS — Split banner + wide overlay cards ==========
  const TOPS_PRODUCTS = activeGender === 'Women' ? [
    {id: 'tw1', name: 'Silk Camisole', brand: 'Massimo Dutti', price: 2499, originalPrice: 3999, discount: 37, image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400'},
    {id: 'tw2', name: 'Cropped Knit', brand: 'Zara', price: 1799, image: 'https://images.unsplash.com/photo-1564246544814-647aff343a3f?w=400'},
    {id: 'tw3', name: 'Ruffle Blouse', brand: 'H&M', price: 1499, originalPrice: 2499, discount: 40, image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400'},
    {id: 'tw4', name: 'Blazer Top', brand: 'Mango', price: 3299, image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400'},
    {id: 'tw5', name: 'Ribbed Tank', brand: 'Uniqlo', price: 999, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400'},
  ] : [
    {id: 'tm1', name: 'Graphic Tee', brand: 'Zara', price: 1499, originalPrice: 2199, discount: 32, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400'},
    {id: 'tm2', name: 'Oxford Shirt', brand: 'H&M', price: 1999, originalPrice: 2999, discount: 33, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'},
    {id: 'tm3', name: 'Striped Polo', brand: 'Ralph Lauren', price: 3499, image: 'https://images.unsplash.com/photo-1625910513413-5fc42eb01100?w=400'},
    {id: 'tm4', name: 'Henley Sleeve', brand: 'Uniqlo', price: 1299, image: 'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=400'},
    {id: 'tm5', name: 'Linen Shirt', brand: 'Mango', price: 2299, originalPrice: 3499, discount: 34, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'},
  ];
  const renderTopsSection = () => {
    const isW = activeGender === 'Women';
    return (
      <View style={styles.topsSectionWrap}>
        <View style={{height: 220, overflow: 'hidden', position: 'relative'}}>
          <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800' : 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800'}} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%'}} resizeMode="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.85)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
          {/* Content row */}
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24}}>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10}}>
                <View style={{width: 24, height: 2, borderRadius: 1, backgroundColor: genderPalette.mid}} />
                <Text style={{fontSize: 10, fontWeight: '700', color: genderPalette.mid, letterSpacing: 3, fontFamily: FONTS.sans}}>NEW IN</Text>
              </View>
              <Text style={{fontSize: Math.min(28, 28 * S), fontWeight: '800', color: '#fff', fontFamily: FONTS.serif, lineHeight: Math.min(32, 32 * S)}}>
                {isW ? 'Tops That\nTurn Heads' : 'Layer Up\nYour Game'}
              </Text>
              <Text style={{fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: FONTS.sans, marginTop: 8, fontStyle: 'italic'}}>
                {isW ? 'Blouses, tanks & beyond' : 'Tees, shirts & more'}
              </Text>
            </View>
            {/* Glass CTA */}
            <TouchableOpacity
              style={{backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center'}}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Tops'})}>
              <Icon name="arrow-right" size={18} color="#fff" />
              <Text style={{fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 2, fontFamily: FONTS.sans, marginTop: 6}}>SHOP</Text>
            </TouchableOpacity>
          </View>
          {/* Bottom accent line */}
          <View style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: genderPalette.mid, opacity: 0.4}} />
        </View>
        {renderProductCards(TOPS_PRODUCTS, 'tops')}
      </View>
    );
  };

  // ========== BOTTOMS — Dark full-bleed banner + 2-col grid ==========
  const BOTTOMS_PRODUCTS = activeGender === 'Women' ? [
    {id: 'bw1', name: 'Wide Leg Trousers', brand: 'Mango', price: 2799, originalPrice: 3999, discount: 30, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'},
    {id: 'bw2', name: 'Pleated Skirt', brand: 'Zara', price: 1999, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400'},
    {id: 'bw3', name: 'High Rise Jeans', brand: "Levi's", price: 3499, originalPrice: 4999, discount: 30, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400'},
    {id: 'bw4', name: 'Satin Palazzo', brand: 'H&M', price: 1599, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400'},
  ] : [
    {id: 'bm1', name: 'Slim Chinos', brand: 'Zara', price: 2499, originalPrice: 3499, discount: 28, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'},
    {id: 'bm2', name: 'Relaxed Joggers', brand: 'Nike', price: 2999, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400'},
    {id: 'bm3', name: 'Cargo Pants', brand: 'H&M', price: 1799, originalPrice: 2499, discount: 28, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'},
    {id: 'bm4', name: 'Classic Denim', brand: "Levi's", price: 3999, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400'},
  ];
  const renderBottomsSection = () => {
    const isW = activeGender === 'Women';
    return (
      <View style={styles.bottomsSectionWrap}>
        <View style={{height: 260, overflow: 'hidden', position: 'relative'}}>
          <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900' : 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900'}} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%'}} resizeMode="cover" />
          <LinearGradient colors={isDark ? [genderPalette.dark + 'E6', 'transparent', genderPalette.dark + 'CC'] : ['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.55)']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
          {/* Floating glass card */}
          <View style={{position: 'absolute', bottom: 20, left: 20, right: 20}}>
            <View style={{backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden'}}>
              <BlurView blurType={T.blurType} blurAmount={16} style={StyleSheet.absoluteFill} />
              <View>
                <Text style={{fontSize: 10, fontWeight: '700', color: genderPalette.light, letterSpacing: 3, fontFamily: FONTS.sans}}>BOTTOMS</Text>
                <Text style={{fontSize: Math.min(22, 22 * S), fontWeight: '800', color: '#fff', fontFamily: FONTS.serif, lineHeight: Math.min(26, 26 * S), marginTop: 2, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 3}}>
                  {isW ? 'Perfect Fit' : 'Bottom Half'}
                </Text>
              </View>
              <TouchableOpacity
                style={{backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 6}}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Bottoms'})}>
                <Text style={{fontSize: 10, fontWeight: '700', letterSpacing: 1.5, fontFamily: FONTS.sans, color: activeGender === 'Men' ? '#000' : '#fff'}}>SHOP</Text>
                <Icon name="arrow-right" size={12} color={activeGender === 'Men' ? '#000' : '#fff'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {renderProductCards(BOTTOMS_PRODUCTS, 'bottoms')}
      </View>
    );
  };

  // ========== OUTERWEAR — Cinematic banner + large overlay cards ==========
  const OUTER_PRODUCTS = activeGender === 'Women' ? [
    {id: 'ow1', name: 'Trench Coat', brand: 'Burberry', price: 9999, image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400'},
    {id: 'ow2', name: 'Cropped Blazer', brand: 'Zara', price: 3999, originalPrice: 5999, discount: 33, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'},
    {id: 'ow3', name: 'Teddy Coat', brand: 'Mango', price: 4999, originalPrice: 7499, discount: 33, image: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400'},
  ] : [
    {id: 'om1', name: 'Leather Bomber', brand: 'AllSaints', price: 8999, originalPrice: 12999, discount: 30, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'},
    {id: 'om2', name: 'Wool Overcoat', brand: 'Massimo Dutti', price: 7499, image: 'https://images.unsplash.com/photo-1544923246-77307dd270cb?w=400'},
    {id: 'om3', name: 'Puffer Jacket', brand: 'North Face', price: 5999, originalPrice: 8999, discount: 33, image: 'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=400'},
  ];
  const renderOuterwearSection = () => {
    const isW = activeGender === 'Women';
    return (
      <View style={styles.outerSectionWrap}>
        <View style={{paddingHorizontal: SIZES.screenPadding}}>
          {/* Section header with accent bar */}
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16}}>
            <View style={{width: 3, height: 28, borderRadius: 2, backgroundColor: genderPalette.mid}} />
            <View>
              <Text style={{fontSize: 10, fontWeight: '700', color: isDark ? genderPalette.light : 'rgba(0,0,0,0.45)', letterSpacing: 3, fontFamily: FONTS.sans}}>OUTERWEAR</Text>
              <Text style={{fontSize: Math.min(22, 22 * S), fontWeight: '800', color: isDark ? genderPalette.lightest : '#1A1A1A', fontFamily: FONTS.serif, lineHeight: Math.min(26, 26 * S)}}>
                {isW ? 'Wrap It Up' : 'Jacket Season'}
              </Text>
            </View>
          </View>
          {/* Overlapping stacked image cards */}
          <View style={{height: 260, position: 'relative'}}>
            <View style={{position: 'absolute', top: 0, left: 0, right: 60, height: 200, borderRadius: 20, overflow: 'hidden', transform: [{rotate: '-2deg'}]}}>
              <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600' : 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600'}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFill} />
            </View>
            <View style={{position: 'absolute', top: 40, left: 60, right: 0, height: 200, borderRadius: 20, overflow: 'hidden', transform: [{rotate: '2deg'}], borderWidth: 1, borderColor: T.border}}>
              <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600' : 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600'}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} />
              <View style={{position: 'absolute', bottom: 16, left: 16, right: 16}}>
                <Text style={{fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.sans, fontStyle: 'italic'}}>
                  {isW ? 'Coats, blazers & jackets' : 'Bombers, coats & layers'}
                </Text>
                <TouchableOpacity
                  style={{marginTop: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6}}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Outerwear'})}>
                  <Text style={{fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 2, fontFamily: FONTS.sans}}>EXPLORE</Text>
                  <Icon name="arrow-up-right" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {renderProductCards(OUTER_PRODUCTS, 'outer')}
      </View>
    );
  };

  // ========== DRESSES — Tall portrait banner + tall portrait cards ==========
  const DRESS_PRODUCTS = activeGender === 'Women' ? [
    {id: 'dw1', name: 'Satin Midi', brand: 'Massimo Dutti', price: 4999, originalPrice: 7999, discount: 37, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400'},
    {id: 'dw2', name: 'Floral Maxi', brand: 'Zara', price: 2999, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'},
    {id: 'dw3', name: 'Bodycon Mini', brand: 'H&M', price: 1799, originalPrice: 2999, discount: 40, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400'},
    {id: 'dw4', name: 'Wrap Dress', brand: 'Mango', price: 3499, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'},
  ] : [
    {id: 'dm1', name: 'Classic Suit', brand: 'Hugo Boss', price: 12999, originalPrice: 18999, discount: 31, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400'},
    {id: 'dm2', name: 'Formal Blazer', brand: 'Massimo Dutti', price: 6999, image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400'},
    {id: 'dm3', name: 'Tuxedo Jacket', brand: 'Armani', price: 15999, originalPrice: 22999, discount: 30, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'},
    {id: 'dm4', name: 'Vest Set', brand: 'Zara', price: 4999, image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400'},
  ];
  const renderDressesSection = () => {
    const isW = activeGender === 'Women';
    return (
      <View style={styles.dressSectionWrap}>
        <View style={{height: 360, overflow: 'hidden', position: 'relative'}}>
          <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900' : 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900'}} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%'}} resizeMode="cover" />
          {/* Dramatic vignette gradient */}
          <LinearGradient colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.75)']} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['transparent', isDark ? genderPalette.dark + '90' : 'rgba(0,0,0,0.4)']} start={{x: 0, y: 0}} end={{x: 0, y: 1}} style={StyleSheet.absoluteFill} />
          {/* Top decorative tag */}
          <View style={{position: 'absolute', top: 22, left: 0, right: 0, alignItems: 'center'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
              <View style={{width: 40, height: 1, backgroundColor: 'rgba(255,255,255,0.3)'}} />
              <Text style={{fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 4, fontFamily: FONTS.sans}}>
                {isW ? 'THE DRESS EDIT' : 'THE FORMAL EDIT'}
              </Text>
              <View style={{width: 40, height: 1, backgroundColor: 'rgba(255,255,255,0.3)'}} />
            </View>
          </View>
          {/* Bottom centered content */}
          <View style={{position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 28}}>
            <Text style={{fontSize: Math.min(34, 34 * S), fontWeight: '800', color: '#fff', fontFamily: FONTS.serif, textAlign: 'center', letterSpacing: 1, lineHeight: Math.min(38, 38 * S)}}>
              {isW ? 'Dress the\nMood' : 'Suited &\nBooted'}
            </Text>
            <TouchableOpacity
              style={{marginTop: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 28, backgroundColor: 'rgba(255,255,255,0.08)'}}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Dresses'})}>
              <Text style={{fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 3, fontFamily: FONTS.sans}}>EXPLORE</Text>
            </TouchableOpacity>
          </View>
        </View>
        {renderProductCards(DRESS_PRODUCTS, 'dress')}
      </View>
    );
  };

  // ========== ACTIVEWEAR — Gradient banner + compact rounded cards ==========
  const ACTIVE_PRODUCTS = activeGender === 'Women' ? [
    {id: 'aw1', name: 'Seamless Leggings', brand: 'Lululemon', price: 3999, originalPrice: 5999, discount: 33, image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400'},
    {id: 'aw2', name: 'Sports Bra', brand: 'Nike', price: 1499, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'},
    {id: 'aw3', name: 'Yoga Tank', brand: 'Alo Yoga', price: 2499, originalPrice: 3499, discount: 28, image: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=400'},
    {id: 'aw4', name: 'Running Jacket', brand: 'Adidas', price: 2999, image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400'},
    {id: 'aw5', name: 'Biker Shorts', brand: 'Puma', price: 1199, image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400'},
  ] : [
    {id: 'am1', name: 'Dri-Fit Tee', brand: 'Nike', price: 1999, originalPrice: 2999, discount: 33, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'},
    {id: 'am2', name: 'Compression Shorts', brand: 'Under Armour', price: 1799, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400'},
    {id: 'am3', name: 'Track Jacket', brand: 'Adidas', price: 3499, originalPrice: 4999, discount: 30, image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400'},
    {id: 'am4', name: 'Running Shorts', brand: 'Puma', price: 1299, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'},
    {id: 'am5', name: 'Gym Hoodie', brand: 'Nike', price: 3999, image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400'},
  ];
  const renderActivewearSection = () => {
    const isW = activeGender === 'Women';
    return (
      <View style={styles.activeSectionWrap}>
        <View style={{height: 220, overflow: 'hidden', position: 'relative'}}>
          <LinearGradient colors={isDark ? [genderPalette.dark, genderPalette.mid + '40', genderPalette.dark] : [genderPalette.mid + '15', genderPalette.mid + '08', genderPalette.mid + '15']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={StyleSheet.absoluteFill} />
          {/* Geometric accent shapes */}
          <View style={{position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, borderWidth: 1.5, borderColor: genderPalette.mid + '25'}} />
          <View style={{position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: genderPalette.mid + '10'}} />
          {/* Content row */}
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 1, padding: 22, justifyContent: 'center'}}>
              <View style={{backgroundColor: genderPalette.mid + '25', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start', marginBottom: 10}}>
                <Text style={{fontSize: 9, fontWeight: '700', color: isDark ? genderPalette.lightest : genderPalette.mid, letterSpacing: 2, fontFamily: FONTS.sans}}>ACTIVEWEAR</Text>
              </View>
              <Text style={{fontSize: Math.min(28, 28 * S), fontWeight: '800', color: isDark ? '#fff' : '#1A1A1A', fontFamily: FONTS.serif, lineHeight: Math.min(32, 32 * S)}}>
                {isW ? 'Move in\nStyle' : 'Train\nHarder'}
              </Text>
              <Text style={{fontSize: 11, color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)', fontFamily: FONTS.sans, marginTop: 6}}>
                {isW ? 'Leggings, sports bras & more' : 'Gym-ready essentials'}
              </Text>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, alignSelf: 'flex-start', marginTop: 14}}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Activewear'})}>
                <Text style={{fontSize: 10, fontWeight: '700', letterSpacing: 1.5, fontFamily: FONTS.sans, color: activeGender === 'Men' ? '#000' : '#fff'}}>SHOP NOW</Text>
                <Icon name="arrow-right" size={12} color={activeGender === 'Men' ? '#000' : '#fff'} />
              </TouchableOpacity>
            </View>
            {/* Image side with organic border */}
            <View style={{width: '40%', overflow: 'hidden', borderTopLeftRadius: 40, borderBottomLeftRadius: 40}}>
              <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=500' : 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
              <LinearGradient colors={isDark ? [genderPalette.dark + '60', 'transparent'] : [genderPalette.mid + '20', 'transparent']} start={{x: 0, y: 0.5}} end={{x: 1, y: 0.5}} style={StyleSheet.absoluteFill} />
            </View>
          </View>
        </View>
        {renderProductCards(ACTIVE_PRODUCTS, 'active')}
      </View>
    );
  };

  // ========== TRENDING TICKER (between sections) ==========
  const TRENDING_TAGS = activeGender === 'Women'
    ? ['Quiet Luxury', 'Coquette', 'Clean Girl', 'Y2K Revival', 'Mob Wife', 'Coastal', 'Dark Academia', 'Balletcore']
    : ['Oversized Fit', 'Quiet Luxury', 'Dark Academia', 'Streetcore', 'Old Money', 'Gorpcore', 'Minimalist', 'Workwear'];
  const renderTrendingTicker = () => (
    <View style={{marginTop: 32, overflow: 'hidden'}}>
      <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding, marginBottom: 14}}>
        <View style={{width: 6, height: 6, borderRadius: 3, backgroundColor: genderPalette.mid, marginRight: 8}} />
        <Text style={{fontSize: 11, fontWeight: '700', color: isDark ? genderPalette.light : 'rgba(0,0,0,0.45)', letterSpacing: 3, fontFamily: FONTS.sans}}>TRENDING NOW</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: SIZES.screenPadding, gap: 10}}>
        {TRENDING_TAGS.map((tag, i) => (
          <TouchableOpacity key={tag} style={{backgroundColor: i === 0 ? genderPalette.mid + '20' : T.chipBg, borderWidth: 1, borderColor: i === 0 ? genderPalette.mid + '40' : T.chipBorder, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 18}} activeOpacity={0.8}>
            <Text style={{fontSize: 12, fontWeight: '600', color: i === 0 ? (isDark ? genderPalette.lightest : genderPalette.mid) : T.chipText, fontFamily: FONTS.sans}}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ========== EDITORIAL QUOTE (glass card with fashion quote) ==========
  const renderEditorialQuote = () => (
    <View style={{marginTop: 32, paddingHorizontal: SIZES.screenPadding}}>
      <View style={{backgroundColor: T.glass, borderWidth: 1, borderColor: T.glassBorder, borderRadius: 24, paddingVertical: 32, paddingHorizontal: 28, overflow: 'hidden', position: 'relative'}}>
        <BlurView blurType={T.blurType} blurAmount={12} style={StyleSheet.absoluteFill} />
        <View style={{width: 32, height: 3, borderRadius: 2, backgroundColor: genderPalette.mid, marginBottom: 16}} />
        <Text style={{fontSize: Math.min(20, 20 * S), fontWeight: '300', color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)', fontFamily: FONTS.serif, lineHeight: Math.min(28, 28 * S), fontStyle: 'italic'}}>
          "Fashion is the armor to survive the reality of everyday life."
        </Text>
        <Text style={{fontSize: 11, fontWeight: '600', color: isDark ? genderPalette.light : genderPalette.mid, fontFamily: FONTS.sans, marginTop: 14, letterSpacing: 2}}>
          — BILL CUNNINGHAM
        </Text>
      </View>
    </View>
  );

  // ========== CURATED PICKS (staggered bento cards) ==========
  const renderCuratedPicks = () => {
    const isW = activeGender === 'Women';
    return (
      <View style={{marginTop: 32}}>
        <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding, marginBottom: 16}}>
          <Text style={{fontSize: Math.min(22, 22 * S), fontWeight: '800', color: isDark ? genderPalette.lightest : '#1A1A1A', fontFamily: FONTS.serif, flex: 1}}>Curated Picks</Text>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 4}} onPress={() => handleSeeAll('Curated', genderProducts.slice(0, 12))}>
            <Text style={{fontSize: 11, fontWeight: '600', color: genderPalette.mid, fontFamily: FONTS.sans, letterSpacing: 1}}>SEE ALL</Text>
            <Icon name="arrow-right" size={12} color={genderPalette.mid} />
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', gap: 12, paddingHorizontal: SIZES.screenPadding}}>
          {/* Left tall card */}
          <TouchableOpacity style={{flex: 1, height: 280, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: T.border}} activeOpacity={0.85} onPress={() => navigation.navigate('CategoryDetail', {categoryType: isW ? 'Dresses' : 'Tops'})}>
            <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500' : 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500'}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
            <View style={{position: 'absolute', bottom: 16, left: 14, right: 14}}>
              <Text style={{fontSize: Math.min(18, 18 * S), fontWeight: '800', color: '#fff', fontFamily: FONTS.serif}}>{isW ? 'Date Night' : 'Street Ready'}</Text>
              <Text style={{fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: FONTS.sans, marginTop: 4}}>12 pieces</Text>
            </View>
          </TouchableOpacity>
          {/* Right two stacked cards */}
          <View style={{flex: 1, gap: 12}}>
            <TouchableOpacity style={{flex: 1, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: T.border}} activeOpacity={0.85} onPress={() => navigation.navigate('CategoryDetail', {categoryType: isW ? 'Tops' : 'Bottoms'})}>
              <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500' : 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500'}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} />
              <View style={{position: 'absolute', bottom: 12, left: 12}}>
                <Text style={{fontSize: 14, fontWeight: '700', color: '#fff', fontFamily: FONTS.serif}}>{isW ? 'Brunch' : 'Weekend'}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: T.border}} activeOpacity={0.85} onPress={() => navigation.navigate('CategoryDetail', {categoryType: isW ? 'Outerwear' : 'Outerwear'})}>
              <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500' : 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500'}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} />
              <View style={{position: 'absolute', bottom: 12, left: 12}}>
                <Text style={{fontSize: 14, fontWeight: '700', color: '#fff', fontFamily: FONTS.serif}}>{isW ? 'Party' : 'Formal'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };


  // ========== EXPLORE — Sticky header + flat masonry ==========
  const EXPLORE_FILTERS = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Activewear'];

  const filteredExploreProducts = useMemo(() => {
    let prods = genderProducts;
    if (exploreFilter !== 'All') {
      prods = prods.filter(p => p.category === exploreFilter);
    }
    if (exploreSearchQuery.trim()) {
      const q = exploreSearchQuery.toLowerCase();
      prods = prods.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    return prods;
  }, [genderProducts, exploreFilter, exploreSearchQuery]);

  const {leftCol, rightCol} = useMemo(() => {
    const left: typeof filteredExploreProducts = [];
    const right: typeof filteredExploreProducts = [];
    filteredExploreProducts.forEach((p, i) => {
      if (i % 2 === 0) left.push(p);
      else right.push(p);
    });
    return {leftCol: left, rightCol: right};
  }, [filteredExploreProducts]);

  // Sticky header animated style — smooth transition
  const exploreStickyStyle = useAnimatedStyle(() => {
    const offset = scrollY.value - exploreSectionY.value;
    const progress = Math.min(Math.max(offset / 60, 0), 1);
    return {
      opacity: progress,
      transform: [{translateY: (1 - progress) * -40}],
      pointerEvents: progress > 0.1 ? 'auto' as const : 'none' as const,
    };
  });

  const onExploreSectionLayout = useCallback((e: any) => {
    exploreSectionY.value = e.nativeEvent.layout.y;
  }, [exploreSectionY]);

  const renderExploreCard = (product: Product, index: number, colIndex: number) => {
    const imgHeight = (index + colIndex) % 3 === 0 ? 220 : (index + colIndex) % 3 === 1 ? 180 : 150;
    return (
      <TouchableOpacity key={`explore-${product.id}`} style={styles.exploreCard} activeOpacity={0.9} onPress={() => navigation.navigate('ProductDetail', {product})}>
        <View style={{width: '100%', height: imgHeight, borderRadius: 16, overflow: 'hidden'}}>
          <Image source={{uri: product.images[0]}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
          <TouchableOpacity style={styles.exploreCardHeart} activeOpacity={0.7} onPress={() => dispatch({type: 'TOGGLE_FAVORITE', payload: product.id})}>
            <Icon name="heart" size={14} color={state.favorites.includes(product.id) ? '#FF4B6E' : '#fff'} />
          </TouchableOpacity>
        </View>
        <View style={styles.exploreCardInfo}>
          <Text style={styles.exploreCardBrand}>{product.brand}</Text>
          <Text style={styles.exploreCardName} numberOfLines={2}>{product.name}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4}}>
            <Text style={styles.exploreCardPrice}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text style={styles.exploreCardOldPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Inline explore header (scrolls normally, triggers sticky overlay)
  const renderExploreInlineHeader = () => (
    <View onLayout={onExploreSectionLayout} style={styles.exploreHeader}>
      <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding, marginBottom: 14}}>
        <Text style={styles.exploreTitle}>Explore</Text>
        <View style={{flex: 1}} />
        <Text style={{fontSize: 12, fontWeight: '600', color: isDark ? genderPalette.light : 'rgba(0,0,0,0.4)', fontFamily: FONTS.sans}}>{filteredExploreProducts.length} items</Text>
      </View>
      <View style={styles.exploreSearchBar}>
        <Icon name="search" size={18} color="#999" />
        <TextInput
          style={styles.exploreSearchInput}
          placeholder="Search products, brands..."
          placeholderTextColor="#aaa"
          value={exploreSearchQuery}
          onChangeText={setExploreSearchQuery}
        />
        {exploreSearchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setExploreSearchQuery('')}>
            <Icon name="x" size={16} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exploreFilterRow}>
        {EXPLORE_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.exploreFilterChip, exploreFilter === f && {backgroundColor: genderPalette.mid}]}
            activeOpacity={0.8}
            onPress={() => setExploreFilter(f)}
          >
            <Text style={[styles.exploreFilterChipText, exploreFilter === f && {color: '#fff'}]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Flat masonry grid (rendered directly in main scroll)
  const renderExploreMasonry = () => (
    <View style={{paddingBottom: 40}}>
      <View style={styles.exploreMasonry}>
        <View style={styles.exploreColumn}>
          {leftCol.map((p, i) => renderExploreCard(p, i, 0))}
        </View>
        <View style={styles.exploreColumn}>
          {rightCol.map((p, i) => renderExploreCard(p, i, 1))}
        </View>
      </View>
    </View>
  );

  // Sticky overlay header (fixed to top when scrolled past)
  const renderExploreStickyOverlay = () => (
    <ReAnimated.View
      style={[{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
        paddingTop: insets.top + 10,
        backgroundColor: T.bg,
      }, exploreStickyStyle]}
      pointerEvents="box-none"
    >
      <View style={{paddingBottom: 4}} pointerEvents="auto">
        <View style={styles.exploreSearchBar}>
          <Icon name="search" size={18} color="#999" />
          <TextInput
            style={styles.exploreSearchInput}
            placeholder="Search products, brands..."
            placeholderTextColor="#aaa"
            value={exploreSearchQuery}
            onChangeText={setExploreSearchQuery}
          />
          {exploreSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setExploreSearchQuery('')}>
              <Icon name="x" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exploreFilterRow}>
          {EXPLORE_FILTERS.map(f => (
            <TouchableOpacity
              key={`sticky-${f}`}
              style={[styles.exploreFilterChip, exploreFilter === f && {backgroundColor: genderPalette.mid}]}
              activeOpacity={0.8}
              onPress={() => setExploreFilter(f)}
            >
              <Text style={[styles.exploreFilterChipText, exploreFilter === f && {color: '#fff'}]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ReAnimated.View>
  );

  // 9. Classic Black Banner — Noir Editorial
  const renderClassicBlack = () => (
    <View style={styles.classicSection}>
      <View style={styles.classicBg}>
        <Image
          source={{uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'}}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFill} />
        {/* Accent line */}
        <View style={{position: 'absolute', top: 24, left: 24, width: 40, height: 3, borderRadius: 2, backgroundColor: genderPalette.mid}} />
        <View style={{flex: 1, justifyContent: 'flex-end', padding: 24}}>
          <Text style={{fontSize: Math.min(38, 38 * S), fontWeight: '900', color: '#fff', fontFamily: FONTS.serif, lineHeight: Math.min(42, 42 * S), letterSpacing: -0.5}}>
            CLASSIC{'\n'}BLACK
          </Text>
          <Text style={{fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: FONTS.sans, marginTop: 6, fontStyle: 'italic'}}>
            Own every night
          </Text>
          <TouchableOpacity
            style={{marginTop: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 22, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8}}
            onPress={() => handleSeeAll('Classic Black', genderProducts.slice(0, 8))}>
            <Text style={{fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 2, fontFamily: FONTS.sans}}>SEE ALL</Text>
            <Icon name="arrow-right" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFloatingCart = () => {
    const translateY = floatingCartAnim.interpolate({inputRange: [0, 1], outputRange: [100, 0]});
    // Move cart box down in sync with tab bar hiding (tabBarTranslateY: 0→160)
    const cartBottomOffset = tabBarTranslateY.interpolate({inputRange: [0, 160], outputRange: [0, 70], extrapolate: 'clamp'});
    return (
      <Animated.View
        style={[styles.floatingCart, {transform: [{translateY: Animated.add(translateY, cartBottomOffset)}], opacity: floatingCartAnim}]}
        pointerEvents={cartItemCount > 0 ? 'auto' : 'none'}>
        <TouchableOpacity style={styles.floatingCartInner} onPress={() => navigation.navigate('Cart')} activeOpacity={0.9}>
          <View style={styles.floatingCartLeft}>
            <View style={styles.floatingCartBadge}>
              <Text style={styles.floatingCartBadgeText}>{cartItemCount}</Text>
            </View>
            <View>
              <Text style={styles.floatingCartItems}>{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</Text>
              <Text style={styles.floatingCartTotal}>{formatPrice(cartTotal)}</Text>
            </View>
          </View>
          <View style={styles.floatingCartRight}>
            <Text style={styles.floatingCartCta}>View Cart</Text>
            <Icon name="arrow-right" size={16} color={activeGender === 'Men' ? '#000' : genderPalette.lightest} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[styles.container, {backgroundColor: isDark ? animatedColors.containerBg : T.bg}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? genderPalette.dark : T.bg} />


      {/* Fixed Header — only when search is open */}
      {searchOverlayVisible && (
        <View style={[styles.headerCurved, {paddingTop: insets.top + 10}]}>
          <View style={[styles.hSearchBarWrap, {paddingLeft: SIZES.screenPadding}]}>
            <TouchableOpacity style={styles.hSearchBackBtn} onPress={closeSearchOverlay}>
              <Icon name="arrow-left" size={20} color={T.iconColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hSearchBar, {flex: 1}]}
              activeOpacity={0.8}>
              <Icon name="search" size={16} color={isDark ? genderPalette.light : 'rgba(0,0,0,0.35)'} />
              <TextInput
                ref={searchInputRef}
                style={styles.hSearchInput}
                placeholder="Search brands, products..."
                placeholderTextColor={isDark ? genderPalette.light : 'rgba(0,0,0,0.35)'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                selectionColor={isDark ? genderPalette.lightest : genderPalette.mid}
                autoFocus
              />
              <TouchableOpacity onPress={() => setPhotoSearchModal(true)}>
                <Icon name="camera" size={16} color={isDark ? genderPalette.light : 'rgba(0,0,0,0.35)'} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Overlay Content */}
      {searchOverlayVisible && (
        <SearchOverlay
          visible={searchOverlayVisible}
          progress={searchOverlayProgress}
          onClose={closeSearchOverlay}
          navigation={navigation}
        />
      )}

      {/* Main Scrollable Content */}
      {!searchOverlayVisible && (
      <Animated.View style={{flex: 1, opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
      <ReAnimated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={reanimatedScrollHandler}
        scrollEventThrottle={Platform.OS === 'android' ? 16 : 1}
        bounces
        alwaysBounceVertical
        nestedScrollEnabled
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#ffffff' : '#000000'}
            colors={[isDark ? '#ffffff' : '#000000']}
          />
        }
        style={{flex: 1, backgroundColor: T.bg}}
        contentContainerStyle={cartItemCount > 0 ? {paddingBottom: 80} : undefined}>


        {/* Full background gradients — crossfade between Men & Women */}
        {isDark ? (
          <>
            {/* Men: Blue gradient at top center */}
            <Animated.View pointerEvents="none" style={{position: 'absolute', top: 0, left: 0, right: 0, height: 900, zIndex: 0, opacity: genderMix.interpolate({inputRange: [0, 1], outputRange: [1, 0]})}}>
              <LinearGradient
                colors={['rgba(65,0,245,0.4)', 'rgba(26,0,85,0.2)', 'transparent']}
                locations={[0, 0.35, 1]}
                start={{x: 0.5, y: 0}}
                end={{x: 0.5, y: 1}}
                style={{position: 'absolute', top: 0, left: 0, right: 0, height: 400}}
              />
              <LinearGradient
                colors={['transparent', '#000000']}
                locations={[0, 1]}
                style={{position: 'absolute', top: 400, left: 0, right: 0, height: 500}}
              />
            </Animated.View>
            {/* Women: Pink gradient at top center */}
            <Animated.View pointerEvents="none" style={{position: 'absolute', top: 0, left: 0, right: 0, height: 900, zIndex: 0, opacity: genderMix}}>
              <LinearGradient
                colors={['rgba(240,55,165,0.4)', 'rgba(51,0,31,0.2)', 'transparent']}
                locations={[0, 0.35, 1]}
                start={{x: 0.5, y: 0}}
                end={{x: 0.5, y: 1}}
                style={{position: 'absolute', top: 0, left: 0, right: 0, height: 500}}
              />
              <LinearGradient
                colors={['transparent', '#000000']}
                locations={[0, 1]}
                style={{position: 'absolute', top: 400, left: 0, right: 0, height: 500}}
              />
            </Animated.View>
            {/* Men gradient (blue) */}
            <Animated.View pointerEvents="none" style={{position: 'absolute', top: 600, left: 0, right: 0, height: 1200, zIndex: 0, opacity: genderMix.interpolate({inputRange: [0, 1], outputRange: [1, 0]})}}>
              <LinearGradient
                colors={['#000000', '#060018', '#0D0033', '#1A0055', '#0D0033', '#060018', '#000000', '#000000', '#060018', '#0D0033', '#1A0055', '#0D0033', '#060018', '#000000']}
                locations={[0, 0.02, 0.06, 0.12, 0.2, 0.3, 0.4, 0.5, 0.6, 0.68, 0.76, 0.84, 0.92, 1]}
                style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
              />
              <GrainOverlay />
            </Animated.View>
            {/* Women gradient (pink) */}
            <Animated.View pointerEvents="none" style={{position: 'absolute', top: 600, left: 0, right: 0, height: 1200, zIndex: 0, opacity: genderMix}}>
              <LinearGradient
                colors={['#000000', '#0A0008', '#1A0012', '#33001F', '#1A0012', '#0A0008', '#000000', '#000000', '#0A0008', '#1A0012', '#33001F', '#1A0012', '#0A0008', '#000000']}
                locations={[0, 0.02, 0.06, 0.12, 0.2, 0.3, 0.4, 0.5, 0.6, 0.68, 0.76, 0.84, 0.92, 1]}
                style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
              />
              <GrainOverlay />
            </Animated.View>
          </>
        ) : (
          <>
            {/* Men light: blue gradient at top */}
            <Animated.View pointerEvents="none" style={{position: 'absolute', top: 0, left: 0, right: 0, height: 900, zIndex: 0, opacity: genderMix.interpolate({inputRange: [0, 1], outputRange: [1, 0]})}}>
              <LinearGradient
                colors={['#B499FF', '#D4C6FF', '#EDE8FF', '#FAFAFA', '#FAFAFA']}
                locations={[0, 0.12, 0.28, 0.5, 1]}
                start={{x: 0.5, y: 0}}
                end={{x: 0.5, y: 1}}
                style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
              />
            </Animated.View>
            {/* Women light: pink gradient at top */}
            <Animated.View pointerEvents="none" style={{position: 'absolute', top: 0, left: 0, right: 0, height: 900, zIndex: 0, opacity: genderMix}}>
              <LinearGradient
                colors={['#FF99CC', '#FFBDD9', '#FFE8F0', '#FAFAFA', '#FAFAFA']}
                locations={[0, 0.12, 0.28, 0.5, 1]}
                start={{x: 0.5, y: 0}}
                end={{x: 0.5, y: 1}}
                style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
              />
            </Animated.View>
            {/* Men light: repeating blue waves below */}
            <Animated.View pointerEvents="none" style={{position: 'absolute', top: 600, left: 0, right: 0, height: 1200, zIndex: 0, opacity: genderMix.interpolate({inputRange: [0, 1], outputRange: [1, 0]})}}>
              <LinearGradient
                colors={['#FAFAFA', '#EDE8FF', '#D4C6FF', '#EDE8FF', '#FAFAFA', '#FAFAFA', '#EDE8FF', '#D4C6FF', '#EDE8FF', '#FAFAFA']}
                locations={[0, 0.08, 0.16, 0.24, 0.38, 0.55, 0.65, 0.75, 0.85, 1]}
                style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
              />
            </Animated.View>
            {/* Women light: repeating pink waves below */}
            <Animated.View pointerEvents="none" style={{position: 'absolute', top: 600, left: 0, right: 0, height: 1200, zIndex: 0, opacity: genderMix}}>
              <LinearGradient
                colors={['#FAFAFA', '#FFE8F0', '#FFBDD9', '#FFE8F0', '#FAFAFA', '#FAFAFA', '#FFE8F0', '#FFBDD9', '#FFE8F0', '#FAFAFA']}
                locations={[0, 0.08, 0.16, 0.24, 0.38, 0.55, 0.65, 0.75, 0.85, 1]}
                style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
              />
            </Animated.View>
          </>
        )}

        {/* Header */}
        <View style={[styles.headerCurved, {paddingTop: insets.top + 10}]}>
          <View style={styles.headerInner}>
            <View style={styles.headerLeft}>
              <View style={styles.deliveryTitleRow}>
                <Animated.Text style={[styles.deliveryLabel, {color: isDark ? animatedColors.textAccent : genderPalette.mid}]}>Delivery in </Animated.Text>
                <Animated.Text style={[styles.deliveryTime, {color: isDark ? animatedColors.lightest : T.text}]}>60 min</Animated.Text>
              </View>
              <TouchableOpacity style={styles.addressRow} activeOpacity={0.7}>
                <Animated.Text style={[styles.addressText, {color: isDark ? animatedColors.light : T.textSec}]} numberOfLines={1}>Sector 17, Chandigarh</Animated.Text>
                <Icon name="chevron-down" size={14} color={isDark ? genderPalette.light : T.textSec} />
              </TouchableOpacity>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.hIconBtn} onPress={toggleTheme}>
                <Icon name={isDark ? 'sun' : 'moon'} size={20} color={T.iconColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.hIconBtn} onPress={openSearchOverlay}>
                <Icon name="search" size={20} color={T.iconColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.hIconBtn} onPress={() => navigation.navigate('FavoritesTab')}>
                <Icon name="heart" size={20} color={T.iconColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.hIconBtn} onPress={() => navigation.navigate('ProfileTab')}>
                <Icon name="user" size={20} color={T.iconColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {searchQuery ? (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsTitle}>
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
            </Text>
            <View style={styles.productGrid}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onPress={() => {}} style={styles.gridCard} />
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* ClosetX Hero Banner */}
            {renderHeroBanner()}

            {/* Banner Carousel */}
            <View style={styles.bannerSection}>
              <Animated.ScrollView
                ref={bannerScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleBannerScroll}
                snapToInterval={BANNER_SNAP}
                decelerationRate="fast"
                contentContainerStyle={styles.bannerList}
                onScroll={Animated.event(
                  [{nativeEvent: {contentOffset: {x: bannerScrollX}}}],
                  {useNativeDriver: true},
                )}
                scrollEventThrottle={Platform.OS === 'android' ? 16 : 1}>
                {LOOP_BANNERS.map((banner, index) => renderBanner(banner, index))}
              </Animated.ScrollView>
            </View>


            {/* 1. Ticket Categories Grid */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderTicketCategories()}
            </AnimatedSection>

            {/* 2. Full-width Banner */}
            <AnimatedSection scrollY={scrollY} slideDistance={20}>
              {renderPromoBanner()}
            </AnimatedSection>

            {/* 3. Discover Brands Grid */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderDiscoverBrands()}
            </AnimatedSection>

            {/* 3.5 Shoe Banner */}
            <AnimatedSection scrollY={scrollY} slideDistance={20}>
              {renderShoeBanner()}
            </AnimatedSection>

            {/* 3.6 Shoe Product Cards */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderShoeCards()}
            </AnimatedSection>

            {/* Community / Editorial Bento Grid */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderCommunitySection()}
            </AnimatedSection>

            {/* Fashion Reels 3D Carousel */}
            {renderReelsSection()}

            {/* 8.5 Accessories Banner */}
            {renderAccessoriesBanner()}

            {/* Watch Bento Grid */}
            {renderWatchGrid()}

            {/* 8.6 Accessories Cards */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderAccessoryCards()}
            </AnimatedSection>

            {/* Tops */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderTopsSection()}
            </AnimatedSection>

            {/* Trending Ticker */}
            <AnimatedSection scrollY={scrollY} slideDistance={15}>
              {renderTrendingTicker()}
            </AnimatedSection>

            {/* Bottoms */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderBottomsSection()}
            </AnimatedSection>

            {/* Outerwear */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderOuterwearSection()}
            </AnimatedSection>

            {/* Editorial Quote */}
            <AnimatedSection scrollY={scrollY} slideDistance={15}>
              {renderEditorialQuote()}
            </AnimatedSection>

            {/* Dresses */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderDressesSection()}
            </AnimatedSection>

            {/* Curated Picks */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderCuratedPicks()}
            </AnimatedSection>

            {/* Activewear */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderActivewearSection()}
            </AnimatedSection>

            {/* 9. Classic Black Banner */}
            <AnimatedSection scrollY={scrollY} slideDistance={20}>
              {renderClassicBlack()}
            </AnimatedSection>

            {/* 10. Explore — inline header + flat masonry */}
            {renderExploreInlineHeader()}
            {renderExploreMasonry()}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ReAnimated.ScrollView>
      {/* Sticky explore header overlay */}
      {renderExploreStickyOverlay()}
      </Animated.View>
      )}

      {renderFloatingCart()}

      {/* Photo Search Glass Modal */}
      <Modal visible={photoSearchModal} transparent animationType="fade" onRequestClose={() => setPhotoSearchModal(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32}}>
          <View style={{width: '100%', borderRadius: 24, overflow: 'hidden'}}>
            <BlurView blurType={isDark ? 'dark' : 'light'} blurAmount={40} style={StyleSheet.absoluteFill} />
            <View style={{padding: 28, borderWidth: 1, borderRadius: 24, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}}>
              <Text style={{fontSize: 20, fontWeight: '700', fontFamily: 'Rondira-Medium', color: isDark ? '#FFF' : '#1A1A1A', marginBottom: 10}}>Photo Search</Text>
              <Text style={{fontSize: 14, fontFamily: 'Helvetica', lineHeight: 22, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)', marginBottom: 24}}>Coming soon! Search by taking a photo.</Text>
              <TouchableOpacity
                style={{paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: isDark ? genderPalette.lightest : genderPalette.mid}}
                onPress={() => setPhotoSearchModal(false)}>
                <Text style={{fontSize: 14, fontWeight: '700', fontFamily: 'Helvetica', color: isDark ? '#000' : '#FFF'}}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}


const createStyles = (colors: any, isDark: boolean, gp: {lightest: string; light: string; mid: string; dark: string}) => StyleSheet.create({
  container: {flex: 1},
  topGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 350, zIndex: 0,
  },
  // Header
  headerCurved: {
    backgroundColor: 'transparent', paddingBottom: 12, zIndex: 2,
  },
  headerInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16,
  },
  headerLeft: {flex: 1},
  deliveryTitleRow: {flexDirection: 'row', alignItems: 'baseline'},
  deliveryLabel: {
    fontSize: Math.min(21, 21 * S), fontWeight: '600', fontFamily: 'Inter',
    color: gp.mid,
    letterSpacing: -0.08 * 21, lineHeight: Math.min(21, 21 * S),
  },
  deliveryTime: {
    fontSize: Math.min(21, 21 * S), fontWeight: '600', fontFamily: 'Inter',
    color: isDark ? gp.lightest : '#1A1A1A',
    letterSpacing: -0.08 * 21, lineHeight: Math.min(21, 21 * S),
  },
  addressRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3},
  addressText: {
    fontSize: 13, fontWeight: '300', fontFamily: 'Inter',
    color: isDark ? gp.light : 'rgba(0,0,0,0.45)',
    letterSpacing: -0.08 * 13, lineHeight: 13,
  },
  headerActions: {flexDirection: 'row', alignItems: 'center', gap: 18},
  hIconBtn: {width: 36, height: 36, justifyContent: 'center', alignItems: 'center'},
  hSearchBarWrap: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 14, gap: 8,
  },
  hSearchBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: isDark ? gp.light + '30' : 'rgba(0,0,0,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },
  hSearchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: isDark ? gp.light + '30' : 'rgba(0,0,0,0.04)',
    borderRadius: 14, paddingHorizontal: 14, height: 42, gap: 8,
    borderWidth: 1, borderColor: isDark ? gp.light + '30' : 'rgba(0,0,0,0.06)',
  },
  hSearchInput: {
    flex: 1, fontSize: 13, color: isDark ? gp.lightest : '#1A1A1A',
    fontWeight: FONT_WEIGHTS.regular, fontFamily: 'Poppins',
  },
  // ClosetX Hero Banner
  heroBannerWrap: {marginTop: 10, paddingHorizontal: SIZES.screenPadding, overflow: 'visible'},
  closetXRow: {
    position: 'absolute', top: 7, right: 35 * S,
    flexDirection: 'row', alignItems: 'baseline', zIndex: 2,
  },
  closetXText: {
    fontSize: 35 * S, fontWeight: '900', fontFamily: 'Jost',
    color: isDark ? gp.lightest : '#1A1A1A',
    letterSpacing: -2.4, lineHeight: 38 * S,
  },
  closetXAccent: {
    fontSize: 30 * S, fontWeight: '900', fontFamily: 'Jost',
    color: gp.mid,
    letterSpacing: -2.4, lineHeight: 34 * S,
  },
  genderCardsRow: {flexDirection: 'row', gap: 12, marginTop: 28 * S, overflow: 'visible'},
  genderCard: {
    flex: 1, borderRadius: 18, overflow: 'hidden', position: 'relative',
  },
  genderCardGlass: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
  },
  genderCardActiveLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
  },
  genderCardContent: {
    position: 'absolute', top: 0, bottom: 0, left: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  genderCardFor: {
    fontSize: 9, fontWeight: '500', fontFamily: 'Poppins', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.45)',
    letterSpacing: 3, textTransform: 'uppercase', marginBottom: -2,
  },
  genderCardLabel: {
    fontSize: Math.min(22, 22 * S), fontWeight: '900', fontFamily: 'Jost', color: isDark ? '#FFFFFF' : '#1A1A1A',
    letterSpacing: 4, textTransform: 'uppercase', lineHeight: Math.min(24, 24 * S),
  },
  genderCardArrow: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  // Banner Carousel
  bannerSection: {marginTop: 20, overflow: 'visible', zIndex: 2, paddingVertical: 0},
  bannerList: {paddingHorizontal: BANNER_SIDE_PADDING, paddingVertical: 10},
  bannerCard: {width: '100%', height: 345 * S, borderRadius: 16, overflow: 'hidden'},
  bannerBgImage: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%',
  },
  bannerGradientOverlay: {flex: 1, padding: 0, justifyContent: 'space-between'},
  magHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16, marginHorizontal: 16,
  },
  magTitle: {
    fontSize: 24, fontWeight: FONT_WEIGHTS.bold, fontFamily: 'Helvetica',
    color: COLORS.white, letterSpacing: 6,
  },
  magSeasonBadge: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
  },
  magSeasonText: {
    fontSize: 10, fontWeight: FONT_WEIGHTS.bold, fontFamily: 'Helvetica',
    color: COLORS.white, letterSpacing: 2,
  },
  magIssueTag: {
    fontSize: 10, fontWeight: FONT_WEIGHTS.bold, fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.55)', letterSpacing: 3, textAlign: 'center',
  },
  magBottom: {gap: 4, marginBottom: 16, marginHorizontal: 16},
  magQuote: {
    fontSize: Math.min(24, 24 * S), fontWeight: FONT_WEIGHTS.bold, fontFamily: 'Helvetica',
    color: COLORS.white, lineHeight: Math.min(30, 30 * S), letterSpacing: -0.5,
  },
  magSubtitle: {
    fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Helvetica', fontStyle: 'italic', letterSpacing: 0.5,
  },
  magShopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1,
    borderColor: gp.dark === '#000000' ? '#CDF564' : 'rgba(255,255,255,0.35)',
    borderRadius: 6,
    paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: 4,
    backgroundColor: gp.dark === '#000000' ? '#CDF564' : 'transparent',
  },
  magShopBtnText: {
    fontSize: 10, fontWeight: FONT_WEIGHTS.bold,
    color: gp.dark === '#000000' ? '#000000' : COLORS.white,
    fontFamily: 'Helvetica', letterSpacing: 2,
  },
  bannerDots: {flexDirection: 'row', justifyContent: 'center', marginTop: 12},
  bannerDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? gp.light + '30' : 'rgba(0,0,0,0.12)', marginHorizontal: 3,
  },
  bannerDotActive: {width: 22, backgroundColor: gp.dark === '#000000' ? '#CDF564' : gp.mid},

  // --- 1. TICKET CATEGORIES ---
  ticketSection: {
    marginTop: -4, paddingHorizontal: SIZES.screenPadding,
  },
  ticketGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
  },
  ticketItem: {
    width: (width - SIZES.screenPadding * 2 - 18) / 4, marginBottom: 14,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 28,
    borderWidth: isDark ? 0 : 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  ticketTop: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  ticketImageShadow: {
    marginTop: -20,
    backgroundColor: 'transparent',
    width: 48, height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketImage: {
    width: 55 * S, height: 55 * S,
  },
  ticketPerforation: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 14,
    marginHorizontal: -1,
  },
  ticketNotchLeft: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: isDark ? gp.dark : '#FAFAFA', marginLeft: -7,
  },
  ticketDashedLine: {
    flex: 1, flexDirection: 'row', justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  ticketDash: {
    width: 4, height: 1, backgroundColor: '#E0E0E0',
  },
  ticketNotchRight: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: isDark ? gp.dark : '#FAFAFA', marginRight: -7,
  },
  ticketBottom: {
    paddingVertical: 8, alignItems: 'center',
  },
  ticketLabel: {
    fontSize: 9, fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: FONTS.sans, color: '#333', textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Shared CTA Bar (used by categories and brands)
  ctaBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: isDark ? gp.lightest + '15' : 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  ctaBarThumbs: {flexDirection: 'row', marginRight: 4},
  ctaBarThumb: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: isDark ? gp.dark : '#FAFAFA', marginLeft: -8,
  },
  ctaBarText: {
    fontSize: 13, fontWeight: FONT_WEIGHTS.semiBold, fontFamily: FONTS.sans,
    color: isDark ? gp.lightest : '#1A1A1A',
  },

  // --- 2. TREND SECTION ---
  trendSection: {marginTop: 18, paddingHorizontal: SIZES.screenPadding, gap: 2},
  trendCardWhiteHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, zIndex: 2,
  },
  trendBadge: {
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.2)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  trendBadgeText: {
    fontSize: 12, fontWeight: '600' as any, fontFamily: 'Helvetica', color: '#1A1A1A',
  },
  trendArrowDark: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  trendCardWhiteTitle: {
    position: 'absolute', bottom: 20, left: 0,
    fontSize: Math.min(28, 28 * S), fontWeight: '800' as any, fontFamily: 'Helvetica', color: isDark ? '#FFFFFF' : '#000000',
  },
  trendTextSection: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
  },
  trendBigText: {
    flex: 1, fontSize: Math.min(30, 30 * S), fontWeight: '800' as any, fontFamily: 'Helvetica',
    color: isDark ? gp.lightest : '#1A1A1A', lineHeight: Math.min(38, 38 * S),
  },
  trendArrowFloat: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginLeft: 12,
  },
  trendCardDarkHeader: {padding: 16},
  trendBadgeDark: {
    borderWidth: 1.5, borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start',
  },
  trendBadgeDarkText: {
    fontSize: 12, fontWeight: '600' as any, fontFamily: 'Helvetica', color: isDark ? '#FFFFFF' : '#1A1A1A',
  },
  trendCardDarkBottom: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: 16,
  },
  trendCardDarkTitle: {
    flex: 1, fontSize: 24, fontWeight: '800' as any, fontFamily: 'Helvetica',
    color: isDark ? '#FFFFFF' : '#1A1A1A', lineHeight: 30,
  },
  trendArrowSmall: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginLeft: 12,
  },
  trendChips: {flexDirection: 'row', gap: 6},
  trendChipCard: {
    flex: 1,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)', borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
  },
  trendChipInner: {
    paddingHorizontal: 12, paddingVertical: 14,
  },
  trendChipDot: {
    width: 6, height: 6, borderRadius: 3, marginBottom: 10, opacity: 0.9,
  },
  trendChipLabel: {
    fontSize: 13, fontWeight: '800' as any, fontFamily: 'Helvetica',
    color: isDark ? '#FFFFFF' : '#1A1A1A', letterSpacing: 0.8, lineHeight: 16, marginBottom: 4,
  },
  trendChipSub: {
    fontSize: 10, fontWeight: '500' as any, fontFamily: 'Helvetica',
    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
    letterSpacing: 0.3, marginBottom: 10,
  },
  trendChipRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
  },
  trendChipArrow: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)', marginTop: 2,
    justifyContent: 'center', alignItems: 'center',
  },

  // --- shared promo banner styles (used by shoe/accessories/bottoms banners) ---
  promoBannerTitle: {
    fontSize: Math.min(24, 24 * S), fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: '#FFFFFF', lineHeight: Math.min(30, 30 * S),
  },
  promoBannerSub: {
    fontSize: 13, fontFamily: FONTS.sans, color: 'rgba(255,255,255,0.85)',
    marginTop: 4, marginBottom: 12,
  },
  promoBannerBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingVertical: 10, paddingHorizontal: 22, borderRadius: 8, gap: 6,
  },
  promoBannerBtnText: {
    fontSize: 12, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.sans,
    color: gp.dark === '#000000' ? '#000000' : '#FFFFFF', letterSpacing: 1,
  },

  // --- 3. DISCOVER BRANDS ---
  brandsSection: {marginTop: 32, overflow: 'hidden'},
  brandsSectionTitle: {
    fontSize: 22, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: isDark ? gp.lightest : '#1A1A1A', marginBottom: 18, paddingHorizontal: SIZES.screenPadding,
  },
  brandGridCard: {
    width: (width - SIZES.screenPadding * 2 - 30) / 4,
    height: (width - SIZES.screenPadding * 2 - 30) / 4,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
    borderWidth: isDark ? 0 : 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  brandGridLogo: {width: '70%', height: '70%'},

  // --- 3.5 SHOE SHOWCASE ---
  shoeHeroRow: {
    paddingHorizontal: SIZES.screenPadding, paddingTop: 24, paddingBottom: 8,
  },
  shoeCardContent: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: '55%',
    paddingHorizontal: 20, paddingVertical: 22, justifyContent: 'center',
  },
  shoeCardTextSide: {},
  shoeHeroImg: {
    position: 'absolute', top: -30 * S, right: -50 * S, width: 250 * S, height: 250 * S,
  },
  shoeGlassTitle: {
    fontSize: Math.min(24, 24 * S), fontWeight: '900' as any, fontFamily: 'Helvetica',
    color: isDark ? '#FFFFFF' : '#1A1A1A', letterSpacing: 1, lineHeight: Math.min(28, 28 * S),
  },
  shoeGlassSub: {
    fontSize: 11, fontWeight: '500' as any, fontFamily: 'Helvetica',
    letterSpacing: 0.3, marginTop: 8, opacity: 0.9,
  },
  shoeGlassBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, gap: 6, marginTop: 12,
  },
  shoeGlassBtnText: {
    fontSize: 10, fontWeight: '700' as any, fontFamily: FONTS.sans,
    color: gp.dark === '#000000' ? '#000000' : '#FFFFFF', letterSpacing: 1,
  },
  shoeShowcaseWrap: {
    width: '100%', height: 300, overflow: 'hidden',
  },
  shoeShowcaseCircle: {
    position: 'absolute',
    top: -40,
    left: (width - SHOE_CIRCLE_SIZE) / 2,
    width: SHOE_CIRCLE_SIZE,
    height: SHOE_CIRCLE_SIZE,
    zIndex: 1,
  },
  shoeShowcaseGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: 2,
  },
  shoeCarouselWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3,
  },
  shoeCarouselContent: {},
  shoeCarouselSlide: {
    width: width, alignItems: 'center', justifyContent: 'center',
    marginTop: -20,
  },
  shoeCarouselImg: {
    width: 220 * S, height: 220 * S,
  },
  shoeCarouselBrand: {
    fontSize: 14, fontWeight: '700' as any, fontFamily: FONTS.sans,
    color: isDark ? '#FFFFFF' : '#1A1A1A', letterSpacing: 3, marginTop: -30, textAlign: 'center',
    textTransform: 'uppercase',
  },
  // --- kept for accessories banner ---
  shoeBannerWrap: {marginTop: 28, width: '100%', height: 200, overflow: 'hidden'},
  shoeBannerTopFade: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 60, zIndex: 2,
  },

  // --- 3.6 SHOE CARDS (SVG shaped) ---
  shoeCardsSection: {marginTop: 18},
  shoeCardsList: {paddingHorizontal: SIZES.screenPadding, gap: 12},
  shoeCard: {
    width: 170, height: 240, position: 'relative',
  },
  shoeCardInfo: {
    position: 'absolute', bottom: 14, left: 12, right: 50,
  },
  shoeCardBrand: {
    fontSize: 10, fontWeight: '700' as any, fontFamily: 'Helvetica',
    color: isDark ? gp.light : 'rgba(0,0,0,0.5)', letterSpacing: 1, textTransform: 'uppercase',
  },
  shoeCardName: {
    fontSize: 13, fontWeight: '600' as any, fontFamily: 'Helvetica',
    color: isDark ? gp.lightest : '#1A1A1A', marginTop: 3,
  },
  shoeCardPrice: {
    fontSize: 15, fontWeight: '800' as any, fontFamily: 'Helvetica',
    color: isDark ? gp.lightest : '#1A1A1A', marginTop: 4,
  },
  shoeCardPlus: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  // --- shared card styles (used by accessories/other sections) ---
  shoeCardImgWrap: {width: 148, height: 170, borderRadius: 14, overflow: 'hidden'},
  shoeCardImg: {width: '100%', height: '100%'},
  shoeCardBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  shoeCardBadgeText: {
    fontSize: 9, fontWeight: '700' as any, fontFamily: 'Helvetica', color: '#fff', letterSpacing: 0.3,
  },
  shoeCardHeart: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  shoeCardPriceRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4},
  shoeCardOldPrice: {
    fontSize: 11, fontFamily: 'Helvetica', color: isDark ? gp.light : 'rgba(0,0,0,0.4)',
    textDecorationLine: 'line-through',
  },

  // --- SEARCH RESULTS GRID ---
  productGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.screenPadding,
    justifyContent: 'space-between',
  },
  gridCard: {width: (width - SIZES.screenPadding * 2 - 12) / 2, marginBottom: 14},

  // --- 7. STYLE OCCASIONS ---
  occasionsSection: {marginTop: 32},
  occasionsTitle: {
    fontSize: 20, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: isDark ? gp.lightest : '#1A1A1A', marginBottom: 18, textAlign: 'center',
    paddingHorizontal: SIZES.screenPadding,
  },
  occasionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SIZES.screenPadding, justifyContent: 'space-between',
  },
  occasionCard: {
    width: (width - SIZES.screenPadding * 2 - 18) / 4,
    height: ((width - SIZES.screenPadding * 2 - 18) / 4) * 1.5,
    borderRadius: 12, overflow: 'hidden', marginBottom: 6,
    backgroundColor: isDark ? (gp.dark === '#000000' ? '#0A0A14' : gp.mid + '30') : '#F0F0F0',
    borderWidth: isDark ? (gp.dark === '#000000' ? 1 : 0) : 1,
    borderColor: isDark ? gp.mid + '20' : 'rgba(0,0,0,0.06)',
  },
  occasionImage: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%',
  },
  occasionGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  occasionTextWrap: {
    position: 'absolute',
    zIndex: 2,
    width: ((width - SIZES.screenPadding * 2 - 18) / 4) * 1.3,
    height: (width - SIZES.screenPadding * 2 - 18) / 4,
    left: -(((width - SIZES.screenPadding * 2 - 18) / 4) * 1.3 - (width - SIZES.screenPadding * 2 - 18) / 4) / 2 - 30,
    top: (((width - SIZES.screenPadding * 2 - 18) / 4) * 1.5 - (width - SIZES.screenPadding * 2 - 18) / 4) / 2,
    transform: [{rotate: '-90deg'}],
    justifyContent: 'center',
    paddingLeft: 2,
  },
  occasionLabel: {
    fontSize: 10, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.sans,
    color: '#FFFFFF', letterSpacing: 1.2, textAlign: 'left',
  },

  // --- 8. OFFERS GRID ---
  offersSection: {marginTop: 32},
  offersTitle: {
    fontSize: 22, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: isDark ? gp.lightest : '#1A1A1A', marginBottom: 16, paddingHorizontal: SIZES.screenPadding,
  },
  offersGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SIZES.screenPadding, justifyContent: 'space-between',
  },
  offerCard: {
    width: (width - SIZES.screenPadding * 2 - 12) / 2,
    height: ((width - SIZES.screenPadding * 2 - 12) / 2) * 1.2,
    borderRadius: 16, overflow: 'hidden', marginBottom: 12,
  },
  offerImage: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%',
  },
  offerGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  offerTextWrap: {
    position: 'absolute', bottom: 18, left: 18, right: 10, zIndex: 2,
  },
  offerTitle: {
    fontSize: 24, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: '#FFFFFF', lineHeight: 28,
  },
  offerSubtitle: {
    fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.sans,
    marginTop: 4,
  },

  // --- 9. CLASSIC BLACK ---
  classicSection: {marginTop: 32},
  classicBg: {width: '100%', height: 280, overflow: 'hidden', position: 'relative' as const},

  // Search Results
  searchResults: {paddingTop: 20},
  searchResultsTitle: {
    paddingHorizontal: SIZES.screenPadding, fontSize: SIZES.bodySmall,
    color: isDark ? gp.light : 'rgba(0,0,0,0.5)', marginBottom: 16, fontWeight: FONT_WEIGHTS.medium, fontFamily: FONTS.sans,
  },

  // Floating Cart
  floatingCart: {
    position: 'absolute', bottom: 90, left: SIZES.screenPadding, right: SIZES.screenPadding,
  },
  floatingCartInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: gp.dark === '#000000' ? '#CDF564' : gp.mid,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 12, paddingHorizontal: 16,
    shadowColor: gp.dark === '#000000' ? '#CDF564' : gp.mid,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 6,
  },
  floatingCartLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  floatingCartBadge: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: gp.dark === '#000000' ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  floatingCartBadgeText: {
    fontSize: 13, fontWeight: FONT_WEIGHTS.bold,
    color: gp.dark === '#000000' ? '#000000' : '#FFFFFF', fontFamily: FONTS.sans,
  },
  floatingCartItems: {
    fontSize: 11, color: gp.dark === '#000000' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.55)',
    fontFamily: FONTS.sans,
  },
  floatingCartTotal: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold,
    color: gp.dark === '#000000' ? '#000000' : '#FFFFFF', fontFamily: FONTS.sans,
  },
  floatingCartRight: {flexDirection: 'row', alignItems: 'center', gap: 6},
  floatingCartCta: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold,
    color: gp.dark === '#000000' ? '#000000' : '#FFFFFF', fontFamily: FONTS.sans,
  },

  // --- CATEGORY SECTION WRAPS ---
  topsSectionWrap: {marginTop: 32},
  bottomsSectionWrap: {marginTop: 32},
  outerSectionWrap: {marginTop: 32},
  dressSectionWrap: {marginTop: 32},
  activeSectionWrap: {marginTop: 32},

  // --- EXPLORE SECTION ---
  exploreHeader: {
    paddingTop: 32, paddingBottom: 4, backgroundColor: isDark ? gp.dark : '#FAFAFA',
  },
  exploreTitle: {
    fontSize: 24, fontWeight: '800' as any, color: isDark ? gp.lightest : '#1A1A1A', fontFamily: FONTS.serif,
  },
  exploreSearchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: isDark ? '#0A0A14' : '#FFFFFF',
    marginHorizontal: SIZES.screenPadding, borderRadius: 12, paddingHorizontal: 14,
    height: 44, gap: 10,
    borderWidth: 1,
    borderColor: isDark ? gp.mid + '25' : 'rgba(0,0,0,0.08)',
  },
  exploreSearchInput: {
    flex: 1, fontSize: 14, fontFamily: FONTS.sans,
    color: isDark ? gp.lightest : '#1a1a1a', paddingVertical: 0,
  },
  exploreFilterRow: {
    paddingHorizontal: SIZES.screenPadding, gap: 8, paddingVertical: 14,
  },
  exploreFilterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: isDark ? gp.mid + '18' : 'rgba(0,0,0,0.04)',
  },
  exploreFilterChipText: {
    fontSize: 12, fontWeight: '600' as any, color: isDark ? gp.light : 'rgba(0,0,0,0.5)', fontFamily: FONTS.sans,
  },
  exploreMasonry: {
    flexDirection: 'row', paddingHorizontal: SIZES.screenPadding, gap: 12,
  },
  exploreColumn: {flex: 1, gap: 12},
  exploreCard: {
    backgroundColor: isDark ? '#0A0A14' : '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: isDark ? gp.mid + '15' : 'rgba(0,0,0,0.06)',
  },
  exploreCardHeart: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  exploreCardBadge: {
    position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  exploreCardInfo: {padding: 10},
  exploreCardBrand: {
    fontSize: 10, fontWeight: '600' as any, color: isDark ? gp.light : 'rgba(0,0,0,0.5)', fontFamily: FONTS.sans,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  exploreCardName: {
    fontSize: 13, fontWeight: '500' as any, color: isDark ? gp.lightest : '#1A1A1A', fontFamily: FONTS.sans, marginTop: 2,
  },
  exploreCardPrice: {
    fontSize: 14, fontWeight: '700' as any, color: isDark ? gp.lightest : '#1A1A1A', fontFamily: FONTS.sans,
  },
  exploreCardOldPrice: {
    fontSize: 11, fontFamily: FONTS.sans, color: isDark ? gp.light : 'rgba(0,0,0,0.4)', textDecorationLine: 'line-through' as const,
  },

  // --- COMMUNITY / EDITORIAL BENTO ---
  commSection: {
    marginTop: 32, paddingHorizontal: SIZES.screenPadding, position: 'relative',
    paddingTop: 28, paddingBottom: 50, overflow: 'hidden',
  },
  commSectionTitle: {
    fontSize: 20, fontWeight: '700' as any, fontFamily: FONTS.serif,
    color: isDark ? gp.lightest : '#1A1A1A', marginBottom: 18, textAlign: 'center',
  },
  commRow: {flexDirection: 'row', gap: 10, zIndex: 3},
  commLeftArrow: {
    position: 'absolute', top: 8, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  commLeftGlass: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  commLeftGlassTint: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
  },
  commLeftGlassBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)', borderRadius: 20,
  },
  commLeftGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  commLeftTextWrap: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
  },
  commLeftLabel: {
    fontSize: 24, fontWeight: '800' as any, color: '#fff', fontFamily: FONTS.serif, lineHeight: 28,
    textTransform: 'capitalize' as const,
  },
  commLeftSub: {
    fontSize: 11, fontWeight: '500' as any, color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.sans, marginTop: 4,
  },
  commStatContent: {
    padding: 16, flex: 1, justifyContent: 'center',
  },
  commStatLabel: {
    fontSize: 9, fontWeight: '700' as any, color: '#999', fontFamily: FONTS.sans, letterSpacing: 2, marginBottom: 6,
  },
  commStatNumber: {
    fontSize: 28, fontWeight: '900' as any, color: '#1a1a1a', fontFamily: 'Helvetica', lineHeight: 32,
  },
  commStatText: {
    fontSize: 11, fontWeight: '500' as any, color: '#555', fontFamily: FONTS.sans, marginTop: 8, lineHeight: 15,
  },
  commNextBtn: {
    position: 'absolute', bottom: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  commMidText: {
    fontSize: Math.min(28, 28 * S), fontWeight: '800' as any, color: isDark ? gp.lightest : '#1A1A1A', fontFamily: 'Helvetica', lineHeight: Math.min(33, 33 * S),
  },
  commMidAccent: {
    fontSize: Math.min(28, 28 * S), fontWeight: '800' as any, fontFamily: 'Rondira-Medium', zIndex: 1,
    color: gp.mid,
  },
  commLeftCutout: {
    position: 'absolute', top: 0, right: 0, width: 30, height: 30,
    backgroundColor: isDark ? gp.dark : '#FAFAFA', borderBottomLeftRadius: 14,
  },
  commLeftCutoutInner: {
    width: '100%', height: '100%',
  },
  commLeftImg: {
    position: 'absolute', top: -110, left: '-30%', width: '170%', height: '140%', zIndex: 3,
  },
  commRBArrow: {
    position: 'absolute', top: -4, right: -4,
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', zIndex: 3,
  },
  commCtaContent: {
    padding: 16, paddingTop: 14, flex: 1, justifyContent: 'space-between',
  },
  commCtaTitle: {
    fontSize: 22, fontWeight: '900' as any, color: isDark ? '#fff' : '#FAFAFA', fontFamily: 'Helvetica', letterSpacing: 2,
  },
  commCtaSub: {
    fontSize: 12, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.65)', fontFamily: FONTS.sans, marginTop: 4,
  },
  commCtaBtn: {
    alignSelf: 'stretch', backgroundColor: isDark ? '#fff' : '#FAFAFA',
    borderRadius: 24, paddingVertical: 10, alignItems: 'center', marginTop: 8,
  },
  commCtaBtnText: {
    fontSize: 13, fontWeight: '600' as any, color: '#1a1a1a', fontFamily: FONTS.sans,
  },

  bottomSpacer: {height: 100},
});
