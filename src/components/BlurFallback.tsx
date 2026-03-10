import React from 'react';
import {Platform, View, ViewStyle, StyleProp} from 'react-native';
import {BlurView as RNBlurView} from '@react-native-community/blur';

interface Props {
  blurType?: 'dark' | 'light' | 'xlight' | 'prominent' | 'regular' | 'extraDark' | 'chromeMaterial' | 'chromeMaterialDark' | 'chromeMaterialLight' | 'material' | 'materialDark' | 'materialLight' | 'thickMaterial' | 'thickMaterialDark' | 'thickMaterialLight' | 'thinMaterial' | 'thinMaterialDark' | 'thinMaterialLight' | 'ultraThinMaterial' | 'ultraThinMaterialDark' | 'ultraThinMaterialLight';
  blurAmount?: number;
  reducedTransparencyFallbackColor?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const BLUR_BG: Record<string, string> = {
  dark: 'rgba(0,0,0,0.78)',
  xlight: 'rgba(255,255,255,0.88)',
  light: 'rgba(255,255,255,0.72)',
  prominent: 'rgba(0,0,0,0.65)',
  regular: 'rgba(128,128,128,0.55)',
  extraDark: 'rgba(0,0,0,0.88)',
  chromeMaterial: 'rgba(40,40,40,0.82)',
  chromeMaterialDark: 'rgba(15,12,20,0.88)',
  chromeMaterialLight: 'rgba(240,240,240,0.85)',
  material: 'rgba(30,30,30,0.78)',
  materialDark: 'rgba(15,15,15,0.85)',
  materialLight: 'rgba(245,245,245,0.82)',
  thickMaterial: 'rgba(25,25,25,0.85)',
  thickMaterialDark: 'rgba(10,10,10,0.9)',
  thickMaterialLight: 'rgba(250,250,250,0.9)',
  thinMaterial: 'rgba(30,30,30,0.65)',
  thinMaterialDark: 'rgba(15,15,15,0.7)',
  thinMaterialLight: 'rgba(245,245,245,0.68)',
  ultraThinMaterial: 'rgba(20,20,20,0.55)',
  ultraThinMaterialDark: 'rgba(15,12,20,0.92)',
  ultraThinMaterialLight: 'rgba(250,250,250,0.55)',
};

export default function BlurFallback({blurType = 'dark', blurAmount = 10, reducedTransparencyFallbackColor, style, children}: Props) {
  if (Platform.OS === 'ios') {
    return (
      <RNBlurView blurType={blurType} blurAmount={blurAmount} reducedTransparencyFallbackColor={reducedTransparencyFallbackColor} style={style}>
        {children}
      </RNBlurView>
    );
  }

  const bg = reducedTransparencyFallbackColor || BLUR_BG[blurType] || BLUR_BG.dark;
  return (
    <View style={[{backgroundColor: bg}, style]}>
      {children}
    </View>
  );
}
