import React, {useCallback} from 'react';
import {LayoutChangeEvent, ImageSourcePropType, StyleProp, ViewStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';

interface Props {
  scrollY: SharedValue<number>;
  source: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  parallaxMultiplier?: number;
  resizeMode?: 'cover' | 'contain';
}

export default function ParallaxImage({
  scrollY,
  source,
  style,
  parallaxMultiplier = 0.25,
  resizeMode = 'cover',
}: Props) {
  const imageY = useSharedValue(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      imageY.value = e.nativeEvent.layout.y;
    },
    [imageY],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const offset = (scrollY.value - imageY.value) * parallaxMultiplier;
    return {
      transform: [{translateY: offset}],
    };
  });

  return (
    <Animated.View onLayout={onLayout} style={[{overflow: 'hidden'}, style]}>
      <Animated.Image
        source={source}
        style={[{width: '100%', height: '130%'}, animatedStyle]}
        resizeMode={resizeMode}
      />
    </Animated.View>
  );
}
