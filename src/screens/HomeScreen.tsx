import React, {useRef, useState, useEffect, useCallback} from 'react';
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
  RefreshControl,
  FlatList,
  StatusBar,
  Alert,
  Share,
  ImageBackground,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {PRODUCTS, BANNERS, CATEGORIES, BRANDS, COLLECTIONS, getFlashDeals, Product, FlashDeal, formatPrice} from '../data/products';
import {useApp} from '../context/AppContext';
import {useHeroTransition} from '../context/HeroTransitionContext';
import {useTabBar} from '../context/TabBarContext';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';
import SearchOverlay from '../components/SearchOverlay';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';

const REEL_VIDEO = require('../../assets/video/v1.mp4');

const {width} = Dimensions.get('window');
const BANNER_CARD_WIDTH = width - 90;
const BANNER_SPACING = 10;
const BANNER_SNAP = BANNER_CARD_WIDTH + BANNER_SPACING;
const LOOP_BANNERS = [
  {...BANNERS[BANNERS.length - 1], id: 'clone-last'},
  ...BANNERS,
  {...BANNERS[0], id: 'clone-first'},
];
const CATEGORY_GRID_COLS = 4;
const CATEGORY_ITEM_WIDTH = (width - SIZES.screenPadding * 2 - 12 * 3) / CATEGORY_GRID_COLS;

interface Props {
  navigation: any;
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return timeLeft;
}

function getTimeLeft(target: Date) {
  const now = new Date().getTime();
  const diff = target.getTime() - now;
  if (diff <= 0) return {hours: 0, minutes: 0, seconds: 0};
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function CountdownTimer({endsAt}: {endsAt: Date}) {
  const {hours, minutes, seconds} = useCountdown(endsAt);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <View style={styles.countdownRow}>
      <View style={styles.countdownBlock}>
        <Text style={styles.countdownNum}>{pad(hours)}</Text>
      </View>
      <Text style={styles.countdownSep}>:</Text>
      <View style={styles.countdownBlock}>
        <Text style={styles.countdownNum}>{pad(minutes)}</Text>
      </View>
      <Text style={styles.countdownSep}>:</Text>
      <View style={styles.countdownBlock}>
        <Text style={styles.countdownNum}>{pad(seconds)}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen({navigation}: Props) {
  const {cartItemCount, cartTotal} = useApp();
  const {openProduct} = useHeroTransition();
  const {tabBarTranslateY} = useTabBar();
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
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerScrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const floatingCartAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isTabBarHidden = useRef(false);
  const marqueeAnim = useRef(new Animated.Value(0)).current;

  const handleMainScroll = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const isDown = y > lastScrollY.current;
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
    lastScrollY.current = y;
  }, [tabBarTranslateY]);

  const [flashDeals] = useState<FlashDeal[]>(getFlashDeals());

  const featuredProducts = PRODUCTS.filter(p => p.isFeatured);
  const newProducts = PRODUCTS.filter(p => p.isNew);
  const bestSellers = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 6);
  const trendingProducts = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const dealOfDay = PRODUCTS.filter(p => p.discount).sort((a, b) => (b.discount || 0) - (a.discount || 0))[0];

  const forHerProducts = PRODUCTS.filter(p => p.gender === 'women' || p.gender === 'unisex');
  const forHimProducts = PRODUCTS.filter(p => p.gender === 'men' || p.gender === 'unisex');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 500, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 500, useNativeDriver: true}),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    // Set initial scroll to first real banner (skip clone-last)
    setTimeout(() => {
      bannerScrollRef.current?.scrollTo({x: BANNER_SNAP, animated: false});
    }, 100);
  }, []);

  // Brand marquee auto-scroll
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(marqueeAnim, {
        toValue: -1,
        duration: 12000,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [marqueeAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner(prev => {
        const next = (prev + 1) % BANNERS.length;
        if (next === 0) {
          // Scroll to clone-first (smooth), then jump to real-first
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
      // Fade out + slide up
      Animated.parallel([
        Animated.timing(placeholderFade, {toValue: 0, duration: 300, useNativeDriver: true}),
        Animated.timing(placeholderSlide, {toValue: -10, duration: 300, useNativeDriver: true}),
      ]).start(() => {
        setPlaceholderIndex(prev => (prev + 1) % searchPlaceholders.length);
        // Reset position below and fade in
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
      toValue: 1,
      duration: 350,
      useNativeDriver: false,
    }).start();
    Animated.timing(tabBarTranslateY, {
      toValue: 160,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [searchOverlayProgress, tabBarTranslateY]);

  const closeSearchOverlay = useCallback(() => {
    setSearchQuery('');
    Animated.timing(searchOverlayProgress, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setSearchOverlayVisible(false);
    });
    Animated.timing(tabBarTranslateY, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
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


  const filteredProducts = searchQuery
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : PRODUCTS;

  const handleBannerScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const idx = Math.round(x / BANNER_SNAP);
    if (idx <= 0) {
      // At clone-last, jump to real last
      bannerScrollRef.current?.scrollTo({x: BANNERS.length * BANNER_SNAP, animated: false});
      setActiveBanner(BANNERS.length - 1);
    } else if (idx >= LOOP_BANNERS.length - 1) {
      // At clone-first, jump to real first
      bannerScrollRef.current?.scrollTo({x: BANNER_SNAP, animated: false});
      setActiveBanner(0);
    } else {
      setActiveBanner(idx - 1);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    navigation.navigate('CategoryProducts', {
      categoryName,
      products: PRODUCTS.filter(p => p.category === categoryName),
    });
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'You have no new notifications right now.', [{text: 'OK'}]);
  };

  const handleFilter = () => {
    Alert.alert('Filter & Sort', 'Choose a filter option:', [
      {text: 'Price: Low to High'}, {text: 'Price: High to Low'},
      {text: 'Top Rated'}, {text: 'Cancel', style: 'cancel'},
    ]);
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

  const handlePromoPress = async () => {
    try {
      await Share.share({
        message: 'Join Trenzo and get \u20B9500 off your first order! Download now: https://trenzo.app/invite',
      });
    } catch {
      Alert.alert('Refer & Earn', 'Share Trenzo with friends and get \u20B9500 off for every friend who joins!');
    }
  };

  // --- RENDER HELPERS ---

  const MODEL_REELS = [
    {
      id: 'v1',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600',
      headline: 'RISE ABOVE\nWITH FASHION',
      subtext: 'Redefine your presence',
      label: 'EDITORIAL',
    },
    {
      id: 'v2',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
      headline: 'OWN THE\nSIDEWALK',
      subtext: 'Street style redefined',
      label: 'RUNWAY',
    },
    {
      id: 'v3',
      image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600',
      headline: 'BOLD IS\nBEAUTIFUL',
      subtext: 'Make a statement',
      label: 'LOOKBOOK',
    },
    {
      id: 'v4',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600',
      headline: 'ELEGANCE\nIN MOTION',
      subtext: 'Grace meets style',
      label: 'CAMPAIGN',
    },
    {
      id: 'v5',
      image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=600',
      headline: 'SET THE\nTREND',
      subtext: 'Don\'t follow, lead',
      label: 'EXCLUSIVE',
    },
  ];

  const REEL_CARD_W = width * 0.42;
  const REEL_CARD_H = REEL_CARD_W * 1.55;

  const renderModelReels = () => (
    <View style={styles.reelSection}>
      <View style={styles.reelHeader}>
        <View style={styles.reelHeaderLeft}>
          <Icon name="play-circle" size={20} color={COLORS.primary} />
          <View>
            <Text style={styles.reelHeaderTitle}>Trenzo in Action</Text>
            <Text style={styles.reelHeaderSub}>Style that moves</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAll('Trenzo in Action', featuredProducts)}>
          <Text style={styles.seeAllText}>See All</Text>
          <Icon name="chevron-right" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={MODEL_REELS}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.reelList}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[styles.reelCard, {width: REEL_CARD_W, height: REEL_CARD_H}]}
            activeOpacity={0.9}
            onPress={() => handleSeeAll(item.headline.replace('\n', ' '), featuredProducts.slice(0, 6))}>
            <Video
              source={REEL_VIDEO}
              style={styles.reelImage}
              resizeMode="cover"
              repeat
              muted
              paused={false}
            />
            {/* B&W desaturation overlay */}
            <View style={styles.reelBwOverlay} />
            {/* Gradient for text readability */}
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.75)']}
              locations={[0, 0.35, 1]}
              style={styles.reelGradient}>
              {/* Top: label + play */}
              <View style={styles.reelTopRow}>
                <View style={styles.reelLabelBadge}>
                  <Text style={styles.reelLabelText}>{item.label}</Text>
                </View>
                <View style={styles.reelPlayBtn}>
                  <Icon name="play" size={12} color="#FFF" />
                </View>
              </View>
              {/* Film grain lines */}
              <View style={styles.reelGrainLines}>
                {[0, 1, 2].map(i => (
                  <View key={i} style={styles.reelGrainLine} />
                ))}
              </View>
              {/* Bottom: headline */}
              <View style={styles.reelBottom}>
                <Text style={styles.reelHeadline}>{item.headline}</Text>
                <Text style={styles.reelSubtext}>{item.subtext}</Text>
                {/* Barcode decoration */}
                <View style={styles.reelBarcode}>
                  {[8, 3, 6, 2, 7, 3, 5, 2, 8, 4, 6, 3, 7, 2, 5].map((h, i) => (
                    <View key={i} style={[styles.reelBarcodeBar, {height: h}]} />
                  ))}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const COUPONS = [
    {id: 'c1', code: 'FLAT20', label: 'Flat 20% Off', desc: 'On orders above ₹1,999', color: '#111111', icon: 'percent'},
    {id: 'c2', code: 'FIRST50', label: '₹500 Off', desc: 'First order special', color: '#333333', icon: 'gift'},
    {id: 'c3', code: 'FREESHIP', label: 'Free Shipping', desc: 'No minimum order', color: '#111111', icon: 'truck'},
    {id: 'c4', code: 'EXTRA10', label: 'Extra 10% Off', desc: 'On top brands', color: '#333333', icon: 'tag'},
  ];

  const COUPON_GAP = 10;
  const COUPON_CARD_W = (width - SIZES.screenPadding - COUPON_GAP * 2) / 2.5;

  const renderCoupons = () => (
    <View style={styles.couponSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.couponScroll}>
        {COUPONS.map(coupon => (
          <TouchableOpacity
            key={coupon.id}
            style={[styles.couponCard, {backgroundColor: coupon.color, width: COUPON_CARD_W}]}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Coupon Copied!', `${coupon.code} has been copied. Apply at checkout.`)}>
            <View style={styles.couponTopRow}>
              <View style={styles.couponIconWrap}>
                <Icon name={coupon.icon} size={14} color={coupon.color} />
              </View>
              <View style={styles.couponCodeBadge}>
                <Text style={styles.couponCode}>{coupon.code}</Text>
              </View>
            </View>
            <Text style={styles.couponLabel}>{coupon.label}</Text>
            <Text style={styles.couponDesc}>{coupon.desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBanner = (banner: typeof BANNERS[0], loopIndex: number) => {
    const inputRange = [
      (loopIndex - 1) * BANNER_SNAP,
      loopIndex * BANNER_SNAP,
      (loopIndex + 1) * BANNER_SNAP,
    ];
    const scale = bannerScrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: 'clamp',
    });
    const cardOpacity = bannerScrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });
    const rotate = bannerScrollX.interpolate({
      inputRange,
      outputRange: ['3deg', '0deg', '-3deg'],
      extrapolate: 'clamp',
    });
    const translateY = bannerScrollX.interpolate({
      inputRange,
      outputRange: [10, 0, 10],
      extrapolate: 'clamp',
    });

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
          {/* Image layer */}
          <Image source={{uri: banner.image}} style={styles.bannerBgImage} resizeMode="cover" />
          {/* Gradient overlay — same size as card */}
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.65)']}
            locations={[0, 0.4, 1]}
            style={styles.bannerGradientOverlay}>
            {/* Magazine header */}
            <View style={styles.magHeader}>
              <Text style={styles.magTitle}>{banner.magazineTitle || 'TRENZO'}</Text>
              {banner.season && (
                <View style={styles.magSeasonBadge}>
                  <Text style={styles.magSeasonText}>{banner.season}</Text>
                </View>
              )}
            </View>

            {/* Issue tag */}
            {banner.issueTag && (
              <Text style={styles.magIssueTag}>{banner.issueTag}</Text>
            )}

            {/* Bottom content */}
            <View style={styles.magBottom}>
              {banner.quote && (
                <Text style={styles.magQuote} numberOfLines={2}>{banner.quote}</Text>
              )}
              <Text style={styles.magSubtitle}>{banner.subtitle}</Text>
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

  const CATEGORY_ICONS: Record<string, {name: string; family: 'materialCommunity' | 'ionicons' | 'material'}> = {
    Dresses: {name: 'tshirt-crew', family: 'materialCommunity'},
    Tops: {name: 'hanger', family: 'materialCommunity'},
    Bottoms: {name: 'roller-skate-off', family: 'materialCommunity'},
    Outerwear: {name: 'jacket-outline', family: 'materialCommunity'},
    Accessories: {name: 'watch', family: 'materialCommunity'},
    Shoes: {name: 'shoe-heel', family: 'materialCommunity'},
    Bags: {name: 'bag-personal', family: 'materialCommunity'},
    Activewear: {name: 'run-fast', family: 'materialCommunity'},
  };

  const renderCategoryGrid = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => navigation.navigate('CategoriesTab')}>
          <Text style={styles.seeAllText}>See All</Text>
          <Icon name="chevron-right" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map(category => {
          const iconData = CATEGORY_ICONS[category.name] || {name: 'tag-outline', family: 'materialCommunity' as const};
          return (
            <TouchableOpacity
              key={category.id} style={styles.categoryGridItem}
              activeOpacity={0.7} onPress={() => handleCategoryPress(category.name)}>
              <View style={styles.categoryGridImageWrap}>
                <Icon name={iconData.name} size={34} color={COLORS.black} family={iconData.family} />
              </View>
              <Text style={styles.categoryGridName} numberOfLines={1}>{category.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderDealOfDay = () => {
    if (!dealOfDay) return null;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionTitleIcon, {backgroundColor: 'rgba(0,0,0,0.06)'}]}>
              <Icon name="percent" size={14} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Deal of the Day</Text>
              <Text style={styles.sectionSubtitle}>Limited time offer</Text>
            </View>
          </View>
        </View>
        <View style={styles.dealOfDayOuter}>
          {/* Image overflows top */}
          <Image source={require('../../assets/images /deal.png')} style={styles.dealOfDayImage} resizeMode="contain" />
          <TouchableOpacity
            style={styles.dealOfDayCard} activeOpacity={0.9}
            onPress={() => openProduct(dealOfDay, {x: 0, y: 200, width: 200, height: 200}, PRODUCTS)}>
            {/* 1. Giant text BEHIND */}
            <View style={styles.dealBigTextWrap}>
              <Text style={styles.dealBigText}>DEAL</Text>
            </View>
            {/* 2. Discount badge */}
            <View style={styles.dealOfDayBadge}>
              <Text style={styles.dealOfDayBadgeText}>{dealOfDay.discount}% OFF</Text>
            </View>
            {/* 3. Bottom content */}
            <View style={styles.dealOfDayInfo}>
              <Text style={styles.dealOfDayBrand}>{dealOfDay.brand}</Text>
              <Text style={styles.dealOfDayName} numberOfLines={2}>{dealOfDay.name}</Text>
              <View style={styles.dealOfDayPriceRow}>
                <Text style={styles.dealOfDayPrice}>{formatPrice(dealOfDay.price)}</Text>
                {dealOfDay.originalPrice && (
                  <Text style={styles.dealOfDayOrigPrice}>{formatPrice(dealOfDay.originalPrice)}</Text>
                )}
              </View>
              <View style={styles.dealOfDayBtn}>
                <Text style={styles.dealOfDayBtnText}>Shop Now</Text>
                <Icon name="arrow-right" size={14} color={COLORS.white} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFlashDeals = () => (
    <View style={styles.flashDealsSection}>
      <View style={styles.flashDealsHeader}>
        <View style={styles.flashDealsHeaderLeft}>
          <View style={styles.flashBoltIcon}>
            <Icon name="zap" size={14} color={COLORS.white} family="feather" />
          </View>
          <View>
            <Text style={styles.flashDealsTitle}>Flash Deals</Text>
            <Text style={styles.flashDealsSubtitle}>Ends in</Text>
          </View>
          {flashDeals.length > 0 && <CountdownTimer endsAt={flashDeals[0].endsAt} />}
        </View>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAll('Flash Deals', flashDeals.map(d => d.product))}>
          <Text style={styles.seeAllText}>All</Text>
          <Icon name="chevron-right" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={flashDeals}
        keyExtractor={(item) => `flash-${item.product.id}`}
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flashDealsList}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.flashDealCard} activeOpacity={0.85}
            onPress={() => openProduct(item.product, {x: 40, y: 300, width: 140, height: 140}, flashDeals.map(d => d.product))}>
            <View style={styles.flashDealImageWrap}>
              <Image source={{uri: item.product.images[0]}} style={styles.flashDealImage} resizeMode="cover" />
              <View style={styles.flashDealBadge}>
                <Text style={styles.flashDealBadgeText}>{item.product.discount}% OFF</Text>
              </View>
            </View>
            <View style={styles.flashDealInfo}>
              <Text style={styles.flashDealName} numberOfLines={1}>{item.product.name}</Text>
              <View style={styles.flashDealPriceRow}>
                <Text style={styles.flashDealPrice}>{formatPrice(item.dealPrice)}</Text>
                <Text style={styles.flashDealOrigPrice}>
                  {formatPrice(item.product.originalPrice || item.product.price)}
                </Text>
              </View>
              <View style={styles.claimedBarBg}>
                <View style={[styles.claimedBarFill, {width: `${item.claimed}%`}]} />
              </View>
              <Text style={styles.claimedText}>{item.claimed}% claimed</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderEditorialLookbook = () => (
    <View style={[styles.sectionContainer, {marginTop: 0}]}>
      <TouchableOpacity
        style={styles.editorialCard} activeOpacity={0.9}
        onPress={() => handleSeeAll('The Lookbook', featuredProducts)}>
        <Image
          source={{uri: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800'}}
          style={styles.editorialImage} resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.6)']}
          locations={[0, 0.45, 1]}
          style={styles.editorialOverlay}>
          <View style={styles.editorialTop}>
            <Text style={styles.editorialMagName}>TRENZO</Text>
            <View style={styles.editorialTagWrap}>
              <Text style={styles.editorialTag}>LOOKBOOK</Text>
            </View>
          </View>
          <View>
            <Text style={styles.editorialTitle}>The Art of{'\n'}Getting Dressed</Text>
            <Text style={styles.editorialSubtitle}>Curated styles for every occasion</Text>
            <View style={styles.editorialBtn}>
              <Text style={styles.editorialBtnText}>EXPLORE</Text>
              <Icon name="arrow-right" size={12} color={COLORS.white} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPinterestMiniEditorial = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.miniEditRow}>
        <TouchableOpacity
          style={styles.miniEditCard} activeOpacity={0.9}
          onPress={() => handleSeeAll('Spring Edit', forHerProducts.slice(0, 8))}>
          <Image
            source={require('../../assets/images /left.jpg')}
            style={styles.miniEditImage} resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.miniEditGradient}>
            <Text style={styles.miniEditLabel}>SPRING EDIT</Text>
            <Text style={styles.miniEditTitle}>Refresh{'\n'}Your Look</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.miniEditCard} activeOpacity={0.9}
          onPress={() => handleSeeAll('The Classics', bestSellers.slice(0, 6))}>
          <Image
            source={require('../../assets/images /rigth.jpg')}
            style={styles.miniEditImage} resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.miniEditGradient}>
            <Text style={styles.miniEditLabel}>THE CLASSICS</Text>
            <Text style={styles.miniEditTitle}>Timeless{'\n'}Pieces</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBrandSection = () => {
    // Brand cover images — editorial fashion shots per brand
    const brandCovers: Record<string, string> = {
      'H&M': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
      'Zara': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
      'Uniqlo': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
      'Nike': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'Adidas': 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=800',
      'Mango': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
      'Studio': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    };
    const b = BRANDS;
    return (
      <View style={styles.brandSectionWrap}>
        {/* Section header */}
        <View style={styles.brandSectionHead}>
          <View>
            <Text style={styles.brandSectionLabel}>BRANDS</Text>
            <Text style={styles.brandSectionTitle}>Shop by Brand</Text>
          </View>
          <TouchableOpacity style={styles.seeAllButton} onPress={() => navigation.navigate('CategoriesTab')}>
            <Text style={styles.seeAllText}>All Brands</Text>
            <Icon name="chevron-right" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Full-width hero brand banner */}
        <TouchableOpacity
          style={styles.brandHeroBanner} activeOpacity={0.9}
          onPress={() => handleBrandPress(b[0]?.name || 'H&M')}>
          <ImageBackground
            source={{uri: brandCovers[b[0]?.name] || brandCovers['H&M']}}
            style={styles.brandHeroBg}
            resizeMode="cover">
            <View style={styles.brandHeroOverlay}>
              <Text style={styles.brandHeroTag}>FEATURED BRAND</Text>
              <Text style={styles.brandHeroName}>{b[0]?.name || 'H&M'}</Text>
              <Text style={styles.brandHeroTagline}>{b[0]?.tagline || 'Fashion & Quality'}</Text>
              <View style={styles.brandHeroBtn}>
                <Text style={styles.brandHeroBtnText}>Explore Collection</Text>
                <Icon name="arrow-right" size={14} color="#FFF" />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Collage grid — Row 1: 2 cards (60/40 split) */}
        <View style={styles.brandCollageRow}>
          <TouchableOpacity
            style={[styles.brandCollageCard, {flex: 3}]} activeOpacity={0.9}
            onPress={() => handleBrandPress(b[1]?.name || 'Zara')}>
            <ImageBackground
              source={{uri: brandCovers[b[1]?.name] || brandCovers['Zara']}}
              style={styles.brandCollageBg} resizeMode="cover">
              <View style={styles.brandCollageOverlay}>
                <Text style={styles.brandCollageName}>{b[1]?.name || 'Zara'}</Text>
                <Text style={styles.brandCollageSub}>{b[1]?.tagline}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.brandCollageCard, {flex: 2}]} activeOpacity={0.9}
            onPress={() => handleBrandPress(b[2]?.name || 'Uniqlo')}>
            <ImageBackground
              source={{uri: brandCovers[b[2]?.name] || brandCovers['Uniqlo']}}
              style={styles.brandCollageBg} resizeMode="cover">
              <View style={styles.brandCollageOverlay}>
                <Text style={styles.brandCollageName}>{b[2]?.name || 'Uniqlo'}</Text>
                <Text style={styles.brandCollageSub}>{b[2]?.tagline}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Collage grid — Row 2: 3 equal cards */}
        <View style={styles.brandCollageRow}>
          {b.slice(3, 6).map(brand => (
            <TouchableOpacity
              key={brand.id} style={[styles.brandCollageCard, {flex: 1}]}
              activeOpacity={0.9} onPress={() => handleBrandPress(brand.name)}>
              <ImageBackground
                source={{uri: brandCovers[brand.name] || brand.logo}}
                style={styles.brandCollageSquareBg} resizeMode="cover">
                <View style={styles.brandCollageOverlay}>
                  <Text style={styles.brandCollageName}>{brand.name}</Text>
                  <Text style={styles.brandCollageSub}>{brand.tagline}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>

        {/* Collage grid — Row 3: 2 cards (40/60 split) reversed */}
        {b[6] && (
          <View style={styles.brandCollageRow}>
            <TouchableOpacity
              style={[styles.brandCollageCard, {flex: 2}]} activeOpacity={0.9}
              onPress={() => handleBrandPress(b[6].name)}>
              <ImageBackground
                source={{uri: brandCovers[b[6].name] || b[6].logo}}
                style={styles.brandCollageBg} resizeMode="cover">
                <View style={styles.brandCollageOverlay}>
                  <Text style={styles.brandCollageName}>{b[6].name}</Text>
                  <Text style={styles.brandCollageSub}>{b[6].tagline}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            {/* Promo tile */}
            <View style={[styles.brandCollageCard, styles.brandPromoTile, {flex: 3}]}>
              <Text style={styles.brandPromoTag}>SALE</Text>
              <Text style={styles.brandPromoTitle}>Up to 60% Off</Text>
              <Text style={styles.brandPromoSub}>On top brands this season</Text>
              <View style={styles.brandPromoBtn}>
                <Text style={styles.brandPromoBtnText}>Shop Sale</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderCollections = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionTitleIcon, {backgroundColor: 'rgba(0,0,0,0.06)'}]}>
            <Icon name="bookmark" size={14} color={COLORS.charcoal} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Collections</Text>
            <Text style={styles.sectionSubtitle}>Curated just for you</Text>
          </View>
        </View>
      </View>
      <FlatList
        data={COLLECTIONS} keyExtractor={item => item.id}
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.collectionsList}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.collectionCard} activeOpacity={0.9}
            onPress={() => {
              const prods = PRODUCTS.filter(p => item.productIds.includes(p.id));
              handleSeeAll(item.title, prods);
            }}>
            <Image source={{uri: item.image}} style={styles.collectionImage} resizeMode="cover" />
            <View style={styles.collectionOverlay}>
              <Text style={styles.collectionTitle}>{item.title}</Text>
              <Text style={styles.collectionSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderMosaicGrid = () => {
    const mosaicProducts = newProducts.slice(0, 3);
    if (mosaicProducts.length < 3) return null;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionTitleIcon, {backgroundColor: 'rgba(0,0,0,0.06)'}]}>
              <Icon name="package" size={14} color={COLORS.charcoal} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <Text style={styles.sectionSubtitle}>Fresh drops this week</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAll('New Arrivals', newProducts)}>
            <Text style={styles.seeAllText}>See All</Text>
            <Icon name="chevron-right" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.mosaicContainer}>
          {/* Large card on left */}
          <TouchableOpacity
            style={styles.mosaicLarge} activeOpacity={0.9}
            onPress={() => openProduct(mosaicProducts[0], {x: 0, y: 200, width: 200, height: 200}, newProducts)}>
            <Image source={{uri: mosaicProducts[0].images[0]}} style={styles.mosaicImage} resizeMode="cover" />
            <View style={styles.mosaicOverlay}>
              <Text style={styles.mosaicBrand}>{mosaicProducts[0].brand}</Text>
              <Text style={styles.mosaicName} numberOfLines={2}>{mosaicProducts[0].name}</Text>
              <Text style={styles.mosaicPrice}>{formatPrice(mosaicProducts[0].price)}</Text>
            </View>
            {mosaicProducts[0].isNew && (
              <View style={styles.mosaicBadge}><Text style={styles.mosaicBadgeText}>NEW</Text></View>
            )}
          </TouchableOpacity>
          {/* Two small cards stacked on right */}
          <View style={styles.mosaicSmallCol}>
            {mosaicProducts.slice(1, 3).map(p => (
              <TouchableOpacity
                key={p.id} style={styles.mosaicSmall} activeOpacity={0.9}
                onPress={() => openProduct(p, {x: 0, y: 200, width: 200, height: 200}, newProducts)}>
                <Image source={{uri: p.images[0]}} style={styles.mosaicImage} resizeMode="cover" />
                <View style={styles.mosaicOverlay}>
                  <Text style={styles.mosaicBrand}>{p.brand}</Text>
                  <Text style={styles.mosaicName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.mosaicPrice}>{formatPrice(p.price)}</Text>
                </View>
                {p.isNew && (
                  <View style={styles.mosaicBadge}><Text style={styles.mosaicBadgeText}>NEW</Text></View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderHorizontalProductList = (
    title: string, products: Product[], subtitle?: string, iconName?: string,
  ) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          {iconName && (
            <View style={styles.sectionTitleIcon}>
              <Icon name={iconName} size={14} color={COLORS.primary} />
            </View>
          )}
          <View>
            <Text style={styles.sectionTitle}>{title}</Text>
            {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAll(title, products)}>
          <Text style={styles.seeAllText}>See All</Text>
          <Icon name="chevron-right" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        renderItem={({item}) => (
          <ProductCard product={item} onPress={() => {}} style={styles.horizontalCard} />
        )}
        keyExtractor={item => `${title}-${item.id}`}
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  const renderBestSellersGrid = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionTitleIcon, {backgroundColor: 'rgba(0,0,0,0.06)'}]}>
            <Icon name="award" size={14} color={COLORS.charcoal} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <Text style={styles.sectionSubtitle}>Most loved by our customers</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAll('Best Sellers', bestSellers)}>
          <Text style={styles.seeAllText}>See All</Text>
          <Icon name="chevron-right" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.productGrid}>
        {bestSellers.map(product => (
          <ProductCard key={`best-${product.id}`} product={product} onPress={() => {}} style={styles.gridCard} />
        ))}
      </View>
    </View>
  );

  const renderPromoStrip = () => (
    <TouchableOpacity style={styles.promoStrip} activeOpacity={0.85} onPress={handlePromoPress}>
      <View style={styles.promoStripContent}>
        <View style={styles.promoIconWrap}>
          <Icon name="gift" size={18} color={COLORS.white} />
        </View>
        <View style={styles.promoTextBlock}>
          <Text style={styles.promoTitle}>Refer & Earn</Text>
          <Text style={styles.promoSubtitle}>Get {'\u20B9'}500 off for every friend who joins</Text>
        </View>
        <Icon name="chevron-right" size={20} color={COLORS.white} />
      </View>
    </TouchableOpacity>
  );

  const renderForHimHer = () => (
    <View style={styles.genderCardsRow}>
      <TouchableOpacity style={styles.genderCard} activeOpacity={0.85} onPress={() => navigation.navigate('ForHer')}>
        <View style={[styles.genderCardInner, {backgroundColor: 'transparent'}]}>
          <View style={styles.genderTextOverlay}>
            <Text style={[styles.genderBigText, {color: '#E91E63'}]}>HER</Text>
          </View>
          <Image
            source={require('../../assets/images /1.png')}
            style={styles.genderModelImg}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.genderCard} activeOpacity={0.85} onPress={() => navigation.navigate('ForHim')}>
        <View style={[styles.genderCardInner, {backgroundColor: 'transparent'}]}>
          <View style={styles.genderTextOverlay}>
            <Text style={[styles.genderBigText, {color: '#1976D2'}]}>HIM</Text>
          </View>
          <Image
            source={require('../../assets/images /2.png')}
            style={styles.genderModelImg}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  const MARQUEE_BRANDS = [...BRANDS.map(b => b.name), ...BRANDS.map(b => b.name)];
  const MARQUEE_ITEM_W = 120;
  const MARQUEE_TOTAL_W = MARQUEE_BRANDS.length * MARQUEE_ITEM_W / 2;

  const renderBrandMarquee = () => {
    const translateX = marqueeAnim.interpolate({
      inputRange: [-1, 0],
      outputRange: [-MARQUEE_TOTAL_W, 0],
    });
    return (
      <View style={styles.marqueeWrap}>
        <Animated.View style={[styles.marqueeTrack, {transform: [{translateX}]}]}>
          {MARQUEE_BRANDS.map((name, i) => (
            <View key={`${name}-${i}`} style={styles.marqueeItem}>
              <Text style={styles.marqueeDot}>{'\u2022'}</Text>
              <Text style={styles.marqueeText}>{name.toUpperCase()}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  const renderStyleSpotlight = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionTitleIcon, {backgroundColor: 'rgba(0,0,0,0.06)'}]}>
            <Icon name="camera" size={14} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Style Spotlight</Text>
            <Text style={styles.sectionSubtitle}>Get inspired</Text>
          </View>
        </View>
      </View>
      <View style={styles.spotlightRow}>
        <TouchableOpacity
          style={styles.spotlightCard} activeOpacity={0.9}
          onPress={() => handleSeeAll('Casual Chic', forHerProducts.slice(0, 6))}>
          <Image
            source={{uri: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400'}}
            style={styles.spotlightImage} resizeMode="cover"
          />
          <View style={styles.spotlightOverlay}>
            <Text style={styles.spotlightLabel}>Casual Chic</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.spotlightCard} activeOpacity={0.9}
          onPress={() => handleSeeAll('Street Style', forHimProducts.slice(0, 6))}>
          <Image
            source={{uri: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400'}}
            style={styles.spotlightImage} resizeMode="cover"
          />
          <View style={styles.spotlightOverlay}>
            <Text style={styles.spotlightLabel}>Street Style</Text>
          </View>
        </TouchableOpacity>
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
            <Icon name="arrow-right" size={16} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.offWhite} />

      {/* Fixed Header — only when search is open */}
      {searchOverlayVisible && (
        <View style={[styles.headerCurved, {paddingTop: 54}]}>
          <View style={[styles.hSearchBarWrap, {paddingLeft: SIZES.screenPadding}]}>
            <TouchableOpacity style={styles.hSearchBackBtn} onPress={closeSearchOverlay}>
              <Icon name="arrow-left" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hSearchBar, {flex: 1}]}
              activeOpacity={0.8}>
              <Icon name="search" size={16} color="rgba(255,255,255,0.5)" />
              <TextInput
                ref={searchInputRef}
                style={styles.hSearchInput}
                placeholder="Search brands, products..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                selectionColor={COLORS.white}
                autoFocus
              />
              <TouchableOpacity onPress={() => Alert.alert('Photo Search', 'Coming soon! Search by taking a photo.')}>
                <Icon name="camera" size={16} color="rgba(255,255,255,0.5)" />
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
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleMainScroll}
        scrollEventThrottle={16}
        bounces
        alwaysBounceVertical
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        style={{flex: 1, opacity: fadeAnim, transform: [{translateY: slideAnim}]}}
        contentContainerStyle={cartItemCount > 0 ? {paddingBottom: 80} : undefined}>

        {/* Scrollable Header — minimal */}
        <View style={styles.headerCurved}>
          <View style={styles.headerInner}>
            <Text style={styles.headerBrandText}>TRENZO</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.hIconBtn} onPress={handleNotifications}>
                <Icon name="bell" size={18} color={COLORS.black} />
                <View style={styles.hNotifDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.hIconBtn} onPress={() => navigation.navigate('Cart')}>
                <Icon name="shopping-bag" size={18} color={COLORS.black} />
                {cartItemCount > 0 && (
                  <View style={styles.hCartBadge}><Text style={styles.hCartBadgeText}>{cartItemCount}</Text></View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.hSearchBarWrap}>
            <TouchableOpacity
              style={[styles.hSearchBar, {flex: 1}]}
              activeOpacity={0.8}
              onPress={openSearchOverlay}>
              <Icon name="search" size={16} color={COLORS.midGray} />
              <View style={{flex: 1, justifyContent: 'center'}}>
                <View style={styles.hSearchPlaceholderRow}>
                  <Text style={styles.hSearchPlaceholder}>Search </Text>
                  <Animated.Text
                    style={[styles.hSearchPlaceholderAnimated, {opacity: placeholderFade, transform: [{translateY: placeholderSlide}]}]}
                  >
                    "{searchPlaceholders[placeholderIndex]}"
                  </Animated.Text>
                </View>
              </View>
            </TouchableOpacity>
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
            {/* For Him / For Her */}
            {renderForHimHer()}

            {/* Brand Marquee */}
            {renderBrandMarquee()}

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

            {/* Model Reels — B&W fashion videos */}
            {renderModelReels()}

            {/* Categories */}
            {renderCategoryGrid()}

            {/* Deal of the Day */}
            {renderDealOfDay()}

            {/* Flash Deals */}
            {renderFlashDeals()}

            {/* Trending Now */}
            {renderHorizontalProductList('Trending Now', trendingProducts, 'What everyone is buying', 'trending-up')}

            {/* Mini Editorial Duo */}
            {renderPinterestMiniEditorial()}

            {/* Editorial Lookbook */}
            {renderEditorialLookbook()}

            {/* Shop by Brand */}
            {renderBrandSection()}

            {/* New Arrivals Mosaic */}
            {renderMosaicGrid()}

            {/* Collections */}
            {renderCollections()}

            {/* Handpicked for You */}
            {renderHorizontalProductList('Handpicked for You', featuredProducts, 'Curated by our stylists', 'heart')}

            {/* Best Sellers */}
            {renderBestSellersGrid()}

            {/* Promo Strip */}
            {renderPromoStrip()}

            {/* Style Spotlight */}
            {renderStyleSpotlight()}

            {/* Pinterest-style Explore Feed */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionTitleIcon, {backgroundColor: COLORS.cream}]}>
                    <Icon name="grid" size={14} color={COLORS.charcoal} />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Explore</Text>
                    <Text style={styles.sectionSubtitle}>Your personal style feed</Text>
                  </View>
                </View>
              </View>
              {/* Masonry two-column layout */}
              <View style={styles.masonryWrap}>
                <View style={styles.masonryCol}>
                  {PRODUCTS.slice(0, 16).filter((_, i) => i % 2 === 0).map((product, idx) => {
                    const isEditorial = idx === 1 || idx === 5;
                    const isTall = idx % 3 === 0;
                    return (
                      <TouchableOpacity
                        key={`pin-l-${product.id}`}
                        style={[styles.pinCard, isTall ? styles.pinTall : styles.pinShort]}
                        activeOpacity={0.9}
                        onPress={() => openProduct(product, {x: 0, y: 200, width: 200, height: 200}, PRODUCTS)}>
                        <Image source={{uri: product.images[0]}} style={styles.pinImage} resizeMode="cover" />
                        {isEditorial ? (
                          <View style={styles.pinEditorialOverlay}>
                            <Text style={styles.pinEditorialTag}>EDITORIAL</Text>
                            <Text style={styles.pinEditorialQuote}>{product.name}</Text>
                            <Text style={styles.pinEditorialBrand}>{product.brand}</Text>
                          </View>
                        ) : (
                          <View style={styles.pinInfoOverlay}>
                            <Text style={styles.pinBrand}>{product.brand}</Text>
                            <Text style={styles.pinName} numberOfLines={2}>{product.name}</Text>
                            <Text style={styles.pinPrice}>{formatPrice(product.price)}</Text>
                          </View>
                        )}
                        {product.isNew && (
                          <View style={styles.pinBadge}><Text style={styles.pinBadgeText}>NEW</Text></View>
                        )}
                        {product.discount && !product.isNew ? (
                          <View style={[styles.pinBadge, {backgroundColor: COLORS.charcoal}]}><Text style={styles.pinBadgeText}>{product.discount}% OFF</Text></View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={[styles.masonryCol, {marginTop: 30}]}>
                  {PRODUCTS.slice(0, 16).filter((_, i) => i % 2 === 1).map((product, idx) => {
                    const isEditorial = idx === 2 || idx === 6;
                    const isTall = idx % 3 === 1;
                    return (
                      <TouchableOpacity
                        key={`pin-r-${product.id}`}
                        style={[styles.pinCard, isTall ? styles.pinTall : styles.pinShort]}
                        activeOpacity={0.9}
                        onPress={() => openProduct(product, {x: 0, y: 200, width: 200, height: 200}, PRODUCTS)}>
                        <Image source={{uri: product.images[0]}} style={styles.pinImage} resizeMode="cover" />
                        {isEditorial ? (
                          <View style={styles.pinEditorialOverlay}>
                            <Text style={styles.pinEditorialTag}>CURATED</Text>
                            <Text style={styles.pinEditorialQuote}>{product.name}</Text>
                            <Text style={styles.pinEditorialBrand}>{product.brand}</Text>
                          </View>
                        ) : (
                          <View style={styles.pinInfoOverlay}>
                            <Text style={styles.pinBrand}>{product.brand}</Text>
                            <Text style={styles.pinName} numberOfLines={2}>{product.name}</Text>
                            <Text style={styles.pinPrice}>{formatPrice(product.price)}</Text>
                          </View>
                        )}
                        {product.isNew && (
                          <View style={styles.pinBadge}><Text style={styles.pinBadgeText}>NEW</Text></View>
                        )}
                        {product.discount && !product.isNew ? (
                          <View style={[styles.pinBadge, {backgroundColor: COLORS.charcoal}]}><Text style={styles.pinBadgeText}>{product.discount}% OFF</Text></View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
      )}

      {renderFloatingCart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  // Minimal Header
  headerCurved: {
    backgroundColor: COLORS.offWhite,
    paddingTop: 54,
    paddingBottom: 0,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 8,
  },
  headerBrandText: {
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: COLORS.black,
    letterSpacing: 4,
  },
  hWelcomeWrap: {
    flex: 1,
  },
  hWelcomeLine: {
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.6)',
  },
  hUserName: {
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: COLORS.white,
    marginTop: 1,
  },
  hDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  hDeliveryPinWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hDeliveryInfo: {
    flex: 1,
  },
  hDeliveryLabel: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1,
  },
  hDeliveryAddress: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: COLORS.white,
    marginTop: 1,
  },
  hTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,214,10,0.18)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  hTimeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: '#FFD60A',
  },
  headerActions: {flexDirection: 'row', alignItems: 'center', gap: 6},
  hMoneyBtn: {
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 2,
  },
  hMoneySymbol: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFD60A',
  },
  hMoneyText: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.white,
    fontFamily: 'Poppins',
  },
  hIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hNotifDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.offWhite,
  },
  hCartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.black,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  hCartBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
  },
  hSearchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 14,
    gap: 8,
  },
  hSearchBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  hSearchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  hSearchPlaceholderRow: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hSearchPlaceholder: {
    fontSize: 13,
    color: COLORS.midGray,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  hSearchPlaceholderAnimated: {
    fontSize: 13,
    color: COLORS.midGray,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  hFilterBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stories
  // Coupons
  couponSection: {marginTop: 14},
  couponScroll: {paddingHorizontal: SIZES.screenPadding},
  couponCard: {
    padding: 12,
    height: 90,
    borderRadius: SIZES.radiusMd,
    marginRight: 10,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  couponTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponCodeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  couponCode: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  couponLabel: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: '#FFF',
    marginTop: 6,
  },
  couponDesc: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  // Banners — Magazine Cover Style
  bannerSection: {marginTop: 16, overflow: 'visible'},
  bannerList: {paddingHorizontal: 45, paddingVertical: 14},
  bannerCard: {
    width: '100%',
    height: 420,
    borderRadius: 28,
    overflow: 'hidden',
  },
  bannerBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bannerGradientOverlay: {
    flex: 1,
    padding: 0,
    justifyContent: 'space-between',
  },
  magHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16, marginHorizontal: 16,
  },
  magTitle: {
    fontSize: 24,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: COLORS.white,
    letterSpacing: 6,
  },
  magSeasonBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  magSeasonText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    color: COLORS.white,
    letterSpacing: 2,
  },
  magIssueTag: {
    fontSize: 8,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 3,
    textAlign: 'center',
  },
  magBottom: {
    gap: 4,
    marginBottom: 16, marginHorizontal: 16,
  },
  magQuote: {
    fontSize: 26,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: COLORS.white,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  magSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: FONTS.sans,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  magShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  magShopBtnText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    fontFamily: FONTS.sans,
    letterSpacing: 2,
  },
  bannerDots: {flexDirection: 'row', justifyContent: 'center', marginTop: 12},
  bannerDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.lightGray, marginHorizontal: 3,
  },
  bannerDotActive: {width: 22, backgroundColor: COLORS.primary},
  // Category Grid
  sectionContainer: {marginTop: 24},
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, marginBottom: 14,
  },
  sectionTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  sectionTitleIcon: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: {
    fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif, color: COLORS.black,
  },
  sectionSubtitle: {fontSize: 11, color: COLORS.midGray, marginTop: 1, fontFamily: FONTS.sans},
  seeAllButton: {flexDirection: 'row', alignItems: 'center', gap: 2},
  seeAllText: {
    fontSize: SIZES.bodySmall, color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium, fontFamily: FONTS.sans,
  },
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.screenPadding,
    justifyContent: 'space-between',
  },
  categoryGridItem: {width: CATEGORY_ITEM_WIDTH, alignItems: 'center', marginBottom: 16},
  categoryGridImageWrap: {
    width: CATEGORY_ITEM_WIDTH - 8, height: CATEGORY_ITEM_WIDTH - 8,
    borderRadius: (CATEGORY_ITEM_WIDTH - 8) / 2,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.06)',
  },
  categoryGridName: {
    fontSize: 11, color: COLORS.charcoal, fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: FONTS.sans, marginTop: 6, textAlign: 'center',
  },
  // Deal of the Day
  dealOfDayOuter: {
    marginHorizontal: SIZES.screenPadding,
  },
  dealOfDayCard: {
    borderRadius: SIZES.radiusXl,
    overflow: 'hidden', height: 220, backgroundColor: COLORS.offWhite,
  },
  dealBigTextWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  dealBigText: {
    fontSize: 100, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: 'rgba(0,0,0,0.06)', letterSpacing: -4,
  },
  dealOfDayImage: {
    position: 'absolute', top: -160, right: -40,
    width: 440, height: 530, zIndex: 10,
  },
  dealOfDayBadge: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: COLORS.black, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10,
  },
  dealOfDayBadgeText: {
    color: '#FFF', fontSize: 14, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.sans,
  },
  dealOfDayInfo: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 16, paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.0)',
  },
  dealOfDayBrand: {
    fontSize: 11, color: COLORS.black, fontFamily: FONTS.sans,
    fontWeight: FONT_WEIGHTS.medium, textTransform: 'uppercase', letterSpacing: 1.5,
    opacity: 0.6,
  },
  dealOfDayName: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, fontFamily: FONTS.serif,
    color: COLORS.black, marginTop: 3,
  },
  dealOfDayPriceRow: {flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 5},
  dealOfDayPrice: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black, fontFamily: FONTS.sans,
  },
  dealOfDayOrigPrice: {
    fontSize: SIZES.bodySmall, color: 'rgba(0,0,0,0.4)', textDecorationLine: 'line-through',
    fontFamily: FONTS.sans,
  },
  dealOfDayBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.black,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: SIZES.radiusFull,
    alignSelf: 'flex-start', marginTop: 12, gap: 6,
  },
  dealOfDayBtnText: {
    fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.white, fontFamily: FONTS.sans,
  },
  // Flash Deals
  flashDealsSection: {
    marginTop: 24, backgroundColor: COLORS.cream, paddingVertical: 16,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.lightGray,
  },
  flashDealsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding, marginBottom: 14,
  },
  flashDealsHeaderLeft: {flexDirection: 'row', alignItems: 'center', gap: 8},
  flashBoltIcon: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  flashDealsTitle: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif, color: COLORS.black,
  },
  flashDealsSubtitle: {fontSize: 10, color: COLORS.midGray, fontFamily: FONTS.sans},
  countdownRow: {flexDirection: 'row', alignItems: 'center', marginLeft: 6},
  countdownBlock: {
    backgroundColor: COLORS.black, borderRadius: 4, paddingHorizontal: 5,
    paddingVertical: 2, minWidth: 26, alignItems: 'center',
  },
  countdownNum: {
    fontSize: 12, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white, fontFamily: FONTS.sans,
  },
  countdownSep: {
    fontSize: 12, fontFamily: 'Poppins', fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.charcoal, marginHorizontal: 2,
  },
  flashDealsList: {paddingHorizontal: SIZES.screenPadding},
  flashDealCard: {
    width: 140, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd,
    marginRight: 12, overflow: 'hidden',
  },
  flashDealImageWrap: {width: '100%', aspectRatio: 1, backgroundColor: COLORS.cream},
  flashDealImage: {width: '100%', height: '100%'},
  flashDealBadge: {
    position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  flashDealBadgeText: {
    color: COLORS.white, fontSize: 9, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.sans,
  },
  flashDealInfo: {padding: 8},
  flashDealName: {
    fontSize: 12, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.charcoal, fontFamily: FONTS.sans,
  },
  flashDealPriceRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4},
  flashDealPrice: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary, fontFamily: FONTS.sans,
  },
  flashDealOrigPrice: {
    fontSize: 11, color: COLORS.midGray, textDecorationLine: 'line-through', fontFamily: FONTS.sans,
  },
  claimedBarBg: {
    height: 4, backgroundColor: COLORS.lightGray, borderRadius: 2, marginTop: 6, overflow: 'hidden',
  },
  claimedBarFill: {height: '100%', backgroundColor: COLORS.primary, borderRadius: 2},
  claimedText: {
    fontSize: 9, color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium,
    fontFamily: FONTS.sans, marginTop: 3,
  },
  // Editorial Lookbook — Magazine Style
  editorialCard: {
    marginHorizontal: 0, borderRadius: 0,
    overflow: 'hidden', height: 420, backgroundColor: '#000',
  },
  editorialImage: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%'},
  editorialOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'space-between',
    padding:0,
  },
  editorialTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20, marginHorizontal: 20,
  },
  editorialMagName: {
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
    letterSpacing: 6,
  },
  editorialTagWrap: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 0, paddingVertical: 0, borderRadius: 0,
  },
  editorialTag: {
    fontSize: 9, color: '#FFF', fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans, letterSpacing: 2,
  },
  editorialTitle: {
    fontSize: 28, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: '#FFF', lineHeight: 34, marginHorizontal: 20,
  },
  editorialSubtitle: {
    fontSize: 12, color: 'rgba(255,255,255,0.75)',
    fontFamily: FONTS.sans, marginTop: 4, fontStyle: 'italic', marginHorizontal: 20,
  },
  editorialBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 8, paddingHorizontal: 30,
    alignSelf: 'flex-start', marginTop: 10, marginLeft: 20, marginBottom: 20,
  },
  editorialBtnText: {
    fontSize: 11, fontWeight: FONT_WEIGHTS.bold,
    color: '#FFF', fontFamily: FONTS.sans, letterSpacing: 2,
  },
  // Mini Editorial Cards
  miniEditRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 10,
  },
  miniEditCard: {
    flex: 1,
    height: 230,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  miniEditImage: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -40,
    width: undefined,
    height: undefined,
  },
  miniEditGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-end',
    padding: 0,
  },
  miniEditLabel: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  miniEditTitle: {
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
    lineHeight: 24,
    marginHorizontal: 16, marginBottom: 16,
  },
  // Collections
  collectionsList: {paddingHorizontal: SIZES.screenPadding},
  collectionCard: {
    width: 200, height: 140, borderRadius: SIZES.radiusLg,
    overflow: 'hidden', marginRight: 14,
  },
  collectionImage: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%'},
  collectionOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-end', padding: 0, backgroundColor: 'rgba(0,0,0,0.3)',
  },
  collectionTitle: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: '#FFF', marginHorizontal: 12,
  },
  collectionSubtitle: {
    fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.sans, marginTop: 2,
    marginHorizontal: 12, marginBottom: 12,
  },
  // Mosaic Grid
  mosaicContainer: {
    flexDirection: 'row', paddingHorizontal: SIZES.screenPadding, gap: 10,
  },
  mosaicLarge: {
    flex: 1, height: 320, borderRadius: SIZES.radiusLg, overflow: 'hidden',
  },
  mosaicSmallCol: {flex: 1, gap: 10},
  mosaicSmall: {
    flex: 1, borderRadius: SIZES.radiusLg, overflow: 'hidden',
  },
  mosaicImage: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%'},
  mosaicOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-end', padding: 0, backgroundColor: 'rgba(0,0,0,0.25)',
  },
  mosaicBrand: {
    fontSize: 9, color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.sans,
    fontWeight: FONT_WEIGHTS.medium, textTransform: 'uppercase', letterSpacing: 0.5,
    marginHorizontal: 12,
  },
  mosaicName: {
    fontSize: 13, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif,
    color: '#FFF', marginTop: 2, marginHorizontal: 12,
  },
  mosaicPrice: {
    fontSize: 13, fontWeight: FONT_WEIGHTS.bold, color: '#FFF',
    fontFamily: FONTS.sans, marginTop: 2, marginHorizontal: 12, marginBottom: 12,
  },
  mosaicBadge: {
    position: 'absolute', top: 8, left: 8, backgroundColor: COLORS.primary,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  mosaicBadgeText: {
    color: '#FFF', fontSize: 9, fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans, letterSpacing: 0.5,
  },
  // Promo Strip
  promoStrip: {marginTop: 24, marginHorizontal: SIZES.screenPadding},
  promoStripContent: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd, paddingVertical: 14, paddingHorizontal: 16, gap: 12,
  },
  promoIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  promoTextBlock: {flex: 1},
  promoTitle: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white, fontFamily: FONTS.sans,
  },
  promoSubtitle: {
    fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.sans, marginTop: 1,
  },
  // Gender cards - giant text over model
  genderCardsRow: {
    flexDirection: 'row',
    gap: 0,
    marginTop: 0,
  },
  genderCard: {
    flex: 1,
  },
  genderCardInner: {
    height: 220,
    overflow: 'hidden',
  },
  genderTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBigText: {
    fontSize: 60,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    letterSpacing: -2,
    marginBottom: 120,
  },
  genderModelImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  genderLabelWrap: {
    position: 'absolute',
    bottom: 30,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  genderLabel: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    color: COLORS.white,
    letterSpacing: 3,
  },
  // Style Spotlight
  spotlightRow: {
    flexDirection: 'row', paddingHorizontal: SIZES.screenPadding, gap: 12,
  },
  spotlightCard: {
    flex: 1, height: 200, borderRadius: SIZES.radiusLg, overflow: 'hidden',
  },
  spotlightImage: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%'},
  spotlightOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-end', padding: 14, backgroundColor: 'rgba(0,0,0,0.25)',
  },
  spotlightLabel: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.serif, color: '#FFF',
  },
  // Brand section — collage layout
  brandSectionWrap: {
    marginTop: 24,
  },
  brandSectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 14,
  },
  brandSectionLabel: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 2,
  },
  brandSectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: COLORS.black,
  },
  brandHeroBanner: {
    width: '100%',
    overflow: 'hidden',
  },
  brandHeroBg: {
    width: '100%',
    height: 220,
  },
  brandHeroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 0,
  },
  brandHeroTag: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    marginBottom: 6,
    marginHorizontal: 20,
  },
  brandHeroName: {
    fontSize: 34,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
    marginHorizontal: 20,
  },
  brandHeroTagline: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    marginHorizontal: 20,
  },
  brandHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginTop: 14,
    marginLeft: 20, marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  brandHeroBtnText: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: '#FFF',
  },
  brandCollageRow: {
    flexDirection: 'row',
  },
  brandCollageCard: {
    overflow: 'hidden',
  },
  brandCollageBg: {
    width: '100%',
    height: 180,
  },
  brandCollageSquareBg: {
    width: '100%',
    height: 160,
  },
  brandCollageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end',
    padding: 0,
  },
  brandCollageName: {
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
    marginHorizontal: 12,
  },
  brandCollageSub: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
    marginHorizontal: 12, marginBottom: 12,
  },
  brandPromoTile: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    padding: 20,
  },
  brandPromoTag: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 3,
    marginBottom: 4,
  },
  brandPromoTitle: {
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
  },
  brandPromoSub: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  brandPromoBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  brandPromoBtnText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: COLORS.primary,
  },
  // Product lists
  horizontalList: {paddingHorizontal: SIZES.screenPadding},
  horizontalCard: {width: 165, marginRight: 12},
  productGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.screenPadding,
    justifyContent: 'space-between',
  },
  gridCard: {width: (width - SIZES.screenPadding * 2 - 12) / 2, marginBottom: 14},
  // Search results
  searchResults: {paddingTop: 20},
  searchResultsTitle: {
    paddingHorizontal: SIZES.screenPadding, fontSize: SIZES.bodySmall,
    color: COLORS.darkGray, marginBottom: 16, fontWeight: FONT_WEIGHTS.medium, fontFamily: FONTS.sans,
  },
  // Floating Cart
  floatingCart: {
    position: 'absolute', bottom: 90, left: SIZES.screenPadding, right: SIZES.screenPadding,
  },
  floatingCartInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, borderRadius: SIZES.radiusMd,
    paddingVertical: 12, paddingHorizontal: 16, ...SHADOWS.large,
  },
  floatingCartLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  floatingCartBadge: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  floatingCartBadgeText: {
    fontSize: 13, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white, fontFamily: FONTS.sans,
  },
  floatingCartItems: {fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.sans},
  floatingCartTotal: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white, fontFamily: FONTS.sans,
  },
  floatingCartRight: {flexDirection: 'row', alignItems: 'center', gap: 6},
  floatingCartCta: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.white, fontFamily: FONTS.sans,
  },
  // Model Reels — B&W Video Cards
  reelSection: {
    marginTop: 24,
  },
  reelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 14,
  },
  reelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reelPlayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  reelHeaderTitle: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: COLORS.black,
  },
  reelHeaderSub: {
    fontSize: 11,
    color: COLORS.midGray,
    fontFamily: FONTS.sans,
    marginTop: 1,
  },
  reelList: {
    paddingHorizontal: SIZES.screenPadding,
  },
  reelCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#000',
  },
  reelImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  reelBwOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  reelGradient: {
    flex: 1,
    padding: 0,
    justifyContent: 'space-between',
  },
  reelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12, marginHorizontal: 12,
  },
  reelLabelBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  reelLabelText: {
    fontSize: 8,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
  },
  reelPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  reelGrainLines: {
    position: 'absolute',
    top: '40%' as any,
    left: 14,
    right: 14,
    gap: 8,
  },
  reelGrainLine: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  reelBottom: {
    gap: 4,
    marginBottom: 12, marginHorizontal: 12,
  },
  reelHeadline: {
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
    lineHeight: 22,
    letterSpacing: 1,
  },
  reelSubtext: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: FONTS.sans,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  reelBarcode: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
    marginTop: 8,
    opacity: 0.4,
  },
  reelBarcodeBar: {
    width: 2,
    backgroundColor: '#FFF',
    borderRadius: 0.5,
  },
  // Pinterest Masonry
  masonryWrap: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.screenPadding,
    gap: 10,
  },
  masonryCol: {
    flex: 1,
    gap: 10,
  },
  pinCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.cream,
  },
  pinTall: {
    height: 280,
  },
  pinShort: {
    height: 210,
  },
  pinImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  pinInfoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pinBrand: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pinName: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
    marginTop: 2,
    lineHeight: 17,
  },
  pinPrice: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    color: '#FFF',
    marginTop: 4,
  },
  pinEditorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  pinEditorialTag: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    marginBottom: 6,
  },
  pinEditorialQuote: {
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
    lineHeight: 22,
  },
  pinEditorialBrand: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: FONTS.sans,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  pinBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pinBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sans,
    letterSpacing: 0.5,
  },
  bottomSpacer: {height: 100},
  // Brand Marquee
  marqueeWrap: {
    overflow: 'hidden',
    height: 32,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    marginTop: -46,
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  marqueeDot: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.35)',
    marginRight: 10,
  },
  marqueeText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: FONTS.sans,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
});
