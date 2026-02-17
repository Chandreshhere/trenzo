import React, {useEffect, useRef} from 'react';
import {View, Text, Image, StyleSheet, Animated, StatusBar, Dimensions, Easing} from 'react-native';
import {COLORS, FONT_WEIGHTS, SIZES} from '../utils/theme';
import Icon from '../components/Icon';

const LOGO_IMG = require('../../assets/images /logo.png');

const {width} = Dimensions.get('window');
const W = width;

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({onFinish}: Props) {
  // Logo
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(20)).current;
  const logoSwing = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(1)).current;

  // Rider motion
  const riderProgress = useRef(new Animated.Value(0)).current; // 0 → 1 master timeline
  const riderBounce = useRef(new Animated.Value(0)).current;

  // Speed lines (4 lines)
  const speedLine1 = useRef(new Animated.Value(0)).current;
  const speedLine2 = useRef(new Animated.Value(0)).current;
  const speedLine3 = useRef(new Animated.Value(0)).current;
  const speedLine4 = useRef(new Animated.Value(0)).current;

  // Ground + sub tagline
  const groundOpacity = useRef(new Animated.Value(0)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous subtle bounce while riding
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(riderBounce, {
          toValue: -3, duration: 120, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(riderBounce, {
          toValue: 1, duration: 120, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
      ]),
    );

    // Speed lines loop - staggered flicker
    const speedLoop = Animated.loop(
      Animated.stagger(60, [
        Animated.sequence([
          Animated.timing(speedLine1, {toValue: 1, duration: 200, useNativeDriver: true}),
          Animated.timing(speedLine1, {toValue: 0, duration: 150, useNativeDriver: true}),
        ]),
        Animated.sequence([
          Animated.timing(speedLine2, {toValue: 1, duration: 180, useNativeDriver: true}),
          Animated.timing(speedLine2, {toValue: 0, duration: 130, useNativeDriver: true}),
        ]),
        Animated.sequence([
          Animated.timing(speedLine3, {toValue: 1, duration: 160, useNativeDriver: true}),
          Animated.timing(speedLine3, {toValue: 0, duration: 140, useNativeDriver: true}),
        ]),
        Animated.sequence([
          Animated.timing(speedLine4, {toValue: 1, duration: 190, useNativeDriver: true}),
          Animated.timing(speedLine4, {toValue: 0, duration: 120, useNativeDriver: true}),
        ]),
      ]),
    );

    // Pendulum swing loop — starts after logo appears
    const swingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoSwing, {
          toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(logoSwing, {
          toValue: -1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(logoSwing, {
          toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
      ]),
    );

    Animated.sequence([
      // Phase 1: Logo entrance (fast, punchy)
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1, damping: 14, mass: 0.6, stiffness: 200, useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {toValue: 1, duration: 350, useNativeDriver: true}),
        Animated.timing(logoY, {
          toValue: 0, duration: 400, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true,
        }),
      ]),

      // Phase 2: Tagline + ground line appear
      Animated.parallel([
        Animated.timing(tagOpacity, {toValue: 1, duration: 250, useNativeDriver: true}),
        Animated.timing(groundOpacity, {toValue: 1, duration: 300, useNativeDriver: true}),
      ]),

      // Phase 3: Rider zooms left → right across entire screen and exits
      Animated.parallel([
        Animated.timing(riderProgress, {
          toValue: 1,
          duration: 1400,
          easing: Easing.bezier(0.4, 0, 0.6, 1), // smooth S-curve, fast in middle
          useNativeDriver: true,
        }),
      ]),

      // Phase 4: Sub tagline
      Animated.timing(subOpacity, {toValue: 1, duration: 300, useNativeDriver: true}),

      // Phase 5: Hold
      Animated.delay(400),

      // Phase 6: Fade out
      Animated.timing(bgOpacity, {toValue: 0, duration: 350, useNativeDriver: true}),
    ]).start(() => {
      bounceLoop.stop();
      speedLoop.stop();
      swingLoop.stop();
      onFinish();
    });

    bounceLoop.start();
    speedLoop.start();
    swingLoop.start();

    return () => {
      bounceLoop.stop();
      speedLoop.stop();
      swingLoop.stop();
    };
  }, [logoScale, logoOpacity, logoY, logoSwing, tagOpacity, bgOpacity, riderProgress,
      riderBounce, speedLine1, speedLine2, speedLine3, speedLine4,
      groundOpacity, subOpacity, onFinish]);

  // Logo pendulum swing rotation (pivot from top center)
  const logoRotate = logoSwing.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  // --- Derived rider animations from master progress ---
  // Rider goes from far left off-screen → through center → far right off-screen
  const riderX = riderProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-W * 0.7, 0, W * 0.7],
  });

  // Rider tilts forward throughout (slight lean = speed feel)
  const riderTilt = riderProgress.interpolate({
    inputRange: [0, 0.15, 0.5, 0.85, 1],
    outputRange: ['-14deg', '-8deg', '-5deg', '-8deg', '-14deg'],
    extrapolate: 'clamp',
  });

  // Rider fades in quickly, stays visible, fades out at exit
  const riderOpacity = riderProgress.interpolate({
    inputRange: [0, 0.04, 0.88, 1],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });

  // Ghost trail 1 — follows slightly behind the main rider
  const ghost1X = riderProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-W * 0.7 - 40, -40, W * 0.7 - 40],
  });
  const ghost1Opacity = riderProgress.interpolate({
    inputRange: [0, 0.06, 0.85, 0.95],
    outputRange: [0, 0.3, 0.3, 0],
    extrapolate: 'clamp',
  });

  // Ghost trail 2 — follows further behind
  const ghost2X = riderProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-W * 0.7 - 80, -80, W * 0.7 - 80],
  });
  const ghost2Opacity = riderProgress.interpolate({
    inputRange: [0, 0.1, 0.82, 0.92],
    outputRange: [0, 0.18, 0.18, 0],
    extrapolate: 'clamp',
  });

  // Speed lines visibility (visible throughout ride)
  const speedVisible = riderProgress.interpolate({
    inputRange: [0, 0.06, 0.88, 0.96],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });

  // Ground shadow follows rider
  const shadowX = riderProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-W * 0.7, 0, W * 0.7],
  });
  const shadowScale = riderProgress.interpolate({
    inputRange: [0, 0.3, 0.5, 0.7, 1],
    outputRange: [0.5, 0.9, 1, 0.9, 0.5],
    extrapolate: 'clamp',
  });

  // Rider scale: grows slightly passing through center, smaller at edges
  const riderScaleAnim = riderProgress.interpolate({
    inputRange: [0, 0.3, 0.5, 0.7, 1],
    outputRange: [0.85, 1.05, 1.12, 1.05, 0.85],
    extrapolate: 'clamp',
  });

  // Speed line helper
  const makeSpeedLine = (anim: Animated.Value, yOffset: number, lineWidth: number) => ({
    opacity: Animated.multiply(anim, speedVisible),
    transform: [
      {translateX: riderX},
      {translateY: yOffset},
    ],
    width: lineWidth,
  });

  return (
    <Animated.View style={[st.container, {opacity: bgOpacity}]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Logo — swings from top like a pendulum */}
      <Animated.View style={[st.logoWrap, {
        opacity: logoOpacity,
        transform: [{scale: logoScale}, {translateY: logoY}, {rotate: logoRotate}],
      }]}>
        <Image source={LOGO_IMG} style={st.logoImg} resizeMode="contain" />
      </Animated.View>


      {/* ===== Delivery rider scene ===== */}
      <View style={st.scene}>

        {/* Ground line */}
        <Animated.View style={[st.ground, {opacity: groundOpacity}]}>
          <View style={st.groundLine} />
          {/* Dashes */}
          <View style={st.dashRow}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <View key={i} style={st.dash} />
            ))}
          </View>
        </Animated.View>

        {/* Ground shadow under rider */}
        <Animated.View style={[st.groundShadow, {
          opacity: riderOpacity,
          transform: [{translateX: shadowX}, {scaleX: shadowScale}],
        }]} />

        {/* Speed lines */}
        <Animated.View style={[st.speedLine, st.speedL1, makeSpeedLine(speedLine1, -18, 50)]} />
        <Animated.View style={[st.speedLine, st.speedL2, makeSpeedLine(speedLine2, -8, 35)]} />
        <Animated.View style={[st.speedLine, st.speedL3, makeSpeedLine(speedLine3, 2, 45)]} />
        <Animated.View style={[st.speedLine, st.speedL4, makeSpeedLine(speedLine4, -25, 28)]} />

        {/* Ghost trail 2 (furthest back) */}
        <Animated.View style={[st.ghost, {
          opacity: ghost2Opacity,
          transform: [{translateX: ghost2X}, {translateY: riderBounce}],
        }]}>
          <Icon name="motorbike" size={44} color="rgba(255,255,255,0.4)" family="materialCommunity" />
        </Animated.View>

        {/* Ghost trail 1 */}
        <Animated.View style={[st.ghost, {
          opacity: ghost1Opacity,
          transform: [{translateX: ghost1X}, {translateY: riderBounce}],
        }]}>
          <Icon name="motorbike" size={44} color="rgba(255,255,255,0.5)" family="materialCommunity" />
        </Animated.View>

        {/* Main rider */}
        <Animated.View style={[st.rider, {
          opacity: riderOpacity,
          transform: [
            {translateX: riderX},
            {translateY: riderBounce},
            {rotate: riderTilt},
            {scale: riderScaleAnim},
          ],
        }]}>
          {/* Package box */}
          <View style={st.packageBox}>
            <Icon name="cube-outline" size={13} color={COLORS.primary} family="ionicons" />
          </View>
          {/* Scooter */}
          <Icon name="motorbike" size={44} color={COLORS.white} family="materialCommunity" />
        </Animated.View>
      </View>

      {/* Sub tagline */}
      <Animated.View style={[st.subWrap, {opacity: subOpacity}]}>
        <View style={st.subLine} />
        <Text style={st.subText}>Get your style delivered in minutes</Text>
        <View style={st.subLine} />
      </Animated.View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  // Logo
  logoWrap: {alignItems: 'center', justifyContent: 'center', marginTop: 60, transformOrigin: 'center top'},
  logoImg: {
    width: W,
    height: W * 0.5,
  },
  tagline: {
    fontSize: SIZES.body,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 8,
    fontWeight: FONT_WEIGHTS.light,
    letterSpacing: 2,
  },

  // Rider scene
  scene: {
    width: W,
    height: 90,
    marginTop: 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  // Ground
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    alignItems: 'center',
  },
  groundLine: {
    width: W * 0.85,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
  },
  dashRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 6,
  },
  dash: {
    width: 14,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 1,
  },

  // Ground shadow
  groundShadow: {
    position: 'absolute',
    bottom: 3,
    width: 55,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  // Speed lines
  speedLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  speedL1: {bottom: 30, marginLeft: -90},
  speedL2: {bottom: 30, marginLeft: -80},
  speedL3: {bottom: 30, marginLeft: -70},
  speedL4: {bottom: 30, marginLeft: -100},

  // Ghost trails
  ghost: {
    position: 'absolute',
    bottom: 12,
  },

  // Main rider
  rider: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  packageBox: {
    marginRight: -4,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  // Sub tagline
  subWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    gap: 12,
  },
  subLine: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  subText: {
    fontSize: SIZES.caption,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
