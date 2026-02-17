import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES} from '../utils/theme';
import {PRODUCTS} from '../data/products';
import {useApp} from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';

interface Props {
  navigation: any;
}

export default function FavoritesScreen({navigation}: Props) {
  const {state} = useApp();
  const favoriteProducts = PRODUCTS.filter(p => state.favorites.includes(p.id));

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', {product});
  };

  if (favoriteProducts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyIconContainer}>
          <Icon name="heart" size={36} color={COLORS.midGray} />
        </View>
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the heart on any product{'\n'}to save it here
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('HomeTab')}>
          <Text style={styles.shopButtonText}>Explore Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.itemCount}>
          {favoriteProducts.length} item{favoriteProducts.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}>
        {favoriteProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => handleProductPress(product)}
            style={styles.card}
          />
        ))}
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
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: SIZES.body,
    color: COLORS.midGray,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: SIZES.radiusFull,
    marginTop: 32,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    letterSpacing: 0.3,
  },
  itemCount: {
    fontSize: SIZES.bodySmall,
    color: COLORS.midGray,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
  },
  grid: {
    paddingHorizontal: SIZES.screenPadding,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 16,
  },
});
