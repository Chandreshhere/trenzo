import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Rect} from 'react-native-svg';

const {width: W, height: H} = Dimensions.get('window');

// ── Pre-generate grain dots ──
const GRAIN_COUNT = 600;
const GRAIN_DOTS = Array.from({length: GRAIN_COUNT}, (_, i) => ({
  x: Math.random() * W,
  y: Math.random() * H,
  size: Math.random() * 2.5 + 0.5,
  opacity: Math.random() * 0.35 + 0.05,
}));

const GrainOverlay = React.memo(() => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
      {GRAIN_DOTS.map((dot, i) => (
        <Rect
          key={i}
          x={dot.x}
          y={dot.y}
          width={dot.size}
          height={dot.size}
          fill={`rgba(255,255,255,${dot.opacity})`}
        />
      ))}
    </Svg>
  </View>
));

// ── Cascading columns images ──
const COL_IMAGES = [
  [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
  ],
  [
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
    'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400',
  ],
  [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
    'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400',
    'https://images.unsplash.com/photo-1502716119720-b23a1e3b9c8d?w=400',
    'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400',
  ],
];

const CARD_W = (W - 48) / 3;
const CARD_H = CARD_W * 1.55;
const COL_GAP = 8;

interface Props {
  onComplete: () => void;
}

// ── Looping Column Component ──
const LoopingColumn = ({images, direction, speed}: {images: string[]; direction: 'up' | 'down'; speed: number}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const totalH = images.length * (CARD_H + COL_GAP);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, speed]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: direction === 'up' ? [0, -totalH] : [-totalH, 0],
  });

  // Triple the images for seamless loop
  const tripled = [...images, ...images, ...images];

  return (
    <View style={{width: CARD_W, height: H * 0.72, overflow: 'hidden'}}>
      <Animated.View style={{transform: [{translateY}]}}>
        {tripled.map((uri, i) => (
          <View key={`col-${i}`} style={{
            width: CARD_W, height: CARD_H, borderRadius: 14,
            overflow: 'hidden', marginBottom: COL_GAP,
          }}>
            <Image source={{uri}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
          </View>
        ))}
      </Animated.View>

      {/* Top fade — blend into gradient bg */}
      <LinearGradient
        colors={['rgba(20,0,120,0.95)', 'rgba(20,0,120,0.5)', 'transparent']}
        locations={[0, 0.5, 1]}
        style={{position: 'absolute', top: 0, left: 0, right: 0, height: 80}}
      />

      {/* Bottom fade — blend into gradient bg */}
      <LinearGradient
        colors={['transparent', 'rgba(8,0,18,0.6)', 'rgba(8,0,18,0.98)']}
        locations={[0, 0.4, 1]}
        style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 100}}
      />
    </View>
  );
};

export default function OnboardingScreen({onComplete}: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Gradient base */}
      <LinearGradient
        colors={['#4100F5', '#0A0015', '#F037A5']}
        locations={[0, 0.45, 1]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      {/* Film grain */}
      <GrainOverlay />

      {/* 3 looping columns */}
      <View style={styles.columnsWrap}>
        <LoopingColumn images={COL_IMAGES[0]} direction="up" speed={18000} />
        <LoopingColumn images={COL_IMAGES[1]} direction="down" speed={22000} />
        <LoopingColumn images={COL_IMAGES[2]} direction="up" speed={15000} />
      </View>

      {/* Heavy bottom fade — blends into gradient bg */}
      <LinearGradient
        colors={['transparent', 'rgba(8,0,18,0.55)', 'rgba(8,0,18,0.92)', 'rgba(10,0,21,1)']}
        locations={[0, 0.2, 0.45, 0.65]}
        style={styles.bottomFade}
      />

      {/* Text overlay at bottom */}
      <View style={styles.pageTextBottom}>
        <Text style={styles.pageBadge}>CLOSET X</Text>
        <Text style={styles.pageTitle}>Discover{'\n'}Your Style</Text>
        <Text style={styles.pageSub}>
          Thousands of curated pieces from{'\n'}top brands & indie designers
        </Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={onComplete}
          activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  columnsWrap: {
    flexDirection: 'row',
    gap: COL_GAP,
    paddingHorizontal: 16,
    position: 'absolute',
    top: -CARD_H * 0.5,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: H * 0.65,
  },
  pageTextBottom: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
  },
  pageBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CDF564',
    letterSpacing: 3,
    fontFamily: 'Helvetica',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 44,
    fontFamily: 'Poppins',
    letterSpacing: -0.5,
  },
  pageSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 22,
    fontFamily: 'Poppins',
    fontWeight: '400',
    marginTop: 12,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 55,
    alignItems: 'center',
  },
  nextButton: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 100,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#CDF564',
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica',
  },
});
