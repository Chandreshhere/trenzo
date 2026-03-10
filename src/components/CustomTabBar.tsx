import React, {useRef, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import BlurView from './BlurFallback';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FONT_WEIGHTS} from '../utils/theme';
import {useApp} from '../context/AppContext';
import {useTabBar} from '../context/TabBarContext';
import {useGenderPalette} from '../context/GenderPaletteContext';
import Icon from './Icon';
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const {width} = Dimensions.get('window');
const BAR_HEIGHT = 64;
const BAR_MARGIN = 16;
const PILL_WIDTH = width - BAR_MARGIN * 2;
const TAB_WIDTH = PILL_WIDTH / 5;
const BLOB_SIZE = 56;

const TABS = [
  {name: 'HomeTab', icon: 'home', label: 'Home'},
  {name: 'CategoriesTab', icon: 'grid', label: 'Explore'},
  {name: 'FavoritesTab', icon: 'heart', label: 'Wishlist'},
  {name: 'CartTab', icon: 'shopping-bag', label: 'Bag'},
  {name: 'ProfileTab', icon: 'user', label: 'You'},
];

// Liquid spring — snappy with subtle wobble
const LIQUID_SPRING = {damping: 16, stiffness: 160, mass: 0.4};
const SNAP_SPRING = {damping: 14, stiffness: 150, mass: 0.4};

interface Props {
  state: any;
  navigation: any;
}

export default function CustomTabBar({state, navigation}: Props) {
  const {cartItemCount} = useApp();
  const {tabBarTranslateY} = useTabBar();
  const {palette: gp} = useGenderPalette();
  const {bottom: safeBottom} = useSafeAreaInsets();

  // Reanimated shared values for liquid blob
  const blobX = useSharedValue(state.index * TAB_WIDTH);
  const blobScaleX = useSharedValue(1);
  const blobScaleY = useSharedValue(1);
  const blobGlow = useSharedValue(1);
  const blobRotate = useSharedValue(0);
  const blobBorderRadius = useSharedValue(BLOB_SIZE / 2);

  const prevIndex = useRef(state.index);
  const isDragging = useRef(false);
  const dragStartPx = useRef(0);
  const navRef = useRef(navigation);
  const stateRef = useRef(state);
  navRef.current = navigation;
  stateRef.current = state;

  // Animate blob on tab change
  useEffect(() => {
    const idx = state.index;
    const prev = prevIndex.current;
    if (idx === prev || isDragging.current) return;

    const distance = Math.abs(idx - prev);
    const stretch = 1 + distance * 0.18;
    const direction = idx > prev ? 1 : -1;

    // Liquid movement
    blobX.value = withSpring(idx * TAB_WIDTH, LIQUID_SPRING);

    // Stretch horizontally, squash vertically — snappy settle
    blobScaleX.value = withSequence(
      withTiming(stretch, {duration: 80, easing: Easing.out(Easing.quad)}),
      withSpring(1, {damping: 14, stiffness: 200, mass: 0.4}),
    );
    blobScaleY.value = withSequence(
      withTiming(1 / stretch, {duration: 80, easing: Easing.out(Easing.quad)}),
      withSpring(1, {damping: 14, stiffness: 200, mass: 0.4}),
    );

    // Slight tilt in direction of movement
    blobRotate.value = withSequence(
      withTiming(direction * 4, {duration: 80}),
      withSpring(0, {damping: 14, stiffness: 120, mass: 0.4}),
    );

    // Morph border radius — subtle
    blobBorderRadius.value = withSequence(
      withTiming(BLOB_SIZE / 2 - 3, {duration: 80}),
      withSpring(BLOB_SIZE / 2, {damping: 14, stiffness: 160, mass: 0.4}),
    );

    blobGlow.value = withSequence(
      withTiming(1.08, {duration: 60}),
      withSpring(1, {damping: 14, stiffness: 160, mass: 0.4}),
    );

    prevIndex.current = idx;
  }, [state.index]);

  // Combined scale for blob
  const combinedScaleX = useDerivedValue(() => blobScaleX.value * blobGlow.value);
  const combinedScaleY = useDerivedValue(() => blobScaleY.value * blobGlow.value);

  const blobAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: blobX.value},
      {scaleX: combinedScaleX.value},
      {scaleY: combinedScaleY.value},
      {rotate: `${blobRotate.value}deg`},
    ],
    borderRadius: blobBorderRadius.value,
  }));

  // Specular highlight follows blob deformation
  const highlightStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + (blobGlow.value - 1) * 2,
    transform: [
      {scaleX: 1 / combinedScaleX.value},
      {scaleY: 0.8},
    ],
  }));

  // PanResponder
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 6,
    onPanResponderGrant: () => {
      isDragging.current = true;
      dragStartPx.current = prevIndex.current * TAB_WIDTH;
      blobGlow.value = withSpring(1.2, SNAP_SPRING);
    },
    onPanResponderMove: (_, g) => {
      const x = Math.max(0, Math.min(dragStartPx.current + g.dx, TAB_WIDTH * 4));
      blobX.value = x;
      const vel = Math.abs(g.vx);
      const s = Math.min(1 + vel * 0.25, 1.6);
      blobScaleX.value = s;
      blobScaleY.value = 1 / Math.sqrt(s);
      blobRotate.value = Math.max(-12, Math.min(g.vx * 4, 12));
      blobBorderRadius.value = BLOB_SIZE / 2 - Math.min(vel * 3, 8);
    },
    onPanResponderRelease: (_, g) => {
      isDragging.current = false;
      const x = Math.max(0, Math.min(dragStartPx.current + g.dx, TAB_WIDTH * 4));
      const idx = Math.max(0, Math.min(Math.round(x / TAB_WIDTH), 4));

      // Snap with subtle overshoot
      blobX.value = withSpring(idx * TAB_WIDTH, LIQUID_SPRING);
      blobScaleX.value = withSequence(
        withTiming(0.92, {duration: 50}),
        withSpring(1, {damping: 14, stiffness: 200, mass: 0.4}),
      );
      blobScaleY.value = withSequence(
        withTiming(1.08, {duration: 50}),
        withSpring(1, {damping: 14, stiffness: 200, mass: 0.4}),
      );
      blobRotate.value = withSpring(0, {damping: 14, stiffness: 120, mass: 0.4});
      blobBorderRadius.value = withSpring(BLOB_SIZE / 2, {damping: 14, stiffness: 160, mass: 0.4});
      blobGlow.value = withSequence(
        withTiming(1.05, {duration: 50}),
        withSpring(1, LIQUID_SPRING),
      );

      prevIndex.current = idx;
      // Show tab bar on drag-snap
      Animated.timing(tabBarTranslateY, {toValue: 0, duration: 200, useNativeDriver: true}).start();
      const s = stateRef.current;
      const nav = navRef.current;
      if (idx !== s.index) {
        nav.navigate(TABS[idx].name);
      }
    },
  }), []);

  // Hide tab bar when CartTab is active
  useEffect(() => {
    const isCart = TABS[state.index]?.name === 'CartTab';
    Animated.timing(tabBarTranslateY, {
      toValue: isCart ? 160 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [state.index, tabBarTranslateY]);

  const handlePress = useCallback((index: number, routeName: string) => {
    // Show tab bar when a non-cart tab is pressed
    if (TABS[index]?.name !== 'CartTab') {
      Animated.timing(tabBarTranslateY, {toValue: 0, duration: 200, useNativeDriver: true}).start();
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[index].key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  }, [navigation, state.routes, tabBarTranslateY]);

  return (
    <Animated.View
      style={[
        styles.outerWrap,
        {bottom: Math.max(safeBottom - 22, 2), transform: [{translateY: tabBarTranslateY}]},
      ]}>
      <View style={styles.pill}>
        {/* Hard glass background — solid frosted */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="ultraThinMaterialDark"
          blurAmount={50}
          reducedTransparencyFallbackColor="rgba(15, 12, 20, 0.92)"
        />
        <View style={styles.glassTint} />
        <View style={styles.topEdge} />

        <View style={styles.tabRow} {...pan.panHandlers}>
          {/* Liquid glass blob */}
          <ReAnimated.View
            style={[
              styles.blobOuter,
              {left: (TAB_WIDTH - BLOB_SIZE) / 2},
              blobAnimStyle,
            ]}>
            {/* Soft inner blur */}
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={30}
              reducedTransparencyFallbackColor="rgba(255,255,255,0.18)"
            />
            {/* 3D depth gradient */}
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.50)',
                'rgba(255,255,255,0.15)',
                'rgba(255,255,255,0.04)',
                'rgba(200,200,255,0.10)',
              ]}
              locations={[0, 0.3, 0.65, 1]}
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={StyleSheet.absoluteFill}
            />
            {/* Diagonal specular sheen */}
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.40)',
                'rgba(255,255,255,0.0)',
                'rgba(255,255,255,0.08)',
              ]}
              locations={[0, 0.45, 1]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
            />
            {/* Animated specular highlight */}
            <ReAnimated.View style={[styles.blobHighlight, highlightStyle]} />
            {/* Glass rim */}
            <View style={styles.blobRim} />
            {/* Inner bottom shadow for depth */}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.15)']}
              start={{x: 0.5, y: 0.4}}
              end={{x: 0.5, y: 1}}
              style={StyleSheet.absoluteFill}
            />
          </ReAnimated.View>

          {TABS.map((tab, index) => {
            const isActive = state.index === index;
            const isCart = tab.name === 'CartTab';

            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabButton}
                onPress={() => handlePress(index, tab.name)}
                activeOpacity={0.6}>
                <Icon
                  name={tab.icon}
                  size={22}
                  color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
                />
                {isCart && cartItemCount > 0 && (
                  <View style={[styles.cartBadge, {backgroundColor: gp.mid}]}>
                    <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    width: PILL_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  glassTint: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10, 8, 16, 0.5)',
  },
  topEdge: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  blobOuter: {
    position: 'absolute',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
    overflow: 'hidden',
    shadowColor: 'rgba(255,255,255,0.5)',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 8,
  },
  blobHighlight: {
    position: 'absolute',
    top: 2, left: 8, right: 8,
    height: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  blobRim: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: BLOB_SIZE / 2,
    borderWidth: 1.2,
    borderTopColor: 'rgba(255,255,255,0.55)',
    borderLeftColor: 'rgba(255,255,255,0.28)',
    borderRightColor: 'rgba(255,255,255,0.28)',
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
  },
  cartBadge: {
    position: 'absolute',
    top: 10,
    right: 8,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
