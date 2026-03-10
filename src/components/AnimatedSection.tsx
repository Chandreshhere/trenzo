import React, {useCallback} from 'react';
import {LayoutChangeEvent, ViewStyle, StyleProp, Dimensions, Platform} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  scrollY: SharedValue<number>;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  slideDistance?: number;
  disabled?: boolean;
}

export default function AnimatedSection({
  scrollY,
  children,
  style,
  delay = 0,
  slideDistance = 30,
  disabled = false,
}: Props) {
  const sectionY = useSharedValue(0);
  const hasAppeared = useSharedValue(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      sectionY.value = e.nativeEvent.layout.y;
    },
    [sectionY],
  );

  const animatedStyle = useAnimatedStyle(() => {
    if (disabled) {
      return {opacity: 1, transform: [{translateY: 0}]};
    }

    const triggerPoint = sectionY.value - SCREEN_HEIGHT * 0.9;

    if (scrollY.value > triggerPoint && hasAppeared.value === 0) {
      hasAppeared.value = delay > 0
        ? withDelay(delay, withTiming(1, {duration: 500}))
        : withTiming(1, {duration: 500});
    }

    return {
      opacity: interpolate(hasAppeared.value, [0, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            hasAppeared.value,
            [0, 1],
            [slideDistance, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  // Skip animated sections on Android for performance — they cause frame drops
  if (disabled || Platform.OS === 'android') {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  return (
    <Animated.View onLayout={onLayout} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
