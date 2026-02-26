import React from 'react';
import {View, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import {GenderPalette} from '../context/GenderPaletteContext';

const {width: SW} = Dimensions.get('window');
const CURTAIN_HEIGHT = 280;
const PULL_THRESHOLD = 120;
const FOLD_COUNT = 5;
const SCALLOP_COUNT = Math.ceil(SW / 18);

interface Props {
  scrollY: SharedValue<number>;
  palette: GenderPalette;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function CurtainRefresh({scrollY, palette, onRefresh, refreshing}: Props) {
  const hasTriggered = useSharedValue(false);
  const holdingOpen = useSharedValue(0);

  // When refreshing ends, snap curtain closed
  useAnimatedReaction(
    () => refreshing,
    (curr, prev) => {
      if (prev === true && curr === false) {
        holdingOpen.value = withTiming(0, {duration: 400});
      }
    },
  );

  const curtainStyle = useAnimatedStyle(() => {
    const pullAmount = Math.max(0, -scrollY.value);
    const holdOffset = holdingOpen.value;

    const effectivePull = Math.max(pullAmount, holdOffset);
    const progress = interpolate(
      effectivePull,
      [0, PULL_THRESHOLD * 0.3, PULL_THRESHOLD, PULL_THRESHOLD * 1.4],
      [0, 0.2, 1, 1.1],
      Extrapolation.CLAMP,
    );

    // Trigger refresh when crossing threshold on release
    if (pullAmount > PULL_THRESHOLD && !hasTriggered.value && !refreshing) {
      hasTriggered.value = true;
      holdingOpen.value = PULL_THRESHOLD * 0.7;
      scheduleOnRN(onRefresh);
    }
    if (pullAmount < 10 && hasTriggered.value) {
      hasTriggered.value = false;
    }

    const translateY = interpolate(
      progress,
      [0, 1, 1.1],
      [-CURTAIN_HEIGHT, 0, CURTAIN_HEIGHT * 0.04],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{translateY}],
      opacity: interpolate(progress, [0, 0.08], [0, 1], Extrapolation.CLAMP),
    };
  });

  const foldStyle = useAnimatedStyle(() => {
    const pullAmount = Math.max(0, -scrollY.value, holdingOpen.value);
    const progress = interpolate(pullAmount, [0, PULL_THRESHOLD], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: interpolate(progress, [0.15, 0.5], [0, 0.35], Extrapolation.CLAMP),
    };
  });

  const handStyle = useAnimatedStyle(() => {
    const pullAmount = Math.max(0, -scrollY.value, holdingOpen.value);
    const progress = interpolate(pullAmount, [0, PULL_THRESHOLD], [0, 1], Extrapolation.CLAMP);
    return {
      transform: [
        {translateY: interpolate(progress, [0, 1], [-30, 10], Extrapolation.CLAMP)},
        {scale: interpolate(progress, [0, 0.5, 1], [0.6, 0.9, 1.1], Extrapolation.CLAMP)},
        {rotate: `${interpolate(progress, [0, 1], [15, 0], Extrapolation.CLAMP)}deg`},
      ],
      opacity: interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.7], Extrapolation.CLAMP),
    };
  });

  const scallopStyle = useAnimatedStyle(() => {
    const pullAmount = Math.max(0, -scrollY.value, holdingOpen.value);
    const progress = interpolate(pullAmount, [0, PULL_THRESHOLD * 0.5], [0, 1], Extrapolation.CLAMP);
    return {opacity: progress};
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: CURTAIN_HEIGHT,
          zIndex: 50,
          overflow: 'visible',
        },
        curtainStyle,
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[palette.dark, palette.dark, palette.mid + 'DD', palette.mid + '99']}
        locations={[0, 0.4, 0.75, 1]}
        style={{flex: 1, overflow: 'hidden'}}
      >
        {/* Fabric texture - vertical grain */}
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: 0.04,
          }}
        />

        {/* Fold lines */}
        <Animated.View style={[{flex: 1, justifyContent: 'space-evenly', paddingVertical: 30}, foldStyle]}>
          {Array.from({length: FOLD_COUNT}).map((_, i) => (
            <View
              key={i}
              style={{
                height: 1,
                marginHorizontal: 24,
                backgroundColor: palette.lightest,
                opacity: 0.2 + (i % 2) * 0.08,
              }}
            />
          ))}
        </Animated.View>

        {/* Hand icon at bottom center */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 28,
              alignSelf: 'center',
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: palette.dark,
              borderWidth: 1.5,
              borderColor: palette.mid,
              alignItems: 'center',
              justifyContent: 'center',
            },
            handStyle,
          ]}
        >
          <Icon name="hand-left-outline" size={22} color={palette.lightest} family="ionicons" />
        </Animated.View>
      </LinearGradient>

      {/* Scalloped bottom edge */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: -9,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
          },
          scallopStyle,
        ]}
      >
        {Array.from({length: SCALLOP_COUNT}).map((_, i) => (
          <View
            key={i}
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: palette.dark,
              marginHorizontal: -1,
            }}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
}
