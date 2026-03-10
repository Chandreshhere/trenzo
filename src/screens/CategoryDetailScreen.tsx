import React, {useRef, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import Svg, {Defs, ClipPath, Path, Image as SvgImage} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import {SIZES} from '../utils/theme';
import {PRODUCTS, BRANDS, Product, Brand, formatPrice} from '../data/products';
import {useApp} from '../context/AppContext';
import Icon from '../components/Icon';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette} from '../context/GenderPaletteContext';
import {useTabBar} from '../context/TabBarContext';
import GenderGradientBg from '../components/GenderGradientBg';

const {width} = Dimensions.get('window');
const PAD = SIZES.screenPadding;
const CARD_W = (width - PAD * 2 - 12) / 2;
const CARD_H = CARD_W * 1.35;
const R = 18;

// Category-specific theming data
const CATEGORY_DATA: Record<string, {
  headline: string;
  subtitle: string;
  description: string;
  heroImage: string;
  heroImageWomen?: string;
  tags: string[];
  styleTip: string;
  styleTipWomen?: string;
  filterFn: (p: Product) => boolean;
  sectionLabel: string;
  gridLabel: string;
}> = {
  'New Arrivals': {
    headline: 'Fresh\nDrops',
    subtitle: 'Just landed, just for you',
    description: 'The latest additions to our collection. Be the first to discover and own what\'s new this season.',
    heroImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    tags: ['Just In', 'This Week', 'Trending', 'Editor\'s Pick'],
    styleTip: 'Mix one statement new piece with your existing wardrobe staples for an instant refresh.',
    styleTipWomen: 'Pair a new trending piece with classic accessories to keep the look grounded yet fresh.',
    filterFn: (p: Product) => p.isNew === true || p.isFeatured === true,
    sectionLabel: 'JUST DROPPED',
    gridLabel: 'All new arrivals',
  },
  'Shoes': {
    headline: 'Step\nUp',
    subtitle: 'From sneakers to statement',
    description: 'Footwear that defines your stride. Premium sneakers, classic boots, and everything in between.',
    heroImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
    tags: ['Sneakers', 'Boots', 'Loafers', 'Running'],
    styleTip: 'White sneakers are the most versatile shoe you can own — they work with literally everything.',
    styleTipWomen: 'A good pair of ankle boots transitions seamlessly from day to night, season to season.',
    filterFn: (p: Product) => p.category === 'Shoes',
    sectionLabel: 'TOP KICKS',
    gridLabel: 'All footwear',
  },
  'Tops': {
    headline: 'Top\nForm',
    subtitle: 'Layer, drape, define',
    description: 'T-shirts, shirts, sweaters and more. The foundation of every great outfit starts here.',
    heroImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800',
    tags: ['T-Shirts', 'Shirts', 'Sweaters', 'Hoodies'],
    styleTip: 'A well-fitted crew neck tee in navy or white is the hardest working piece in any wardrobe.',
    styleTipWomen: 'Tuck a relaxed blouse into high-waisted pants for effortless polish.',
    filterFn: (p: Product) => p.category === 'Tops',
    sectionLabel: 'ESSENTIAL TOPS',
    gridLabel: 'All tops',
  },
  'Bottoms': {
    headline: 'Below\nthe Belt',
    subtitle: 'Fit is everything',
    description: 'Jeans, trousers, shorts. The right bottom half completes the look and sets the tone.',
    heroImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
    tags: ['Jeans', 'Chinos', 'Shorts', 'Joggers'],
    styleTip: 'Own one pair of dark wash jeans and one pair of chinos — they cover 80% of occasions.',
    styleTipWomen: 'High-waisted wide-leg pants elongate your silhouette. Pair with a cropped top for balance.',
    filterFn: (p: Product) => p.category === 'Bottoms',
    sectionLabel: 'PERFECT FIT',
    gridLabel: 'All bottoms',
  },
  'Outerwear': {
    headline: 'Outer\nLimits',
    subtitle: 'The finishing layer',
    description: 'Jackets, coats, and layers that make the outfit. Because what goes on last gets noticed first.',
    heroImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
    tags: ['Jackets', 'Coats', 'Bombers', 'Parkas'],
    styleTip: 'A versatile bomber jacket works over everything — tees, hoodies, even a button-down.',
    styleTipWomen: 'An oversized blazer thrown over anything instantly elevates casual to chic.',
    filterFn: (p: Product) => p.category === 'Outerwear',
    sectionLabel: 'LAYER UP',
    gridLabel: 'All outerwear',
  },
  'Dresses': {
    headline: 'Dress\nCode',
    subtitle: 'One piece, total impact',
    description: 'From flowing maxis to sharp minis. One-and-done pieces that make getting dressed the easiest decision.',
    heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
    tags: ['Midi', 'Maxi', 'Mini', 'Formal'],
    styleTip: 'A dark midi dress with clean lines works for almost any occasion.',
    styleTipWomen: 'The wrap dress is universally flattering — invest in one in a solid colour.',
    filterFn: (p: Product) => p.category === 'Dresses',
    sectionLabel: 'STANDOUT PICKS',
    gridLabel: 'All dresses',
  },
  'Activewear': {
    headline: 'Move\nBetter',
    subtitle: 'Performance meets aesthetics',
    description: 'Technical fabrics and ergonomic cuts designed to keep up with your intensity, in style.',
    heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    tags: ['Training', 'Running', 'Yoga', 'Compression'],
    styleTip: 'Dark tones hide sweat better. Invest in moisture-wicking base layers first.',
    styleTipWomen: 'A matching set in a bold colour doubles as casual streetwear when paired with sneakers.',
    filterFn: (p: Product) => p.category === 'Activewear',
    sectionLabel: 'PERFORMANCE PICKS',
    gridLabel: 'All activewear',
  },
  'Accessories': {
    headline: 'Detail\nMatters',
    subtitle: 'The finishing touches',
    description: 'Watches, jewellery, belts and more. The details that elevate every outfit from good to unforgettable.',
    heroImage: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800',
    tags: ['Watches', 'Jewellery', 'Belts', 'Sunglasses'],
    styleTip: 'A quality watch and a leather belt are investments that pay off with every outfit.',
    styleTipWomen: 'Layered gold necklaces add depth to even the simplest neckline.',
    filterFn: (p: Product) => p.category === 'Accessories',
    sectionLabel: 'SIGNATURE PIECES',
    gridLabel: 'All accessories',
  },
  'Bags': {
    headline: 'Carry\nStyle',
    subtitle: 'Function meets fashion',
    description: 'Totes, crossbody, backpacks. The right bag ties your look together and carries your world.',
    heroImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    tags: ['Totes', 'Crossbody', 'Backpacks', 'Clutch'],
    styleTip: 'A structured leather bag in black or tan works with everything from casual to formal.',
    styleTipWomen: 'Match your bag size to the occasion — oversized for day, mini for evening.',
    filterFn: (p: Product) => p.category === 'Bags',
    sectionLabel: 'CARRY IT ALL',
    gridLabel: 'All bags',
  },
  'Trending': {
    headline: 'What\'s\nHot',
    subtitle: 'The styles everyone wants',
    description: 'Curated trending picks that are flying off the shelves. Don\'t miss what\'s defining this season.',
    heroImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    tags: ['Viral', 'Hot Right Now', 'Editor\'s Choice', 'Top Rated'],
    styleTip: 'Don\'t chase every trend — pick one statement piece per season and build around it.',
    styleTipWomen: 'The best trends are the ones that already fit your personal style.',
    filterFn: (p: Product) => p.isNew === true || p.isFeatured === true,
    sectionLabel: 'TRENDING NOW',
    gridLabel: 'All trending picks',
  },
  'Hot Drops': {
    headline: 'Just\nDropped',
    subtitle: 'Fresh off the rack',
    description: 'The newest drops and limited-time deals. Be first to grab what\'s new before it sells out.',
    heroImage: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    tags: ['Limited', 'New Drop', 'Sale', 'Exclusive'],
    styleTip: 'New drops pair best with wardrobe staples you already own — no need to reinvent your style.',
    filterFn: (p: Product) => p.isNew === true || (p.discount !== undefined && p.discount > 0),
    sectionLabel: 'JUST LANDED',
    gridLabel: 'All hot drops',
  },
  'Curated For You': {
    headline: 'Picked\nFor You',
    subtitle: 'Our editors\' favourites',
    description: 'Hand-selected pieces our stylists can\'t stop recommending. Quality over quantity, always.',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    tags: ['Editor\'s Pick', 'Curated', 'Premium', 'Must Have'],
    styleTip: 'Curated pieces are meant to be mixed — try pairing unexpected textures and colours.',
    filterFn: (p: Product) => p.isFeatured === true,
    sectionLabel: 'EDITOR\'S CHOICE',
    gridLabel: 'All curated picks',
  },
  'Bestsellers': {
    headline: 'Fan\nFavourites',
    subtitle: 'Most loved, most bought',
    description: 'The pieces our community keeps coming back for. Proven quality, proven style.',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    tags: ['Top Rated', 'Most Bought', 'Repeat Buy', '5 Stars'],
    styleTip: 'Bestsellers become bestsellers for a reason — trust the crowd on wardrobe basics.',
    filterFn: (p: Product) => p.rating >= 4.5,
    sectionLabel: 'CROWD FAVOURITES',
    gridLabel: 'All bestsellers',
  },
  'Trending Looks': {
    headline: 'Look\nBook',
    subtitle: 'Styles that define the moment',
    description: 'Featured looks and discounted gems curated by our style team. Fashion-forward at every price point.',
    heroImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800',
    heroImageWomen: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    tags: ['Featured', 'On Sale', 'Styled', 'Seasonal'],
    styleTip: 'Build complete looks, not individual pieces. Think outfit, not item.',
    filterFn: (p: Product) => p.isFeatured === true || (p.discount !== undefined && p.discount > 0),
    sectionLabel: 'STYLED FOR YOU',
    gridLabel: 'All trending looks',
  },
};

const DEFAULT_DATA = {
  headline: 'Your\nStyle',
  subtitle: 'Curated for you',
  description: 'Hand-picked pieces for this category.',
  heroImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
  tags: ['Trending', 'New', 'Popular', 'Curated'],
  styleTip: 'Build around neutral basics and add one statement piece per outfit.',
  filterFn: (_p: Product) => true,
  sectionLabel: 'HAND PICKED',
  gridLabel: 'All products',
};

interface Props {
  route: any;
  navigation: any;
}

export default function CategoryDetailScreen({route, navigation}: Props) {
  const {categoryType} = route.params as {categoryType: string};
  const {isDark} = useTheme();
  const {palette: gp, activeGender} = useGenderPalette();
  const {tabBarTranslateY} = useTabBar();
  const {dispatch} = useApp();
  const accent = isDark ? (activeGender === 'Men' ? '#CDF564' : gp.mid) : gp.mid;
  const accentText = isDark ? '#000' : '#FFF';
  const isWomen = activeGender === 'Women';

  // Detect if this is a brand page
  const brandData = useMemo(() => BRANDS.find(b => b.name === categoryType), [categoryType]);
  const isBrandPage = !!brandData;

  const catData = useMemo(() => {
    if (CATEGORY_DATA[categoryType]) return CATEGORY_DATA[categoryType];
    if (isBrandPage) {
      return {
        ...DEFAULT_DATA,
        headline: `${categoryType}`,
        subtitle: brandData?.tagline || `Premium ${categoryType} collection`,
        description: `Discover the best from ${categoryType}. Curated styles that define the brand.`,
        heroImage: brandData?.cover || DEFAULT_DATA.heroImage,
        tags: ['New In', 'Popular', 'On Sale', 'Exclusive'],
        filterFn: (p: Product) => p.brand === categoryType,
        sectionLabel: `${categoryType.toUpperCase()} PICKS`,
        gridLabel: `All ${categoryType}`,
      };
    }
    return DEFAULT_DATA;
  }, [categoryType, isBrandPage, brandData]);
  const heroImg: string = isWomen && 'heroImageWomen' in catData && (catData as any).heroImageWomen
    ? (catData as any).heroImageWomen : catData.heroImage;
  const tip: string = isWomen && 'styleTipWomen' in catData && (catData as any).styleTipWomen
    ? (catData as any).styleTipWomen : catData.styleTip;

  const products = useMemo(() => {
    const filtered = PRODUCTS.filter(catData.filterFn);
    return filtered.sort(() => Math.random() - 0.5).slice(0, 20);
  }, [categoryType, activeGender, catData]);

  // Brand page: group products by category
  const brandCategories = useMemo(() => {
    if (!isBrandPage) return [];
    const allBrandProds = PRODUCTS.filter(p => p.brand === categoryType);
    const catMap: Record<string, Product[]> = {};
    allBrandProds.forEach(p => {
      if (!catMap[p.category]) catMap[p.category] = [];
      catMap[p.category].push(p);
    });
    return Object.entries(catMap).map(([cat, prods]) => ({category: cat, products: prods}));
  }, [categoryType, isBrandPage]);

  const featuredPicks = useMemo(() => products.slice(0, 4), [products]);
  const gridProducts = useMemo(() => products.slice(4), [products]);

  // Animations
  const heroAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollYRef = useRef(0);
  const isTabBarHidden = useRef(false);

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(heroAnim, {toValue: 1, friction: 10, tension: 50, useNativeDriver: true}),
      Animated.spring(contentAnim, {toValue: 1, friction: 9, tension: 55, useNativeDriver: true}),
    ]).start();
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const isDown = y > lastScrollYRef.current;
    if (isDown && y > 60 && !isTabBarHidden.current) {
      isTabBarHidden.current = true;
      Animated.timing(tabBarTranslateY, {toValue: 160, duration: 250, useNativeDriver: true}).start();
    } else if (!isDown && isTabBarHidden.current) {
      isTabBarHidden.current = false;
      Animated.timing(tabBarTranslateY, {toValue: 0, duration: 250, useNativeDriver: true}).start();
    }
    lastScrollYRef.current = y;
  }, [tabBarTranslateY]);

  const quickAddToCart = useCallback((product: Product) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        quantity: 1,
        selectedSize: product.sizes[1] || product.sizes[0],
        selectedColor: product.colors[0],
      },
    });
  }, [dispatch]);

  // SVG clip path for featured cards (rounded rect with notch)
  const CARD_CUT = 38;
  const cardClipPath = useMemo(() => {
    const w = CARD_W;
    const h = CARD_H;
    const r = R;
    const c = CARD_CUT;
    const ir = 10;
    return [
      `M ${r} 0`, `L ${w - r} 0`, `Q ${w} 0 ${w} ${r}`,
      `L ${w} ${h - r}`, `Q ${w} ${h} ${w - r} ${h}`,
      `L ${c + ir} ${h}`,
      `C ${c} ${h} ${c} ${h} ${c} ${h - ir}`,
      `L ${c} ${h - c + r}`, `Q ${c} ${h - c} ${c - r} ${h - c}`,
      `L ${ir} ${h - c}`,
      `C 0 ${h - c} 0 ${h - c} 0 ${h - c - ir}`,
      `L 0 ${r}`, `Q 0 0 ${r} 0`, 'Z',
    ].join(' ');
  }, []);

  const heroParallax = scrollY.interpolate({inputRange: [-100, 0, 300], outputRange: [40, 0, -60], extrapolate: 'clamp'});
  const heroOpacity = scrollY.interpolate({inputRange: [0, 250], outputRange: [1, 0], extrapolate: 'clamp'});

  const totalProducts = PRODUCTS.filter(catData.filterFn).length;
  const avgRating = useMemo(() => {
    const all = PRODUCTS.filter(catData.filterFn);
    if (all.length === 0) return 4.5;
    return +(all.reduce((s, p) => s + p.rating, 0) / all.length).toFixed(1);
  }, [categoryType]);

  // Grid layout helpers for brand page
  const fullW = width - PAD * 2;
  const gap = 10;
  const halfW = (fullW - gap) / 2;
  const thirdW = (fullW - gap * 2) / 3;

  // ============= BRAND PAGE RENDER =============
  // Consistent card sizes
  const CARD_SM = halfW * 1.15; // small card height (half-width cards)
  const CARD_LG = 190; // large/full-width card height
  const CARD_SCROLL_W = 150; // horizontal scroll card width
  const CARD_SCROLL_H = 190; // horizontal scroll card image height
  const CARD_R = 16; // consistent border radius

  // Reusable product card overlay (image + gradient + info at bottom)
  const renderProductCardOverlay = (p: Product, cardW: number, cardH: number, showBrand = false) => (
    <TouchableOpacity
      key={p.id}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProductDetail', {product: p})}
      style={{width: cardW, height: cardH, borderRadius: CARD_R, overflow: 'hidden'}}>
      <Image source={{uri: p.images[0]}} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%'}} />
      <View style={{position: 'absolute', bottom: 12, left: 12, right: 12}}>
        {showBrand && (
          <Text style={{fontSize: 9, fontWeight: '600', fontFamily: 'Helvetica', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2}}>{p.brand}</Text>
        )}
        <Text style={{fontSize: 13, fontWeight: '700', fontFamily: 'Helvetica', color: '#FFF'}} numberOfLines={1}>{p.name}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3}}>
          <Text style={{fontSize: 13, fontWeight: '800', fontFamily: 'Helvetica', color: '#FFF'}}>{formatPrice(p.price)}</Text>
          {p.originalPrice && (
            <Text style={{fontSize: 10, fontFamily: 'Helvetica', color: 'rgba(255,255,255,0.45)', textDecorationLine: 'line-through'}}>{formatPrice(p.originalPrice)}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={{position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: accent, justifyContent: 'center', alignItems: 'center'}}
        onPress={() => quickAddToCart(p)}
        activeOpacity={0.8}>
        <Icon name="plus" size={13} color={accentText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Section header helper
  const renderSectionHead = (label: string, title: string, count: number, mt: number) => (
    <View style={{paddingHorizontal: PAD, marginBottom: 14, marginTop: mt}}>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <View>
          <Text style={[s.sectionTag, {color: accent}]}>{label}</Text>
          <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{title}</Text>
        </View>
        <View style={{backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10}}>
          <Text style={{fontSize: 11, fontWeight: '600', fontFamily: 'Helvetica', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}}>{count} items</Text>
        </View>
      </View>
    </View>
  );

  // Editorial banner images per category keyword
  const editorialImages: Record<string, string> = {
    Shoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
    Tops: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
    Bottoms: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
    Outerwear: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    Accessories: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800',
    Dresses: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    Bags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    Activewear: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  };
  const seasonalSlogans = ['Spring/Summer 2026', 'New Season Edit', 'The Essential Edit', 'Curated Collection'];
  const promoLabels = ['Up to 30% off', 'New Arrivals', 'Members Only', 'Limited Edition', 'Bestseller', 'Trending Now'];

  if (isBrandPage && brandData) {

    // Render a "collection banner" — full-width lifestyle editorial
    const renderCollectionBanner = (catName: string, idx: number) => {
      const img = editorialImages[catName] || editorialImages.Tops;
      const slogan = seasonalSlogans[idx % seasonalSlogans.length];
      return (
        <View style={{marginHorizontal: PAD, marginTop: 28, borderRadius: 20, overflow: 'hidden', height: 160}}>
          <Image source={{uri: img}} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} />
          <View style={{position: 'absolute', bottom: 18, left: 18, right: 18}}>
            <Text style={{fontSize: 10, fontWeight: '700', fontFamily: 'Helvetica', color: accent, letterSpacing: 2, marginBottom: 4}}>{slogan.toUpperCase()}</Text>
            <Text style={{fontSize: 22, fontWeight: '800', fontFamily: 'Rondira-Medium', color: '#FFF'}}>{catName}</Text>
            <Text style={{fontSize: 11, fontFamily: 'Helvetica', color: 'rgba(255,255,255,0.7)', marginTop: 3}}>Explore the latest {catName.toLowerCase()} from {categoryType}</Text>
          </View>
        </View>
      );
    };

    // Render a promo deal strip between sections
    const renderPromoBanner = (idx: number) => {
      const label = promoLabels[idx % promoLabels.length];
      const bgColor = idx % 2 === 0 ? accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)');
      const textColor = idx % 2 === 0 ? accentText : (isDark ? '#FFF' : '#1A1A1A');
      return (
        <View style={{marginHorizontal: PAD, marginTop: 24, borderRadius: 14, backgroundColor: bgColor, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Icon name="zap" size={16} color={textColor} />
            <View>
              <Text style={{fontSize: 14, fontWeight: '800', fontFamily: 'Helvetica', color: textColor}}>{label}</Text>
              <Text style={{fontSize: 10, fontFamily: 'Helvetica', color: textColor, opacity: 0.7}}>on {brandCategories[idx % brandCategories.length]?.category || 'all items'}</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Text style={{fontSize: 11, fontWeight: '700', fontFamily: 'Helvetica', color: textColor}}>Shop</Text>
            <Icon name="arrow-right" size={12} color={textColor} />
          </View>
        </View>
      );
    };

    // Clean info card — white/dark bg, product beside text (no overlay)
    const renderCleanCard = (p: Product, cardW: number) => (
      <TouchableOpacity
        key={p.id}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProductDetail', {product: p})}
        style={{
          width: cardW, borderRadius: CARD_R, overflow: 'hidden',
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFF',
          ...(isDark ? {} : {shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2}),
        }}>
        <Image source={{uri: p.images[0]}} style={{width: cardW, height: cardW * 1.1, borderTopLeftRadius: CARD_R, borderTopRightRadius: CARD_R}} resizeMode="cover" />
        <View style={{padding: 12}}>
          <Text style={{fontSize: 9, fontWeight: '600', fontFamily: 'Helvetica', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: 0.8}}>{p.brand}</Text>
          <Text style={{fontSize: 13, fontWeight: '700', fontFamily: 'Helvetica', color: isDark ? '#FFF' : '#1A1A1A', marginTop: 3}} numberOfLines={1}>{p.name}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text style={{fontSize: 14, fontWeight: '800', fontFamily: 'Helvetica', color: isDark ? '#FFF' : '#1A1A1A'}}>{formatPrice(p.price)}</Text>
              {p.originalPrice && <Text style={{fontSize: 10, fontFamily: 'Helvetica', color: 'rgba(150,150,150,0.7)', textDecorationLine: 'line-through'}}>{formatPrice(p.originalPrice)}</Text>}
            </View>
            <TouchableOpacity style={{width: 30, height: 30, borderRadius: 15, backgroundColor: accent, justifyContent: 'center', alignItems: 'center'}} onPress={() => quickAddToCart(p)} activeOpacity={0.8}>
              <Icon name="plus" size={13} color={accentText} />
            </TouchableOpacity>
          </View>
        </View>
        {p.discount && (
          <View style={{position: 'absolute', top: 10, left: 10, backgroundColor: '#FF3B30', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8}}>
            <Text style={{fontSize: 10, fontWeight: '800', fontFamily: 'Helvetica', color: '#FFF'}}>-{p.discount}%</Text>
          </View>
        )}
      </TouchableOpacity>
    );

    // Featured spotlight: large card with colored accent bg
    const renderSpotlightCard = (p: Product) => (
      <TouchableOpacity
        key={`spot-${p.id}`}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProductDetail', {product: p})}
        style={{marginHorizontal: PAD, marginTop: 6, borderRadius: 22, overflow: 'hidden', height: 220, flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F0EB'}}>
        <View style={{flex: 1, padding: 22, justifyContent: 'space-between'}}>
          <View>
            <View style={{backgroundColor: accent, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12}}>
              <Text style={{fontSize: 9, fontWeight: '800', fontFamily: 'Helvetica', color: accentText, letterSpacing: 1}}>FEATURED</Text>
            </View>
            <Text style={{fontSize: 18, fontWeight: '800', fontFamily: 'Rondira-Medium', color: isDark ? '#FFF' : '#1A1A1A', lineHeight: 22}} numberOfLines={2}>{p.name}</Text>
            <Text style={{fontSize: 11, fontFamily: 'Helvetica', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginTop: 4}}>{p.brand}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Text style={{fontSize: 22, fontWeight: '900', fontFamily: 'Helvetica', color: isDark ? '#FFF' : '#1A1A1A'}}>{formatPrice(p.price)}</Text>
            {p.originalPrice && <Text style={{fontSize: 13, fontFamily: 'Helvetica', color: 'rgba(150,150,150,0.6)', textDecorationLine: 'line-through'}}>{formatPrice(p.originalPrice)}</Text>}
          </View>
        </View>
        <Image source={{uri: p.images[0]}} style={{width: '48%', height: '100%'}} resizeMode="cover" />
      </TouchableOpacity>
    );

    // Horizontal lookbook scroll card
    const renderLookbookCard = (p: Product) => (
      <TouchableOpacity
        key={`lb-${p.id}`}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProductDetail', {product: p})}
        style={{width: 140, marginRight: 0}}>
        <View style={{width: 140, height: 185, borderRadius: 18, overflow: 'hidden'}}>
          <Image source={{uri: p.images[0]}} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%'}} />
          <View style={{position: 'absolute', bottom: 10, left: 10, right: 10}}>
            <Text style={{fontSize: 12, fontWeight: '700', fontFamily: 'Helvetica', color: '#FFF'}} numberOfLines={1}>{p.name}</Text>
            <Text style={{fontSize: 12, fontWeight: '800', fontFamily: 'Helvetica', color: '#FFF', marginTop: 2}}>{formatPrice(p.price)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );

    // 5 distinct layout patterns for variety
    const renderBrandCategorySection = (catGroup: {category: string; products: Product[]}, idx: number) => {
      const prods = catGroup.products;
      const layoutType = idx % 5;

      // Layout 0: Collection banner + spotlight featured + 2 clean cards below
      if (layoutType === 0) {
        return (
          <View key={catGroup.category}>
            {renderCollectionBanner(catGroup.category, idx)}
            {renderSectionHead(catGroup.category.toUpperCase(), catGroup.category, prods.length, 18)}
            {prods[0] && renderSpotlightCard(prods[0])}
            {prods.length > 1 && (
              <View style={{flexDirection: 'row', gap, paddingHorizontal: PAD, marginTop: gap}}>
                {prods.slice(1, 3).map(p => renderCleanCard(p, halfW))}
              </View>
            )}
            {prods.length > 3 && (
              <View style={{flexDirection: 'row', gap, paddingHorizontal: PAD, marginTop: gap}}>
                {prods.slice(3, 5).map(p => renderProductCardOverlay(p, halfW, CARD_SM))}
              </View>
            )}
          </View>
        );
      }

      // Layout 1: Section head + full-width overlay card + lookbook horizontal scroll
      if (layoutType === 1) {
        return (
          <View key={catGroup.category}>
            {renderSectionHead(catGroup.category.toUpperCase(), catGroup.category, prods.length, 32)}
            <View style={{paddingHorizontal: PAD}}>
              {prods[0] && renderProductCardOverlay(prods[0], fullW, 200, true)}
            </View>
            {prods.length > 1 && (
              <View style={{marginTop: 14}}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: PAD, gap: 10}}>
                  {prods.slice(1).map(p => renderLookbookCard(p))}
                </ScrollView>
              </View>
            )}
            {renderPromoBanner(idx)}
          </View>
        );
      }

      // Layout 2: 1 large left + 2 stacked right (masonry-ish)
      if (layoutType === 2) {
        const stackH = (CARD_SM * 2 + gap) / 2;
        return (
          <View key={catGroup.category}>
            {renderCollectionBanner(catGroup.category, idx)}
            {renderSectionHead(catGroup.category.toUpperCase(), catGroup.category, prods.length, 18)}
            <View style={{paddingHorizontal: PAD, flexDirection: 'row', gap}}>
              {prods[0] && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('ProductDetail', {product: prods[0]})}
                  style={{width: halfW, height: CARD_SM * 2 + gap, borderRadius: CARD_R, overflow: 'hidden'}}>
                  <Image source={{uri: prods[0].images[0]}} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%'}} />
                  <View style={{position: 'absolute', top: 10, left: 10, backgroundColor: accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8}}>
                    <Text style={{fontSize: 9, fontWeight: '800', fontFamily: 'Helvetica', color: accentText, letterSpacing: 1}}>EDITOR'S PICK</Text>
                  </View>
                  <View style={{position: 'absolute', bottom: 14, left: 14, right: 14}}>
                    <Text style={{fontSize: 16, fontWeight: '800', fontFamily: 'Rondira-Medium', color: '#FFF'}} numberOfLines={2}>{prods[0].name}</Text>
                    <Text style={{fontSize: 15, fontWeight: '800', fontFamily: 'Helvetica', color: '#FFF', marginTop: 4}}>{formatPrice(prods[0].price)}</Text>
                  </View>
                </TouchableOpacity>
              )}
              <View style={{gap}}>
                {prods.slice(1, 3).map(p => renderProductCardOverlay(p, halfW, stackH))}
              </View>
            </View>
            {prods.length > 3 && (
              <View style={{flexDirection: 'row', gap, paddingHorizontal: PAD, marginTop: gap}}>
                {prods.slice(3, 5).map(p => renderCleanCard(p, halfW))}
              </View>
            )}
          </View>
        );
      }

      // Layout 3: Clean cards grid + promo banner
      if (layoutType === 3) {
        return (
          <View key={catGroup.category}>
            {renderSectionHead(catGroup.category.toUpperCase(), catGroup.category, prods.length, 32)}
            <View style={{paddingHorizontal: PAD, gap}}>
              {Array.from({length: Math.ceil(Math.min(prods.length, 4) / 2)}).map((_, rowIdx) => (
                <View key={rowIdx} style={{flexDirection: 'row', gap}}>
                  {prods.slice(rowIdx * 2, rowIdx * 2 + 2).map(p => renderCleanCard(p, halfW))}
                </View>
              ))}
            </View>
            {renderPromoBanner(idx)}
          </View>
        );
      }

      // Layout 4: Horizontal scroll lookbook + spotlight
      return (
        <View key={catGroup.category}>
          {renderSectionHead(catGroup.category.toUpperCase(), catGroup.category, prods.length, 32)}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: PAD, gap: 10}}>
            {prods.map(p => renderLookbookCard(p))}
          </ScrollView>
          {prods[0] && (
            <View style={{marginTop: 14}}>
              {renderSpotlightCard(prods[Math.min(1, prods.length - 1)])}
            </View>
          )}
        </View>
      );
    };

    return (
      <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA'}}>
        <GenderGradientBg />
        <StatusBar barStyle="light-content" />

        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: true, listener: handleScroll})}
          scrollEventThrottle={16}>

          {/* BRAND HERO */}
          <Animated.View style={[s.hero, {height: 380, opacity: heroAnim}]}>
            <Animated.Image
              source={{uri: brandData.cover}}
              style={[StyleSheet.absoluteFill, {transform: [{translateY: heroParallax}]}]}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)', isDark ? '#000' : 'rgba(0,0,0,0.9)']}
              locations={[0, 0.25, 0.65, 1]}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View style={[s.heroContent, {opacity: heroOpacity, bottom: 30}]}>
              <View style={{width: 64, height: 64, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 14}}>
                <Image source={{uri: brandData.logo}} style={{width: '75%', height: '75%'}} resizeMode="contain" />
              </View>
              <Text style={[s.heroHeadline, {fontSize: 36, lineHeight: 40}]}>{brandData.name}</Text>
              <Text style={s.heroSubtitle}>{brandData.tagline}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14}}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <Icon name="package" size={12} color="rgba(255,255,255,0.6)" />
                  <Text style={{fontSize: 12, fontWeight: '600', fontFamily: 'Helvetica', color: 'rgba(255,255,255,0.8)'}}>{totalProducts} products</Text>
                </View>
                <View style={{width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)'}} />
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                  <Icon name="star" size={12} color="#F5A623" />
                  <Text style={{fontSize: 12, fontWeight: '600', fontFamily: 'Helvetica', color: 'rgba(255,255,255,0.8)'}}>{avgRating} avg</Text>
                </View>
                <View style={{width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)'}} />
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                  <Icon name="truck" size={12} color="rgba(255,255,255,0.6)" />
                  <Text style={{fontSize: 12, fontWeight: '600', fontFamily: 'Helvetica', color: 'rgba(255,255,255,0.8)'}}>Free delivery</Text>
                </View>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Category pills */}
          <View style={{marginTop: 20}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: PAD, gap: 8}}>
              {brandCategories.map(cat => (
                <View key={cat.category} style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                }}>
                  <Text style={{fontSize: 12, fontWeight: '600', fontFamily: 'Helvetica', color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'}}>
                    {cat.category} ({cat.products.length})
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Editorial intro banner */}
          <View style={{marginHorizontal: PAD, marginTop: 24, borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', padding: 18, flexDirection: 'row', gap: 14}}>
            <View style={{width: 3, borderRadius: 2, backgroundColor: accent}} />
            <View style={{flex: 1}}>
              <Text style={{fontSize: 10, fontWeight: '700', fontFamily: 'Helvetica', color: accent, letterSpacing: 2, marginBottom: 4}}>ABOUT THE BRAND</Text>
              <Text style={{fontSize: 13, fontFamily: 'Helvetica', lineHeight: 19, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}}>
                Discover the best from {categoryType}. Curated styles that define the brand across {brandCategories.length} categories — from {brandCategories.slice(0, 3).map(c => c.category.toLowerCase()).join(', ')} and more.
              </Text>
            </View>
          </View>

          {/* Render each category section with unique layout */}
          {brandCategories.map((catGroup, idx) => renderBrandCategorySection(catGroup, idx))}

          {/* Bottom CTA */}
          <View style={{paddingHorizontal: PAD, marginTop: 32, marginBottom: 40}}>
            <TouchableOpacity
              style={[s.ctaBanner, {backgroundColor: accent}]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('CategoryProducts', {
                categoryName: categoryType,
                products: PRODUCTS.filter(p => p.brand === categoryType),
              })}>
              <View style={{flex: 1}}>
                <Text style={[s.ctaTitle, {color: accentText}]}>See all from {categoryType}</Text>
                <Text style={[s.ctaSub, {color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'}]}>
                  {totalProducts} products across {brandCategories.length} categories
                </Text>
              </View>
              <View style={[s.ctaArrow, {backgroundColor: isDark ? '#000' : '#FFF'}]}>
                <Icon name="arrow-right" size={16} color={isDark ? '#FFF' : '#000'} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={{height: 120}} />
        </Animated.ScrollView>
      </View>
    );
  }

  // ============= CATEGORY PAGE RENDER (original) =============
  return (
    <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA'}}>
      <GenderGradientBg />
      <StatusBar barStyle="light-content" />

      {/* Back button */}
      <TouchableOpacity
        style={s.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}>
        <Icon name="arrow-left" size={20} color="#FFF" />
      </TouchableOpacity>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true, listener: handleScroll},
        )}
        scrollEventThrottle={16}>

        {/* HERO */}
        <Animated.View style={[s.hero, {opacity: heroAnim}]}>
          <Animated.Image
            source={{uri: heroImg}}
            style={[StyleSheet.absoluteFill, {transform: [{translateY: heroParallax}]}]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)', isDark ? '#000' : 'rgba(0,0,0,0.85)']}
            locations={[0, 0.2, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View style={[s.heroContent, {opacity: heroOpacity}]}>
            <View style={[s.accentLine, {backgroundColor: accent}]} />
            <Text style={s.heroLabel}>{categoryType.toUpperCase()}</Text>
            <Text style={s.heroHeadline}>{catData.headline}</Text>
            <Text style={s.heroSubtitle}>{catData.subtitle}</Text>
          </Animated.View>
        </Animated.View>

        {/* DESCRIPTION + TAGS */}
        <Animated.View style={[s.section, {
          opacity: contentAnim,
          transform: [{translateY: contentAnim.interpolate({inputRange: [0, 1], outputRange: [30, 0]})}],
        }]}>
          <Text style={[s.description, {color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}]}>
            {catData.description}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 16}}>
            {catData.tags.map(tag => (
              <View key={tag} style={[s.tag, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              }]}>
                <Text style={[s.tagText, {color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'}]}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* STATS BAR */}
        <View style={[s.statsBar, {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}]}>
          <View style={s.statItem}>
            <Text style={[s.statValue, {color: accent}]}>{totalProducts}+</Text>
            <Text style={[s.statLabel, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>Products</Text>
          </View>
          <View style={[s.statDivider, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}]} />
          <View style={s.statItem}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
              <Icon name="star" size={12} color="#F5A623" />
              <Text style={[s.statValue, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{avgRating}</Text>
            </View>
            <Text style={[s.statLabel, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>Avg Rating</Text>
          </View>
          <View style={[s.statDivider, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}]} />
          <View style={s.statItem}>
            <Text style={[s.statValue, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Free</Text>
            <Text style={[s.statLabel, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>Delivery</Text>
          </View>
        </View>

        {/* FEATURED PICKS — SVG masked cards */}
        <Animated.View style={[s.section, {
          opacity: contentAnim,
          transform: [{translateY: contentAnim.interpolate({inputRange: [0, 1], outputRange: [50, 0]})}],
        }]}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTag, {color: accent}]}>{catData.sectionLabel}</Text>
            <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>
              Best in {categoryType.toLowerCase()}
            </Text>
          </View>

          <View style={s.cardGrid}>
            {featuredPicks.map((product, i) => (
              <TouchableOpacity
                key={product.id}
                style={{width: CARD_W, height: CARD_H, marginBottom: 14}}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetail', {product})}>
                <Svg width={CARD_W} height={CARD_H} style={StyleSheet.absoluteFill}>
                  <Defs>
                    <ClipPath id={`catClip-${product.id}`}>
                      <Path d={cardClipPath} />
                    </ClipPath>
                  </Defs>
                  <SvgImage
                    href={{uri: product.images[0]}}
                    x={0} y={0} width={CARD_W} height={CARD_H}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#catClip-${product.id})`}
                  />
                  <Path d={cardClipPath} fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} strokeWidth={1} />
                </Svg>
                <View style={s.cardImageWrap}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.75)']}
                    locations={[0.35, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
                <View style={[s.notchCircle, {backgroundColor: i === 0 ? accent : gp.light}]}>
                  <Icon name="arrow-up-right" size={12} color={i === 0 ? accentText : '#FFF'} />
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.cardBrand}>{product.brand}</Text>
                  <Text style={s.cardName} numberOfLines={1}>{product.name}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4}}>
                    <Text style={s.cardPrice}>{formatPrice(product.price)}</Text>
                    {product.originalPrice && (
                      <Text style={s.cardOrigPrice}>{formatPrice(product.originalPrice)}</Text>
                    )}
                  </View>
                </View>
                {product.discount && (
                  <View style={[s.discountBadge, {backgroundColor: accent}]}>
                    <Text style={[s.discountText, {color: accentText}]}>{product.discount}%</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* STYLE TIP */}
        <View style={[s.tipCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}]}>
          <View style={[s.tipAccent, {backgroundColor: accent}]} />
          <View style={{flex: 1}}>
            <Text style={[s.tipLabel, {color: accent}]}>STYLE TIP</Text>
            <Text style={[s.tipText, {color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}]}>
              {tip}
            </Text>
          </View>
        </View>

        {/* HORIZONTAL HIGHLIGHT SCROLL */}
        {featuredPicks.length > 0 && (
          <View style={{marginTop: 28}}>
            <View style={[s.section, {marginTop: 0}]}>
              <View style={s.sectionHeader}>
                <Text style={[s.sectionTag, {color: accent}]}>QUICK ADD</Text>
                <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Tap to cart</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingHorizontal: PAD, gap: 12}}>
              {products.slice(0, 8).map(product => (
                <View key={`hl-${product.id}`} style={[s.hlCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'}]}>
                  <Image source={{uri: product.images[0]}} style={s.hlImage} resizeMode="cover" />
                  <View style={s.hlInfo}>
                    <Text style={[s.hlBrand, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>{product.brand}</Text>
                    <Text style={[s.hlName, {color: isDark ? '#FFF' : '#1A1A1A'}]} numberOfLines={1}>{product.name}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6}}>
                      <Text style={[s.hlPrice, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{formatPrice(product.price)}</Text>
                      <TouchableOpacity
                        style={[s.hlAddBtn, {backgroundColor: accent}]}
                        onPress={() => quickAddToCart(product)}
                        activeOpacity={0.8}>
                        <Icon name="plus" size={14} color={accentText} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* PRODUCT GRID */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTag, {color: accent}]}>SHOP THE EDIT</Text>
            <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{catData.gridLabel}</Text>
          </View>

          <View style={s.cardGrid}>
            {gridProducts.map(product => (
              <TouchableOpacity
                key={product.id}
                style={s.gridCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetail', {product})}>
                <Image source={{uri: product.images[0]}} style={s.gridImage} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.75)']}
                  locations={[0.35, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.gridRating}>
                  <Icon name="star" size={8} color="#F5A623" />
                  <Text style={s.gridRatingText}>{product.rating}</Text>
                </View>
                <TouchableOpacity
                  style={[s.gridAddBtn, {backgroundColor: accent}]}
                  onPress={() => quickAddToCart(product)}
                  activeOpacity={0.8}>
                  <Icon name="plus" size={12} color={accentText} />
                </TouchableOpacity>
                {product.discount && (
                  <View style={[s.gridDiscountBadge, {backgroundColor: accent}]}>
                    <Text style={{fontSize: 9, fontWeight: '800', fontFamily: 'Helvetica', color: accentText}}>{product.discount}%</Text>
                  </View>
                )}
                <View style={s.gridInfo}>
                  <Text style={s.gridBrand}>{product.brand}</Text>
                  <Text style={s.gridName} numberOfLines={1}>{product.name}</Text>
                  <Text style={s.gridPrice}>{formatPrice(product.price)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA Banner */}
        <View style={{paddingHorizontal: PAD, marginTop: 20, marginBottom: 40}}>
          <TouchableOpacity
            style={[s.ctaBanner, {backgroundColor: accent}]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('CategoryProducts', {
              categoryName: categoryType,
              products: PRODUCTS.filter(catData.filterFn),
            })}>
            <View style={{flex: 1}}>
              <Text style={[s.ctaTitle, {color: accentText}]}>See all {categoryType.toLowerCase()}</Text>
              <Text style={[s.ctaSub, {color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'}]}>
                {totalProducts}+ products
              </Text>
            </View>
            <View style={[s.ctaArrow, {backgroundColor: isDark ? '#000' : '#FFF'}]}>
              <Icon name="arrow-right" size={16} color={isDark ? '#FFF' : '#000'} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{height: 120}} />
      </Animated.ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    height: 420,
    overflow: 'hidden',
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: PAD,
    right: PAD,
  },
  accentLine: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    marginBottom: 6,
  },
  heroHeadline: {
    fontSize: 42,
    fontWeight: '800',
    fontFamily: 'Rondira-Medium',
    color: '#FFF',
    lineHeight: 46,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.65)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: PAD,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: PAD,
    marginTop: 24,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    lineHeight: 20,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    letterSpacing: 0.5,
  },
  // Stats
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: PAD,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Helvetica',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Helvetica',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  // Section
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    letterSpacing: 2,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardImageWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_W,
    height: CARD_H,
    borderRadius: R,
    overflow: 'hidden',
  },
  notchCircle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 42,
    left: 12,
    right: 12,
  },
  cardBrand: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    color: '#FFF',
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Helvetica',
    color: '#FFF',
  },
  cardOrigPrice: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Helvetica',
  },
  // Style tip
  tipCard: {
    marginHorizontal: PAD,
    marginTop: 28,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  tipAccent: {
    width: 3,
    borderRadius: 2,
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    letterSpacing: 2,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    fontFamily: 'Helvetica',
    lineHeight: 19,
  },
  // Horizontal highlight cards
  hlCard: {
    width: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hlImage: {
    width: 160,
    height: 160,
  },
  hlInfo: {
    padding: 10,
  },
  hlBrand: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hlName: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    marginTop: 2,
  },
  hlPrice: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Helvetica',
  },
  hlAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Grid
  gridCard: {
    width: CARD_W,
    height: CARD_W * 1.2,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gridRating: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gridRatingText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    color: '#FFF',
  },
  gridAddBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDiscountBadge: {
    position: 'absolute',
    top: 38,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gridInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  gridBrand: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridName: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    color: '#FFF',
    marginTop: 2,
  },
  gridPrice: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    color: '#FFF',
    marginTop: 3,
  },
  // CTA
  ctaBanner: {
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Rondira-Medium',
  },
  ctaSub: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    marginTop: 2,
  },
  ctaArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
