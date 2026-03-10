import React from 'react';
import {View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette} from '../context/GenderPaletteContext';

export default function GenderGradientBg() {
  const {isDark} = useTheme();
  const {activeGender} = useGenderPalette();

  if (isDark) {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {activeGender === 'Men' ? (
          <>
            <LinearGradient
              colors={['rgba(65,0,245,0.35)', 'rgba(26,0,85,0.15)', 'transparent']}
              locations={[0, 0.4, 1]}
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={{position: 'absolute', top: 0, left: 0, right: 0, height: 400}}
            />
            <LinearGradient
              colors={['transparent', '#000000']}
              locations={[0, 1]}
              style={{position: 'absolute', top: 350, left: 0, right: 0, height: 300}}
            />
          </>
        ) : (
          <>
            <LinearGradient
              colors={['rgba(240,55,165,0.35)', 'rgba(51,0,31,0.15)', 'transparent']}
              locations={[0, 0.4, 1]}
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={{position: 'absolute', top: 0, left: 0, right: 0, height: 400}}
            />
            <LinearGradient
              colors={['transparent', '#000000']}
              locations={[0, 1]}
              style={{position: 'absolute', top: 350, left: 0, right: 0, height: 300}}
            />
          </>
        )}
      </View>
    );
  }

  // Light mode
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {activeGender === 'Men' ? (
        <LinearGradient
          colors={['#B499FF', '#D4C6FF', '#EDE8FF', '#FAFAFA', '#FAFAFA']}
          locations={[0, 0.12, 0.28, 0.5, 1]}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <LinearGradient
          colors={['#FF99CC', '#FFBDD9', '#FFE8F0', '#FAFAFA', '#FAFAFA']}
          locations={[0, 0.12, 0.28, 0.5, 1]}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  );
}
