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
import Svg, {Defs, ClipPath, Path} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import {SIZES} from '../utils/theme';
import {PRODUCTS, Product, formatPrice} from '../data/products';
import Icon from '../components/Icon';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette} from '../context/GenderPaletteContext';
import {useTabBar} from '../context/TabBarContext';
import GenderGradientBg from '../components/GenderGradientBg';

const {width: W} = Dimensions.get('window');
const PAD = SIZES.screenPadding;
const CARD_W = (W - PAD * 2 - 12) / 2;
const CARD_H = CARD_W * 1.35;
const R = 18;
const TREND_W = 150;

const buildCardPath = (w: number, h: number) => {
  const notch = 24;
  return [
    `M ${R} 0`, `L ${w - R} 0`, `Q ${w} 0 ${w} ${R}`,
    `L ${w} ${h - R}`, `Q ${w} ${h} ${w - R} ${h}`,
    `L ${notch + R} ${h}`, `Q ${notch} ${h} ${notch} ${h - R}`,
    `L ${notch} ${h - notch + R}`, `Q ${notch} ${h - notch} ${notch - R} ${h - notch}`,
    `L ${R} ${h - notch}`, `Q 0 ${h - notch} 0 ${h - notch - R}`,
    `L 0 ${R}`, `Q 0 0 ${R} 0`, 'Z',
  ].join(' ');
};

const STYLE_EDITS = [
  {label: 'Casual', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400'},
  {label: 'Formal', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'},
  {label: 'Active', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'},
  {label: 'Street', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400'},
  {label: 'Ethnic', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'},
];

interface Props {
  navigation: any;
}

export default function ForHimScreen({navigation}: Props) {
  const {isDark} = useTheme();
  const {palette: gp, activeGender} = useGenderPalette();
  const {tabBarTranslateY} = useTabBar();
  const accent = isDark ? '#CDF564' : gp.mid;
  const accentText = isDark ? '#000' : '#FFF';

  const allProducts = useMemo(() =>
    PRODUCTS.filter(p => p.gender === 'men' || p.gender === 'unisex'),
  []);

  const editorPicks = useMemo(() => allProducts.filter(p => p.isFeatured).slice(0, 8), [allProducts]);
  const newIn = useMemo(() => allProducts.filter(p => p.isNew).slice(0, 4), [allProducts]);
  const topRated = useMemo(() => [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 4), [allProducts]);

  const categories = [
    {label: 'All', icon: 'grid'},
    {label: 'Tops', icon: 'layers'},
    {label: 'Bottoms', icon: 'maximize'},
    {label: 'Outerwear', icon: 'cloud'},
    {label: 'Accessories', icon: 'watch'},
    {label: 'Shoes', icon: 'triangle'},
  ];
  const [activeCategory, setActiveCategory] = React.useState('All');
  const filtered = useMemo(() =>
    activeCategory === 'All' ? allProducts : allProducts.filter(p => p.category === activeCategory),
  [activeCategory, allProducts]);

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

  const cardClipPath = useMemo(() => buildCardPath(CARD_W, CARD_H), []);
  const heroParallax = scrollY.interpolate({inputRange: [-100, 0, 300], outputRange: [40, 0, -60], extrapolate: 'clamp'});
  const heroOpacity = scrollY.interpolate({inputRange: [0, 250], outputRange: [1, 0], extrapolate: 'clamp'});

  const handleProduct = (product: Product) => navigation.navigate('ProductDetail', {product});

  return (
    <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA'}}>
      <GenderGradientBg />
      <StatusBar barStyle="light-content" />

      {/* Back + Search */}
      <View style={s.headerBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={s.backBtn} activeOpacity={0.7}>
          <Icon name="search" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

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
            source={{uri: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800'}}
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
            <Text style={s.heroLabel}>EXCLUSIVE</Text>
            <Text style={s.heroHeadline}>The Modern{'\n'}Wardrobe</Text>
            <Text style={s.heroSubtitle}>Premium picks for every occasion</Text>
            <TouchableOpacity
              style={[s.heroCTA, {backgroundColor: accent}]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'New Arrivals'})}>
              <Text style={[s.heroCTAText, {color: accentText}]}>Shop Collection</Text>
              <Icon name="arrow-right" size={14} color={accentText} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* CATEGORY CHIPS */}
        <Animated.View style={{
          opacity: contentAnim,
          transform: [{translateY: contentAnim.interpolate({inputRange: [0, 1], outputRange: [20, 0]})}],
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: PAD, paddingVertical: 16, gap: 8}}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.label}
                style={[s.chip, activeCategory === cat.label && {backgroundColor: accent, borderColor: accent}]}
                onPress={() => setActiveCategory(cat.label)}
                activeOpacity={0.7}>
                <Icon name={cat.icon} size={12} color={activeCategory === cat.label ? accentText : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)')} />
                <Text style={[s.chipText, {
                  color: activeCategory === cat.label ? accentText : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'),
                }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* EDITOR'S PICKS — horizontal scroll */}
        <Animated.View style={[s.section, {
          opacity: contentAnim,
          transform: [{translateY: contentAnim.interpolate({inputRange: [0, 1], outputRange: [30, 0]})}],
        }]}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={[s.sectionTag, {color: accent}]}>EDITOR'S CHOICE</Text>
              <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Top Picks for You</Text>
            </View>
            <TouchableOpacity style={s.seeAllBtn} onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Curated For You'})}>
              <Text style={[s.seeAllText, {color: accent}]}>See All</Text>
              <Icon name="chevron-right" size={13} color={accent} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: PAD}}>
            {editorPicks.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[s.trendCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFF'}]}
                activeOpacity={0.85}
                onPress={() => handleProduct(item)}>
                <Image source={{uri: item.images[0]}} style={s.trendImage} />
                {item.discount && (
                  <View style={[s.trendBadge, {backgroundColor: '#FF453A'}]}>
                    <Text style={{fontSize: 9, fontWeight: '800', fontFamily: 'Helvetica', color: '#FFF'}}>{item.discount}% OFF</Text>
                  </View>
                )}
                <View style={s.trendInfo}>
                  <Text style={[s.trendBrand, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>{item.brand}</Text>
                  <Text style={[s.trendName, {color: isDark ? '#FFF' : '#1A1A1A'}]} numberOfLines={1}>{item.name}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4}}>
                    <Text style={[s.trendPrice, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{formatPrice(item.price)}</Text>
                    {item.originalPrice && (
                      <Text style={s.trendOrigPrice}>{formatPrice(item.originalPrice)}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* EDITORIAL — Streetwear */}
        <View style={{paddingHorizontal: PAD, marginTop: 28}}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={s.editorialCard}
            onPress={() => navigation.navigate('Occasion', {occasionLabel: 'STREET'})}>
            <Image
              source={{uri: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800'}}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              locations={[0.3, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.editorialTag}>
              <Text style={{fontSize: 9, fontWeight: '700', fontFamily: 'Helvetica', color: '#FFF', letterSpacing: 1.5}}>THE EDIT</Text>
            </View>
            <View style={s.editorialBottom}>
              <Text style={s.editorialTitle}>Streetwear{'\n'}Essentials</Text>
              <Text style={s.editorialSub}>Sneakers, hoodies & everything street</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* NEW IN — SVG masked cards */}
        <View style={[s.section, {marginTop: 28}]}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={[s.sectionTag, {color: accent}]}>FRESH DROPS</Text>
              <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>New In Store</Text>
            </View>
          </View>
          <View style={s.cardGrid}>
            {newIn.map((product, i) => (
              <TouchableOpacity
                key={product.id}
                style={{width: CARD_W, height: CARD_H, marginBottom: 14}}
                activeOpacity={0.9}
                onPress={() => handleProduct(product)}>
                <Svg width={CARD_W} height={CARD_H} style={StyleSheet.absoluteFill}>
                  <Defs>
                    <ClipPath id={`himClip-${product.id}`}>
                      <Path d={cardClipPath} />
                    </ClipPath>
                  </Defs>
                  <Path d={cardClipPath} fill={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} />
                  <Path d={cardClipPath} fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} strokeWidth={1} />
                </Svg>
                <View style={s.cardImageWrap}>
                  <Image source={{uri: product.images[0]}} style={s.cardImage} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    locations={[0.4, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
                <View style={[s.notchCircle, {backgroundColor: i === 0 ? accent : gp.light}]}>
                  <Icon name="arrow-up-right" size={10} color={i === 0 ? accentText : '#FFF'} />
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.cardBrand}>{product.brand}</Text>
                  <Text style={s.cardName} numberOfLines={1}>{product.name}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4}}>
                    <Text style={s.cardPrice}>{formatPrice(product.price)}</Text>
                    {product.originalPrice && <Text style={s.cardOrigPrice}>{formatPrice(product.originalPrice)}</Text>}
                  </View>
                </View>
                {product.discount && (
                  <View style={[s.discountBadge, {backgroundColor: accent}]}>
                    <Text style={{fontSize: 10, fontWeight: '800', fontFamily: 'Helvetica', color: accentText}}>{product.discount}%</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SHOP BY STYLE — horizontal */}
        <View style={[s.section, {marginTop: 8}]}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={[s.sectionTag, {color: accent}]}>DISCOVER</Text>
              <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Shop by Style</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: PAD}}>
            {STYLE_EDITS.map(style => (
              <TouchableOpacity
                key={style.label}
                style={s.styleCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Occasion', {occasionLabel: style.label.toUpperCase()})}>
                <Image source={{uri: style.image}} style={StyleSheet.absoluteFill} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  locations={[0.5, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={s.styleLabel}>{style.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* TOP RATED — SVG masked cards */}
        <View style={[s.section, {marginTop: 8}]}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={[s.sectionTag, {color: accent}]}>HIGHLY RATED</Text>
              <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Community Favorites</Text>
            </View>
            <TouchableOpacity style={s.seeAllBtn} onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Bestsellers'})}>
              <Text style={[s.seeAllText, {color: accent}]}>See All</Text>
              <Icon name="chevron-right" size={13} color={accent} />
            </TouchableOpacity>
          </View>
          <View style={s.cardGrid}>
            {topRated.map((product, i) => (
              <TouchableOpacity
                key={product.id}
                style={{width: CARD_W, height: CARD_H, marginBottom: 14}}
                activeOpacity={0.9}
                onPress={() => handleProduct(product)}>
                <Svg width={CARD_W} height={CARD_H} style={StyleSheet.absoluteFill}>
                  <Defs>
                    <ClipPath id={`himTr-${product.id}`}>
                      <Path d={cardClipPath} />
                    </ClipPath>
                  </Defs>
                  <Path d={cardClipPath} fill={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} />
                  <Path d={cardClipPath} fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} strokeWidth={1} />
                </Svg>
                <View style={s.cardImageWrap}>
                  <Image source={{uri: product.images[0]}} style={s.cardImage} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    locations={[0.4, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
                <View style={[s.notchCircle, {backgroundColor: i === 0 ? accent : gp.light}]}>
                  <Icon name="star" size={10} color={i === 0 ? accentText : '#FFF'} />
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.cardBrand}>{product.brand}</Text>
                  <Text style={s.cardName} numberOfLines={1}>{product.name}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4}}>
                    <Text style={s.cardPrice}>{formatPrice(product.price)}</Text>
                    <View style={s.ratingPill}>
                      <Icon name="star" size={8} color="#F5A623" />
                      <Text style={s.ratingText}>{product.rating}</Text>
                      <Text style={{fontSize: 8, fontFamily: 'Helvetica', color: 'rgba(255,255,255,0.5)'}}>({product.reviews})</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PROMO BANNER */}
        <View style={{paddingHorizontal: PAD, marginTop: 20}}>
          <TouchableOpacity
            style={[s.promoBanner, {backgroundColor: accent}]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Trending'})}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 9, fontWeight: '700', fontFamily: 'Helvetica', color: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)', letterSpacing: 2}}>MEMBERS ONLY</Text>
              <Text style={{fontSize: 24, fontWeight: '800', fontFamily: 'Rondira-Medium', color: accentText, marginTop: 4}}>Extra 20% Off</Text>
              <Text style={{fontSize: 12, fontFamily: 'Helvetica', color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.65)', marginTop: 4}}>On premium brands this weekend</Text>
              <View style={[s.promoCTA, {backgroundColor: isDark ? '#000' : '#FFF'}]}>
                <Text style={{fontSize: 12, fontWeight: '700', fontFamily: 'Helvetica', color: isDark ? '#FFF' : '#000'}}>Claim Offer</Text>
              </View>
            </View>
            <Image
              source={{uri: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300'}}
              style={s.promoImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        {/* STYLE TIP */}
        <View style={[s.tipCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}]}>
          <View style={[s.tipAccent, {backgroundColor: accent}]} />
          <View style={{flex: 1}}>
            <Text style={[s.tipLabel, {color: accent}]}>STYLE TIP</Text>
            <Text style={[s.tipText, {color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}]}>
              A well-fitted navy blazer is the most versatile piece in your wardrobe. Pair it with chinos for work or jeans for the weekend.
            </Text>
          </View>
        </View>

        {/* FILTERED PRODUCT GRID */}
        <View style={[s.section, {marginTop: 8}]}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={[s.sectionTag, {color: accent}]}>EXPLORE</Text>
              <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>
                {activeCategory === 'All' ? 'All Products' : activeCategory}
              </Text>
            </View>
          </View>
          <View style={s.cardGrid}>
            {filtered.slice(0, 8).map(product => (
              <TouchableOpacity
                key={product.id}
                style={s.gridCard}
                activeOpacity={0.9}
                onPress={() => handleProduct(product)}>
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
                <View style={s.gridInfo}>
                  <Text style={s.gridBrand}>{product.brand}</Text>
                  <Text style={s.gridName} numberOfLines={1}>{product.name}</Text>
                  <Text style={s.gridPrice}>{formatPrice(product.price)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={{paddingHorizontal: PAD, marginTop: 20, marginBottom: 40}}>
          <TouchableOpacity
            style={[s.ctaBanner, {backgroundColor: accent}]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('CategoryDetail', {categoryType: 'Trending'})}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 18, fontWeight: '800', fontFamily: 'Rondira-Medium', color: accentText}}>See all men's styles</Text>
              <Text style={{fontSize: 11, fontFamily: 'Helvetica', color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)', marginTop: 2}}>{allProducts.length}+ products</Text>
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
  headerBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: PAD,
    right: PAD,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    gap: 6,
    marginTop: 14,
  },
  heroCTAText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
    backgroundColor: 'rgba(150,150,150,0.08)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  section: {
    paddingHorizontal: PAD,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  trendCard: {
    width: TREND_W,
    marginRight: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  trendImage: {
    width: '100%',
    height: 180,
  },
  trendBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendInfo: {
    padding: 10,
  },
  trendBrand: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    marginTop: 2,
  },
  trendPrice: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Helvetica',
  },
  trendOrigPrice: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: 'rgba(150,150,150,0.6)',
    textDecorationLine: 'line-through',
  },
  editorialCard: {
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
  },
  editorialTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editorialBottom: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    right: 18,
  },
  editorialTitle: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Rondira-Medium',
    color: '#FFF',
    lineHeight: 30,
    marginBottom: 4,
  },
  editorialSub: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.7)',
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
    height: CARD_H - 30,
    borderTopLeftRadius: R,
    borderTopRightRadius: R,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  notchCircle: {
    position: 'absolute',
    bottom: 18,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 40,
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
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    color: '#FFF',
  },
  styleCard: {
    width: 130,
    height: 170,
    marginRight: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  styleLabel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    color: '#FFF',
  },
  promoBanner: {
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 160,
  },
  promoCTA: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  promoImage: {
    width: 120,
    height: 140,
    borderRadius: 14,
  },
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
  ctaBanner: {
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
