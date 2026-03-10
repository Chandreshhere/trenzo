import React, {useRef, useEffect, useMemo, useCallback} from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BlurView from '../components/BlurFallback';
import {SIZES} from '../utils/theme';
import {CATEGORIES, PRODUCTS, BRANDS, formatPrice} from '../data/products';
import Icon from '../components/Icon';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette} from '../context/GenderPaletteContext';
import {useTabBar} from '../context/TabBarContext';
import GenderGradientBg from '../components/GenderGradientBg';

const {width, height: SCREEN_H} = Dimensions.get('window');
const PAD = SIZES.screenPadding;

interface Props {
  navigation: any;
}

export default function CategoriesScreen({navigation}: Props) {
  const {colors, isDark} = useTheme();
  const {palette: gp, activeGender} = useGenderPalette();
  const {tabBarTranslateY} = useTabBar();
  const accent = isDark ? (activeGender === 'Men' ? '#CDF564' : gp.mid) : gp.mid;
  const accentText = isDark ? '#000' : '#FFF';

  // Tab bar hide on scroll
  const lastScrollYRef = useRef(0);
  const isTabBarHidden = useRef(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
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

  // Staggered entrance
  const anim0 = useRef(new Animated.Value(0)).current;
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;
  const anim4 = useRef(new Animated.Value(0)).current;
  const anims = [anim0, anim1, anim2, anim3, anim4];
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(90, anims.map(a =>
      Animated.spring(a, {toValue: 1, friction: 9, tension: 55, useNativeDriver: true}),
    )).start();
  }, []);

  const anim = (i: number, offset = 40) => ({
    opacity: anims[i],
    transform: [{translateY: anims[i].interpolate({inputRange: [0, 1], outputRange: [offset, 0]})}],
  });

  const handleCategoryPress = (name: string) => {
    navigation.navigate('CategoryDetail', {categoryType: name});
  };

  const topPicks = useMemo(() => [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 6), []);

  // --- HERO: Full-bleed editorial with parallax ---
  const renderHero = () => {
    const parallax = scrollY.interpolate({inputRange: [-100, 0, 300], outputRange: [50, 0, -80], extrapolate: 'clamp'});
    const heroScale = scrollY.interpolate({inputRange: [-200, 0], outputRange: [1.3, 1], extrapolate: 'clamp'});
    const titleSlide = scrollY.interpolate({inputRange: [0, 250], outputRange: [0, -40], extrapolate: 'clamp'});

    return (
      <Animated.View style={[{height: SCREEN_H * 0.48, overflow: 'hidden'}, anim(0, 0)]}>
        <Animated.Image
          source={{uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900'}}
          style={[StyleSheet.absoluteFill, {transform: [{translateY: parallax}, {scale: heroScale}]}]}
          resizeMode="cover"
        />
        {/* Dark gradient overlay */}
        <LinearGradient
          colors={['transparent', 'transparent', isDark ? 'rgba(0,0,0,0.7)' : 'rgba(250,250,250,0.6)', isDark ? '#000' : '#FAFAFA']}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Top bar */}
        <View style={s.heroTopBar}>
          <View style={{flex: 1}} />
          <TouchableOpacity style={s.heroSearchBtn}>
            <Icon name="search" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
        {/* Editorial title at bottom */}
        <Animated.View style={[s.heroContent, {transform: [{translateY: titleSlide}]}]}>
          <View style={[s.heroAccentLine, {backgroundColor: accent}]} />
          <Text style={[s.heroTag, {color: accent}]}>EXPLORE</Text>
          <Text style={[s.heroTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Shop by{'\n'}Category</Text>
          <Text style={[s.heroSub, {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}]}>
            {CATEGORIES.length} categories, {PRODUCTS.length}+ products
          </Text>
        </Animated.View>
      </Animated.View>
    );
  };

  // --- CATEGORY GRID: Large editorial cards with stagger ---
  const renderCategoryCards = () => {
    const cats = CATEGORIES;
    return (
      <Animated.View style={[{marginTop: -20}, anim(1, 30)]}>
        {/* First row: 2 tall cards */}
        <View style={s.cardRow}>
          {cats.slice(0, 2).map((cat, i) => (
            <TouchableOpacity
              key={cat.id}
              style={[s.catCard, s.catCardTall]}
              activeOpacity={0.88}
              onPress={() => handleCategoryPress(cat.name)}>
              <Image source={{uri: cat.image}} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.75)']}
                locations={[0.3, 1]}
                style={StyleSheet.absoluteFill}
              />
              {/* Glass pill at top */}
              <View style={s.catCardTopPill}>
                <BlurView blurType="dark" blurAmount={12} style={StyleSheet.absoluteFill} />
                <Text style={s.catCardCount}>{cat.itemCount} items</Text>
              </View>
              {/* Bottom content */}
              <View style={s.catCardBottom}>
                <View style={[s.catIconCircle, {backgroundColor: i === 0 ? accent : gp.light}]}>
                  <Icon name={cat.icon} size={14} color={i === 0 ? accentText : '#FFF'} />
                </View>
                <Text style={s.catCardName}>{cat.name}</Text>
              </View>
              {/* Accent edge */}
              <View style={[s.catCardEdge, {backgroundColor: i === 0 ? accent : gp.light}]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Second row: 3 compact cards */}
        <View style={[s.cardRow, {marginTop: 10}]}>
          {cats.slice(2, 5).map((cat, i) => (
            <TouchableOpacity
              key={cat.id}
              style={[s.catCard, s.catCardCompact]}
              activeOpacity={0.88}
              onPress={() => handleCategoryPress(cat.name)}>
              <Image source={{uri: cat.image}} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                locations={[0.2, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.catCardBottom}>
                <Text style={[s.catCardName, {fontSize: 13}]}>{cat.name}</Text>
                <Text style={s.catCardCountSm}>{cat.itemCount}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Full-width feature card */}
        <View style={{paddingHorizontal: PAD, marginTop: 10}}>
          {cats[5] && (
            <TouchableOpacity
              style={s.catCardWide}
              activeOpacity={0.88}
              onPress={() => handleCategoryPress(cats[5].name)}>
              <Image source={{uri: cats[5].image}} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                locations={[0, 1]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.wideCardContent}>
                <View style={[s.wideAccent, {backgroundColor: accent}]} />
                <View style={{flex: 1}}>
                  <Text style={s.wideCardName}>{cats[5].name}</Text>
                  <Text style={s.wideCardSub}>{cats[5].itemCount} styles to explore</Text>
                </View>
                <View style={[s.wideArrow, {backgroundColor: accent}]}>
                  <Icon name="arrow-right" size={16} color={accentText} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Last 2 cards */}
        <View style={[s.cardRow, {marginTop: 10}]}>
          {cats.slice(6, 8).map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[s.catCard, s.catCardTall]}
              activeOpacity={0.88}
              onPress={() => handleCategoryPress(cat.name)}>
              <Image source={{uri: cat.image}} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.75)']}
                locations={[0.3, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.catCardBottom}>
                <View style={[s.catIconCircle, {backgroundColor: gp.light}]}>
                  <Icon name={cat.icon} size={14} color="#FFF" />
                </View>
                <Text style={s.catCardName}>{cat.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  // --- BRANDS: Horizontal glass cards ---
  const renderBrands = () => (
    <Animated.View style={[{marginTop: 36}, anim(2)]}>
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTag, {color: accent}]}>TOP BRANDS</Text>
        <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Shop by Brand</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: PAD, gap: 12}}>
        {BRANDS.map(brand => (
          <TouchableOpacity
            key={brand.id}
            style={[s.brandCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}]}
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate('CategoryDetail', {categoryType: brand.name});
            }}>
            <Image source={{uri: brand.logo}} style={s.brandLogo} resizeMode="contain" />
            <Text style={[s.brandName, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{brand.name}</Text>
            <Text style={[s.brandCount, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>{brand.productCount} products</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  // --- TOP PICKS: Editorial product strip ---
  const renderTopPicks = () => (
    <Animated.View style={[{marginTop: 36}, anim(3)]}>
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTag, {color: accent}]}>EDITORS PICK</Text>
        <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Top Rated</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: PAD, gap: 14}}
        decelerationRate="fast">
        {topPicks.map((item, i) => (
          <TouchableOpacity
            key={item.id}
            style={s.pickCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('ProductDetail', {product: item})}>
            <Image source={{uri: item.images[0]}} style={s.pickImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              locations={[0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
            {/* Rating badge */}
            <View style={s.pickRating}>
              <Icon name="star" size={9} color="#F5A623" />
              <Text style={s.pickRatingText}>{item.rating}</Text>
            </View>
            {/* Bottom info */}
            <View style={s.pickBottom}>
              <Text style={s.pickBrand}>{item.brand}</Text>
              <Text style={s.pickName} numberOfLines={1}>{item.name}</Text>
              <View style={s.pickPriceRow}>
                <Text style={s.pickPrice}>{formatPrice(item.price)}</Text>
                {item.originalPrice && (
                  <Text style={s.pickOrigPrice}>{formatPrice(item.originalPrice)}</Text>
                )}
              </View>
            </View>
            {/* Number overlay */}
            <Text style={s.pickNumber}>0{i + 1}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  // --- PROMO: Full-width editorial banner ---
  const renderPromo = () => (
    <Animated.View style={[{marginTop: 36, paddingHorizontal: PAD}, anim(4)]}>
      <TouchableOpacity style={[s.promoBanner, {backgroundColor: accent}]} activeOpacity={0.9}>
        <View style={s.promoContent}>
          <Text style={[s.promoTag, {color: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'}]}>MEGA SALE</Text>
          <Text style={[s.promoTitle, {color: accentText}]}>Up to 60%{'\n'}Off</Text>
          <Text style={[s.promoSub, {color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'}]}>Across all categories</Text>
          <View style={[s.promoCta, {backgroundColor: isDark ? '#000' : '#FFF'}]}>
            <Text style={[s.promoCtaText, {color: isDark ? '#FFF' : '#000'}]}>Shop Sale</Text>
            <Icon name="arrow-right" size={12} color={isDark ? '#FFF' : '#000'} />
          </View>
        </View>
        <View style={s.promoRight}>
          <Text style={[s.promoBigNum, {color: isDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)'}]}>60%</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA'}}>
      <GenderGradientBg />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true, listener: handleScroll},
        )}
        scrollEventThrottle={16}>
        {renderHero()}
        {renderCategoryCards()}
        {renderBrands()}
        {renderTopPicks()}
        {renderPromo()}
        <View style={{height: 120}} />
      </Animated.ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  // Hero
  heroTopBar: {
    position: 'absolute',
    top: 54,
    left: PAD,
    right: PAD,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  heroSearchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: PAD,
    right: PAD,
  },
  heroAccentLine: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: 10,
  },
  heroTag: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    letterSpacing: 3,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    lineHeight: 42,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: 'Helvetica',
    marginTop: 6,
  },

  // Category cards
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: PAD,
    gap: 10,
  },
  catCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  catCardTall: {
    flex: 1,
    height: 220,
  },
  catCardCompact: {
    flex: 1,
    height: 130,
  },
  catCardWide: {
    width: '100%',
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  catCardTopPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  catCardCount: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.9)',
  },
  catCardBottom: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  catIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catCardName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    color: '#FFF',
  },
  catCardCountSm: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  catCardEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  wideCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  wideAccent: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 14,
  },
  wideCardName: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    color: '#FFF',
  },
  wideCardSub: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  wideArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section headers
  sectionHeader: {
    paddingHorizontal: PAD,
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

  // Brands
  brandCard: {
    width: 130,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 10,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  brandCount: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    marginTop: 2,
  },

  // Top Picks
  pickCard: {
    width: 160,
    height: 230,
    borderRadius: 18,
    overflow: 'hidden',
  },
  pickImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  pickRating: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pickRatingText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    color: '#FFF',
  },
  pickBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  pickBrand: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pickName: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    color: '#FFF',
    marginTop: 2,
  },
  pickPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  pickPrice: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    color: '#FFF',
  },
  pickOrigPrice: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'line-through',
  },
  pickNumber: {
    position: 'absolute',
    top: 8,
    left: 12,
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Rondira-Medium',
    color: 'rgba(255,255,255,0.08)',
  },

  // Promo
  promoBanner: {
    borderRadius: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 180,
  },
  promoContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  promoTag: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    letterSpacing: 2,
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    lineHeight: 34,
  },
  promoSub: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    marginTop: 4,
    marginBottom: 16,
  },
  promoCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 6,
  },
  promoCtaText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  promoRight: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
  },
  promoBigNum: {
    fontSize: 72,
    fontWeight: '900',
    fontFamily: 'Rondira-Medium',
  },
});
