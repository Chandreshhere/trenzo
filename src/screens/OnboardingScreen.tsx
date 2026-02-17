import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import {COLORS, FONT_WEIGHTS, SIZES} from '../utils/theme';

const {width, height} = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Discover\nYour Style',
    subtitle: 'Browse thousands of curated fashion pieces from top brands and indie designers.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
    bgColor: '#1A3B8A',
  },
  {
    id: '2',
    title: 'Quick\nDelivery',
    subtitle: 'Get your favorite fashion items delivered in minutes, not days. Speed meets style.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
    bgColor: '#8B6F5E',
  },
  {
    id: '3',
    title: 'Effortless\nShopping',
    subtitle: 'A seamless, beautiful shopping experience designed for the modern fashion lover.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
    bgColor: '#5B7C6B',
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({onComplete}: Props) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({index: currentIndex + 1});
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const renderItem = ({item, index}: {item: typeof ONBOARDING_DATA[0]; index: number}) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const imageScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });
    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });
    const textTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, 30],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, {width}]}>
        <View style={styles.imageContainer}>
          <Animated.View style={{transform: [{scale: imageScale}]}}>
            <Image
              source={{uri: item.image}}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={[styles.imageOverlay, {backgroundColor: item.bgColor}]} />
          </Animated.View>
        </View>
        <Animated.View
          style={[
            styles.textContainer,
            {opacity: textOpacity, transform: [{translateY: textTranslateY}]},
          ]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_DATA.map((_, index) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {width: dotWidth, opacity: dotOpacity},
                ]}
              />
            );
          })}
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.midGray,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.75,
    height: height * 0.4,
    borderRadius: SIZES.radiusXl,
    overflow: 'hidden',
    marginTop: 60,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  textContainer: {
    paddingHorizontal: 40,
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 42,
    fontFamily: 'Poppins',
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: SIZES.radiusFull,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: 0.5,
    fontFamily: 'Poppins',
  },
});
