import React, {useEffect, useRef} from 'react';
import {View, Image, StyleSheet, Animated, StatusBar, Dimensions, Easing} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const LOGO_IMG = require('../../assets/images /logo.png');

const {width: W, height: H} = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({onFinish}: Props) {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(20)).current;
  const logoSwing = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
      // Phase 1: Logo entrance
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1, damping: 14, mass: 0.6, stiffness: 200, useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {toValue: 1, duration: 350, useNativeDriver: true}),
        Animated.timing(logoY, {
          toValue: 0, duration: 400, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true,
        }),
      ]),

      // Phase 2: Hold
      Animated.delay(1200),

      // Phase 3: Fade out
      Animated.timing(bgOpacity, {toValue: 0, duration: 350, useNativeDriver: true}),
    ]).start(() => {
      swingLoop.stop();
      onFinish();
    });

    swingLoop.start();

    return () => {
      swingLoop.stop();
    };
  }, [logoScale, logoOpacity, logoY, logoSwing, bgOpacity, onFinish]);

  const logoRotate = logoSwing.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  return (
    <Animated.View style={[styles.container, {opacity: bgOpacity}]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#0D0033', '#000000', '#1A0B12']}
        locations={[0, 0.5, 1]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.logoWrap, {
        opacity: logoOpacity,
        transform: [
          {scale: logoScale},
          {translateY: logoY},
          {translateY: -(W * 0.7) * 0.25},
          {rotate: logoRotate},
          {translateY: (W * 0.7) * 0.25},
        ],
      }]}>
        <Image source={LOGO_IMG} style={styles.logoImg} resizeMode="contain" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: {
    width: W * 0.7,
    height: W * 0.7,
  },
});
