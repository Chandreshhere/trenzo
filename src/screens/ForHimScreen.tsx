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

// Midnight blue / slate palette
const P = {
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  accent: '#3A6DD4',
  accentLight: 'rgba(58,109,212,0.10)',
  cream: '#F8F0E5',
  text: '#1A1A1A',
  textSecondary: '#8E8E93',
  border: 'rgba(58,109,212,0.12)',
  overlayDark: 'rgba(0,0,0,0.50)',
  overlayLight: 'rgba(0,0,0,0.25)',
};

const STYLE_EDITS = [
  {id: 'se1', title: 'Casual', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', subtitle: 'Everyday essentials'},
  {id: 'se2', title: 'Formal', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400', subtitle: 'Office ready looks'},
  {id: 'se3', title: 'Active', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', subtitle: 'Performance wear'},
  {id: 'se4', title: 'Street', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400', subtitle: 'Urban style'},
  {id: 'se5', title: 'Ethnic', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', subtitle: 'Traditional wear'},
];

const LOOKBOOK = [
  {id: 'lb1', title: 'The Weekend Edit', subtitle: 'Relaxed fits for lazy days', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600'},
  {id: 'lb2', title: 'Office Power', subtitle: 'Dress for the role you want', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'},
];

interface Props {
  navigation: any;
}

export default function ForHimScreen({navigation}: Props) {
  const allProducts = PRODUCTS.filter(
    p => p.gender === 'men' || p.gender === 'unisex',
  );

  const categories = [
    {label: 'All', icon: 'grid'},
    {label: 'Tops', icon: 'layers'},
    {label: 'Bottoms', icon: 'maximize'},
    {label: 'Outerwear', icon: 'cloud'},
    {label: 'Accessories', icon: 'watch'},
    {label: 'Shoes', icon: 'triangle'},
  ];

  const [activeCategory, setActiveCategory] = React.useState('All');

  const filtered =
    activeCategory === 'All'
      ? allProducts
      : allProducts.filter(p => p.category === activeCategory);

  const editorPicks = allProducts.filter(p => p.isFeatured).slice(0, 8);
  const newIn = allProducts.filter(p => p.isNew).slice(0, 6);
  const topRated = [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 6);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', {product});
  };

  // --- SECTION: Hero Banner ---
  const renderHero = () => (
    <TouchableOpacity activeOpacity={0.9} style={styles.heroContainer}>
      <ImageBackground
        source={{uri: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800'}}
        style={styles.heroImage}
        imageStyle={{borderRadius: 20}}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroTagRow}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>EXCLUSIVE</Text>
            </View>
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroTitle}>The Modern{'\n'}Man's Wardrobe</Text>
            <Text style={styles.heroSubtitle}>Premium picks for every occasion</Text>
            <View style={styles.heroCTA}>
              <Text style={styles.heroCTAText}>Shop Collection</Text>
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

  // --- SECTION: Editor's Picks Horizontal ---
  const renderEditorPicks = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>EDITOR'S CHOICE</Text>
          <Text style={styles.sectionTitle}>Top Picks for You</Text>
        </View>
        <TouchableOpacity style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>See All</Text>
          <Icon name="chevron-right" size={14} color={P.accent} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={editorPicks}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: SIZES.screenPadding}}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.pickCard}
            activeOpacity={0.85}
            onPress={() => handleProductPress(item)}>
            <Image source={{uri: item.images[0]}} style={styles.pickImage} />
            {item.discount && (
              <View style={styles.pickBadge}>
                <Text style={styles.pickBadgeText}>{item.discount}% OFF</Text>
              </View>
            )}
            <View style={styles.pickInfo}>
              <Text style={styles.pickBrand}>{item.brand}</Text>
              <Text style={styles.pickName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.pickPriceRow}>
                <Text style={styles.pickPrice}>{formatPrice(item.price)}</Text>
                {item.originalPrice && (
                  <Text style={styles.pickOrigPrice}>{formatPrice(item.originalPrice)}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // --- SECTION: The Streetwear Edit (Editorial) ---
  const renderStreetEdit = () => (
    <View style={styles.section}>
      <TouchableOpacity activeOpacity={0.9} style={styles.editorialCard}>
        <ImageBackground
          source={{uri: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800'}}
          style={styles.editorialImage}
          imageStyle={{borderRadius: 16}}>
          <View style={styles.editorialOverlay}>
            <View style={styles.editorialTagRow}>
              <Text style={styles.editorialTag}>THE EDIT</Text>
            </View>
            <Text style={styles.editorialTitle}>Streetwear{'\n'}Essentials</Text>
            <Text style={styles.editorialSub}>Sneakers, hoodies & everything street</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );

  // --- SECTION: New In - Mosaic Grid ---
  const renderMosaic = () => {
    const items = newIn.length >= 3 ? newIn : allProducts.slice(0, 3);
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTag}>FRESH DROPS</Text>
            <Text style={styles.sectionTitle}>New In Store</Text>
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

  // --- SECTION: Shop by Style ---
  const renderStyleEdits = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>DISCOVER</Text>
          <Text style={styles.sectionTitle}>Shop by Style</Text>
        </View>
      </View>
      <FlatList
        data={STYLE_EDITS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: SIZES.screenPadding}}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.styleCard} activeOpacity={0.85}>
            <Image source={{uri: item.image}} style={styles.styleImage} />
            <View style={styles.styleLabelWrap}>
              <Text style={styles.styleLabel}>{item.title}</Text>
              <Text style={styles.styleSub}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // --- SECTION: Top Rated horizontal ---
  const renderTopRated = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>HIGHLY RATED</Text>
          <Text style={styles.sectionTitle}>Community Favorites</Text>
        </View>
        <TouchableOpacity style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>See All</Text>
          <Icon name="chevron-right" size={14} color={P.accent} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={topRated}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: SIZES.screenPadding}}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.ratedCard}
            activeOpacity={0.85}
            onPress={() => handleProductPress(item)}>
            <Image source={{uri: item.images[0]}} style={styles.ratedImage} />
            <View style={styles.ratedRating}>
              <Icon name="star" size={10} color="#F5A623" />
              <Text style={styles.ratedRatingText}>{item.rating}</Text>
              <Text style={styles.ratedReviews}>({item.reviews})</Text>
            </View>
            <View style={styles.ratedInfo}>
              <Text style={styles.ratedBrand}>{item.brand}</Text>
              <Text style={styles.ratedName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.ratedPrice}>{formatPrice(item.price)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // --- SECTION: Lookbook (2 horizontal editorial cards) ---
  const renderLookbook = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>LOOKBOOK</Text>
          <Text style={styles.sectionTitle}>Outfit Inspiration</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: SIZES.screenPadding, gap: 12}}>
        {LOOKBOOK.map(look => (
          <TouchableOpacity key={look.id} style={styles.lookCard} activeOpacity={0.9}>
            <ImageBackground
              source={{uri: look.image}}
              style={styles.lookImage}
              imageStyle={{borderRadius: 14}}>
              <View style={styles.lookOverlay}>
                <Text style={styles.lookTitle}>{look.title}</Text>
                <Text style={styles.lookSub}>{look.subtitle}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // --- SECTION: Promo Banner ---
  const renderPromoBanner = () => (
    <View style={[styles.section, {paddingHorizontal: SIZES.screenPadding}]}>
      <View style={styles.promoBanner}>
        <View style={styles.promoLeft}>
          <Text style={styles.promoTag}>MEMBERS ONLY</Text>
          <Text style={styles.promoTitle}>Extra 20% Off</Text>
          <Text style={styles.promoSub}>On premium brands this weekend</Text>
          <View style={styles.promoCTA}>
            <Text style={styles.promoCTAText}>Claim Offer</Text>
          </View>
        </View>
        <Image
          source={{uri: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300'}}
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
        <Text style={styles.headerTitle}>For Him</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Icon name="search" size={20} color={P.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {renderHero()}
        {renderChips()}
        {renderEditorPicks()}
        {renderStreetEdit()}
        {renderMosaic()}
        {renderStyleEdits()}
        {renderTopRated()}
        {renderPromoBanner()}
        {renderLookbook()}
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
  // Editor's Picks Cards
  pickCard: {
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
  pickImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E8EDF5',
  },
  pickBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF453A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pickBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
  },
  pickInfo: {
    padding: 10,
  },
  pickBrand: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: P.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickName: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: P.text,
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
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: P.text,
  },
  pickOrigPrice: {
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
  // Style Cards
  styleCard: {
    width: 130,
    marginRight: 12,
    alignItems: 'center',
  },
  styleImage: {
    width: 130,
    height: 160,
    borderRadius: 14,
    backgroundColor: '#E8EDF5',
  },
  styleLabelWrap: {
    marginTop: 8,
    alignItems: 'center',
  },
  styleLabel: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: P.text,
  },
  styleSub: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: P.textSecondary,
    marginTop: 1,
  },
  // Top Rated
  ratedCard: {
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
  ratedImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E8EDF5',
  },
  ratedRating: {
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
  ratedRatingText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: P.text,
  },
  ratedReviews: {
    fontSize: 9,
    fontFamily: 'Poppins',
    color: P.textSecondary,
  },
  ratedInfo: {
    padding: 10,
  },
  ratedBrand: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
    color: P.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratedName: {
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
    color: P.text,
    marginTop: 2,
  },
  ratedPrice: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
    color: P.text,
    marginTop: 4,
  },
  // Lookbook
  lookCard: {
    width: width * 0.7,
  },
  lookImage: {
    width: '100%',
    height: 180,
  },
  lookOverlay: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
    justifyContent: 'flex-end',
  },
  lookTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    marginBottom: 4,
  },
  lookSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'Poppins',
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
