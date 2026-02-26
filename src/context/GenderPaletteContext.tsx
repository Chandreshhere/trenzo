import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react';

export interface GenderPalette {
  lightest: string;
  light: string;
  mid: string;
  dark: string;
}

export const GENDER_PALETTES: Record<'Men' | 'Women', GenderPalette> = {
  Men: {lightest: '#E7F0FA', light: '#7BA4D0', mid: '#2E5E99', dark: '#0D2440'},
  Women: {lightest: '#F7E8EC', light: '#C57C8A', mid: '#732C3F', dark: '#1A0B12'},
};

interface GenderPaletteContextType {
  activeGender: 'Men' | 'Women';
  palette: GenderPalette;
  setActiveGender: (gender: 'Men' | 'Women') => void;
}

const GenderPaletteContext = createContext<GenderPaletteContextType | undefined>(undefined);

export function GenderPaletteProvider({children}: {children: ReactNode}) {
  const [activeGender, setActiveGender] = useState<'Men' | 'Women'>('Men');
  const palette = GENDER_PALETTES[activeGender];

  return (
    <GenderPaletteContext.Provider value={{activeGender, palette, setActiveGender}}>
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
