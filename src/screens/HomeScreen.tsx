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
} from 'react-native';
import ReAnimated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
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
import CurtainRefresh from '../components/CurtainRefresh';
import LinearGradient from 'react-native-linear-gradient';
import {BlurView} from '@react-native-community/blur';

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
const BANNER_CARD_WIDTH = width - 64;
const BANNER_SPACING = 12;
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

// Layout constants for new sections
const BRAND_CARD_W = (width - 40 - 36) / 4;


// Static data for Style Occasions
const OCCASIONS = [
  {id: 'oc1', label: 'STREET WEAR', image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400'},
  {id: 'oc2', label: 'NIGHT OUT', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'},
  {id: 'oc3', label: 'WEDDING', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'},
  {id: 'oc4', label: 'OFFICE', image: 'https://images.unsplash.com/photo-1507679799987-c73b1d15d073?w=400'},
  {id: 'oc5', label: 'BRUNCH', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400'},
  {id: 'oc6', label: 'VACATION', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400'},
  {id: 'oc7', label: 'GYM', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'},
  {id: 'oc8', label: 'DATE NIGHT', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400'},
  {id: 'oc9', label: 'FESTIVAL', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400'},
  {id: 'oc10', label: 'CASUAL', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400'},
  {id: 'oc11', label: 'FORMAL', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'},
  {id: 'oc12', label: 'COCKTAIL', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400'},
];

// Static data for Offers
const OFFERS_DATA = [
  {id: 'of1', title: 'FLAT 50%\nOFF', subtitle: 'On ethnic wear', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600'},
  {id: 'of2', title: 'BUY 2\nGET 1', subtitle: 'Selected brands', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600'},
  {id: 'of3', title: 'UPTO 70%\nOFF', subtitle: 'End of season', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600'},
  {id: 'of4', title: 'EXTRA 20%\nOFF', subtitle: 'Using Trenzo Pay', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600'},
];

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
  const [activeBanner, setActiveBanner] = useState(0);
  const [brandsPage, setBrandsPage] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerScrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const floatingCartAnim = useRef(new Animated.Value(0)).current;
  const lastScrollYRef = useRef(0);
  const isTabBarHidden = useRef(false);
  const scrollY = useSharedValue(0);

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
    const scale = bannerScrollX.interpolate({inputRange, outputRange: [0.92, 1, 0.92], extrapolate: 'clamp'});
    const cardOpacity = bannerScrollX.interpolate({inputRange, outputRange: [0.7, 1, 0.7], extrapolate: 'clamp'});
    const rotate = bannerScrollX.interpolate({inputRange, outputRange: ['3deg', '0deg', '-3deg'], extrapolate: 'clamp'});
    const translateY = bannerScrollX.interpolate({inputRange, outputRange: [10, 0, 10], extrapolate: 'clamp'});

    return (
      <Animated.View key={`${banner.id}-${loopIndex}`} style={{width: BANNER_CARD_WIDTH, marginRight: BANNER_SPACING, transform: [{scale}, {rotateZ: rotate}, {translateY}], opacity: cardOpacity}}>
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
                <Icon name="arrow-right" size={12} color={COLORS.white} />
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
            activeGender === 'Men' && {borderColor: GENDER_PALETTES.Men.mid, borderWidth: 2.5},
          ]}
          activeOpacity={0.85}
          onPress={() => handleGenderCard('Men')}>
          <View style={[
            styles.genderCardInner,
            activeGender === 'Men' && {borderWidth: 0},
          ]}>
            <Image source={GENDER_WOMEN_IMG} style={styles.genderCardImg} resizeMode="cover" />
            <LinearGradient
              colors={activeGender === 'Men'
                ? ['transparent', GENDER_PALETTES.Men.dark + 'E6']
                : ['transparent', 'rgba(0,0,0,0.55)']}
              style={styles.genderCardGradient}
            />
            <View style={styles.genderCardContent}>
              <Text style={styles.genderCardLabel}>MEN</Text>
              <View style={[
                styles.genderCardArrow,
                activeGender === 'Men' && {backgroundColor: GENDER_PALETTES.Men.mid},
              ]}>
                <Icon name="arrow-right" size={14} color="#fff" />
              </View>
            </View>
          </View>
          {activeGender === 'Men' && (
            <View style={[styles.genderCardAccent, {backgroundColor: GENDER_PALETTES.Men.mid}]} />
          )}
          {activeGender !== 'Men' && (
            <View style={styles.genderCardInactiveOverlay} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderCard,
            activeGender === 'Women' && {borderColor: GENDER_PALETTES.Women.mid, borderWidth: 2.5},
          ]}
          activeOpacity={0.85}
          onPress={() => handleGenderCard('Women')}>
          <View style={[
            styles.genderCardInner,
            activeGender === 'Women' && {borderWidth: 0},
          ]}>
            <Image source={GENDER_MEN_IMG} style={styles.genderCardImg} resizeMode="cover" />
            <LinearGradient
              colors={activeGender === 'Women'
                ? ['transparent', GENDER_PALETTES.Women.dark + 'E6']
                : ['transparent', 'rgba(0,0,0,0.55)']}
              style={styles.genderCardGradient}
            />
            <View style={styles.genderCardContent}>
              <Text style={styles.genderCardLabel}>WOMEN</Text>
              <View style={[
                styles.genderCardArrow,
                activeGender === 'Women' && {backgroundColor: GENDER_PALETTES.Women.mid},
              ]}>
                <Icon name="arrow-right" size={14} color="#fff" />
              </View>
            </View>
          </View>
          {activeGender === 'Women' && (
            <View style={[styles.genderCardAccent, styles.genderCardAccentRight, {backgroundColor: GENDER_PALETTES.Women.mid}]} />
          )}
          {activeGender !== 'Women' && (
            <View style={styles.genderCardInactiveOverlay} />
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
                    <Image source={cat.image} style={[styles.ticketImage, (cat as any).rotate && {transform: [{rotate: (cat as any).rotate}]}, (cat as any).size && {width: (cat as any).size, height: (cat as any).size}]} resizeMode="contain" />
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
            style={[styles.promoBannerBtn, {backgroundColor: genderPalette.mid}]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryProducts', {
              categoryName: isWomen ? 'New Arrivals' : 'Street Style',
              products: PRODUCTS.filter(p => p.isNew || p.discount),
            })}>
            <Text style={styles.promoBannerBtnText}>SHOP NOW</Text>
            <Icon name="arrow-right" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 3. Discover Brands Grid
  const BRANDS_PER_PAGE = 12;
  const totalBrandPages = Math.ceil(BRANDS.length / BRANDS_PER_PAGE);
  const pageBrands = BRANDS.slice(brandsPage * BRANDS_PER_PAGE, (brandsPage + 1) * BRANDS_PER_PAGE);

  const renderDiscoverBrands = () => (
    <View style={styles.brandsSection}>
      <Text style={styles.brandsSectionTitle}>Discover Brands</Text>
      <View style={styles.brandsGridWrap}>
        <View style={styles.brandsGrid}>
          {pageBrands.map(brand => (
            <TouchableOpacity
              key={brand.id}
              style={styles.brandGridCard}
              activeOpacity={0.8}
              onPress={() => handleBrandPress(brand.name)}>
              <Image source={{uri: brand.logo}} style={styles.brandGridLogo} resizeMode="contain" />
            </TouchableOpacity>
          ))}
        </View>
        {/* Left shadow + arrow */}
        {/* Left shadow + arrow */}
        <LinearGradient
          colors={[genderPalette.dark, genderPalette.dark + 'CC', genderPalette.dark + '60', 'transparent']}
          locations={[0, 0.3, 0.65, 1]}
          start={{x: 0, y: 0}} end={{x: 1, y: 0}}
          style={styles.brandsShadowLeft}
          pointerEvents="none"
        />
        <TouchableOpacity
          style={[styles.brandsArrowLeft, brandsPage === 0 && {opacity: 0.3}]}
          disabled={brandsPage === 0}
          onPress={() => setBrandsPage(p => Math.max(0, p - 1))}>
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        {/* Right shadow + arrow */}
        <LinearGradient
          colors={['transparent', genderPalette.dark + '60', genderPalette.dark + 'CC', genderPalette.dark]}
          locations={[0, 0.35, 0.7, 1]}
          start={{x: 0, y: 0}} end={{x: 1, y: 0}}
          style={styles.brandsShadowRight}
          pointerEvents="none"
        />
        <TouchableOpacity
          style={[styles.brandsArrowRight, brandsPage === totalBrandPages - 1 && {opacity: 0.3}]}
          disabled={brandsPage === totalBrandPages - 1}
          onPress={() => setBrandsPage(p => Math.min(totalBrandPages - 1, p + 1))}>
          <Icon name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Pagination dots */}
      <View style={styles.brandsDots}>
        {Array.from({length: totalBrandPages}).map((_, i) => (
          <View key={i} style={[styles.brandsDot, brandsPage === i && styles.brandsDotActive]} />
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
            style={[styles.promoBannerBtn, {backgroundColor: genderPalette.mid}]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CategoryProducts', {
              categoryName: isWomen ? 'Heels' : 'Sneakers',
              products: PRODUCTS.filter(p => p.category === 'Footwear' || p.isNew),
            })}>
            <Text style={styles.promoBannerBtnText}>{bannerCta}</Text>
            <Icon name="arrow-right" size={12} color="#fff" />
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
        {OCCASIONS.map(occ => (
          <TouchableOpacity
            key={occ.id}
            style={styles.occasionCard}
            activeOpacity={0.85}
            onPress={() => handleSeeAll(occ.label, genderProducts.slice(0, 8))}>
            <Image source={{uri: occ.image}} style={styles.occasionImage} resizeMode="cover" />
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
        {OFFERS_DATA.map(offer => (
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
            <Icon name="arrow-right" size={16} color={genderPalette.lightest} />
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

      {/* Curtain Pull-to-Refresh */}
      {!searchOverlayVisible && (
        <CurtainRefresh
          scrollY={scrollY}
          palette={genderPalette}
          onRefresh={onRefresh}
          refreshing={refreshing}
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
        style={{flex: 1, backgroundColor: genderPalette.dark}}
        contentContainerStyle={cartItemCount > 0 ? {paddingBottom: 80} : undefined}>

        {/* Top gradient */}
        <LinearGradient
          colors={isDark ? ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0)'] : ['rgba(250,250,248,0.9)', 'transparent']}
          locations={isDark ? [0, 0.25, 0.5, 0.75, 1] : [0, 1]}
          style={styles.topGradient}
          pointerEvents="none"
        />

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

            {/* 9. Classic Black Banner */}
            <AnimatedSection scrollY={scrollY} slideDistance={20}>
              {renderClassicBlack()}
            </AnimatedSection>
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
  container: {flex: 1, backgroundColor: gp.dark},
  topGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 350, zIndex: 0,
  },
  // Header
  headerCurved: {
    backgroundColor: 'transparent', paddingTop: 63, paddingBottom: 12, zIndex: 2,
  },
  headerInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12,
  },
  headerLeft: {flex: 1},
  deliveryTitleRow: {flexDirection: 'row', alignItems: 'baseline'},
  deliveryLabel: {
    fontSize: 21, fontWeight: '600', fontFamily: 'Inter', color: gp.mid,
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
    fontSize: 45, fontWeight: '900', fontFamily: 'Jost', color: gp.mid,
    letterSpacing: -3.6, lineHeight: 45,
    textShadowColor: '#000', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 6,
  },
  heroBannerCard: {
    width: '100%', aspectRatio: 1059 / 330, borderRadius: 16, overflow: 'hidden',
    backgroundColor: 'transparent', zIndex: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  heroBannerShadow: {
    shadowColor: '#000', shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
  },
  heroBannerImg: {width: '100%', height: undefined, aspectRatio: 1059 / 330, borderRadius: 16},
  genderCardsRow: {flexDirection: 'row', gap: 14, marginTop: 80, overflow: 'visible'},
  genderCard: {
    flex: 1, overflow: 'visible', borderRadius: 20,
    borderWidth: 2.5, borderColor: 'transparent',
  },
  genderCardInner: {
    height: 70, borderRadius: 20, overflow: 'visible', backgroundColor: gp.lightest + '15',
  },
  genderCardImg: {width: '100%', height: 140, marginTop: -70, borderRadius: 20},
  genderCardGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  genderCardContent: {
    position: 'absolute', bottom: 14, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  genderCardLabel: {
    fontSize: 22, fontWeight: '800', fontFamily: 'Jost', color: '#FFFFFF',
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
  bannerSection: {marginTop: 10, overflow: 'visible', zIndex: 2},
  bannerList: {paddingHorizontal: 32, paddingVertical: 14},
  bannerCard: {width: '100%', height: 380, borderRadius: 20, overflow: 'hidden'},
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
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 6,
    paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: 4,
  },
  magShopBtnText: {
    fontSize: 10, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white,
    fontFamily: FONTS.sans, letterSpacing: 2,
  },
  bannerDots: {flexDirection: 'row', justifyContent: 'center', marginTop: 12},
  bannerDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: gp.light + '30', marginHorizontal: 3,
  },
  bannerDotActive: {width: 22, backgroundColor: '#FFFFFF'},

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
    marginTop: -28,
    backgroundColor: 'transparent',
    width: 62, height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
  },
  ticketImage: {
    width: 75, height: 75,
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
    color: '#FFFFFF', letterSpacing: 1,
  },

  // --- 3. DISCOVER BRANDS ---
  brandsSection: {marginTop: 32, paddingHorizontal: SIZES.screenPadding},
  brandsGridWrap: {
    overflow: 'visible',
  },
  brandsShadowLeft: {
    position: 'absolute', left: -SIZES.screenPadding, top: -10, bottom: -10, width: 60,
    zIndex: 5,
  },
  brandsShadowRight: {
    position: 'absolute', right: -SIZES.screenPadding, top: -10, bottom: -10, width: 60,
    zIndex: 5,
  },
  brandsArrowLeft: {
    position: 'absolute', left: -12, top: '45%',
    zIndex: 10, padding: 4,
  },
  brandsArrowRight: {
    position: 'absolute', right: -12, top: '45%',
    zIndex: 10, padding: 4,
  },
  brandsSectionTitle: {
    fontSize: 22, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: gp.lightest, marginBottom: 18,
  },
  brandsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
  },
  brandGridCard: {
    width: BRAND_CARD_W, height: BRAND_CARD_W,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, overflow: 'hidden',
  },
  brandGridLogo: {width: '75%', height: '75%'},
  brandNewBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: gp.mid, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  brandNewBadgeText: {
    fontSize: 8, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.sans,
    color: '#FFFFFF', letterSpacing: 0.5,
  },
  brandsDots: {flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12},
  brandsDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: gp.light + '30',
  },
  brandsDotActive: {width: 20, backgroundColor: gp.mid, borderRadius: 3},

  // --- 3.5 SHOE BANNER ---
  shoeBannerWrap: {marginTop: 28, width: '100%', height: 200, overflow: 'hidden'},
  shoeBannerTopFade: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 60, zIndex: 2,
  },

  // --- 3.6 SHOE CARDS ---
  shoeCardsSection: {marginTop: 18},
  shoeCardsList: {paddingHorizontal: SIZES.screenPadding, gap: 12},
  shoeCard: {width: 148, borderRadius: 14, backgroundColor: gp.dark, overflow: 'hidden'},
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
    height: ((width - SIZES.screenPadding * 2 - 18) / 4) * 1.3,
    borderRadius: 12, overflow: 'hidden', marginBottom: 6,
  },
  occasionImage: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%',
  },
  occasionGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  occasionTextWrap: {
    position: 'absolute', bottom: 8, left: 0, right: 0, zIndex: 2,
  },
  occasionLabel: {
    fontSize: 9, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.sans,
    color: '#FFFFFF', letterSpacing: 0.5, textAlign: 'center',
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
  classicBg: {width: '100%', height: 360, overflow: 'hidden'},
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
    backgroundColor: gp.mid, borderRadius: SIZES.radiusMd,
    paddingVertical: 12, paddingHorizontal: 16, ...SHADOWS.large,
  },
  floatingCartLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  floatingCartBadge: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  floatingCartBadgeText: {
    fontSize: 13, fontWeight: FONT_WEIGHTS.bold, color: '#FFFFFF', fontFamily: FONTS.sans,
  },
  floatingCartItems: {fontSize: 11, color: 'rgba(0,0,0,0.55)', fontFamily: FONTS.sans},
  floatingCartTotal: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: '#FFFFFF', fontFamily: FONTS.sans,
  },
  floatingCartRight: {flexDirection: 'row', alignItems: 'center', gap: 6},
  floatingCartCta: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: '#FFFFFF', fontFamily: FONTS.sans,
  },

  bottomSpacer: {height: 100},
});
