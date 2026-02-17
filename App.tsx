import React, {useState, useEffect, useCallback} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {AppProvider} from './src/context/AppContext';
import {HeroTransitionProvider} from './src/context/HeroTransitionContext';
import {TabBarProvider} from './src/context/TabBarContext';
import AppNavigator from './src/navigation/AppNavigator';
import ProductDetailOverlay from './src/components/ProductDetailOverlay';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

type AppScreen = 'splash' | 'onboarding' | 'main';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const onboardingDone = await AsyncStorage.getItem('@trenzo_onboarding_done');
        if (onboardingDone === 'true') {
          setHasCompletedOnboarding(true);
        }
      } catch (_e) {
        // ignore
      }
      setCheckingOnboarding(false);
    })();
  }, []);

  const handleSplashFinish = useCallback(() => {
    if (hasCompletedOnboarding) {
      setCurrentScreen('main');
    } else {
      setCurrentScreen('onboarding');
    }
  }, [hasCompletedOnboarding]);

  const handleOnboardingComplete = useCallback(async () => {
    await AsyncStorage.setItem('@trenzo_onboarding_done', 'true');
    setHasCompletedOnboarding(true);
    setCurrentScreen('main');
  }, []);

  // Don't render anything until we've checked onboarding status
  if (checkingOnboarding) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AppProvider>
          <TabBarProvider>
          <HeroTransitionProvider>
            <StatusBar barStyle="dark-content" />
            {currentScreen === 'splash' && (
              <SplashScreen onFinish={handleSplashFinish} />
            )}
            {currentScreen === 'onboarding' && (
              <OnboardingScreen onComplete={handleOnboardingComplete} />
            )}
            {currentScreen === 'main' && (
              <>
                <AppNavigator />
                <ProductDetailOverlay />
              </>
            )}
          </HeroTransitionProvider>
          </TabBarProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
