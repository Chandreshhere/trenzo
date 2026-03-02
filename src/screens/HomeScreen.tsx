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
  Alert,
  ImageBackground,
  RefreshControl,
  PanResponder,
} from 'react-native';
import ReAnimated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
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

const HERO_BANNER_M = require('../../assets/images /1.jpg');
const HERO_BANNER_F = require('../../assets/images /2.jpg');
const GENDER_MEN_IMG = require('../../assets/images /1.png');
const GENDER_WOMEN_IMG = require('../../assets/images /2.png');
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

const {width} = Dimensions.get('window');
const BANNER_CARD_WIDTH = width - (SIZES.screenPadding * 2);
const BANNER_SPACING = 10;
const BANNER_SNAP = BANNER_CARD_WIDTH + BANNER_SPACING;
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
  {id: 'oc1', label: 'STREET WEAR'},
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

// Static data for Offers
const OFFERS_MEN = [
  {id: 'of1', title: 'FLAT 50%\nOFF', subtitle: 'On streetwear', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600'},
  {id: 'of2', title: 'BUY 2\nGET 1', subtitle: 'Selected brands', image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600'},
  {id: 'of3', title: 'UPTO 70%\nOFF', subtitle: 'End of season', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600'},
  {id: 'of4', title: 'EXTRA 20%\nOFF', subtitle: 'Using Trenzo Pay', image: 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=600'},
];
const OFFERS_WOMEN = [
  {id: 'of1', title: 'FLAT 50%\nOFF', subtitle: 'On ethnic wear', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600'},
  {id: 'of2', title: 'BUY 2\nGET 1', subtitle: 'Selected brands', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600'},
  {id: 'of3', title: 'UPTO 70%\nOFF', subtitle: 'End of season', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'},
  {id: 'of4', title: 'EXTRA 20%\nOFF', subtitle: 'Using Trenzo Pay', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600'},
];

// Pre-compute grain dots once (subtle film grain texture)
const GRAIN_DOTS = Array.from({length: 300}, (_, i) => ({
  key: `g${i}`,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 1 + Math.random() * 1.5,
  opacity: 0.03 + Math.random() * 0.07,
}));

const GrainOverlay = React.memo(() => (
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
));

interface Props {
  navigation: any;
}

export default function HomeScreen({navigation}: Props) {
  const {cartItemCount, cartTotal} = useApp();
  const {openProduct} = useHeroTransition();
  const {tabBarTranslateY} = useTabBar();
  const {colors, isDark} = useTheme();
  const {activeGender, palette: genderPalette, setActiveGender} = useGenderPalette();
  const genderProducts = activeGender === 'Men'
    ? PRODUCTS.filter(p => p.gender === 'men' || p.gender === 'unisex')
    : PRODUCTS.filter(p => p.gender === 'women' || p.gender === 'unisex');
  const styles = useMemo(() => createStyles(colors, isDark, genderPalette), [colors, isDark, activeGender]);
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
  const [brandPage, setBrandPage] = useState(0);
  const brandSlideAnim = useRef(new Animated.Value(0)).current;
  const brandPageRef = useRef(0);
  brandPageRef.current = brandPage;
  const brandPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 15 && Math.abs(gesture.dy) < 30,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -40) {
          const totalPages = Math.ceil(BRANDS.length / 12);
          if (brandPageRef.current < totalPages - 1) {
            const next = brandPageRef.current + 1;
            Animated.timing(brandSlideAnim, {toValue: -1, duration: 220, useNativeDriver: true}).start(() => {
              setBrandPage(next);
              brandSlideAnim.setValue(0.5);
              Animated.spring(brandSlideAnim, {toValue: 0, friction: 14, tension: 50, useNativeDriver: true}).start();
            });
          }
        } else if (gesture.dx > 40) {
          if (brandPageRef.current > 0) {
            const prev = brandPageRef.current - 1;
            Animated.timing(brandSlideAnim, {toValue: 1, duration: 220, useNativeDriver: true}).start(() => {
              setBrandPage(prev);
              brandSlideAnim.setValue(-0.5);
              Animated.spring(brandSlideAnim, {toValue: 0, friction: 14, tension: 50, useNativeDriver: true}).start();
            });
          }
        }
      },
    })
  ).current;
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerScrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const floatingCartAnim = useRef(new Animated.Value(0)).current;
  const lastScrollYRef = useRef(0);
  const isTabBarHidden = useRef(false);
  const scrollY = useSharedValue(0);
  const [exploreSearchQuery, setExploreSearchQuery] = useState('');
  const [exploreFilter, setExploreFilter] = useState('All');

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
      scheduleOnRN(handleTabBarScroll, event.contentOffset.y);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner(prev => {
        const next = (prev + 1) % BANNERS.length;
        if (next === 0) {
          const cloneIdx = LOOP_BANNERS.length - 1;
          bannerScrollRef.current?.scrollTo({x: cloneIdx * BANNER_SNAP, animated: true});
          setTimeout(() => {
            bannerScrollRef.current?.scrollTo({x: BANNER_SNAP, animated: false});
          }, 450);
        } else {
          bannerScrollRef.current?.scrollTo({x: (next + 1) * BANNER_SNAP, animated: true});
        }
        return next;
      });
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
    }, 2000);
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
      setActiveBanner(BANNERS.length - 1);
    } else if (idx >= LOOP_BANNERS.length - 1) {
      bannerScrollRef.current?.scrollTo({x: BANNER_SNAP, animated: false});
      setActiveBanner(0);
    } else {
      setActiveBanner(idx - 1);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    navigation.navigate('CategoryProducts', {
      categoryName,
      products: PRODUCTS.filter(p => p.category.toLowerCase() === categoryName.toLowerCase()),
    });
  };

  const handleSeeAll = (title: string, products: Product[]) => {
    navigation.navigate('CategoryProducts', {categoryName: title, products});
  };

  const handleBrandPress = (brandName: string) => {
    navigation.navigate('CategoryProducts', {
      categoryName: brandName,
      products: PRODUCTS.filter(p => p.brand === brandName),
    });
  };

  const handleGenderCard = (gender: 'Men' | 'Women') => {
    setActiveGender(gender);
  };

  // --- RENDER HELPERS ---

  const renderBanner = (banner: typeof BANNERS[0], loopIndex: number) => {
    const inputRange = [
      (loopIndex - 1) * BANNER_SNAP,
      loopIndex * BANNER_SNAP,
      (loopIndex + 1) * BANNER_SNAP,
    ];
    const scale = bannerScrollX.interpolate({inputRange, outputRange: [0.85, 1, 0.85], extrapolate: 'clamp'});
    const cardOpacity = bannerScrollX.interpolate({inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp'});
    const rotateY = bannerScrollX.interpolate({inputRange, outputRange: ['-15deg', '0deg', '15deg'], extrapolate: 'clamp'});
    const translateY = bannerScrollX.interpolate({inputRange, outputRange: [12, 0, 12], extrapolate: 'clamp'});

    return (
      <Animated.View key={`${banner.id}-${loopIndex}`} style={{width: BANNER_CARD_WIDTH, marginRight: BANNER_SPACING, transform: [{perspective: 1000}, {scale}, {rotateY}, {translateY}], opacity: cardOpacity}}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.bannerCard, {backgroundColor: banner.color}]}
          onPress={() => {
            navigation.navigate('CategoryProducts', {
              categoryName: banner.title.replace('\n', ' '),
              products: PRODUCTS.filter(p => p.isNew || p.discount || p.isFeatured),
            });
          }}>
          <Image source={(activeGender === 'Women' ? CAROUSEL_IMAGES_WOMEN : CAROUSEL_IMAGES_MEN)[((loopIndex - 1 + BANNERS.length) % BANNERS.length) % (activeGender === 'Women' ? CAROUSEL_IMAGES_WOMEN : CAROUSEL_IMAGES_MEN).length]} style={styles.bannerBgImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.65)']}
            locations={[0, 0.4, 1]}
            style={styles.bannerGradientOverlay}>
            <View style={styles.magHeader}>
              <Text style={styles.magTitle}>{banner.magazineTitle || 'ClosetX'}</Text>
              {banner.season && (
                <View style={styles.magSeasonBadge}>
                  <Text style={styles.magSeasonText}>{banner.season}</Text>
                </View>
              )}
            </View>
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

  const renderHeroBanner = () => (
    <View style={styles.heroBannerWrap}>
      <View style={styles.closetXRow}>
        <Text style={styles.closetXText}>Closet</Text>
        <Text style={styles.closetXAccent}>X</Text>
      </View>
      <View style={styles.heroBannerShadow}>
        <Image source={activeGender === 'Women' ? HERO_BANNER_F : HERO_BANNER_M} style={styles.heroBannerImg} />
      </View>
      <View style={styles.genderCardsRow}>
        <TouchableOpacity
          style={[
            styles.genderCard,
            activeGender === 'Men' && {borderColor: '#CDF564', borderWidth: 2.5},
          ]}
          activeOpacity={0.85}
          onPress={() => handleGenderCard('Men')}>
          <View style={[styles.genderCardInner, {borderWidth: 0}]}>
            <Image source={GENDER_WOMEN_IMG} style={styles.genderCardImg} resizeMode="contain" />
            <LinearGradient
              colors={['transparent', GENDER_PALETTES.Men.dark + 'E6']}
              style={styles.genderCardGradient}
            />
            <View style={styles.genderCardContent}>
              <Text style={styles.genderCardLabel}>MEN</Text>
              <View style={[styles.genderCardArrow, {backgroundColor: '#CDF564'}]}>
                <Icon name="arrow-right" size={14} color="#000" />
              </View>
            </View>
          </View>
          {activeGender === 'Men' && (
            <View style={[styles.genderCardAccent, {backgroundColor: '#CDF564'}]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderCard,
            activeGender === 'Women' && {borderColor: GENDER_PALETTES.Women.mid, borderWidth: 2.5},
          ]}
          activeOpacity={0.85}
          onPress={() => handleGenderCard('Women')}>
          <View style={[styles.genderCardInner, {borderWidth: 0}]}>
            <Image source={GENDER_MEN_IMG} style={styles.genderCardImg} resizeMode="contain" />
            <LinearGradient
              colors={['transparent', GENDER_PALETTES.Women.dark + 'E6']}
              style={styles.genderCardGradient}
            />
            <View style={styles.genderCardContent}>
              <Text style={styles.genderCardLabel}>WOMEN</Text>
              <View style={[styles.genderCardArrow, {backgroundColor: GENDER_PALETTES.Women.mid}]}>
                <Icon name="arrow-right" size={14} color="#fff" />
              </View>
            </View>
          </View>
          {activeGender === 'Women' && (
            <View style={[styles.genderCardAccent, styles.genderCardAccentRight, {backgroundColor: GENDER_PALETTES.Women.mid}]} />
          )}
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
  const renderPromoBanner = () => {
    const isWomen = activeGender === 'Women';
    const bannerUri = isWomen
      ? 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900'
      : 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=900';
    const bannerTitle = isWomen ? 'New Season\nArrivals' : 'Street Style\nEssentials';
    const bannerSub = isWomen ? 'Up to 50% off on trending styles' : 'Up to 40% off on urban fits';
    return (
      <View style={styles.promoBannerWrap}>
        <Image source={{uri: bannerUri}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
        />
        <View style={{position: 'absolute', bottom: 24, left: 20}}>
          <Text style={styles.promoBannerTitle}>{bannerTitle}</Text>
          <Text style={styles.promoBannerSub}>{bannerSub}</Text>
          <TouchableOpacity
            style={[styles.promoBannerBtn, {backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryProducts', {
              categoryName: isWomen ? 'New Arrivals' : 'Street Style',
              products: PRODUCTS.filter(p => p.isNew || p.discount),
            })}>
            <Text style={styles.promoBannerBtnText}>SHOP NOW</Text>
            <Icon name="arrow-right" size={12} color={activeGender === 'Men' ? '#000' : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 3. Discover Brands paginated grid (12 per page)
  const BRANDS_PER_PAGE = 12;
  const totalBrandPages = Math.ceil(BRANDS.length / BRANDS_PER_PAGE);

  const handleBrandPageChange = useCallback((direction: 'left' | 'right') => {
    const next = direction === 'right'
      ? Math.min(brandPage + 1, totalBrandPages - 1)
      : Math.max(brandPage - 1, 0);
    if (next === brandPage) return;
    Animated.timing(brandSlideAnim, {
      toValue: direction === 'right' ? -1 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setBrandPage(next);
      brandSlideAnim.setValue(direction === 'right' ? 0.5 : -0.5);
      Animated.spring(brandSlideAnim, {
        toValue: 0,
        friction: 14,
        tension: 50,
        useNativeDriver: true,
      }).start();
    });
  }, [brandPage, totalBrandPages, brandSlideAnim]);

  const renderDiscoverBrands = () => {
    const pageBrands = BRANDS.slice(brandPage * BRANDS_PER_PAGE, (brandPage + 1) * BRANDS_PER_PAGE);
    const translateX = brandSlideAnim.interpolate({
      inputRange: [-1, -0.5, 0, 0.5, 1],
      outputRange: [-width * 0.25, -width * 0.08, 0, width * 0.08, width * 0.25],
    });
    const scale = brandSlideAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0.96, 1, 0.96],
    });
    const opacity = brandSlideAnim.interpolate({
      inputRange: [-1, -0.3, 0, 0.3, 1],
      outputRange: [0, 0.6, 1, 0.6, 0],
    });
    return (
      <View style={styles.brandsSection}>
        <Text style={styles.brandsSectionTitle}>Discover Brands</Text>
        <View style={styles.brandsGridWrap} {...brandPanResponder.panHandlers}>
          <Animated.View style={[styles.brandsGrid, {transform: [{translateX}, {scale}], opacity}]}>
            {pageBrands.map(brand => (
              <TouchableOpacity
                key={brand.id}
                style={styles.brandGridCard}
                activeOpacity={0.8}
                onPress={() => handleBrandPress(brand.name)}>
                <Image source={{uri: brand.logo}} style={styles.brandGridLogo} resizeMode="contain" />
              </TouchableOpacity>
            ))}
          </Animated.View>
          {/* Left arrow */}
          <TouchableOpacity
            style={[styles.brandsNavBtn, styles.brandsNavBtnLeft]}
            activeOpacity={0.7}
            onPress={() => handleBrandPageChange('left')}>
            <Icon name="chevron-left" size={16} color={activeGender === 'Men' ? '#000' : '#FFFFFF'} />
          </TouchableOpacity>
          {/* Right arrow */}
          <TouchableOpacity
            style={[styles.brandsNavBtn, styles.brandsNavBtnRight]}
            activeOpacity={0.7}
            onPress={() => handleBrandPageChange('right')}>
            <Icon name="chevron-right" size={16} color={activeGender === 'Men' ? '#000' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
        {/* Page dots */}
        <View style={styles.brandsDots}>
          {Array.from({length: totalBrandPages}).map((_, i) => (
            <View key={i} style={[styles.brandsDot, brandPage === i && styles.brandsDotActive]} />
          ))}
        </View>
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

  // 3.5 Shoe Banner
  const renderShoeBanner = () => {
    const isWomen = activeGender === 'Women';
    const bannerUri = isWomen
      ? 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900'
      : 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=900';
    const bannerTitle = isWomen ? 'Heels That\nTurn Heads' : 'Sneaker\nDrop';
    const bannerSub = isWomen ? 'Step into elegance' : 'Fresh kicks, bold moves';
    const bannerCta = isWomen ? 'SHOP HEELS' : 'SHOP SNEAKERS';
    return (
      <View style={styles.shoeBannerWrap}>
        <Image source={{uri: bannerUri}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
        />
        {/* Top fade gradient blending into bg */}
        <LinearGradient
          colors={[genderPalette.dark, genderPalette.dark + 'CC', genderPalette.dark + '50', 'transparent']}
          locations={[0, 0.3, 0.65, 1]}
          style={styles.shoeBannerTopFade}
        />
        <View style={{position: 'absolute', bottom: 24, left: 20}}>
          <Text style={styles.promoBannerTitle}>{bannerTitle}</Text>
          <Text style={styles.promoBannerSub}>{bannerSub}</Text>
          <TouchableOpacity
            style={[styles.promoBannerBtn, {backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryProducts', {
              categoryName: isWomen ? 'Heels' : 'Sneakers',
              products: PRODUCTS.filter(p => p.category === 'Footwear' || p.isNew),
            })}>
            <Text style={styles.promoBannerBtnText}>{bannerCta}</Text>
            <Icon name="arrow-right" size={12} color={activeGender === 'Men' ? '#000' : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 3.6 Shoe Products Horizontal Scroll
  const shoeProducts = useMemo(() => {
    const isWomen = activeGender === 'Women';
    return PRODUCTS.filter(p =>
      p.category === 'Shoes' &&
      (isWomen
        ? (p.gender === 'women' || p.gender === 'unisex')
        : (p.gender === 'men' || p.gender === 'unisex'))
    );
  }, [activeGender]);

  const renderShoeCards = () => (
    <View style={styles.shoeCardsSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shoeCardsList}
        decelerationRate="fast"
        snapToInterval={160}
      >
        {shoeProducts.map(product => (
          <TouchableOpacity
            key={`shoe-${product.id}`}
            style={styles.shoeCard}
            activeOpacity={0.9}
            onPress={() => {}}
          >
            <View style={styles.shoeCardImgWrap}>
              <Image source={{uri: product.images[0]}} style={styles.shoeCardImg} resizeMode="cover" />
              {product.discount && (
                <View style={[styles.shoeCardBadge, {backgroundColor: genderPalette.mid}]}>
                  <Text style={styles.shoeCardBadgeText}>{product.discount}% OFF</Text>
                </View>
              )}
              <TouchableOpacity style={styles.shoeCardHeart} activeOpacity={0.7}>
                <Icon name="heart-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.shoeCardInfo}>
              <Text style={styles.shoeCardBrand}>{product.brand}</Text>
              <Text style={styles.shoeCardName} numberOfLines={1}>{product.name}</Text>
              <View style={styles.shoeCardPriceRow}>
                <Text style={styles.shoeCardPrice}>{formatPrice(product.price)}</Text>
                {product.originalPrice && (
                  <Text style={styles.shoeCardOldPrice}>{formatPrice(product.originalPrice)}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

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
            onPress={() => handleSeeAll(occ.label, genderProducts.slice(0, 8))}>
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

  // 8. Offers Grid (2x2)
  const renderOffersGrid = () => (
    <View style={styles.offersSection}>
      <Text style={styles.offersTitle}>Offers</Text>
      <View style={styles.offersGrid}>
        {(activeGender === 'Women' ? OFFERS_WOMEN : OFFERS_MEN).map((offer) => (
          <TouchableOpacity key={offer.id} style={styles.offerCard} activeOpacity={0.9}>
            <Image source={{uri: offer.image}} style={styles.offerImage} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.offerGradient}
            />
            <View style={styles.offerTextWrap}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
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
      ? 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=900'
      : 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=900';
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
          colors={[genderPalette.dark, genderPalette.dark + 'CC', genderPalette.dark + '50', 'transparent']}
          locations={[0, 0.3, 0.65, 1]}
          style={styles.shoeBannerTopFade}
        />
        <View style={{position: 'absolute', bottom: 24, left: 20}}>
          <Text style={styles.promoBannerTitle}>{bannerTitle}</Text>
          <Text style={styles.promoBannerSub}>{bannerSub}</Text>
          <TouchableOpacity
            style={[styles.promoBannerBtn, {backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryProducts', {
              categoryName: 'Accessories',
              products: PRODUCTS.filter(p => p.category === 'Accessories' || p.category === 'Bags'),
            })}>
            <Text style={styles.promoBannerBtnText}>{bannerCta}</Text>
            <Icon name="arrow-right" size={12} color={activeGender === 'Men' ? '#000' : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 8.6 Accessories Products Horizontal Scroll
  const accessoryProducts = useMemo(() => {
    const isWomen = activeGender === 'Women';
    return PRODUCTS.filter(p =>
      (p.category === 'Accessories' || p.category === 'Bags') &&
      (isWomen
        ? (p.gender === 'women' || p.gender === 'unisex')
        : (p.gender === 'men' || p.gender === 'unisex'))
    );
  }, [activeGender]);

  const renderAccessoryCards = () => (
    <View style={styles.shoeCardsSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shoeCardsList}
        decelerationRate="fast"
        snapToInterval={160}
      >
        {accessoryProducts.map(product => (
          <TouchableOpacity
            key={`acc-${product.id}`}
            style={styles.shoeCard}
            activeOpacity={0.9}
            onPress={() => {}}
          >
            <View style={styles.shoeCardImgWrap}>
              <Image source={{uri: product.images[0]}} style={styles.shoeCardImg} resizeMode="cover" />
              {product.discount && (
                <View style={[styles.shoeCardBadge, {backgroundColor: genderPalette.mid}]}>
                  <Text style={styles.shoeCardBadgeText}>{product.discount}% OFF</Text>
                </View>
              )}
              <TouchableOpacity style={styles.shoeCardHeart} activeOpacity={0.7}>
                <Icon name="heart-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.shoeCardInfo}>
              <Text style={styles.shoeCardBrand}>{product.brand}</Text>
              <Text style={styles.shoeCardName} numberOfLines={1}>{product.name}</Text>
              <View style={styles.shoeCardPriceRow}>
                <Text style={styles.shoeCardPrice}>{formatPrice(product.price)}</Text>
                {product.originalPrice && (
                  <Text style={styles.shoeCardOldPrice}>{formatPrice(product.originalPrice)}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ========== Shared product card renderer (same size as shoe cards) ==========
  const renderProductCards = (products: {id: string; name: string; brand: string; price: number; originalPrice?: number; discount?: number; image: string}[], keyPrefix: string) => (
    <View style={styles.shoeCardsSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shoeCardsList}
        decelerationRate="fast"
        snapToInterval={160}
      >
        {products.map(p => (
          <TouchableOpacity
            key={`${keyPrefix}-${p.id}`}
            style={styles.shoeCard}
            activeOpacity={0.9}
            onPress={() => {}}
          >
            <View style={styles.shoeCardImgWrap}>
              <Image source={{uri: p.image}} style={styles.shoeCardImg} resizeMode="cover" />
              {p.discount && (
                <View style={[styles.shoeCardBadge, {backgroundColor: genderPalette.mid}]}>
                  <Text style={styles.shoeCardBadgeText}>{p.discount}% OFF</Text>
                </View>
              )}
              <TouchableOpacity style={styles.shoeCardHeart} activeOpacity={0.7}>
                <Icon name="heart-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.shoeCardInfo}>
              <Text style={styles.shoeCardBrand}>{p.brand}</Text>
              <Text style={styles.shoeCardName} numberOfLines={1}>{p.name}</Text>
              <View style={styles.shoeCardPriceRow}>
                <Text style={styles.shoeCardPrice}>{formatPrice(p.price)}</Text>
                {p.originalPrice && (
                  <Text style={styles.shoeCardOldPrice}>{formatPrice(p.originalPrice)}</Text>
                )}
              </View>
            </View>
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
        <View style={styles.topsBanner}>
          <View style={styles.topsBannerLeft}>
            <Text style={styles.topsBannerLabel}>NEW IN</Text>
            <Text style={styles.topsBannerTitle}>{isW ? 'Tops That\nTurn Heads' : 'Layer Up\nYour Game'}</Text>
            <Text style={styles.topsBannerSub}>{isW ? 'Blouses, tanks & beyond' : 'Tees, shirts & more'}</Text>
            <TouchableOpacity style={[styles.topsBannerBtn, {borderColor: genderPalette.mid}]} activeOpacity={0.85}
              onPress={() => navigation.navigate('CategoryProducts', {categoryName: 'Tops', products: PRODUCTS.filter(p => p.category === 'Tops')})}>
              <Text style={[styles.topsBannerBtnText, {color: genderPalette.mid}]}>SHOP TOPS</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.topsBannerRight}>
            <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=500' : 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=500'}} style={styles.topsBannerImg} resizeMode="cover" />
          </View>
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
        <View style={styles.bottomsBanner}>
          <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900' : 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900'}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
          <LinearGradient colors={[genderPalette.dark + 'E6', 'transparent', genderPalette.dark + 'CC']} locations={[0, 0.5, 1]} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}} />
          <View style={{position: 'absolute', top: 24, left: 20, right: 20}}>
            <Text style={styles.bottomsBannerTag}>BOTTOMS</Text>
            <Text style={styles.bottomsBannerTitle}>{isW ? 'Perfect Fit\nBottoms' : 'Bottom Half\nGame'}</Text>
          </View>
          <TouchableOpacity style={[styles.bottomsBannerBtn, {backgroundColor: activeGender === 'Men' ? '#CDF564' : genderPalette.mid}]} activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryProducts', {categoryName: 'Bottoms', products: PRODUCTS.filter(p => p.category === 'Bottoms')})}>
            <Text style={styles.promoBannerBtnText}>SHOP BOTTOMS</Text>
            <Icon name="arrow-right" size={12} color={activeGender === 'Men' ? '#000' : '#fff'} />
          </TouchableOpacity>
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
        <View style={styles.outerBanner}>
          <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=900' : 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900'}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']} locations={[0, 0.4, 1]} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}} />
          <View style={{position: 'absolute', bottom: 28, left: 20, right: 20}}>
            <Text style={styles.outerBannerTitle}>{isW ? 'Wrap It Up' : 'Jacket Season'}</Text>
            <Text style={styles.outerBannerSub}>{isW ? 'Coats, blazers & jackets' : 'Bombers, coats & layers'}</Text>
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
        <View style={styles.dressBanner}>
          <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900' : 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900'}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}} />
          <View style={{position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 24}}>
            <Text style={styles.dressBannerTag}>{isW ? 'THE DRESS EDIT' : 'THE FORMAL EDIT'}</Text>
            <Text style={styles.dressBannerTitle}>{isW ? 'Dress the Mood' : 'Suited & Booted'}</Text>
            <TouchableOpacity style={[styles.dressBannerBtn, {borderColor: genderPalette.lightest}]} activeOpacity={0.85}
              onPress={() => navigation.navigate('CategoryProducts', {categoryName: 'Dresses', products: PRODUCTS.filter(p => p.category === 'Dresses')})}>
              <Text style={styles.dressBannerBtnText}>EXPLORE</Text>
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
        <LinearGradient colors={[genderPalette.dark, genderPalette.mid, genderPalette.light + '80']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.activeBanner}>
          <View style={styles.activeBannerContent}>
            <Text style={styles.activeBannerTag}>ACTIVEWEAR</Text>
            <Text style={styles.activeBannerTitle}>{isW ? 'Move in\nStyle' : 'Train\nHarder'}</Text>
            <Text style={styles.activeBannerSub}>{isW ? 'Leggings, sports bras & more' : 'Gym-ready essentials'}</Text>
            <TouchableOpacity style={[styles.activeBannerBtn, activeGender === 'Men' && {backgroundColor: '#CDF564'}]} activeOpacity={0.85}
              onPress={() => navigation.navigate('CategoryProducts', {categoryName: 'Activewear', products: PRODUCTS.filter(p => p.category === 'Activewear')})}>
              <Text style={styles.activeBannerBtnText}>SHOP NOW</Text>
              <Icon name="arrow-right" size={12} color={activeGender === 'Men' ? '#000' : genderPalette.dark} />
            </TouchableOpacity>
          </View>
          <View style={styles.activeBannerImgWrap}>
            <Image source={{uri: isW ? 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=500' : 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'}} style={styles.activeBannerImg} resizeMode="cover" />
          </View>
        </LinearGradient>
        {renderProductCards(ACTIVE_PRODUCTS, 'active')}
      </View>
    );
  };


  // ========== EXPLORE MORE — Pinterest masonry grid ==========
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


  const renderExploreCard = (product: Product, index: number, colIndex: number) => {
    const imgHeight = (index + colIndex) % 3 === 0 ? 220 : (index + colIndex) % 3 === 1 ? 180 : 150;
    return (
      <TouchableOpacity key={`explore-${product.id}`} style={styles.exploreCard} activeOpacity={0.9} onPress={() => {}}>
        <View style={{width: '100%', height: imgHeight, borderRadius: 16, overflow: 'hidden'}}>
          <Image source={{uri: product.images[0]}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
          <TouchableOpacity style={styles.exploreCardHeart} activeOpacity={0.7}>
            <Icon name="heart" size={14} color="#fff" />
          </TouchableOpacity>
          {product.discount && (
            <View style={[styles.exploreCardBadge, {backgroundColor: genderPalette.mid}]}>
              <Text style={styles.shoeCardBadgeText}>{product.discount}% OFF</Text>
            </View>
          )}
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

  const renderExploreSection = () => {
    const screenH = Dimensions.get('window').height;
    return (
      <View style={{height: screenH}}>
        {/* These stay at the top when section fills viewport */}
        <View style={styles.exploreHeader}>
          <Text style={[styles.exploreTitle, {paddingHorizontal: SIZES.screenPadding}]}>Explore More</Text>

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

        {/* Products scroll in nested ScrollView */}
        <ScrollView
          style={{flex: 1}}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 100}}
        >
          <View style={styles.exploreMasonry}>
            <View style={styles.exploreColumn}>
              {leftCol.map((p, i) => renderExploreCard(p, i, 0))}
            </View>
            <View style={styles.exploreColumn}>
              {rightCol.map((p, i) => renderExploreCard(p, i, 1))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // 9. Classic Black Banner
  const renderClassicBlack = () => (
    <View style={styles.classicSection}>
      <View style={styles.classicBg}>
        <Image
          source={{uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'}}
          style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
          style={styles.classicGradient}
        />
        <View style={styles.classicTextWrap}>
          <Text style={styles.classicTitle}>CLASSIC{'\n'}BLACK</Text>
          <Text style={styles.classicSubtitle}>Own every night</Text>
          <TouchableOpacity
            style={styles.classicBtn}
            onPress={() => handleSeeAll('Classic Black', genderProducts.slice(0, 8))}>
            <Text style={styles.classicBtnText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFloatingCart = () => {
    const translateY = floatingCartAnim.interpolate({inputRange: [0, 1], outputRange: [100, 0]});
    return (
      <Animated.View
        style={[styles.floatingCart, {transform: [{translateY}], opacity: floatingCartAnim}]}
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
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={genderPalette.dark} />


      {/* Fixed Header — only when search is open */}
      {searchOverlayVisible && (
        <View style={[styles.headerCurved, {paddingTop: 54}]}>
          <View style={[styles.hSearchBarWrap, {paddingLeft: SIZES.screenPadding}]}>
            <TouchableOpacity style={styles.hSearchBackBtn} onPress={closeSearchOverlay}>
              <Icon name="arrow-left" size={20} color={genderPalette.lightest} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hSearchBar, {flex: 1}]}
              activeOpacity={0.8}>
              <Icon name="search" size={16} color={genderPalette.light} />
              <TextInput
                ref={searchInputRef}
                style={styles.hSearchInput}
                placeholder="Search brands, products..."
                placeholderTextColor={genderPalette.light}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                selectionColor={genderPalette.lightest}
                autoFocus
              />
              <TouchableOpacity onPress={() => Alert.alert('Photo Search', 'Coming soon! Search by taking a photo.')}>
                <Icon name="camera" size={16} color={genderPalette.light} />
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
        scrollEventThrottle={16}
        bounces
        alwaysBounceVertical
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000000"
            colors={['#000000']}
          />
        }
        style={{flex: 1, backgroundColor: genderPalette.dark}}
        contentContainerStyle={cartItemCount > 0 ? {paddingBottom: 80} : undefined}>


        {/* Full background gradient — black → blue → black (Starlink style) */}
        {activeGender === 'Men' ? (
          <View pointerEvents="none" style={{position: 'absolute', top: 0, left: 0, right: 0, height: 1800, zIndex: 0}}>
            <LinearGradient
              colors={['#060018', '#0D0033', '#1A0055', '#0D0033', '#060018', '#000000', '#000000', '#060018', '#0D0033', '#1A0055', '#0D0033', '#060018', '#000000']}
              locations={[0, 0.02, 0.05, 0.1, 0.16, 0.25, 0.4, 0.5, 0.6, 0.68, 0.78, 0.88, 1]}
              style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
            />
            <GrainOverlay />
          </View>
        ) : (
          <LinearGradient
            colors={
              isDark
                ? ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0)']
                : ['rgba(250,250,248,0.9)', 'transparent']
            }
            locations={isDark ? [0, 0.25, 0.5, 0.75, 1] : [0, 1]}
            style={styles.topGradient}
            pointerEvents="none"
          />
        )}

        {/* Header */}
        <View style={styles.headerCurved}>
          <View style={styles.headerInner}>
            <View style={styles.headerLeft}>
              <View style={styles.deliveryTitleRow}>
                <Text style={styles.deliveryLabel}>Delivery in </Text>
                <Text style={styles.deliveryTime}>60 min</Text>
              </View>
              <TouchableOpacity style={styles.addressRow} activeOpacity={0.7}>
                <Text style={styles.addressText} numberOfLines={1}>Sector 17, Chandigarh</Text>
                <Icon name="chevron-down" size={14} color={genderPalette.light} />
              </TouchableOpacity>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.hIconBtn} onPress={openSearchOverlay}>
                <Icon name="search" size={20} color={genderPalette.lightest} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.hIconBtn} onPress={() => navigation.navigate('WishlistTab')}>
                <Icon name="heart" size={20} color={genderPalette.lightest} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.hIconBtn} onPress={() => navigation.navigate('ProfileTab')}>
                <Icon name="user" size={20} color={genderPalette.lightest} />
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
                scrollEventThrottle={16}>
                {LOOP_BANNERS.map((banner, index) => renderBanner(banner, index))}
              </Animated.ScrollView>
              <View style={styles.bannerDots}>
                {BANNERS.map((_, index) => (
                  <View key={index} style={[styles.bannerDot, activeBanner === index && styles.bannerDotActive]} />
                ))}
              </View>
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

            {/* 7. Style Occasions Grid */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderStyleOccasions()}
            </AnimatedSection>

            {/* 8. Offers Grid */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderOffersGrid()}
            </AnimatedSection>

            {/* 8.5 Accessories Banner */}
            <AnimatedSection scrollY={scrollY} slideDistance={20}>
              {renderAccessoriesBanner()}
            </AnimatedSection>

            {/* 8.6 Accessories Cards */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderAccessoryCards()}
            </AnimatedSection>

            {/* Tops */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderTopsSection()}
            </AnimatedSection>

            {/* Bottoms */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderBottomsSection()}
            </AnimatedSection>

            {/* Outerwear */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderOuterwearSection()}
            </AnimatedSection>

            {/* Dresses */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderDressesSection()}
            </AnimatedSection>

            {/* Activewear */}
            <AnimatedSection scrollY={scrollY} slideDistance={25}>
              {renderActivewearSection()}
            </AnimatedSection>

            {/* 9. Classic Black Banner */}
            <AnimatedSection scrollY={scrollY} slideDistance={20}>
              {renderClassicBlack()}
            </AnimatedSection>

            {/* 10. Explore More */}
            {renderExploreSection()}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ReAnimated.ScrollView>
      </Animated.View>
      )}

      {renderFloatingCart()}
    </View>
  );
}


const createStyles = (colors: any, isDark: boolean, gp: {lightest: string; light: string; mid: string; dark: string}) => StyleSheet.create({
  container: {flex: 1, backgroundColor: gp.dark === '#000000' ? '#0D0033' : gp.dark},
  topGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 350, zIndex: 0,
  },
  // Header
  headerCurved: {
    backgroundColor: 'transparent', paddingTop: 63, paddingBottom: 12, zIndex: 2,
  },
  headerInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16,
  },
  headerLeft: {flex: 1},
  deliveryTitleRow: {flexDirection: 'row', alignItems: 'baseline'},
  deliveryLabel: {
    fontSize: 21, fontWeight: '600', fontFamily: 'Inter',
    color: gp.dark === '#000000' ? '#CDF564' : gp.mid,
    letterSpacing: -0.08 * 21, lineHeight: 21,
  },
  deliveryTime: {
    fontSize: 21, fontWeight: '600', fontFamily: 'Inter', color: gp.lightest,
    letterSpacing: -0.08 * 21, lineHeight: 21,
  },
  addressRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3},
  addressText: {
    fontSize: 13, fontWeight: '300', fontFamily: 'Inter', color: gp.light,
    letterSpacing: -0.08 * 13, lineHeight: 13,
  },
  headerActions: {flexDirection: 'row', alignItems: 'center', gap: 18},
  hIconBtn: {width: 36, height: 36, justifyContent: 'center', alignItems: 'center'},
  hSearchBarWrap: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 14, gap: 8,
  },
  hSearchBackBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: gp.light + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  hSearchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: gp.light + '30',
    borderRadius: 14, paddingHorizontal: 14, height: 42, gap: 8,
    borderWidth: 1, borderColor: gp.light + '30',
  },
  hSearchInput: {
    flex: 1, fontSize: 13, color: gp.lightest,
    fontWeight: FONT_WEIGHTS.regular, fontFamily: 'Poppins',
  },
  // ClosetX Hero Banner
  heroBannerWrap: {paddingHorizontal: SIZES.screenPadding, marginTop: 8},
  closetXRow: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end',
    marginBottom: -18, zIndex: 0, paddingRight: 12,
  },
  closetXText: {
    fontSize: 45, fontWeight: '900', fontFamily: 'Jost', color: gp.lightest,
    letterSpacing: -3.6, lineHeight: 45,
    textShadowColor: '#000', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 6,
  },
  closetXAccent: {
    fontSize: 45, fontWeight: '900', fontFamily: 'Jost',
    color: gp.dark === '#000000' ? '#CDF564' : gp.mid,
    letterSpacing: -3.6, lineHeight: 45,
    textShadowColor: '#000', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 6,
  },
  heroBannerCard: {
    width: '100%', height: 120, borderRadius: 16, overflow: 'hidden',
    backgroundColor: 'transparent', zIndex: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  heroBannerShadow: {},
  heroBannerImg: {width: '100%', height: 120, borderRadius: 16},
  genderCardsRow: {flexDirection: 'row', gap: 16, marginTop: 40, overflow: 'visible'},
  genderCard: {
    flex: 1, overflow: 'visible', borderRadius: 16,
    borderWidth: 2.5, borderColor: 'transparent',
  },
  genderCardInner: {
    height: 55, borderRadius: 16, overflow: 'visible', backgroundColor: gp.lightest + '15',
    position: 'relative',
  },
  genderCardImg: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    width: '100%', height: 90, borderRadius: 16,
  },
  genderCardGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  genderCardContent: {
    position: 'absolute', top: 0, bottom: 0, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  genderCardLabel: {
    fontSize: 20, fontWeight: '700', fontFamily: 'Helvetica', color: '#FFFFFF',
    letterSpacing: 3, textTransform: 'uppercase',
  },
  genderCardArrow: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  genderCardAccent: {
    position: 'absolute', bottom: -6, left: 16, width: 40, height: 4, borderRadius: 2,
  },
  genderCardAccentRight: {left: undefined, right: 16},
  genderCardInactiveOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20,
  },
  // Banner Carousel
  bannerSection: {marginTop: 10, overflow: 'visible', zIndex: 2, paddingVertical: 8},
  bannerList: {paddingHorizontal: SIZES.screenPadding, paddingVertical: 10},
  bannerCard: {width: '100%', height: 280, borderRadius: 16, overflow: 'hidden'},
  bannerBgImage: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%',
  },
  bannerGradientOverlay: {flex: 1, padding: 0, justifyContent: 'space-between'},
  magHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16, marginHorizontal: 16,
  },
  magTitle: {
    fontSize: 24, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: COLORS.white, letterSpacing: 6,
  },
  magSeasonBadge: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
  },
  magSeasonText: {
    fontSize: 10, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.sans,
    color: COLORS.white, letterSpacing: 2,
  },
  magIssueTag: {
    fontSize: 10, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.sans,
    color: 'rgba(255,255,255,0.55)', letterSpacing: 3, textAlign: 'center',
  },
  magBottom: {gap: 4, marginBottom: 16, marginHorizontal: 16},
  magQuote: {
    fontSize: 24, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: COLORS.white, lineHeight: 30, letterSpacing: -0.5,
  },
  magSubtitle: {
    fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: FONT_WEIGHTS.regular,
    fontFamily: FONTS.sans, fontStyle: 'italic', letterSpacing: 0.5,
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
    fontFamily: FONTS.sans, letterSpacing: 2,
  },
  bannerDots: {flexDirection: 'row', justifyContent: 'center', marginTop: 12},
  bannerDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: gp.light + '30', marginHorizontal: 3,
  },
  bannerDotActive: {width: 22, backgroundColor: gp.dark === '#000000' ? '#CDF564' : gp.mid},

  // --- 1. TICKET CATEGORIES ---
  ticketSection: {
    marginTop: 28, paddingHorizontal: SIZES.screenPadding,
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
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 28,
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
    width: 55, height: 55,
  },
  ticketPerforation: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 14,
    marginHorizontal: -1,
  },
  ticketNotchLeft: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: gp.dark, marginLeft: -7,
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
    backgroundColor: gp.dark, marginRight: -7,
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
    borderTopWidth: 1, borderTopColor: gp.lightest + '15',
    gap: 8,
  },
  ctaBarThumbs: {flexDirection: 'row', marginRight: 4},
  ctaBarThumb: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: gp.dark, marginLeft: -8,
  },
  ctaBarText: {
    fontSize: 13, fontWeight: FONT_WEIGHTS.semiBold, fontFamily: FONTS.sans,
    color: gp.lightest,
  },

  // --- 2. FULL-WIDTH BANNER ---
  promoBannerWrap: {marginTop: 28, width: '100%', height: 200},
  promoBannerBg: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  promoBannerGradient: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', padding: 20},
  promoBannerTitle: {
    fontSize: 24, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: '#FFFFFF', lineHeight: 30,
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
    color: gp.lightest, marginBottom: 18, paddingHorizontal: SIZES.screenPadding,
  },
  brandsGridWrap: {
    position: 'relative',
  },
  brandsNavBtn: {
    position: 'absolute', top: '50%', marginTop: -16,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: gp.dark === '#000000' ? '#CDF564' : gp.mid,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 5,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  brandsNavBtnLeft: {left: 2},
  brandsNavBtnRight: {right: 2},
  brandsScrollContent: {
    paddingHorizontal: SIZES.screenPadding, gap: 12,
  },
  brandsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SIZES.screenPadding,
    gap: 10,
  },
  brandsDots: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 14, gap: 6,
  },
  brandsDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: gp.light + '30',
  },
  brandsDotActive: {width: 20, backgroundColor: gp.dark === '#000000' ? '#CDF564' : gp.mid},
  brandGridCard: {
    width: (width - SIZES.screenPadding * 2 - 30) / 4,
    height: (width - SIZES.screenPadding * 2 - 30) / 4,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  brandGridLogo: {width: '70%', height: '70%'},

  // --- 3.5 SHOE BANNER ---
  shoeBannerWrap: {marginTop: 28, width: '100%', height: 200, overflow: 'hidden'},
  shoeBannerTopFade: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 60, zIndex: 2,
  },

  // --- 3.6 SHOE CARDS ---
  shoeCardsSection: {marginTop: 18},
  shoeCardsList: {paddingHorizontal: SIZES.screenPadding, gap: 12},
  shoeCard: {
    width: 148, borderRadius: 14, backgroundColor: gp.dark === '#000000' ? '#0A0A14' : gp.dark,
    overflow: 'hidden', borderWidth: gp.dark === '#000000' ? 1 : 0, borderColor: gp.mid + '15',
  },
  shoeCardImgWrap: {width: 148, height: 170, borderRadius: 14, overflow: 'hidden'},
  shoeCardImg: {width: '100%', height: '100%'},
  shoeCardBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  shoeCardBadgeText: {
    fontSize: 9, fontWeight: '700' as any, fontFamily: FONTS.sans, color: '#fff', letterSpacing: 0.3,
  },
  shoeCardHeart: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  shoeCardInfo: {padding: 10},
  shoeCardBrand: {
    fontSize: 10, fontWeight: '600' as any, fontFamily: FONTS.sans,
    color: gp.light, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  shoeCardName: {
    fontSize: 13, fontWeight: '500' as any, fontFamily: FONTS.sans,
    color: gp.lightest, marginTop: 2,
  },
  shoeCardPriceRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4},
  shoeCardPrice: {
    fontSize: 14, fontWeight: '700' as any, fontFamily: FONTS.sans, color: gp.lightest,
  },
  shoeCardOldPrice: {
    fontSize: 11, fontFamily: FONTS.sans, color: gp.light,
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
    color: gp.lightest, marginBottom: 18, textAlign: 'center',
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
    backgroundColor: gp.dark === '#000000' ? '#0A0A14' : gp.mid + '30',
    borderWidth: gp.dark === '#000000' ? 1 : 0,
    borderColor: gp.mid + '20',
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
    color: gp.lightest, marginBottom: 16, paddingHorizontal: SIZES.screenPadding,
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
  classicBg: {width: '100%', height: 200, overflow: 'hidden'},
  classicGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  classicTextWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: 2,
  },
  classicTitle: {
    fontSize: 42, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: '#FFFFFF', textAlign: 'center', letterSpacing: 6, lineHeight: 48,
  },
  classicSubtitle: {
    fontSize: 16, color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.sans,
    marginTop: 8, fontStyle: 'italic',
  },
  classicBtn: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 12, paddingHorizontal: 32, marginTop: 24,
  },
  classicBtnText: {
    fontSize: 12, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.sans,
    color: '#FFFFFF', letterSpacing: 3,
  },

  // Search Results
  searchResults: {paddingTop: 20},
  searchResultsTitle: {
    paddingHorizontal: SIZES.screenPadding, fontSize: SIZES.bodySmall,
    color: gp.light, marginBottom: 16, fontWeight: FONT_WEIGHTS.medium, fontFamily: FONTS.sans,
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

  // --- TOPS SECTION ---
  topsSectionWrap: {marginTop: 32},
  topsBanner: {
    flexDirection: 'row', borderRadius: 0,
    overflow: 'hidden', backgroundColor: gp.dark === '#000000' ? '#0A0A14' : gp.lightest + '10', height: 180,
    borderTopWidth: gp.dark === '#000000' ? 1 : 0,
    borderBottomWidth: gp.dark === '#000000' ? 1 : 0,
    borderColor: gp.mid + '15',
  },
  topsBannerLeft: {flex: 1, padding: 20, justifyContent: 'center'},
  topsBannerLabel: {
    fontSize: 10, fontWeight: '700' as any, color: gp.light, letterSpacing: 2,
    fontFamily: FONTS.sans, marginBottom: 6,
  },
  topsBannerTitle: {
    fontSize: 22, fontWeight: '800' as any, color: gp.lightest, fontFamily: FONTS.serif, lineHeight: 26,
  },
  topsBannerSub: {
    fontSize: 11, color: gp.light, fontFamily: FONTS.sans, marginTop: 4, fontStyle: 'italic',
  },
  topsBannerBtn: {
    borderWidth: 1.5, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16,
    alignSelf: 'flex-start', marginTop: 12,
  },
  topsBannerBtnText: {fontSize: 10, fontWeight: '700' as any, letterSpacing: 2, fontFamily: FONTS.sans},
  topsBannerRight: {width: '42%', overflow: 'hidden'},
  topsBannerImg: {width: '100%', height: '100%'},

  // --- BOTTOMS SECTION ---
  bottomsSectionWrap: {marginTop: 32},
  bottomsBanner: {
    height: 200, overflow: 'hidden',
  },
  bottomsBannerTag: {
    fontSize: 10, fontWeight: '700' as any, color: gp.light, letterSpacing: 3,
    fontFamily: FONTS.sans, marginBottom: 6,
  },
  bottomsBannerTitle: {
    fontSize: 26, fontWeight: '800' as any, color: '#fff', fontFamily: FONTS.serif, lineHeight: 30,
  },
  bottomsBannerBtn: {
    position: 'absolute', bottom: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8,
  },

  // --- OUTERWEAR SECTION ---
  outerSectionWrap: {marginTop: 32},
  outerBanner: {
    height: 260, overflow: 'hidden',
  },
  outerBannerTitle: {
    fontSize: 30, fontWeight: '800' as any, color: '#fff', fontFamily: FONTS.serif, lineHeight: 34,
  },
  outerBannerSub: {
    fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.sans, marginTop: 4, fontStyle: 'italic',
  },

  // --- DRESSES SECTION ---
  dressSectionWrap: {marginTop: 32},
  dressBanner: {
    height: 320, overflow: 'hidden',
  },
  dressBannerTag: {
    fontSize: 10, fontWeight: '700' as any, color: 'rgba(255,255,255,0.6)', letterSpacing: 3,
    fontFamily: FONTS.sans, marginBottom: 4,
  },
  dressBannerTitle: {
    fontSize: 28, fontWeight: '800' as any, color: '#fff', fontFamily: FONTS.serif,
    textAlign: 'center', letterSpacing: 1,
  },
  dressBannerBtn: {
    borderWidth: 1.5, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, marginTop: 12,
  },
  dressBannerBtnText: {
    fontSize: 11, fontWeight: '700' as any, color: '#fff', letterSpacing: 2, fontFamily: FONTS.sans,
  },

  // --- ACTIVEWEAR SECTION ---
  activeSectionWrap: {marginTop: 32},
  activeBanner: {
    overflow: 'hidden',
    flexDirection: 'row', height: 180,
  },
  activeBannerContent: {flex: 1, padding: 20, justifyContent: 'center'},
  activeBannerTag: {
    fontSize: 10, fontWeight: '700' as any, color: 'rgba(255,255,255,0.6)', letterSpacing: 2,
    fontFamily: FONTS.sans, marginBottom: 4,
  },
  activeBannerTitle: {
    fontSize: 24, fontWeight: '800' as any, color: '#fff', fontFamily: FONTS.serif, lineHeight: 28,
  },
  activeBannerSub: {
    fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.sans, marginTop: 4,
  },
  activeBannerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16,
    alignSelf: 'flex-start', marginTop: 12,
  },
  activeBannerBtnText: {
    fontSize: 10, fontWeight: '700' as any, letterSpacing: 1.5, fontFamily: FONTS.sans,
  },
  activeBannerImgWrap: {width: '40%', overflow: 'hidden'},
  activeBannerImg: {width: '100%', height: '100%'},

  // --- EXPLORE MORE SECTION ---
  exploreHeader: {
    paddingBottom: 4, backgroundColor: gp.dark,
  },
  exploreTitle: {
    fontSize: 22, fontWeight: '700' as any, color: gp.lightest, fontFamily: FONTS.serif,
    marginBottom: 14,
  },
  exploreSearchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: gp.dark === '#000000' ? '#0A0A14' : '#fff',
    marginHorizontal: SIZES.screenPadding, borderRadius: 12, paddingHorizontal: 14,
    height: 44, gap: 10,
    borderWidth: gp.dark === '#000000' ? 1 : 0,
    borderColor: gp.mid + '25',
  },
  exploreSearchInput: {
    flex: 1, fontSize: 14, fontFamily: FONTS.sans,
    color: gp.dark === '#000000' ? gp.lightest : '#1a1a1a', paddingVertical: 0,
  },
  exploreFilterRow: {
    paddingHorizontal: SIZES.screenPadding, gap: 8, paddingVertical: 14,
  },
  exploreFilterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: gp.mid + '18',
  },
  exploreFilterChipText: {
    fontSize: 12, fontWeight: '600' as any, color: gp.light, fontFamily: FONTS.sans,
  },
  exploreMasonry: {
    flexDirection: 'row', paddingHorizontal: SIZES.screenPadding, gap: 12,
  },
  exploreColumn: {flex: 1, gap: 12},
  exploreCard: {
    backgroundColor: gp.dark === '#000000' ? '#0A0A14' : gp.dark, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: gp.mid + '15',
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
    fontSize: 10, fontWeight: '600' as any, color: gp.light, fontFamily: FONTS.sans,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  exploreCardName: {
    fontSize: 13, fontWeight: '500' as any, color: gp.lightest, fontFamily: FONTS.sans, marginTop: 2,
  },
  exploreCardPrice: {
    fontSize: 14, fontWeight: '700' as any, color: gp.lightest, fontFamily: FONTS.sans,
  },
  exploreCardOldPrice: {
    fontSize: 11, fontFamily: FONTS.sans, color: gp.light, textDecorationLine: 'line-through' as const,
  },

  bottomSpacer: {height: 100},
});
