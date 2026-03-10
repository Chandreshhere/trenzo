import React, {createContext, useContext, useState, useRef, ReactNode} from 'react';
import {Animated, Platform} from 'react-native';
import {useTheme} from './ThemeContext';

export interface GenderPalette {
  lightest: string;
  light: string;
  mid: string;
  dark: string;
}

export const GENDER_PALETTES: Record<'Men' | 'Women', GenderPalette> = {
  Men: {lightest: '#F0EBFF', light: '#8B72FF', mid: '#4100F5', dark: '#000000'},
  Women: {lightest: '#FFE8F0', light: '#FF6EB4', mid: '#F037A5', dark: '#1A0B12'},
};

interface GenderPaletteContextType {
  activeGender: 'Men' | 'Women';
  palette: GenderPalette;
  setActiveGender: (gender: 'Men' | 'Women') => void;
  /** 0 = Men, 1 = Women — animated value for smooth color interpolation */
  genderMix: Animated.Value;
  /** Interpolated animated colors */
  animatedColors: {
    lightest: Animated.AnimatedInterpolation<string>;
    light: Animated.AnimatedInterpolation<string>;
    mid: Animated.AnimatedInterpolation<string>;
    dark: Animated.AnimatedInterpolation<string>;
    /** Men=#CDF564, Women=Women.mid — accent color for buttons/badges */
    accent: Animated.AnimatedInterpolation<string>;
    /** Men=#4100F5, Women=Women.mid — accent color for text only */
    textAccent: Animated.AnimatedInterpolation<string>;
    /** Men=#0D0033, Women=#1A0B12 — container background */
    containerBg: Animated.AnimatedInterpolation<string>;
  };
}

const GenderPaletteContext = createContext<GenderPaletteContextType | undefined>(undefined);

export function GenderPaletteProvider({children}: {children: ReactNode}) {
  const {setActiveGender: setThemeGender} = useTheme();
  const [activeGender, setActiveGenderState] = useState<'Men' | 'Women'>('Men');
  const targetGenderRef = useRef<'Men' | 'Women'>('Men');
  const palette = GENDER_PALETTES[activeGender];
  const genderMix = useRef(new Animated.Value(0)).current;

  const setActiveGender = (gender: 'Men' | 'Women') => {
    if (gender === activeGender && gender === targetGenderRef.current) return;
    targetGenderRef.current = gender;
    setActiveGenderState(gender);
    setThemeGender(gender);
    // Android: shorter animation for snappy feel, iOS: smooth 500ms
    const duration = Platform.OS === 'android' ? 250 : 500;
    genderMix.stopAnimation();
    Animated.timing(genderMix, {
      toValue: gender === 'Women' ? 1 : 0,
      duration,
      useNativeDriver: false,
    }).start();
  };

  const animatedColors = {
    lightest: genderMix.interpolate({inputRange: [0, 1], outputRange: [GENDER_PALETTES.Men.lightest, GENDER_PALETTES.Women.lightest]}),
    light: genderMix.interpolate({inputRange: [0, 1], outputRange: [GENDER_PALETTES.Men.light, GENDER_PALETTES.Women.light]}),
    mid: genderMix.interpolate({inputRange: [0, 1], outputRange: [GENDER_PALETTES.Men.mid, GENDER_PALETTES.Women.mid]}),
    dark: genderMix.interpolate({inputRange: [0, 1], outputRange: [GENDER_PALETTES.Men.dark, GENDER_PALETTES.Women.dark]}),
    accent: genderMix.interpolate({inputRange: [0, 1], outputRange: ['#CDF564', GENDER_PALETTES.Women.mid]}),
    textAccent: genderMix.interpolate({inputRange: [0, 1], outputRange: [GENDER_PALETTES.Men.mid, GENDER_PALETTES.Women.mid]}),
    containerBg: genderMix.interpolate({inputRange: [0, 1], outputRange: ['#0D0033', '#1A0B12']}),
  };

  return (
    <GenderPaletteContext.Provider value={{activeGender, palette, setActiveGender, genderMix, animatedColors}}>
      {children}
    </GenderPaletteContext.Provider>
  );
}

export function useGenderPalette() {
  const context = useContext(GenderPaletteContext);
  if (!context) {
    throw new Error('useGenderPalette must be used within GenderPaletteProvider');
  }
  return context;
}
