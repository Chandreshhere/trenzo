import React, {createContext, useContext, useRef} from 'react';
import {Animated} from 'react-native';

interface TabBarContextType {
  tabBarTranslateY: Animated.Value;
}

const TabBarContext = createContext<TabBarContextType>({
  tabBarTranslateY: new Animated.Value(0),
});

export function TabBarProvider({children}: {children: React.ReactNode}) {
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;

  return (
    <TabBarContext.Provider value={{tabBarTranslateY}}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  return useContext(TabBarContext);
}
