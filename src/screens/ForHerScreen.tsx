import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Image,
  FlatList,
  ImageBackground,
} from 'react-native';
import {FONTS, FONT_WEIGHTS, SIZES} from '../utils/theme';
import {PRODUCTS, Product, formatPrice} from '../data/products';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';

const {width} = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - SIZES.screenPadding * 2 - CARD_GAP) / 2;

// Soft pink / rose palette
const P = {
  bg: '#F0F3FA',
  surface: '#FFFFFF',
  accent: '#1A3B8A',
  accentLight: 'rgba(26,59,138,0.10)',
  accentSoft: '#C8D4F0',
  text: '#1A1A1A',
  textSecondary: '#8E8E93',
  border: 'rgba(26,59,138,0.15)',
  overlayDark: 'rgba(0,0,0,0.45)',
  overlayLight: 'rgba(0,0,0,0.25)',
};

const OCCASIONS = [
  {id: 'occ1', title: 'Workwear', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', color: '#F3E8FF'},
  {id: 'occ2', title: 'Party', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400', color: '#DBEAFE'},
  {id: 'occ3', title: 'Casual', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400', color: '#FEF3C7'},
  {id: 'occ4', title: 'Ethnic', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', color: '#DBEAFE'},
  {id: 'occ5', title: 'Vacation', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400', color: '#D1FAE5'},
];

const STYLE_TIPS = [
  {id: 'st1', title: 'Layer Like a Pro', subtitle: 'Master the art of layering this season', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600'},
  {id: 'st2', title: 'Minimal Chic', subtitle: 'Less is more - curated essentials', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600'},
];

interface Props {
  navigation: any;
}

export default function ForHerScreen({navigation}: Props) {
  const allProducts = PRODUCTS.filter(
    p => p.gender === 'women' || p.gender === 'unisex',
  );

  const categories = [
    {label: 'All', icon: 'grid'},
    {label: 'Dresses', icon: 'shopping-bag'},
    {label: 'Tops', icon: 'layers'},
    {label: 'Bottoms', icon: 'maximize'},
    {label: 'Accessories', icon: 'watch'},
    {label: 'Shoes', icon: 'triangle'},
  ];

  const [activeCategory, setActiveCategory] = React.useState('All');

  const filtered =
    activeCategory === 'All'
      ? allProducts
      : allProducts.filter(p => p.category === activeCategory);

  const trending = allProducts.filter(p => p.isFeatured).slice(0, 8);
  const newArrivals = allProducts.filter(p => p.isNew).slice(0, 6);
  const bestSellers = allProducts.sort((a, b) => b.reviews - a.reviews).slice(0, 6);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', {product});
  };

  // --- SECTION: Hero Banner ---
  const renderHero = () => (
    <TouchableOpacity activeOpacity={0.9} style={styles.heroContainer}>
      <ImageBackground
        source={{uri: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800'}}
        style={styles.heroImage}
        imageStyle={{borderRadius: 20}}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroTagRow}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>NEW SEASON</Text>
            </View>
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroTitle}>Spring{'\n'}Collection '25</Text>
            <Text style={styles.heroSubtitle}>Florals, pastels & fresh silhouettes</Text>
            <View style={styles.heroCTA}>
              <Text style={styles.heroCTAText}>Explore Now</Text>
              <Icon name="arrow-right" size={14} color="#FFF" />
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  // --- SECTION: Category Chips ---
  const renderChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}>
      {categories.map(cat => (
        <TouchableOpacity
          key={cat.label}
          style={[
            styles.chip,
            activeCategory === cat.label && styles.chipActive,
          ]}
          onPress={() => setActiveCategory(cat.label)}
          activeOpacity={0.7}>
          <Icon
            name={cat.icon}
            size={13}
            color={activeCategory === cat.label ? '#FFF' : P.accent}
          />
          <Text
            style={[
              styles.chipText,
              activeCategory === cat.label && styles.chipTextActive,
            ]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // --- SECTION: Trending Horizontal Scroll ---
  const renderTrending = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>TRENDING</Text>
          <Text style={styles.sectionTitle}>Most Loved Right Now</Text>
        </View>
        <TouchableOpacity style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>See All</Text>
          <Icon name="chevron-right" size={14} color={P.accent} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={trending}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: SIZES.screenPadding}}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.trendCard}
            activeOpacity={0.85}
            onPress={() => handleProductPress(item)}>
            <Image source={{uri: item.images[0]}} style={styles.trendImage} />
            <View style={styles.trendInfo}>
              <Text style={styles.trendBrand}>{item.brand}</Text>
              <Text style={styles.trendName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.trendPriceRow}>
                <Text style={styles.trendPrice}>{formatPrice(item.price)}</Text>
                {item.originalPrice && (
                  <Text style={styles.trendOrigPrice}>{formatPrice(item.originalPrice)}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // --- SECTION: Editorial Card ---
  const renderEditorial = () => (
    <View style={styles.section}>
      <TouchableOpacity activeOpacity={0.9} style={styles.editorialCard}>
        <ImageBackground
          source={{uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'}}
          style={styles.editorialImage}
          imageStyle={{borderRadius: 16}}>
          <View style={styles.editorialOverlay}>
            <View style={styles.editorialTagRow}>
              <Text style={styles.editorialTag}>STYLE GUIDE</Text>
            </View>
            <Text style={styles.editorialTitle}>Date Night{'\n'}Essentials</Text>
            <Text style={styles.editorialSub}>From LBDs to statement accessories</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );

  // --- SECTION: New Arrivals Mosaic ---
  const renderMosaic = () => {
    const items = newArrivals.length >= 3 ? newArrivals : allProducts.slice(0, 3);
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTag}>JUST DROPPED</Text>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
          </View>
        </View>
        <View style={styles.mosaicContainer}>
          {/* Large card left */}
          <TouchableOpacity
            style={styles.mosaicLarge}
            activeOpacity={0.85}
            onPress={() => handleProductPress(items[0])}>
            <ImageBackground
              source={{uri: items[0].images[0]}}
              style={styles.mosaicLargeImg}
              imageStyle={{borderRadius: 14}}>
              <View style={styles.mosaicOverlay}>
                <Text style={styles.mosaicBrand}>{items[0].brand}</Text>
                <Text style={styles.mosaicName} numberOfLines={2}>{items[0].name}</Text>
                <Text style={styles.mosaicPrice}>{formatPrice(items[0].price)}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
          {/* Two small cards right */}
          <View style={styles.mosaicRight}>
            {items.slice(1, 3).map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.mosaicSmall}
                activeOpacity={0.85}
                onPress={() => handleProductPress(item)}>
                <ImageBackground
                  source={{uri: item.images[0]}}
                  style={styles.mosaicSmallImg}
                  imageStyle={{borderRadius: 14}}>
                  <View style={styles.mosaicOverlay}>
                    <Text style={styles.mosaicBrand}>{item.brand}</Text>
                    <Text style={styles.mosaicName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.mosaicPrice}>{formatPrice(item.price)}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // --- SECTION: Shop by Occasion ---
  const renderOccasions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>CURATED</Text>
          <Text style={styles.sectionTitle}>Shop by Occasion</Text>
        </View>
      </View>
      <FlatList
        data={OCCASIONS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: SIZES.screenPadding}}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.occasionCard} activeOpacity={0.85}>
            <Image source={{uri: item.image}} style={styles.occasionImage} />
            <View style={styles.occasionLabelWrap}>
              <Text style={styles.occasionLabel}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // --- SECTION: Style Tips (2 horizontal cards) ---
  const renderStyleTips = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>INSPIRATION</Text>
          <Text style={styles.sectionTitle}>Style Tips</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: SIZES.screenPadding, gap: 12}}>
        {STYLE_TIPS.map(tip => (
          <TouchableOpacity key={tip.id} style={styles.styleTipCard} activeOpacity={0.9}>
            <ImageBackground
              source={{uri: tip.image}}
              style={styles.styleTipImage}
              imageStyle={{borderRadius: 14}}>
              <View style={styles.styleTipOverlay}>
                <Text style={styles.styleTipTitle}>{tip.title}</Text>
                <Text style={styles.styleTipSub}>{tip.subtitle}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // --- SECTION: Best Sellers horizontal ---
  const renderBestSellers = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>TOP RATED</Text>
          <Text style={styles.sectionTitle}>Best Sellers</Text>
        </View>
        <TouchableOpacity style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>See All</Text>
          <Icon name="chevron-right" size={14} color={P.accent} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={bestSellers}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: SIZES.screenPadding}}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.bestSellerCard}
            activeOpacity={0.85}
            onPress={() => handleProductPress(item)}>
            <Image source={{uri: item.images[0]}} style={styles.bestSellerImage} />
            <View style={styles.bestSellerRating}>
              <Icon name="star" size={10} color="#F5A623" />
              <Text style={styles.bestSellerRatingText}>{item.rating}</Text>
            </View>
            <View style={styles.bestSellerInfo}>
              <Text style={styles.bestSellerBrand}>{item.brand}</Text>
              <Text style={styles.bestSellerName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.bestSellerPrice}>{formatPrice(item.price)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // --- SECTION: Promo Banner ---
  const renderPromoBanner = () => (
    <View style={[styles.section, {paddingHorizontal: SIZES.screenPadding}]}>
      <View style={styles.promoBanner}>
        <View style={styles.promoLeft}>
          <Text style={styles.promoTag}>LIMITED TIME</Text>
          <Text style={styles.promoTitle}>Flat 40% Off</Text>
          <Text style={styles.promoSub}>On all dresses & jumpsuits</Text>
          <View style={styles.promoCTA}>
            <Text style={styles.promoCTAText}>Shop Now</Text>
          </View>
        </View>
        <Image
          source={{uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300'}}
          style={styles.promoImage}
        />
      </View>
    </View>
  );

  // --- SECTION: Filtered Product Grid ---
  const renderProductGrid = () => (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, {paddingHorizontal: SIZES.screenPadding}]}>
        <View>
          <Text style={styles.sectionTag}>EXPLORE</Text>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'All' ? 'All Products' : activeCategory}
          </Text>
        </View>
      </View>
      <View style={styles.productGrid}>
        {filtered.slice(0, 12).map(product => (
          <View key={product.id} style={styles.cardWrapper}>
            <ProductCard product={product} style={styles.gridCard} />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={P.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>For Her</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Icon name="search" size={20} color={P.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {renderHero()}
        {renderChips()}
        {renderTrending()}
        {renderEditorial()}
        {renderMosaic()}
        {renderOccasions()}
        {renderBestSellers()}
        {renderPromoBanner()}
        {renderStyleTips()}
        {renderProductGrid()}
        <View style={{height: 120}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: P.bg,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: Platform.OS === 'ios' ? 58 : 42,
    paddingBottom: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: P.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: P.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: P.text,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: P.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: P.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  // Hero
  heroContainer: {
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 320,
  },
  heroOverlay: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: P.overlayDark,
    padding: 24,
    justifyContent: 'space-between',
  },
  heroTagRow: {
    flexDirection: 'row',
  },
  heroTag: {
    backgroundColor: P.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroTagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    letterSpacing: 1.2,
  },
  heroBottom: {},
  heroTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    lineHeight: 38,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Poppins',
    marginBottom: 14,
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: P.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  heroCTAText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
  // Chips
  chipRow: {
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.radiusFull,
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.border,
  },
  chipActive: {
    backgroundColor: P.accent,
    borderColor: P.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: P.accent,
  },
  chipTextActive: {
    color: '#FFF',
  },
  // Sections
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 14,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: P.accent,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: P.text,
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
    color: P.accent,
  },
  // Trending Cards
  trendCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: P.surface,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  trendImage: {
    width: '100%',
    height: 180,
    backgroundColor: P.accentSoft,
  },
  trendInfo: {
    padding: 10,
  },
  trendBrand: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: P.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendName: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: P.text,
    marginTop: 2,
  },
  trendPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  trendPrice: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: P.text,
  },
  trendOrigPrice: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: P.textSecondary,
    textDecorationLine: 'line-through',
  },
  // Editorial
  editorialCard: {
    marginHorizontal: SIZES.screenPadding,
  },
  editorialImage: {
    width: '100%',
    height: 220,
  },
  editorialOverlay: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: P.overlayDark,
    padding: 24,
    justifyContent: 'flex-end',
  },
  editorialTagRow: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  editorialTag: {
    color: P.accent,
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    letterSpacing: 1.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editorialTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    lineHeight: 32,
    marginBottom: 4,
  },
  editorialSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontFamily: 'Poppins',
  },
  // Mosaic
  mosaicContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.screenPadding,
    gap: 10,
  },
  mosaicLarge: {
    flex: 1,
  },
  mosaicLargeImg: {
    width: '100%',
    height: 320,
  },
  mosaicRight: {
    flex: 1,
    gap: 10,
  },
  mosaicSmall: {
    flex: 1,
  },
  mosaicSmallImg: {
    width: '100%',
    height: 155,
  },
  mosaicOverlay: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 14,
    justifyContent: 'flex-end',
  },
  mosaicBrand: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mosaicName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    marginTop: 2,
  },
  mosaicPrice: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  // Occasions
  occasionCard: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  occasionImage: {
    width: 120,
    height: 150,
    borderRadius: 14,
    backgroundColor: P.accentSoft,
  },
  occasionLabelWrap: {
    marginTop: 8,
  },
  occasionLabel: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: P.text,
    textAlign: 'center',
  },
  // Best Sellers
  bestSellerCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: P.surface,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bestSellerImage: {
    width: '100%',
    height: 200,
    backgroundColor: P.accentSoft,
  },
  bestSellerRating: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  bestSellerRatingText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: P.text,
  },
  bestSellerInfo: {
    padding: 10,
  },
  bestSellerBrand: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: P.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bestSellerName: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: P.text,
    marginTop: 2,
  },
  bestSellerPrice: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: P.text,
    marginTop: 4,
  },
  // Promo Banner
  promoBanner: {
    flexDirection: 'row',
    backgroundColor: P.accent,
    borderRadius: 18,
    overflow: 'hidden',
    minHeight: 160,
  },
  promoLeft: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  promoTag: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: '#FFF',
    marginBottom: 4,
  },
  promoSub: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  promoCTA: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  promoCTAText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: P.accent,
  },
  promoImage: {
    width: 130,
    height: '100%',
  },
  // Style Tips
  styleTipCard: {
    width: width * 0.7,
  },
  styleTipImage: {
    width: '100%',
    height: 180,
  },
  styleTipOverlay: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
    justifyContent: 'flex-end',
  },
  styleTipTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    marginBottom: 4,
  },
  styleTipSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'Poppins',
  },
  // Product Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 14,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    backgroundColor: P.surface,
    shadowColor: P.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gridCard: {
    width: '100%',
  },
});
