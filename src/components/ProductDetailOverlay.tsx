import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  PanResponder,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {Product, formatPrice} from '../data/products';
import {useHeroTransition} from '../context/HeroTransitionContext';
import {useApp} from '../context/AppContext';
import Icon from './Icon';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette, GenderPalette} from '../context/GenderPaletteContext';

const {width: SW, height: SH} = Dimensions.get('window');
const TOP_INSET = Platform.OS === 'ios' ? 54 : 36;

const CARD_H = SH * 0.82;
const CARD_W = SW * 0.92;
const CARD_TOP = (SH - CARD_H) / 2;
const CARD_LEFT = (SW - CARD_W) / 2;
const CARD_R = 24;
const CARD_IMG_H = CARD_H * 0.55;
const FULL_IMG_H = SH * 0.44;
const EXPAND_DRAG = 150;
const PEEK = 16;
const CARD_GAP = 16;

export default function ProductDetailOverlay() {
  const {colors, isDark} = useTheme();
  const {activeGender, palette: gp} = useGenderPalette();
  const st = useMemo(() => createStyles(colors, isDark, gp), [colors, isDark, activeGender]);
  const {isOpen, product, products, sourceRect, closeProduct} = useHeroTransition();
  const {state, dispatch} = useApp();

  // openProgress: source rect → 85% card
  // expandProgress: 85% card → 100% fullscreen (drives ALL transitions)
  const openProgress = useRef(new Animated.Value(0)).current;
  const expandProgress = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const swipeX = useRef(new Animated.Value(0)).current;

  const [isRendered, setIsRendered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [openComplete, setOpenComplete] = useState(false);
  const isSwipingRef = useRef(false);

  const scrollRef = useRef<ScrollView>(null);
  const isCollapsingRef = useRef(false);
  const expandedRef = useRef(false);
  const gestureMode = useRef<'none' | 'swipe' | 'expand' | 'collapse'>('none');
  const wasBouncingRef = useRef(false);
  const scrollYRef = useRef(0);

  const currentProduct = products[currentIndex] || product;
  const isFavorite = currentProduct ? state.favorites.includes(currentProduct.id) : false;

  const resetAll = useCallback(() => {
    // Stop any running animations before resetting to prevent
    // "JS driven animation on native node" errors
    openProgress.stopAnimation();
    expandProgress.stopAnimation();
    bgOpacity.stopAnimation();
    swipeX.stopAnimation();
    openProgress.setValue(0);
    expandProgress.setValue(0);
    bgOpacity.setValue(0);
    swipeX.setValue(0);
    setExpanded(false);
    expandedRef.current = false;
    setJustAdded(false);
    setSelectedImageIdx(0);
    isCollapsingRef.current = false;
    setIsSwiping(false);
    isSwipingRef.current = false;
    setOpenComplete(false);
  }, [openProgress, expandProgress, bgOpacity, swipeX]);

  // OPEN
  useEffect(() => {
    if (isOpen && product && sourceRect) {
      resetAll();
      const idx = products.findIndex(p => p.id === product.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
      setIsRendered(true);

      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(openProgress, {
            toValue: 1, damping: 28, mass: 0.8, stiffness: 220, useNativeDriver: false,
          }),
          Animated.timing(bgOpacity, {
            toValue: 1, duration: 280, useNativeDriver: true,
          }),
        ]).start(() => setOpenComplete(true));
      });
    }
  }, [isOpen, product, sourceRect, products, resetAll, openProgress, bgOpacity]);

  // CLOSE
  const handleClose = useCallback(() => {
    // Hide peek cards immediately so they don't fly around during close
    setOpenComplete(false);

    const doClose = () => {
      Animated.parallel([
        Animated.spring(openProgress, {
          toValue: 0, damping: 28, mass: 0.8, stiffness: 220, useNativeDriver: false,
        }),
        Animated.timing(bgOpacity, {
          toValue: 0, duration: 250, useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRendered(false);
        closeProduct();
      });
    };

    if (expandedRef.current) {
      isCollapsingRef.current = true;
      wasBouncingRef.current = false;
      scrollRef.current?.scrollTo({y: 0, animated: true});
      Animated.spring(expandProgress, {
        toValue: 0, damping: 24, mass: 0.7, stiffness: 200, useNativeDriver: false,
      }).start(() => {
        setExpanded(false);
        expandedRef.current = false;
        isCollapsingRef.current = false;
        doClose();
      });
    } else {
      doClose();
    }
  }, [openProgress, expandProgress, bgOpacity, closeProduct]);

  // COLLAPSE back to card (button tap)
  const handleCollapse = useCallback(() => {
    if (!expandedRef.current || isCollapsingRef.current) {return;}
    isCollapsingRef.current = true;
    wasBouncingRef.current = false;
    scrollRef.current?.scrollTo({y: 0, animated: true});
    Animated.spring(expandProgress, {
      toValue: 0, damping: 26, mass: 0.7, stiffness: 200, useNativeDriver: false,
    }).start(() => {
      setExpanded(false);
      expandedRef.current = false;
      isCollapsingRef.current = false;
    });
  }, [expandProgress]);

  // PanResponder: horizontal carousel swipe + real-time vertical expand
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const snapToCard = useCallback((newIndex: number, direction: 'left' | 'right') => {
    if (isSwipingRef.current) {return;}
    isSwipingRef.current = true;
    setIsSwiping(true);
    const snapDist = CARD_W + CARD_GAP;
    const toValue = direction === 'left' ? -snapDist : snapDist;

    Animated.spring(swipeX, {
      toValue, damping: 24, mass: 0.9, stiffness: 200, useNativeDriver: false,
    }).start(() => {
      // Update product state first
      setCurrentIndex(newIndex);
      setSelectedImageIdx(0);
      setSelectedSize(products[newIndex].sizes[0]);
      setSelectedColor(products[newIndex].colors[0]);
      setJustAdded(false);
      // Wait for React to render new content before resetting position
      // This prevents a flash of old content at center
      requestAnimationFrame(() => {
        swipeX.setValue(0);
        isSwipingRef.current = false;
        setIsSwiping(false);
      });
    });
  }, [products, swipeX]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    // Capture phase: intercept pull-down collapse BEFORE ScrollView gets it
    onMoveShouldSetPanResponderCapture: (_, g) => {
      if (expandedRef.current && !isSwipingRef.current && !isCollapsingRef.current
          && scrollYRef.current <= 2 && g.dy > 10 && Math.abs(g.dy) > Math.abs(g.dx) * 1.5) {
        gestureMode.current = 'collapse';
        return true;
      }
      return false;
    },
    onMoveShouldSetPanResponder: (_, g) => {
      if (expandedRef.current || isSwipingRef.current) {return false;}
      const ax = Math.abs(g.dx);
      const ay = Math.abs(g.dy);
      if (ax > 10 && ax > ay * 1.2) {return true;}
      if (g.dy < -8 && ay > ax * 1.3) {return true;}
      return false;
    },
    onPanResponderGrant: () => {
      if (gestureMode.current !== 'collapse') {
        gestureMode.current = 'none';
      }
    },
    onPanResponderMove: (_, g) => {
      // Collapse: pull down when expanded
      if (gestureMode.current === 'collapse') {
        const progress = Math.max(0, 1 - Math.max(0, g.dy) / EXPAND_DRAG);
        expandProgress.setValue(progress);
        return;
      }
      // Card mode gestures
      if (gestureMode.current === 'none') {
        if (Math.abs(g.dx) > Math.abs(g.dy) + 3) {
          gestureMode.current = 'swipe';
        } else if (g.dy < -5) {
          gestureMode.current = 'expand';
        }
      }
      if (gestureMode.current === 'swipe') {
        let dx = g.dx * 0.85;
        const idx = currentIndexRef.current;
        if (idx === 0 && dx > 0) {dx *= 0.3;}
        if (idx === products.length - 1 && dx < 0) {dx *= 0.3;}
        swipeX.setValue(dx);
      } else if (gestureMode.current === 'expand') {
        const progress = Math.min(1, Math.max(0, -g.dy / EXPAND_DRAG));
        expandProgress.setValue(progress);
      }
    },
    onPanResponderRelease: (_, g) => {
      const mode = gestureMode.current;
      gestureMode.current = 'none';

      if (mode === 'collapse') {
        const progress = 1 - Math.max(0, g.dy) / EXPAND_DRAG;
        if (progress < 0.7 || g.vy > 0.8) {
          // Commit collapse
          isCollapsingRef.current = true;
          wasBouncingRef.current = false;
          Animated.spring(expandProgress, {
            toValue: 0, damping: 26, mass: 0.7, stiffness: 200, useNativeDriver: false,
          }).start(() => {
            setExpanded(false);
            expandedRef.current = false;
            isCollapsingRef.current = false;
            scrollRef.current?.scrollTo({y: 0, animated: false});
          });
        } else {
          // Cancel collapse
          Animated.spring(expandProgress, {
            toValue: 1, damping: 26, mass: 0.7, stiffness: 220, useNativeDriver: false,
          }).start();
        }
        return;
      }
      if (mode === 'swipe') {
        const idx = currentIndexRef.current;
        if ((g.dx < -40 || g.vx < -0.5) && idx < products.length - 1) {
          snapToCard(idx + 1, 'left');
        } else if ((g.dx > 40 || g.vx > 0.5) && idx > 0) {
          snapToCard(idx - 1, 'right');
        } else {
          Animated.spring(swipeX, {toValue: 0, friction: 8, useNativeDriver: false}).start();
        }
      } else if (mode === 'expand') {
        const progress = Math.min(1, Math.max(0, -g.dy / EXPAND_DRAG));
        if (progress > 0.3 || g.vy < -0.5) {
          setExpanded(true);
          expandedRef.current = true;
          Animated.spring(expandProgress, {
            toValue: 1, damping: 26, mass: 0.7, stiffness: 200, useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(expandProgress, {
            toValue: 0, damping: 26, mass: 0.7, stiffness: 220, useNativeDriver: false,
          }).start();
        }
      }
    },
  }), [swipeX, expandProgress, products.length, snapToCard]);

  // Track scroll position + iOS bounce collapse fallback
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    scrollYRef.current = y;

    // iOS bounce visual feedback (backup collapse mechanism)
    if (y < 0 && expandedRef.current && !isCollapsingRef.current && gestureMode.current !== 'collapse') {
      wasBouncingRef.current = true;
      const progress = Math.max(0, 1 + y / EXPAND_DRAG);
      expandProgress.setValue(progress);
    } else if (wasBouncingRef.current && y >= 0) {
      wasBouncingRef.current = false;
      expandProgress.setValue(1);
    }
  }, [expandProgress]);

  // iOS bounce: detect finger release during pull-down
  const handleScrollEndDrag = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const vy = e.nativeEvent.velocity?.y ?? 0;

    if (y < 0 && expandedRef.current && !isCollapsingRef.current) {
      const progress = 1 + y / EXPAND_DRAG;
      // vy < 0 means contentOffset is moving negative (pulling down)
      if (progress < 0.7 || vy < -1.0) {
        isCollapsingRef.current = true;
        wasBouncingRef.current = false;
        Animated.spring(expandProgress, {
          toValue: 0, damping: 26, mass: 0.7, stiffness: 200, useNativeDriver: false,
        }).start(() => {
          setExpanded(false);
          expandedRef.current = false;
          isCollapsingRef.current = false;
          scrollRef.current?.scrollTo({y: 0, animated: false});
        });
      }
    }
  }, [expandProgress]);

  const handleAddToCart = useCallback(() => {
    if (!currentProduct) {return;}
    dispatch({
      type: 'ADD_TO_CART',
      payload: {product: currentProduct, quantity: 1, selectedSize, selectedColor},
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }, [currentProduct, selectedSize, selectedColor, dispatch]);

  const handleToggleFavorite = useCallback(() => {
    if (!currentProduct) {return;}
    dispatch({type: 'TOGGLE_FAVORITE', payload: currentProduct.id});
  }, [currentProduct, dispatch]);

  if (!isRendered || !product || !sourceRect) {return null;}

  // --- Card position/size interpolations (all clamped to prevent spring overshoot glitches) ---
  const cardLeft = Animated.add(
    openProgress.interpolate({inputRange: [0, 1], outputRange: [sourceRect.x, CARD_LEFT], extrapolate: 'clamp'}),
    expandProgress.interpolate({inputRange: [0, 1], outputRange: [0, -CARD_LEFT], extrapolate: 'clamp'}),
  );
  const cardTop = Animated.add(
    openProgress.interpolate({inputRange: [0, 1], outputRange: [sourceRect.y, CARD_TOP], extrapolate: 'clamp'}),
    expandProgress.interpolate({inputRange: [0, 1], outputRange: [0, -CARD_TOP], extrapolate: 'clamp'}),
  );
  const cardWidth = Animated.add(
    openProgress.interpolate({inputRange: [0, 1], outputRange: [sourceRect.width, CARD_W], extrapolate: 'clamp'}),
    expandProgress.interpolate({inputRange: [0, 1], outputRange: [0, SW - CARD_W], extrapolate: 'clamp'}),
  );
  const cardHeight = Animated.add(
    openProgress.interpolate({inputRange: [0, 1], outputRange: [sourceRect.height, CARD_H], extrapolate: 'clamp'}),
    expandProgress.interpolate({inputRange: [0, 1], outputRange: [0, SH - CARD_H], extrapolate: 'clamp'}),
  );
  const cardBorderRadius = Animated.add(
    openProgress.interpolate({inputRange: [0, 1], outputRange: [SIZES.radiusLg, CARD_R], extrapolate: 'clamp'}),
    expandProgress.interpolate({inputRange: [0, 1], outputRange: [0, -CARD_R], extrapolate: 'clamp'}),
  );

  // --- Content interpolations driven by expandProgress ---
  const imageHeight = expandProgress.interpolate({
    inputRange: [0, 1], outputRange: [CARD_IMG_H, FULL_IMG_H], extrapolate: 'clamp',
  });
  const swipeHintOpacity = expandProgress.interpolate({
    inputRange: [0, 0.25], outputRange: [1, 0], extrapolate: 'clamp',
  });
  const detailsOpacity = expandProgress.interpolate({
    inputRange: [0.3, 0.7], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const detailsSlideY = expandProgress.interpolate({
    inputRange: [0.3, 1], outputRange: [20, 0], extrapolate: 'clamp',
  });
  const topBarOpacity = expandProgress.interpolate({
    inputRange: [0.5, 0.85], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const bottomBarOpacity = expandProgress.interpolate({
    inputRange: [0.5, 0.9], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const cardFavOpacity = expandProgress.interpolate({
    inputRange: [0, 0.3], outputRange: [1, 0], extrapolate: 'clamp',
  });
  const peekOpacity = expandProgress.interpolate({
    inputRange: [0, 0.15], outputRange: [1, 0], extrapolate: 'clamp',
  });

  // Card left including swipe offset — the whole card slides during swipe
  const cardLeftWithSwipe = Animated.add(cardLeft, swipeX);

  // Peek card positions: offset from the main card position
  const prevPeekLeft = Animated.add(
    cardLeftWithSwipe,
    openProgress.interpolate({inputRange: [0, 1], outputRange: [0, -(CARD_W + CARD_GAP)], extrapolate: 'clamp'}),
  );
  const nextPeekLeft = Animated.add(
    cardLeftWithSwipe,
    openProgress.interpolate({inputRange: [0, 1], outputRange: [0, CARD_W + CARD_GAP], extrapolate: 'clamp'}),
  );

  const prevProduct = currentIndex > 0 ? products[currentIndex - 1] : null;
  const nextProduct = currentIndex < products.length - 1 ? products[currentIndex + 1] : null;

  const hasDiscount = currentProduct?.originalPrice && currentProduct.originalPrice > currentProduct.price;
  const discountPercent = hasDiscount
    ? Math.round(((currentProduct!.originalPrice! - currentProduct!.price) / currentProduct!.originalPrice!) * 100)
    : 0;

  return (
    <View style={st.overlay} pointerEvents={isRendered ? 'auto' : 'none'}>
      <StatusBar barStyle="light-content" animated />

      {/* Dim background */}
      <Animated.View style={[st.bg, {opacity: bgOpacity}]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1} />
      </Animated.View>

      {/* Close button (card mode - outside card) */}
      {!expanded && (
        <Animated.View style={[st.closeBtn, {opacity: bgOpacity}]}>
          <TouchableOpacity style={st.closeBtnInner} onPress={handleClose}>
            <Icon name="x" size={20} color={gp.lightest} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Page indicator */}
      {!expanded && products.length > 1 && (
        <Animated.View style={[st.pageInd, {opacity: bgOpacity}]}>
          <Text style={st.pageText}>{currentIndex + 1} / {products.length}</Text>
        </Animated.View>
      )}

      {/* ===== PEEK CARDS (siblings, not children of card — avoids overflow clip) ===== */}
      {openComplete && !expanded && prevProduct && (
        <Animated.View
          style={[st.peekCard, {left: prevPeekLeft, top: cardTop, height: cardHeight, opacity: peekOpacity}]}
          pointerEvents="none">
          <View style={[st.peekImg, {height: CARD_IMG_H}]}>
            <Image source={{uri: prevProduct.images[0]}} style={st.imgFull} resizeMode="cover" />
            {prevProduct.discount ? (
              <View style={st.badge}><Text style={st.badgeText}>{prevProduct.discount}% OFF</Text></View>
            ) : null}
          </View>
          <View style={st.peekContent}>
            <Text style={st.brand}>{prevProduct.brand}</Text>
            <Text style={st.name} numberOfLines={2}>{prevProduct.name}</Text>
            <View style={st.priceRow}>
              <Text style={st.price}>{formatPrice(prevProduct.price)}</Text>
            </View>
          </View>
        </Animated.View>
      )}
      {openComplete && !expanded && nextProduct && (
        <Animated.View
          style={[st.peekCard, {left: nextPeekLeft, top: cardTop, height: cardHeight, opacity: peekOpacity}]}
          pointerEvents="none">
          <View style={[st.peekImg, {height: CARD_IMG_H}]}>
            <Image source={{uri: nextProduct.images[0]}} style={st.imgFull} resizeMode="cover" />
            {nextProduct.discount ? (
              <View style={st.badge}><Text style={st.badgeText}>{nextProduct.discount}% OFF</Text></View>
            ) : null}
          </View>
          <View style={st.peekContent}>
            <Text style={st.brand}>{nextProduct.brand}</Text>
            <Text style={st.name} numberOfLines={2}>{nextProduct.name}</Text>
            <View style={st.priceRow}>
              <Text style={st.price}>{formatPrice(nextProduct.price)}</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ===== THE CARD — whole card slides with swipeX ===== */}
      <Animated.View
        style={[
          st.card,
          {left: cardLeftWithSwipe, top: cardTop, width: cardWidth, height: cardHeight, borderRadius: cardBorderRadius},
        ]}
        {...panResponder.panHandlers}>

        {/* Top bar (collapse + fav) - appears during expansion */}
        <Animated.View style={[st.topBar, {opacity: topBarOpacity}]} pointerEvents={expanded ? 'auto' : 'none'}>
          <TouchableOpacity style={st.topBtn} onPress={handleCollapse}>
            <Icon name="chevron-down" size={22} color={gp.lightest} />
          </TouchableOpacity>
          <TouchableOpacity style={st.topBtn} onPress={handleToggleFavorite}>
            <Icon name="heart" size={20}
              color={isFavorite ? '#FF4757' : gp.light}
              family={isFavorite ? 'ionicons' : 'feather'} />
          </TouchableOpacity>
        </Animated.View>

        {/* Single unified ScrollView — no inner swipeX wrapper needed */}
        <ScrollView
          ref={scrollRef}
          style={{flex: 1}}
          scrollEnabled={expanded}
          showsVerticalScrollIndicator={false}
          bounces={expanded}
          onScroll={handleScroll}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={8}>

          {/* Product Image */}
          <Animated.View style={[st.imgWrap, {height: imageHeight}]}>
            <Image source={{uri: currentProduct.images[selectedImageIdx]}} style={st.imgFull} resizeMode="cover" />
            {currentProduct.images.length > 1 && (
              <View style={st.imgDots}>
                {currentProduct.images.map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setSelectedImageIdx(i)}
                    style={[st.imgDot, i === selectedImageIdx && st.imgDotActive]} />
                ))}
              </View>
            )}
            {currentProduct.discount ? (
              <View style={st.badge}><Text style={st.badgeText}>{currentProduct.discount}% OFF</Text></View>
            ) : null}
            <Animated.View style={[st.imgFavWrap, {opacity: cardFavOpacity}]} pointerEvents={expanded ? 'none' : 'auto'}>
              <TouchableOpacity style={st.imgFav} onPress={handleToggleFavorite}>
                <Icon name="heart" size={16}
                  color={isFavorite ? '#FF4757' : gp.light}
                  family={isFavorite ? 'ionicons' : 'feather'} />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Content section */}
          <View style={st.content}>
            {/* Pull bar - shows during expansion */}
            <Animated.View style={[st.pullInd, {opacity: detailsOpacity}]}>
              <View style={st.pullBar} />
            </Animated.View>

            {/* Basic info - ALWAYS visible */}
            <Text style={st.brand}>{currentProduct.brand}</Text>
            <Text style={st.name} numberOfLines={expanded ? undefined : 2}>{currentProduct.name}</Text>
            <View style={st.priceRow}>
              <Text style={st.price}>{formatPrice(currentProduct.price)}</Text>
              {currentProduct.originalPrice && (
                <Text style={st.origPrice}>{formatPrice(currentProduct.originalPrice)}</Text>
              )}
              {hasDiscount && (
                <View style={st.discBadge}>
                  <Text style={st.discText}>{discountPercent}% OFF</Text>
                </View>
              )}
            </View>
            <View style={st.ratingRow}>
              <Icon name="star" size={13} color="#F5A623" family="ionicons" />
              <Text style={st.rating}>{currentProduct.rating}</Text>
              <Text style={st.reviews}>({currentProduct.reviews} reviews)</Text>
            </View>

            {/* Swipe hint - fades out during expansion */}
            <Animated.View style={[st.swipeArea, {opacity: swipeHintOpacity}]} pointerEvents={expanded ? 'none' : 'auto'}>
              {products.length > 1 && (
                <View style={st.swipeHint}>
                  <Icon name="chevron-left" size={14} color={currentIndex > 0 ? gp.light : 'transparent'} />
                  <Text style={st.swipeText}>Swipe to browse</Text>
                  <Icon name="chevron-right" size={14} color={currentIndex < products.length - 1 ? gp.light : 'transparent'} />
                </View>
              )}
              <View style={st.scrollBar}><View style={st.scrollBarInner} /></View>
            </Animated.View>

            {/* Detail sections - fade in during expansion */}
            <Animated.View style={{opacity: detailsOpacity, transform: [{translateY: detailsSlideY}]}}
              pointerEvents={expanded ? 'auto' : 'none'}>
              <Text style={st.secLabel}>Description</Text>
              <Text style={st.desc}>{currentProduct.description}</Text>

              <Text style={st.secLabel}>Size</Text>
              <View style={st.optRow}>
                {currentProduct.sizes.map(sz => (
                  <TouchableOpacity key={sz}
                    style={[st.sizeChip, selectedSize === sz && st.sizeAct]}
                    onPress={() => setSelectedSize(sz)}>
                    <Text style={[st.sizeTxt, selectedSize === sz && st.sizeTxtAct]}>{sz}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={st.secLabel}>Color</Text>
              <View style={st.optRow}>
                {currentProduct.colors.map(clr => (
                  <TouchableOpacity key={clr}
                    style={[st.colorChip, {backgroundColor: clr}, selectedColor === clr && st.colorAct]}
                    onPress={() => setSelectedColor(clr)}>
                    {selectedColor === clr && (
                      <Icon name="check" size={14} color={isLightColor(clr) ? COLORS.black : COLORS.white} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={st.delCard}>
                <Icon name="zap" size={16} color={gp.mid} />
                <View style={{flex: 1}}>
                  <Text style={st.delTitle}>Express Delivery</Text>
                  <Text style={st.delSub}>Get it within 30 minutes</Text>
                </View>
              </View>

              <View style={{height: 110}} />
            </Animated.View>
          </View>
        </ScrollView>

        {/* Bottom CTA bar - fades in with expansion */}
        <Animated.View style={[st.bottomBar, {opacity: bottomBarOpacity}]} pointerEvents={expanded ? 'auto' : 'none'}>
          <View>
            <Text style={st.btmLabel}>Total Price</Text>
            <Text style={st.btmPrice}>{formatPrice(currentProduct.price)}</Text>
          </View>
          <TouchableOpacity
            style={[st.cartBtn, justAdded && st.cartBtnOk]}
            onPress={handleAddToCart} activeOpacity={0.85}>
            {justAdded ? (
              <><Icon name="check" size={18} color={gp.lightest} /><Text style={st.cartTxt}>Added!</Text></>
            ) : (
              <><Icon name="shopping-bag" size={18} color={gp.lightest} /><Text style={st.cartTxt}>Add to Cart</Text></>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) {return false;}
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

const createStyles = (colors: any, isDark: boolean, gp: GenderPalette) => StyleSheet.create({
  overlay: {...StyleSheet.absoluteFillObject, zIndex: 1000},
  bg: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)'},

  closeBtn: {position: 'absolute', top: TOP_INSET, left: 20, zIndex: 1010},
  closeBtnInner: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
  },
  pageInd: {
    position: 'absolute', top: TOP_INSET + 8, alignSelf: 'center', zIndex: 1010,
    backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
  },
  pageText: {color: gp.lightest, fontSize: 12, fontWeight: FONT_WEIGHTS.semiBold, fontFamily: FONTS.sans},

  card: {
    position: 'absolute', overflow: 'hidden', backgroundColor: gp.dark, zIndex: 1005,
    ...SHADOWS.large,
  },

  // Top bar overlay (expanded)
  topBar: {
    position: 'absolute', top: TOP_INSET, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 20,
  },
  topBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },

  // Image
  imgWrap: {backgroundColor: gp.lightest + '18', overflow: 'hidden'},
  imgFull: {width: '100%', height: '100%'},
  imgDots: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  imgDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: gp.light},
  imgDotActive: {width: 18, backgroundColor: gp.mid},
  badge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: gp.mid, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: {color: gp.lightest, fontSize: 11, fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.sans},
  imgFavWrap: {position: 'absolute', top: 12, right: 12},
  imgFav: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center',
  },

  // Content
  content: {paddingHorizontal: 20, paddingTop: 12},
  pullInd: {alignItems: 'center', paddingBottom: 6},
  pullBar: {width: 36, height: 4, borderRadius: 2, backgroundColor: gp.lightest + '18'},

  brand: {
    fontSize: 11, color: gp.light, fontFamily: FONTS.sans,
    fontWeight: FONT_WEIGHTS.medium, textTransform: 'uppercase', letterSpacing: 1,
  },
  name: {
    fontSize: SIZES.h4, fontFamily: FONTS.serif, fontWeight: FONT_WEIGHTS.bold,
    color: gp.lightest, marginTop: 4, lineHeight: 24,
  },
  priceRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8},
  price: {fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: gp.lightest, fontFamily: FONTS.sans},
  origPrice: {fontSize: SIZES.body, color: gp.light, textDecorationLine: 'line-through', fontFamily: FONTS.sans},
  discBadge: {backgroundColor: gp.mid, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6},
  discText: {fontSize: 11, fontWeight: FONT_WEIGHTS.bold, color: gp.lightest, fontFamily: FONTS.sans},
  ratingRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4},
  rating: {fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: gp.lightest, fontFamily: FONTS.sans},
  reviews: {fontSize: SIZES.bodySmall, color: gp.light, fontFamily: FONTS.sans},

  // Swipe hint area (card mode)
  swipeArea: {marginTop: 'auto', paddingTop: 16, paddingBottom: 14, alignItems: 'center'},
  swipeHint: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10},
  swipeText: {fontSize: 12, color: gp.light, fontFamily: FONTS.sans},
  scrollBar: {alignItems: 'center'},
  scrollBarInner: {width: 40, height: 4, borderRadius: 2, backgroundColor: gp.lightest + '18'},

  // Detail sections
  secLabel: {
    fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: gp.lightest,
    fontFamily: FONTS.sans, marginTop: 22, marginBottom: 10,
  },
  desc: {fontSize: SIZES.body, color: gp.light, fontFamily: FONTS.sans, lineHeight: 22},
  optRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  sizeChip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: SIZES.radiusMd,
    backgroundColor: gp.lightest + '18', borderWidth: 1.5, borderColor: gp.lightest + '18',
  },
  sizeAct: {borderColor: gp.mid, backgroundColor: gp.mid},
  sizeTxt: {fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.medium, color: gp.lightest, fontFamily: FONTS.sans},
  sizeTxtAct: {color: gp.lightest, fontWeight: FONT_WEIGHTS.bold},
  colorChip: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  colorAct: {borderColor: gp.mid},
  delCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: gp.lightest + '18',
    padding: 14, borderRadius: SIZES.radiusMd, marginTop: 22, gap: 12,
  },
  delTitle: {fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.semiBold, color: gp.lightest, fontFamily: FONTS.sans},
  delSub: {fontSize: SIZES.caption, color: gp.light, fontFamily: FONTS.sans, marginTop: 2},

  // Peek cards (adjacent carousel cards)
  peekCard: {
    position: 'absolute', width: CARD_W, zIndex: 1004,
    backgroundColor: gp.dark, borderRadius: CARD_R, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  peekImg: {backgroundColor: gp.lightest + '18', overflow: 'hidden'},
  peekContent: {paddingHorizontal: 20, paddingTop: 12},

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: gp.lightest + '18', borderTopWidth: 1, borderTopColor: gp.lightest + '18',
  },
  btmLabel: {fontSize: SIZES.caption, color: gp.light, fontFamily: FONTS.sans},
  btmPrice: {fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: gp.lightest, fontFamily: FONTS.sans},
  cartBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: gp.mid,
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: SIZES.radiusFull, gap: 8, ...SHADOWS.medium,
  },
  cartBtnOk: {backgroundColor: colors.success},
  cartTxt: {fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: gp.lightest, fontFamily: FONTS.sans},
});
