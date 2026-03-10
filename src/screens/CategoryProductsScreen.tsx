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
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SIZES} from '../utils/theme';
import {Product, formatPrice} from '../data/products';
import Icon from '../components/Icon';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette} from '../context/GenderPaletteContext';
import {useTabBar} from '../context/TabBarContext';
import GenderGradientBg from '../components/GenderGradientBg';

const {width: W} = Dimensions.get('window');
const PAD = SIZES.screenPadding;
const CARD_W = (W - PAD * 2 - 12) / 2;

interface Props {
  route: any;
  navigation: any;
}

export default function CategoryProductsScreen({route, navigation}: Props) {
  const {categoryName, products} = route.params as {
    categoryName: string;
    products: Product[];
  };
  const {isDark} = useTheme();
  const {palette: gp, activeGender} = useGenderPalette();
  const {tabBarTranslateY} = useTabBar();
  const accent = isDark ? (activeGender === 'Men' ? '#CDF564' : gp.mid) : gp.mid;
  const accentText = isDark ? '#000' : '#FFF';

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollYRef = useRef(0);
  const isTabBarHidden = useRef(false);

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(headerAnim, {toValue: 1, friction: 10, tension: 60, useNativeDriver: true}),
      Animated.spring(gridAnim, {toValue: 1, friction: 9, tension: 50, useNativeDriver: true}),
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

  const headerScale = scrollY.interpolate({inputRange: [0, 100], outputRange: [1, 0.96], extrapolate: 'clamp'});

  return (
    <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA'}}>
      <GenderGradientBg />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <Animated.View style={[s.header, {
        opacity: headerAnim,
        transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}],
      }]}>
        <TouchableOpacity style={[s.backBtn, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}]} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={isDark ? '#FFF' : '#1A1A1A'} />
        </TouchableOpacity>
        <Animated.View style={{transform: [{scale: headerScale}]}}>
          <Text style={[s.headerTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{categoryName}</Text>
        </Animated.View>
        <View style={{width: 40}} />
      </Animated.View>

      {/* Result count */}
      <Animated.View style={{
        paddingHorizontal: PAD,
        paddingBottom: 8,
        opacity: headerAnim,
      }}>
        <Text style={[s.resultCount, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>
          {products.length} product{products.length !== 1 ? 's' : ''}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true, listener: handleScroll},
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{paddingHorizontal: PAD, paddingBottom: 120}}>

        {products.length === 0 ? (
          <View style={s.emptyContainer}>
            <View style={[s.emptyIcon, {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}]}>
              <Icon name="search" size={36} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} />
            </View>
            <Text style={[s.emptyTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>No items yet</Text>
            <Text style={[s.emptyText, {color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}]}>
              Check back soon for new additions
            </Text>
          </View>
        ) : (
          <Animated.View style={[s.grid, {
            opacity: gridAnim,
            transform: [{translateY: gridAnim.interpolate({inputRange: [0, 1], outputRange: [40, 0]})}],
          }]}>
            {products.map((product, i) => (
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
                {/* Discount */}
                {product.discount && (
                  <View style={[s.discountBadge, {backgroundColor: accent}]}>
                    <Text style={{fontSize: 9, fontWeight: '800', fontFamily: 'Helvetica', color: accentText}}>{product.discount}%</Text>
                  </View>
                )}
                {/* Info */}
                <View style={s.gridInfo}>
                  <Text style={s.gridBrand}>{product.brand}</Text>
                  <Text style={s.gridName} numberOfLines={1}>{product.name}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3}}>
                    <Text style={s.gridPrice}>{formatPrice(product.price)}</Text>
                    {product.originalPrice && (
                      <Text style={s.gridOrigPrice}>{formatPrice(product.originalPrice)}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingTop: Platform.OS === 'ios' ? 58 : 42,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Helvetica',
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Helvetica',
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: CARD_W,
    height: CARD_W * 1.25,
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
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
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
  },
  gridOrigPrice: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'line-through',
  },
});
