import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {Product} from '../data/products';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';

const {width} = Dimensions.get('window');

interface Props {
  route: any;
  navigation: any;
}

export default function CategoryProductsScreen({route, navigation}: Props) {
  const {categoryName, products} = route.params as {
    categoryName: string;
    products: Product[];
  };
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={styles.placeholder} />
      </View>

      <Animated.ScrollView
        style={{opacity: fadeAnim}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={{height: 8}} />
        <View style={styles.productGrid}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              style={styles.gridCard}
            />
          ))}
        </View>
        {products.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="search" size={36} color={COLORS.midGray} />
            </View>
            <Text style={styles.emptyText}>No items in this category yet</Text>
          </View>
        )}
        <View style={{height: 40}} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
  },
  placeholder: {width: 40},
  content: {
    paddingHorizontal: SIZES.screenPadding,
  },
  resultCount: {
    fontSize: SIZES.bodySmall,
    color: COLORS.midGray,
    marginBottom: 16,
    fontWeight: FONT_WEIGHTS.medium,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: (width - SIZES.screenPadding * 2 - 12) / 2,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.midGray,
    fontWeight: FONT_WEIGHTS.regular,
  },
});
