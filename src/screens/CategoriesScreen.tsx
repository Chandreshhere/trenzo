import React, {useRef, useEffect} from 'react';
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
  ImageBackground,
  FlatList,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES} from '../utils/theme';
import {CATEGORIES, PRODUCTS, BRANDS, formatPrice} from '../data/products';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';

const {width} = Dimensions.get('window');
const PAD = SIZES.screenPadding;
const HALF_CARD = (width - PAD * 2 - 12) / 2;

// Curated collections for the categories page
const FEATURED_COLLECTIONS = [
  {
    id: 'fc1',
    title: 'Summer\nEssentials',
    subtitle: 'Light fabrics & breezy fits',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
    color: '#1A3B8A',
    categories: ['Dresses', 'Tops'],
  },
  {
    id: 'fc2',
    title: 'Street\nReady',
    subtitle: 'Urban fits for the bold',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600',
    color: '#3A6DD4',
    categories: ['Bottoms', 'Shoes'],
  },
  {
    id: 'fc3',
    title: 'Accessory\nEdit',
    subtitle: 'Complete your look',
    image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=600',
    color: '#D4A03A',
    categories: ['Accessories', 'Bags'],
  },
];

const TRENDING_CATS = [
  {id: 'tc1', label: 'Co-ord Sets', icon: 'grid', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300'},
  {id: 'tc2', label: 'Oversized Tees', icon: 'layers', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=300'},
  {id: 'tc3', label: 'Wide Leg', icon: 'maximize', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300'},
  {id: 'tc4', label: 'Chunky Sneakers', icon: 'triangle', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'},
  {id: 'tc5', label: 'Mini Bags', icon: 'briefcase', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300'},
  {id: 'tc6', label: 'Layering', icon: 'cloud', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300'},
];

interface Props {
  navigation: any;
}

export default function CategoriesScreen({navigation}: Props) {
  // Staggered entrance animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const trendAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  const brandsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(headerAnim, {toValue: 1, friction: 8, tension: 50, useNativeDriver: true}),
      Animated.spring(heroAnim, {toValue: 1, friction: 8, tension: 50, useNativeDriver: true}),
      Animated.spring(cardsAnim, {toValue: 1, friction: 8, tension: 50, useNativeDriver: true}),
      Animated.spring(trendAnim, {toValue: 1, friction: 8, tension: 50, useNativeDriver: true}),
      Animated.spring(gridAnim, {toValue: 1, friction: 8, tension: 50, useNativeDriver: true}),
      Animated.spring(brandsAnim, {toValue: 1, friction: 8, tension: 50, useNativeDriver: true}),
    ]).start();
  }, []);

  const animStyle = (anim: Animated.Value, offset = 30) => ({
    opacity: anim,
    transform: [{translateY: anim.interpolate({inputRange: [0, 1], outputRange: [offset, 0]})}],
  });

  const handleCategoryPress = (categoryName: string) => {
    const filtered = PRODUCTS.filter(p => p.category === categoryName);
    navigation.navigate('CategoryProducts', {categoryName, products: filtered});
  };

  const handleCollectionPress = (collection: typeof FEATURED_COLLECTIONS[0]) => {
    const products = PRODUCTS.filter(p => collection.categories.includes(p.category));
    navigation.navigate('CategoryProducts', {categoryName: collection.title.replace('\n', ' '), products});
  };

  const topPicks = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 8);

  // --- HERO BANNER ---
  const renderHero = () => (
    <Animated.View style={[animStyle(heroAnim)]}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.heroBanner}
        onPress={() => handleCollectionPress(FEATURED_COLLECTIONS[0])}>
        <ImageBackground
          source={{uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800'}}
          style={styles.heroImage}
          imageStyle={{borderRadius: 22}}>
          <View style={styles.heroOverlay}>
            <View style={styles.heroTagWrap}>
              <Text style={styles.heroTag}>FEATURED</Text>
            </View>
            <View style={styles.heroBottom}>
              <Text style={styles.heroTitle}>Shop by{'\n'}Category</Text>
              <Text style={styles.heroSub}>Discover curated collections for every style</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );

  // --- FEATURED COLLECTIONS (horizontal scroll) ---
  const renderCollections = () => (
    <Animated.View style={[styles.section, animStyle(cardsAnim)]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>CURATED FOR YOU</Text>
          <Text style={styles.sectionTitle}>Collections</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: PAD, gap: 14}}
        decelerationRate="fast">
        {FEATURED_COLLECTIONS.map(col => (
          <TouchableOpacity
            key={col.id}
            style={styles.collectionCard}
            activeOpacity={0.9}
            onPress={() => handleCollectionPress(col)}>
            <ImageBackground
              source={{uri: col.image}}
              style={styles.collectionImage}
              imageStyle={{borderRadius: 18}}>
              <View style={styles.collectionOverlay}>
                <View style={[styles.collectionAccent, {backgroundColor: col.color}]} />
                <Text style={styles.collectionTitle}>{col.title}</Text>
                <Text style={styles.collectionSub}>{col.subtitle}</Text>
                <View style={styles.collectionBtn}>
                  <Text style={styles.collectionBtnText}>Explore</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  // --- TRENDING CATEGORIES (circular cards) ---
  const renderTrendingCats = () => (
    <Animated.View style={[styles.section, animStyle(trendAnim)]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>TRENDING NOW</Text>
          <Text style={styles.sectionTitle}>What's Hot</Text>
        </View>
      </View>
      <FlatList
        data={TRENDING_CATS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: PAD}}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.trendCatItem}
            activeOpacity={0.8}
            onPress={() => handleCategoryPress(item.label)}>
            <View style={styles.trendCatImageWrap}>
              <Image source={{uri: item.image}} style={styles.trendCatImage} />
            </View>
            <Text style={styles.trendCatLabel} numberOfLines={1}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );

  // --- MAIN CATEGORIES GRID (mosaic layout) ---
  const renderCategoryGrid = () => {
    const cats = CATEGORIES;
    return (
      <Animated.View style={[styles.section, animStyle(gridAnim)]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTag}>ALL CATEGORIES</Text>
            <Text style={styles.sectionTitle}>Browse Everything</Text>
          </View>
        </View>
        <View style={styles.mosaicWrap}>
          {cats.map((cat, i) => {
            // Mosaic pattern: 0=full, 1-2=half, 3-4=half, 5=full, 6=half...
            const pattern = i % 5;
            const isFull = pattern === 0;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.mosaicCard, isFull ? styles.mosaicFull : styles.mosaicHalf]}
                activeOpacity={0.85}
                onPress={() => handleCategoryPress(cat.name)}>
                <Image source={{uri: cat.image}} style={styles.mosaicImage} resizeMode="cover" />
                <View style={styles.mosaicOverlay} />
                <View style={styles.mosaicContent}>
                  <View style={styles.mosaicIconWrap}>
                    <Icon name={cat.icon} size={16} color="#FFF" />
                  </View>
                  <Text style={styles.mosaicName}>{cat.name}</Text>
                </View>
                {/* Glass shimmer accent */}
                <View style={styles.mosaicGlassEdge} />
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  // --- SHOP BY BRAND strip ---
  const renderBrandStrip = () => (
    <Animated.View style={[styles.section, animStyle(brandsAnim)]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>TOP BRANDS</Text>
          <Text style={styles.sectionTitle}>Shop by Brand</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: PAD, gap: 12}}>
        {BRANDS.map(brand => (
          <TouchableOpacity
            key={brand.id}
            style={styles.brandChip}
            activeOpacity={0.8}
            onPress={() => {
              const prods = PRODUCTS.filter(p => p.brand === brand.name);
              navigation.navigate('CategoryProducts', {categoryName: brand.name, products: prods});
            }}>
            <Image source={{uri: brand.logo}} style={styles.brandLogo} resizeMode="contain" />
            <Text style={styles.brandName}>{brand.name}</Text>
            <Text style={styles.brandTagline} numberOfLines={1}>{brand.tagline}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  // --- TOP PICKS HORIZONTAL ---
  const renderTopPicks = () => (
    <Animated.View style={[styles.section, animStyle(brandsAnim, 20)]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>EDITORS PICK</Text>
          <Text style={styles.sectionTitle}>Top Rated Products</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={() => navigation.navigate('CategoryProducts', {categoryName: 'Top Picks', products: topPicks})}>
          <Text style={styles.seeAllText}>See All</Text>
          <Icon name="chevron-right" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={topPicks}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: PAD}}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.pickCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ProductDetail', {product: item})}>
            <Image source={{uri: item.images[0]}} style={styles.pickImage} />
            <View style={styles.pickRating}>
              <Icon name="star" size={10} color="#F5A623" />
              <Text style={styles.pickRatingText}>{item.rating}</Text>
            </View>
            <View style={styles.pickInfo}>
              <Text style={styles.pickBrand}>{item.brand}</Text>
              <Text style={styles.pickName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.pickPrice}>{formatPrice(item.price)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );

  // --- PROMO BANNER ---
  const renderPromo = () => (
    <Animated.View style={[styles.section, animStyle(brandsAnim, 15)]}>
      <View style={{paddingHorizontal: PAD}}>
        <TouchableOpacity style={styles.promoBanner} activeOpacity={0.9}>
          <View style={styles.promoLeft}>
            <Text style={styles.promoTag}>MEGA SALE</Text>
            <Text style={styles.promoTitle}>Up to 60%{'\n'}Off</Text>
            <Text style={styles.promoSub}>Across all categories</Text>
            <View style={styles.promoCTA}>
              <Text style={styles.promoCTAText}>Shop Sale</Text>
              <Icon name="arrow-right" size={12} color={COLORS.primary} />
            </View>
          </View>
          <Image
            source={{uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300'}}
            style={styles.promoImage}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, animStyle(headerAnim, 20)]}>
          <View>
            <Text style={styles.headerTag}>BROWSE</Text>
            <Text style={styles.headerTitle}>Categories</Text>
          </View>
          <TouchableOpacity style={styles.headerSearchBtn}>
            <Icon name="search" size={20} color={COLORS.charcoal} />
          </TouchableOpacity>
        </Animated.View>

        {renderHero()}
        {renderCollections()}
        {renderTrendingCats()}
        {renderCategoryGrid()}
        {renderBrandStrip()}
        {renderTopPicks()}
        {renderPromo()}

        <View style={{height: 120}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
  },
  headerSearchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Hero
  heroBanner: {
    marginHorizontal: PAD,
    marginBottom: 6,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  heroOverlay: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 22,
    justifyContent: 'space-between',
  },
  heroTagWrap: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroTag: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    letterSpacing: 1.2,
  },
  heroBottom: {},
  heroTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    lineHeight: 33,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  // Sections
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: PAD,
    marginBottom: 14,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: COLORS.black,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: COLORS.primary,
  },
  // Featured Collections
  collectionCard: {
    width: width * 0.65,
  },
  collectionImage: {
    width: '100%',
    height: 220,
  },
  collectionOverlay: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 20,
    justifyContent: 'flex-end',
  },
  collectionAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: 50,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 8,
  },
  collectionTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    lineHeight: 29,
  },
  collectionSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  collectionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  collectionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
  // Trending Categories
  trendCatItem: {
    alignItems: 'center',
    marginRight: 18,
    width: 76,
  },
  trendCatImageWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    padding: 3,
    overflow: 'hidden',
  },
  trendCatImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  trendCatLabel: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: COLORS.charcoal,
    marginTop: 6,
    textAlign: 'center',
  },
  // Mosaic Grid
  mosaicWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PAD,
    gap: 12,
  },
  mosaicCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  mosaicFull: {
    width: '100%',
    height: 160,
  },
  mosaicHalf: {
    width: HALF_CARD,
    height: 180,
  },
  mosaicImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  mosaicOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  mosaicContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  mosaicIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  mosaicName: {
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
  },
  mosaicGlassEdge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderTopRightRadius: 18,
  },
  // Brands
  brandChip: {
    width: 120,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.offWhite,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: COLORS.charcoal,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 10,
    fontFamily: 'Poppins',
    color: COLORS.midGray,
    textAlign: 'center',
    marginTop: 2,
  },
  // Top Picks
  pickCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    overflow: 'hidden',
  },
  pickImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F0E8E3',
  },
  pickRating: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pickRatingText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: COLORS.charcoal,
  },
  pickInfo: {
    padding: 10,
  },
  pickBrand: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: COLORS.midGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickName: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: COLORS.charcoal,
    marginTop: 2,
  },
  pickPrice: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: COLORS.black,
    marginTop: 4,
  },
  // Promo
  promoBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 170,
  },
  promoLeft: {
    flex: 1,
    padding: 22,
    justifyContent: 'center',
  },
  promoTag: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
    lineHeight: 33,
  },
  promoSub: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    marginBottom: 14,
  },
  promoCTA: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    gap: 6,
  },
  promoCTAText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: COLORS.primary,
  },
  promoImage: {
    width: 140,
    height: '100%',
    opacity: 0.5,
  },
});
