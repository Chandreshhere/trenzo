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

const {width} = Dimensions.get('window');
const PAD = SIZES.screenPadding;
const CARD_W = (width - PAD * 2 - 12) / 2;
const CARD_H = CARD_W * 1.35;
const R = 18;

// Occasion-specific data
const OCCASION_DATA: Record<string, {
  headline: string;
  subtitle: string;
  description: string;
  heroImage: string;
  tags: string[];
  filterCategories: string[];
}> = {
  'STREET': {
    headline: 'Own the\nStreet',
    subtitle: 'Bold, raw, unapologetic',
    description: 'Curated streetwear essentials that turn heads. Mix oversized silhouettes with statement accessories.',
    heroImage: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800',
    tags: ['Oversized', 'Graphic Tees', 'Sneakers', 'Hoodies'],
    filterCategories: ['Tops', 'Bottoms', 'Shoes', 'Outerwear'],
  },
  'NIGHT OUT': {
    headline: 'After\nDark',
    subtitle: 'Dress for the spotlight',
    description: 'From rooftop bars to late-night events. Looks that command attention under city lights.',
    heroImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    tags: ['Statement', 'Sequins', 'Heels', 'Clutch'],
    filterCategories: ['Dresses', 'Tops', 'Shoes', 'Accessories'],
  },
  'WEDDING': {
    headline: 'The Grand\nAffair',
    subtitle: 'Grace meets grandeur',
    description: 'Whether you\'re the guest or the center of attention. Elegance that photographs beautifully.',
    heroImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    tags: ['Ethnic', 'Lehenga', 'Sherwani', 'Jewellery'],
    filterCategories: ['Dresses', 'Accessories', 'Shoes'],
  },
  'OFFICE': {
    headline: 'Power\nMoves',
    subtitle: 'Dress the ambition',
    description: 'Sharp tailoring meets modern comfort. Pieces that command the boardroom and beyond.',
    heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
    tags: ['Tailored', 'Blazers', 'Trousers', 'Loafers'],
    filterCategories: ['Tops', 'Bottoms', 'Outerwear', 'Shoes'],
  },
  'BRUNCH': {
    headline: 'Easy\nSundays',
    subtitle: 'Effortlessly put together',
    description: 'Relaxed yet refined. Looks perfect for long brunch conversations and golden-hour selfies.',
    heroImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    tags: ['Linen', 'Pastels', 'Midi Skirts', 'Mules'],
    filterCategories: ['Dresses', 'Tops', 'Bottoms', 'Accessories'],
  },
  'VACATION': {
    headline: 'Pack\nLight',
    subtitle: 'Wanderlust wardrobe',
    description: 'Versatile pieces that mix & match for any destination. From beach to boulevard in seconds.',
    heroImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    tags: ['Resort', 'Swimwear', 'Sandals', 'Linen'],
    filterCategories: ['Dresses', 'Tops', 'Bottoms', 'Shoes'],
  },
  'GYM': {
    headline: 'Move\nFree',
    subtitle: 'Performance meets style',
    description: 'Technical fabrics, ergonomic fits. Activewear that looks as good as it performs.',
    heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    tags: ['Performance', 'Leggings', 'Tanks', 'Trainers'],
    filterCategories: ['Activewear', 'Shoes', 'Accessories'],
  },
  'DATE NIGHT': {
    headline: 'First\nImpression',
    subtitle: 'Dress the butterflies',
    description: 'Confident, polished, memorable. The outfit that makes the night unforgettable.',
    heroImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800',
    tags: ['Elegant', 'Cologne', 'Watch', 'Slim Fit'],
    filterCategories: ['Tops', 'Bottoms', 'Dresses', 'Accessories'],
  },
  'FESTIVAL': {
    headline: 'Wild &\nFree',
    subtitle: 'Express yourself louder',
    description: 'Bohemian layers, metallic accents, statement boots. Dress for the mosh pit and the main stage.',
    heroImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
    tags: ['Boho', 'Layered', 'Boots', 'Accessories'],
    filterCategories: ['Tops', 'Outerwear', 'Shoes', 'Accessories'],
  },
  'CASUAL': {
    headline: 'Off\nDuty',
    subtitle: 'Minimal effort, maximum style',
    description: 'Your everyday uniform elevated. Clean basics and smart layering for effortless cool.',
    heroImage: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800',
    tags: ['Basics', 'Denim', 'Sneakers', 'Tees'],
    filterCategories: ['Tops', 'Bottoms', 'Shoes', 'Outerwear'],
  },
  'FORMAL': {
    headline: 'Black\nTie',
    subtitle: 'The art of dressing up',
    description: 'Impeccable suits, evening gowns, polished details. For when the dress code is non-negotiable.',
    heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    tags: ['Suits', 'Gowns', 'Cufflinks', 'Heels'],
    filterCategories: ['Tops', 'Bottoms', 'Dresses', 'Accessories'],
  },
  'COCKTAIL': {
    headline: 'Raise\nthe Bar',
    subtitle: 'Chic after five',
    description: 'Somewhere between casual and black tie. The sweet spot of sophisticated evening style.',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    tags: ['Cocktail', 'Mini Dress', 'Blazer', 'Stilettos'],
    filterCategories: ['Dresses', 'Tops', 'Shoes', 'Accessories'],
  },
};

const DEFAULT_DATA = {
  headline: 'Your\nStyle',
  subtitle: 'Curated for you',
  description: 'Hand-picked pieces for this occasion.',
  heroImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
  tags: ['Trending', 'New', 'Popular', 'Curated'],
  filterCategories: ['Tops', 'Bottoms', 'Dresses', 'Shoes'],
};

interface Props {
  route: any;
  navigation: any;
}

export default function OccasionScreen({route, navigation}: Props) {
  const {occasionLabel} = route.params as {occasionLabel: string};
  const {isDark} = useTheme();
  const {palette: gp, activeGender} = useGenderPalette();
  const {tabBarTranslateY} = useTabBar();
  const accent = isDark ? (activeGender === 'Men' ? '#CDF564' : gp.mid) : gp.mid;
  const accentText = isDark ? '#000' : '#FFF';
  const data = OCCASION_DATA[occasionLabel] || DEFAULT_DATA;

  const products = useMemo(() => {
    const cats = data.filterCategories;
    const filtered = PRODUCTS.filter(p => cats.includes(p.category));
    // Shuffle for variety
    return filtered.sort(() => Math.random() - 0.5).slice(0, 16);
  }, [occasionLabel]);

  const topPicks = useMemo(() => products.slice(0, 4), [products]);
  const gridProducts = useMemo(() => products.slice(4), [products]);

  // Entrance animations
  const heroAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Tab bar hide
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

  // SVG clip path for product cards (rounded rect with notch)
  const cardClipPath = useMemo(() => {
    const w = CARD_W;
    const h = CARD_H;
    const notch = 24;
    return [
      `M ${R} 0`, `L ${w - R} 0`, `Q ${w} 0 ${w} ${R}`,
      `L ${w} ${h - R}`, `Q ${w} ${h} ${w - R} ${h}`,
      `L ${notch + R} ${h}`, `Q ${notch} ${h} ${notch} ${h - R}`,
      `L ${notch} ${h - notch + R}`, `Q ${notch} ${h - notch} ${notch - R} ${h - notch}`,
      `L ${R} ${h - notch}`, `Q 0 ${h - notch} 0 ${h - notch - R}`,
      `L 0 ${R}`, `Q 0 0 ${R} 0`, 'Z',
    ].join(' ');
  }, []);

  const heroParallax = scrollY.interpolate({inputRange: [-100, 0, 300], outputRange: [40, 0, -60], extrapolate: 'clamp'});
  const heroOpacity = scrollY.interpolate({inputRange: [0, 250], outputRange: [1, 0], extrapolate: 'clamp'});

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
            source={{uri: data.heroImage}}
            style={[StyleSheet.absoluteFill, {transform: [{translateY: heroParallax}]}]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)', isDark ? '#000' : 'rgba(0,0,0,0.85)']}
            locations={[0, 0.25, 0.65, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View style={[s.heroContent, {opacity: heroOpacity}]}>
            <View style={[s.accentLine, {backgroundColor: accent}]} />
            <Text style={s.heroLabel}>{occasionLabel}</Text>
            <Text style={s.heroHeadline}>{data.headline}</Text>
            <Text style={s.heroSubtitle}>{data.subtitle}</Text>
          </Animated.View>
        </Animated.View>

        {/* DESCRIPTION + TAGS */}
        <Animated.View style={[s.section, {
          opacity: contentAnim,
          transform: [{translateY: contentAnim.interpolate({inputRange: [0, 1], outputRange: [30, 0]})}],
        }]}>
          <Text style={[s.description, {color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}]}>
            {data.description}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 16}}>
            {data.tags.map(tag => (
              <View key={tag} style={[s.tag, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              }]}>
                <Text style={[s.tagText, {color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'}]}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* TOP PICKS — SVG masked cards */}
        <Animated.View style={[s.section, {
          opacity: contentAnim,
          transform: [{translateY: contentAnim.interpolate({inputRange: [0, 1], outputRange: [50, 0]})}],
        }]}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTag, {color: accent}]}>HAND PICKED</Text>
            <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Top for {occasionLabel.toLowerCase()}</Text>
          </View>

          <View style={s.cardGrid}>
            {topPicks.map((product, i) => (
              <TouchableOpacity
                key={product.id}
                style={{width: CARD_W, height: CARD_H, marginBottom: 14}}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetail', {product})}>
                <Svg width={CARD_W} height={CARD_H} style={StyleSheet.absoluteFill}>
                  <Defs>
                    <ClipPath id={`occClip-${product.id}`}>
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
                {/* Accent notch circle */}
                <View style={[s.notchCircle, {backgroundColor: i === 0 ? accent : gp.light}]}>
                  <Icon name="arrow-up-right" size={10} color={i === 0 ? accentText : '#FFF'} />
                </View>
                {/* Product info at bottom */}
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
                {/* Discount badge */}
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
              {occasionLabel === 'STREET' && 'Layer an oversized hoodie with slim cargo pants. Finish with chunky sneakers.'}
              {occasionLabel === 'NIGHT OUT' && 'A statement piece is all you need — let one item do the talking.'}
              {occasionLabel === 'WEDDING' && 'Coordinate your accessories with the colour palette of the event.'}
              {occasionLabel === 'OFFICE' && 'A well-fitted blazer transforms any outfit from casual to corporate.'}
              {occasionLabel === 'BRUNCH' && 'Linen and pastels are your best friends. Add minimal gold jewellery.'}
              {occasionLabel === 'VACATION' && 'Pack pieces that layer. One scarf, five different looks.'}
              {occasionLabel === 'GYM' && 'Dark tones hide sweat. Invest in moisture-wicking fabrics.'}
              {occasionLabel === 'DATE NIGHT' && 'Keep it sharp but comfortable — confidence is the best accessory.'}
              {occasionLabel === 'FESTIVAL' && 'Metallic details catch stage lights. Don\'t forget comfortable boots.'}
              {occasionLabel === 'CASUAL' && 'The white tee + jeans + white sneakers combo never fails.'}
              {occasionLabel === 'FORMAL' && 'Fit is everything. A tailored suit beats an expensive ill-fitting one.'}
              {occasionLabel === 'COCKTAIL' && 'A midi dress with statement earrings strikes the perfect cocktail balance.'}
            </Text>
          </View>
        </View>

        {/* PRODUCT GRID */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTag, {color: accent}]}>SHOP THE LOOK</Text>
            <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>All {occasionLabel.toLowerCase()} picks</Text>
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
                {/* Rating */}
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

        {/* CTA Banner */}
        <View style={{paddingHorizontal: PAD, marginTop: 20, marginBottom: 40}}>
          <TouchableOpacity
            style={[s.ctaBanner, {backgroundColor: accent}]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('CategoryProducts', {
              categoryName: occasionLabel,
              products: PRODUCTS.filter(p => data.filterCategories.includes(p.category)),
            })}>
            <View style={{flex: 1}}>
              <Text style={[s.ctaTitle, {color: accentText}]}>See all {occasionLabel.toLowerCase()} styles</Text>
              <Text style={[s.ctaSub, {color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'}]}>
                {PRODUCTS.filter(p => data.filterCategories.includes(p.category)).length}+ products
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
    top: 56,
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
  discountText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Helvetica',
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
