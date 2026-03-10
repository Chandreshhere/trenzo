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
import {PRODUCTS, formatPrice} from '../data/products';
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette} from '../context/GenderPaletteContext';
import {useTabBar} from '../context/TabBarContext';
import GenderGradientBg from '../components/GenderGradientBg';
import Icon from '../components/Icon';

const {width: W} = Dimensions.get('window');
const PAD = SIZES.screenPadding;
const CARD_W = (W - PAD * 2 - 12) / 2;

interface Props {
  navigation: any;
}

export default function FavoritesScreen({navigation}: Props) {
  const {isDark} = useTheme();
  const {palette: gp, activeGender} = useGenderPalette();
  const {state, dispatch} = useApp();
  const {tabBarTranslateY} = useTabBar();
  const accent = isDark ? (activeGender === 'Men' ? '#CDF564' : gp.mid) : gp.mid;
  const accentText = isDark ? '#000' : '#FFF';

  const favoriteProducts = useMemo(() =>
    PRODUCTS.filter(p => state.favorites.includes(p.id)),
  [state.favorites]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lastScrollYRef = useRef(0);
  const isTabBarHidden = useRef(false);

  useEffect(() => {
    Animated.spring(fadeAnim, {toValue: 1, friction: 10, tension: 50, useNativeDriver: true}).start();
  }, [fadeAnim]);

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

  if (favoriteProducts.length === 0) {
    return (
      <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40}}>
        <GenderGradientBg />
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={[s.emptyIcon, {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}]}>
          <Icon name="heart" size={36} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} />
        </View>
        <Text style={[s.emptyTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>No favorites yet</Text>
        <Text style={[s.emptyText, {color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}]}>
          Tap the heart on any product{'\n'}to save it here
        </Text>
        <TouchableOpacity
          style={[s.shopBtn, {backgroundColor: accent}]}
          onPress={() => navigation.navigate('HomeTab')}>
          <Text style={{fontSize: 14, fontWeight: '700', fontFamily: 'Helvetica', color: accentText}}>Explore Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA'}}>
      <GenderGradientBg />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={[s.headerTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Favorites</Text>
          <Text style={[s.itemCount, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>
            {favoriteProducts.length} item{favoriteProducts.length !== 1 ? 's' : ''} saved
          </Text>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: new Animated.Value(0)}}}],
          {useNativeDriver: true, listener: handleScroll},
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{paddingHorizontal: PAD, paddingBottom: 120}}
        style={{
          opacity: fadeAnim,
          transform: [{translateY: fadeAnim.interpolate({inputRange: [0, 1], outputRange: [30, 0]})}],
        }}>

        <View style={s.grid}>
          {favoriteProducts.map(product => (
            <TouchableOpacity
              key={product.id}
              style={s.gridCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProductDetail', {product})}>
              <Image source={{uri: product.images[0]}} style={s.gridImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.75)']}
                locations={[0.3, 1]}
                style={StyleSheet.absoluteFill}
              />
              {/* Heart button */}
              <TouchableOpacity
                style={s.heartBtn}
                onPress={() => dispatch({type: 'TOGGLE_FAVORITE', payload: product.id})}>
                <Icon name="heart" size={16} color="#FF453A" />
              </TouchableOpacity>
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
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: PAD,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Rondira-Medium',
  },
  itemCount: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Helvetica',
    marginTop: 2,
  },
  // Empty
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    lineHeight: 22,
  },
  shopBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 100,
    marginTop: 28,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: CARD_W,
    height: CARD_W * 1.3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRating: {
    position: 'absolute',
    top: 8,
    left: 8,
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
    top: 44,
    right: 8,
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
