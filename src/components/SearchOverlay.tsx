import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {PRODUCTS, BRANDS, COLLECTIONS, formatPrice} from '../data/products';
import ProductCard from './ProductCard';
import Icon from './Icon';
import {useRecentSearches} from '../hooks/useRecentSearches';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette, GenderPalette} from '../context/GenderPaletteContext';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.screenPadding * 2 - 12) / 2;

const TRENDING_SEARCHES = [
  {term: 'Summer Dress', count: '12.4k'},
  {term: 'White Sneakers', count: '9.8k'},
  {term: 'Denim Jacket', count: '8.2k'},
  {term: 'Silk Blouse', count: '6.5k'},
  {term: 'Crossbody Bag', count: '5.1k'},
];

const CATEGORY_QUICK = [
  {name: 'Dresses', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400'},
  {name: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'},
  {name: 'Bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'},
  {name: 'Tops', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400'},
  {name: 'Accessories', image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=400'},
];

const BRAND_COVERS: Record<string, string> = {
  'H&M': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
  'Zara': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
  'Uniqlo': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
  'Nike': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  'Adidas': 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=800',
  'Mango': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
  'Studio': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
};

const GENDER_HERO = {
  her: {
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    tagline: 'Curated for the modern woman',
  },
  him: {
    image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800',
    tagline: 'Essentials for the modern man',
  },
};

const FOR_HER_PRODUCTS = PRODUCTS.filter(p => p.gender === 'women' || p.gender === 'unisex').slice(0, 6);
const FOR_HIM_PRODUCTS = PRODUCTS.filter(p => p.gender === 'men' || p.gender === 'unisex').slice(0, 6);

interface SearchOverlayProps {
  visible: boolean;
  progress: Animated.Value;
  onClose: () => void;
  navigation: any;
}

export default function SearchOverlay({visible, progress, onClose, navigation}: SearchOverlayProps) {
  const {colors, isDark} = useTheme();
  const {activeGender, palette: gp} = useGenderPalette();
  const styles = useMemo(() => createStyles(colors, isDark, gp), [colors, isDark, activeGender]);
  const [genderTab, setGenderTab] = useState<'her' | 'him'>('her');
  const {recentSearches, addSearch, removeSearch, clearAll} = useRecentSearches();

  const overlayOpacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const overlayTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  const handleRecentTap = (term: string) => {
    addSearch(term);
    onClose();
    navigation.navigate('CategoryProducts', {
      categoryName: `"${term}"`,
      products: PRODUCTS.filter(
        p =>
          p.name.toLowerCase().includes(term.toLowerCase()) ||
          p.brand.toLowerCase().includes(term.toLowerCase()) ||
          p.category.toLowerCase().includes(term.toLowerCase()),
      ),
    });
  };

  const handleCategoryPress = (name: string) => {
    addSearch(name);
    onClose();
    navigation.navigate('CategoryProducts', {
      categoryName: name,
      products: PRODUCTS.filter(
        p =>
          p.category.toLowerCase().includes(name.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(name.toLowerCase()) ||
          p.name.toLowerCase().includes(name.toLowerCase()),
      ),
    });
  };

  const handleBrandPress = (brandName: string) => {
    onClose();
    navigation.navigate('CategoryProducts', {
      categoryName: brandName,
      products: PRODUCTS.filter(p => p.brand === brandName),
    });
  };

  const handleTrendingPress = (term: string) => {
    addSearch(term);
    onClose();
    navigation.navigate('CategoryProducts', {
      categoryName: term,
      products: PRODUCTS.filter(
        p =>
          p.name.toLowerCase().includes(term.toLowerCase()) ||
          p.category.toLowerCase().includes(term.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(term.toLowerCase()),
      ),
    });
  };

  if (!visible) return null;

  const popularProducts = genderTab === 'her' ? FOR_HER_PRODUCTS : FOR_HIM_PRODUCTS;
  const genderHero = GENDER_HERO[genderTab];
  const b = BRANDS;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {opacity: overlayOpacity, transform: [{translateY: overlayTranslateY}]},
      ]}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Recent Searches — inline tags */}
        {recentSearches.length > 0 && (
          <View style={styles.recentWrap}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentLabel}>Recent</Text>
              <TouchableOpacity onPress={clearAll} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentTags}>
              {recentSearches.map((term, i) => (
                <TouchableOpacity key={i} style={styles.recentTag} onPress={() => handleRecentTap(term)}>
                  <Text style={styles.recentTagText}>{term}</Text>
                  <TouchableOpacity onPress={() => removeSearch(term)} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Icon name="x" size={10} color={gp.light} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Trending — Chart style list */}
        <View style={styles.section}>
          <View style={styles.trendingHeader}>
            <View style={styles.trendingLive}>
              <View style={styles.liveDot} />
              <Text style={styles.trendingHeaderText}>Trending</Text>
            </View>
          </View>
          {TRENDING_SEARCHES.map((item, i) => (
            <TouchableOpacity key={i} style={styles.trendingRow} onPress={() => handleTrendingPress(item.term)} activeOpacity={0.6}>
              <Text style={[styles.trendingRank, i < 3 && styles.trendingRankTop]}>{i + 1}</Text>
              <View style={styles.trendingDivider} />
              <Text style={styles.trendingTerm}>{item.term}</Text>
              <View style={styles.trendingMeta}>
                <Icon name="trending-up" size={11} color={i < 3 ? gp.mid : gp.light} />
                <Text style={[styles.trendingCount, i < 3 && {color: gp.mid}]}>{item.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories — Tall editorial cards */}
        <View style={styles.section}>
          <Text style={styles.editorialLabel}>EXPLORE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: SIZES.screenPadding}}>
            {CATEGORY_QUICK.map((cat, i) => (
              <TouchableOpacity key={i} style={styles.catCard} onPress={() => handleCategoryPress(cat.name)} activeOpacity={0.85}>
                <ImageBackground source={{uri: cat.image}} style={styles.catCardBg} resizeMode="cover">
                  <View style={styles.catCardOverlay}>
                    <Text style={styles.catCardName}>{cat.name}</Text>
                    <View style={styles.catCardArrow}>
                      <Icon name="arrow-up-right" size={14} color={gp.lightest} />
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Collection Banner */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => handleCategoryPress('Dresses')} style={styles.collectionWrap}>
            <ImageBackground
              source={{uri: COLLECTIONS[0].image}}
              style={styles.collectionBanner}
              imageStyle={{borderRadius: 0}}>
              <View style={styles.collectionOverlay}>
                <Text style={styles.collectionTag}>NEW COLLECTION</Text>
                <Text style={styles.collectionTitle}>{COLLECTIONS[0].title}</Text>
                <Text style={styles.collectionSub}>{COLLECTIONS[0].subtitle}</Text>
                <View style={styles.collectionCta}>
                  <Text style={styles.collectionCtaText}>Explore Now</Text>
                  <Icon name="arrow-right" size={14} color={gp.lightest} />
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* For Her / For Him — Full width editorial split */}
        <View style={styles.section}>
          <View style={styles.genderHeaderWrap}>
            <Text style={styles.editorialLabel}>POPULAR RIGHT NOW</Text>
            {/* Gender toggle — underline style */}
            <View style={styles.genderToggle}>
              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => setGenderTab('her')}>
                <Text style={[styles.genderText, genderTab === 'her' && styles.genderTextActive]}>For Her</Text>
                {genderTab === 'her' && <View style={styles.genderUnderline} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => setGenderTab('him')}>
                <Text style={[styles.genderText, genderTab === 'him' && styles.genderTextActive]}>For Him</Text>
                {genderTab === 'him' && <View style={styles.genderUnderline} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Gender hero image */}
          <TouchableOpacity activeOpacity={0.9} style={styles.genderHeroWrap}>
            <ImageBackground source={{uri: genderHero.image}} style={styles.genderHeroBg} resizeMode="cover">
              <View style={styles.genderHeroOverlay}>
                <Text style={styles.genderHeroTitle}>{genderTab === 'her' ? 'For Her' : 'For Him'}</Text>
                <Text style={styles.genderHeroSub}>{genderHero.tagline}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Horizontal scroll products */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: SIZES.screenPadding, paddingTop: 14}}>
            {popularProducts.map((product, i) => (
              <TouchableOpacity key={product.id} style={styles.popProductCard} activeOpacity={0.85}>
                <Image source={{uri: product.images[0]}} style={styles.popProductImg} />
                <View style={styles.popProductInfo}>
                  <Text style={styles.popProductBrand}>{product.brand}</Text>
                  <Text style={styles.popProductName} numberOfLines={1}>{product.name}</Text>
                  <View style={styles.popProductPriceRow}>
                    <Text style={styles.popProductPrice}>{formatPrice(product.price)}</Text>
                    {product.originalPrice && (
                      <Text style={styles.popProductOldPrice}>{formatPrice(product.originalPrice)}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Brands — Editorial Collage */}
        <View style={styles.section}>
          <View style={styles.brandHeader}>
            <Text style={styles.editorialLabel}>TOP BRANDS</Text>
            <Text style={styles.brandTitle}>Shop by Brand</Text>
          </View>

          {/* Hero brand */}
          <TouchableOpacity
            style={styles.brandHeroBanner}
            activeOpacity={0.9}
            onPress={() => handleBrandPress(b[0]?.name || 'H&M')}>
            <ImageBackground
              source={{uri: BRAND_COVERS[b[0]?.name] || BRAND_COVERS['H&M']}}
              style={styles.brandHeroBg}
              resizeMode="cover">
              <View style={styles.brandHeroOverlay}>
                <Text style={styles.brandHeroTag}>FEATURED</Text>
                <Text style={styles.brandHeroName}>{b[0]?.name || 'H&M'}</Text>
                <Text style={styles.brandHeroTagline}>{b[0]?.tagline || 'Fashion & Quality'}</Text>
                <View style={styles.brandHeroBtn}>
                  <Text style={styles.brandHeroBtnText}>Explore</Text>
                  <Icon name="arrow-right" size={12} color={gp.lightest} />
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Collage Row 1 */}
          <View style={styles.brandCollageRow}>
            <TouchableOpacity style={[styles.brandCollageCard, {flex: 3}]} activeOpacity={0.9} onPress={() => handleBrandPress(b[1]?.name || 'Zara')}>
              <ImageBackground source={{uri: BRAND_COVERS[b[1]?.name] || BRAND_COVERS['Zara']}} style={styles.brandCollageBg} resizeMode="cover">
                <View style={styles.brandCollageOverlay}>
                  <Text style={styles.brandCollageName}>{b[1]?.name || 'Zara'}</Text>
                  <Text style={styles.brandCollageSub}>{b[1]?.tagline}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.brandCollageCard, {flex: 2}]} activeOpacity={0.9} onPress={() => handleBrandPress(b[2]?.name || 'Uniqlo')}>
              <ImageBackground source={{uri: BRAND_COVERS[b[2]?.name] || BRAND_COVERS['Uniqlo']}} style={styles.brandCollageBg} resizeMode="cover">
                <View style={styles.brandCollageOverlay}>
                  <Text style={styles.brandCollageName}>{b[2]?.name || 'Uniqlo'}</Text>
                  <Text style={styles.brandCollageSub}>{b[2]?.tagline}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Collage Row 2 */}
          <View style={styles.brandCollageRow}>
            {b.slice(3, 6).map(brand => (
              <TouchableOpacity key={brand.id} style={[styles.brandCollageCard, {flex: 1}]} activeOpacity={0.9} onPress={() => handleBrandPress(brand.name)}>
                <ImageBackground source={{uri: BRAND_COVERS[brand.name] || brand.logo}} style={styles.brandCollageSquareBg} resizeMode="cover">
                  <View style={styles.brandCollageOverlay}>
                    <Text style={styles.brandCollageName}>{brand.name}</Text>
                    <Text style={styles.brandCollageSub}>{brand.tagline}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>

          {/* Collage Row 3 */}
          {b[6] && (
            <View style={styles.brandCollageRow}>
              <TouchableOpacity style={[styles.brandCollageCard, {flex: 2}]} activeOpacity={0.9} onPress={() => handleBrandPress(b[6].name)}>
                <ImageBackground source={{uri: BRAND_COVERS[b[6].name] || b[6].logo}} style={styles.brandCollageBg} resizeMode="cover">
                  <View style={styles.brandCollageOverlay}>
                    <Text style={styles.brandCollageName}>{b[6].name}</Text>
                    <Text style={styles.brandCollageSub}>{b[6].tagline}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
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

        {/* Bottom CTA banner */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => handleCategoryPress('Tops')} style={styles.collectionWrap}>
            <ImageBackground source={{uri: COLLECTIONS[3].image}} style={styles.miniBanner} imageStyle={{borderRadius: 0}}>
              <View style={styles.miniBannerOverlay}>
                <Text style={styles.miniBannerTitle}>{COLLECTIONS[3].title}</Text>
                <Text style={styles.miniBannerSub}>{COLLECTIONS[3].subtitle}</Text>
                <View style={styles.collectionCta}>
                  <Text style={styles.collectionCtaText}>Shop Now</Text>
                  <Icon name="arrow-right" size={12} color={gp.lightest} />
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        <View style={{height: 60}} />
      </ScrollView>
    </Animated.View>
  );
}

const createStyles = (colors: any, isDark: boolean, gp: GenderPalette) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: gp.dark,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingTop: 6,
  },
  section: {
    marginBottom: 24,
  },

  // --- Editorial label used across sections ---
  editorialLabel: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: gp.mid,
    letterSpacing: 2.5,
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 10,
  },

  // --- Recent Searches ---
  recentWrap: {
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentLabel: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: gp.lightest,
  },
  clearText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: gp.mid,
  },
  recentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: gp.light + '30',
    borderRadius: SIZES.radiusSm,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  recentTagText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: FONT_WEIGHTS.regular,
    color: gp.light,
  },

  // --- Trending chart ---
  trendingHeader: {
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 6,
  },
  trendingLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: gp.mid,
  },
  trendingHeaderText: {
    fontSize: 15,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: gp.lightest,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: SIZES.screenPadding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: gp.lightest + '18',
  },
  trendingRank: {
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.light,
    fontFamily: 'Poppins',
    color: gp.light,
    width: 24,
    textAlign: 'center',
  },
  trendingRankTop: {
    fontWeight: FONT_WEIGHTS.bold,
    color: gp.mid,
  },
  trendingDivider: {
    width: 1,
    height: 18,
    backgroundColor: gp.light + '30',
    marginHorizontal: 12,
  },
  trendingTerm: {
    flex: 1,
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: gp.lightest,
  },
  trendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendingCount: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: gp.light,
  },

  // --- Category tall cards ---
  catCard: {
    width: 110,
    height: 150,
    marginRight: 10,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  catCardBg: {
    width: '100%',
    height: '100%',
  },
  catCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  catCardName: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
  },
  catCardArrow: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: gp.light + '50',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- Collection banner ---
  collectionWrap: {
    marginHorizontal: SIZES.screenPadding,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
  },
  collectionBanner: {
    width: '100%',
    height: 180,
  },
  collectionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 22,
    justifyContent: 'flex-end',
  },
  collectionTag: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 6,
  },
  collectionTitle: {
    fontSize: 24,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFFFFF',
  },
  collectionSub: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  collectionCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  collectionCtaText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },

  // --- Gender section ---
  genderHeaderWrap: {
    marginBottom: 14,
  },
  genderToggle: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 4,
  },
  genderOption: {
    alignItems: 'center',
  },
  genderText: {
    fontSize: 15,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: gp.light,
    paddingBottom: 4,
  },
  genderTextActive: {
    color: gp.lightest,
    fontWeight: FONT_WEIGHTS.bold,
  },
  genderUnderline: {
    width: '100%',
    height: 2.5,
    backgroundColor: gp.mid,
  },
  genderHeroWrap: {
    marginHorizontal: SIZES.screenPadding,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  genderHeroBg: {
    width: '100%',
    height: 160,
  },
  genderHeroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  genderHeroTitle: {
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
  },
  genderHeroSub: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },

  // --- Popular product cards (horizontal scroll) ---
  popProductCard: {
    width: 140,
    marginRight: 12,
  },
  popProductImg: {
    width: 140,
    height: 180,
    borderRadius: SIZES.radiusSm,
    backgroundColor: gp.lightest + '18',
  },
  popProductInfo: {
    paddingTop: 8,
  },
  popProductBrand: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: gp.mid,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  popProductName: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: gp.lightest,
    marginTop: 1,
  },
  popProductPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  popProductPrice: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: gp.lightest,
  },
  popProductOldPrice: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
    color: gp.light,
    textDecorationLine: 'line-through',
  },

  // --- Brand collage ---
  brandHeader: {
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: gp.lightest,
    marginTop: -2,
  },
  brandHeroBanner: {
    width: '100%',
    overflow: 'hidden',
  },
  brandHeroBg: {
    width: '100%',
    height: 200,
  },
  brandHeroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  brandHeroTag: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandHeroName: {
    fontSize: 30,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
  },
  brandHeroTagline: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
  },
  brandHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: gp.light + '30',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    borderWidth: 1,
    borderColor: gp.light + '50',
  },
  brandHeroBtnText: {
    fontSize: 12,
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
    height: 160,
  },
  brandCollageSquareBg: {
    width: '100%',
    height: 140,
  },
  brandCollageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  brandCollageName: {
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
  },
  brandCollageSub: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  brandPromoTile: {
    backgroundColor: gp.mid,
    justifyContent: 'center',
    padding: 18,
  },
  brandPromoTag: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 3,
    marginBottom: 3,
  },
  brandPromoTitle: {
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: gp.lightest,
  },
  brandPromoSub: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
    color: 'rgba(0,0,0,0.6)',
    marginTop: 3,
  },
  brandPromoBtn: {
    backgroundColor: gp.lightest,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  brandPromoBtnText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: gp.mid,
  },

  // --- Bottom mini banner ---
  miniBanner: {
    width: '100%',
    height: 120,
  },
  miniBannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 18,
    justifyContent: 'center',
  },
  miniBannerTitle: {
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFFFFF',
  },
  miniBannerSub: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
});
