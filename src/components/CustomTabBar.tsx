import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {COLORS, FONT_WEIGHTS} from '../utils/theme';
import {useApp} from '../context/AppContext';
import {useTabBar} from '../context/TabBarContext';
import Icon from './Icon';

const {width} = Dimensions.get('window');
const BAR_HEIGHT = 60;
const NOTCH_BG_SIZE = 68;
const CIRCLE_SIZE = 52;
const POP_OFFSET = -28;
const BOTTOM_INSET = Platform.OS === 'ios' ? 34 : 0;

const TABS = [
  {name: 'CategoriesTab', icon: 'grid'},
  {name: 'FavoritesTab', icon: 'heart'},
  {name: 'HomeTab', icon: 'home'},
  {name: 'CartTab', icon: 'shopping-bag'},
  {name: 'ProfileTab', icon: 'user'},
];

const HOME_INDEX = 2; // Home is center tab

interface Props {
  state: any;
  navigation: any;
}

export default function CustomTabBar({state, navigation}: Props) {
  const {cartItemCount} = useApp();
  const {tabBarTranslateY} = useTabBar();

  const tabAnims = useRef(
    TABS.map((_, i) => ({
      translateY: new Animated.Value(i === state.index ? POP_OFFSET : 0),
      circleScale: new Animated.Value(i === state.index ? 1 : 0),
    })),
  ).current;

  const prevIndex = useRef(state.index);

  useEffect(() => {
    const idx = state.index;
    const prev = prevIndex.current;
    if (idx === prev) return;

    Animated.parallel([
      // Previous tab: slide back down, hide circle
      Animated.spring(tabAnims[prev].translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }),
      Animated.timing(tabAnims[prev].circleScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      // New tab: pop up, show circle
      Animated.spring(tabAnims[idx].translateY, {
        toValue: POP_OFFSET,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }),
      Animated.spring(tabAnims[idx].circleScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }),
    ]).start();

    prevIndex.current = idx;
  }, [state.index, tabAnims]);

  const handlePress = (index: number, routeName: string) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[index].key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {transform: [{translateY: tabBarTranslateY}]},
      ]}>
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => {
          const isCart = tab.name === 'CartTab';

          // Crossfade icon color: gray when inactive, white when active
          const grayOpacity = tabAnims[index].circleScale.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          });

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => handlePress(index, tab.name)}
              activeOpacity={0.7}>
              <Animated.View
                style={[
                  styles.iconOuter,
                  {transform: [{translateY: tabAnims[index].translateY}]},
                ]}>
                {/* Background circle (creates notch/gap around colored circle) */}
                <Animated.View
                  style={[
                    styles.notchBg,
                    {transform: [{scale: tabAnims[index].circleScale}]},
                  ]}
                />
                {/* Primary colored circle */}
                <Animated.View
                  style={[
                    styles.activeCircle,
                    {transform: [{scale: tabAnims[index].circleScale}]},
                  ]}
                />
                {/* Gray icon (inactive) */}
                <Animated.View
                  style={[styles.iconPos, {opacity: grayOpacity}]}>
                  <Icon name={tab.icon} size={22} color="#ABABAB" />
                </Animated.View>
                {/* White icon (active) */}
                <Animated.View
                  style={[
                    styles.iconPos,
                    {opacity: tabAnims[index].circleScale},
                  ]}>
                  <Icon name={tab.icon} size={22} color="#FFFFFF" />
                </Animated.View>
                {/* Cart badge */}
                {isCart && cartItemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.bottomFill} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: BAR_HEIGHT,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'visible',
  },
  bottomFill: {
    backgroundColor: '#FFFFFF',
    height: BOTTOM_INSET,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
    overflow: 'visible',
  },
  iconOuter: {
    width: NOTCH_BG_SIZE,
    height: NOTCH_BG_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  notchBg: {
    position: 'absolute',
    width: NOTCH_BG_SIZE,
    height: NOTCH_BG_SIZE,
    borderRadius: NOTCH_BG_SIZE / 2,
    backgroundColor: COLORS.background,
  },
  activeCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: COLORS.tabBarActive,
    shadowColor: COLORS.tabBarActive,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconPos: {
    position: 'absolute',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.tabBarActive,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
