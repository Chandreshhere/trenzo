import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react';
import {Product, PRODUCTS} from '../data/products';

export interface SourceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HeroTransitionContextType {
  isOpen: boolean;
  product: Product | null;
  products: Product[];
  sourceRect: SourceRect | null;
  openProduct: (product: Product, rect: SourceRect, allProducts?: Product[]) => void;
  closeProduct: () => void;
}

const HeroTransitionContext = createContext<HeroTransitionContextType | undefined>(undefined);

export function HeroTransitionProvider({children}: {children: ReactNode}) {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [sourceRect, setSourceRect] = useState<SourceRect | null>(null);

  const openProduct = useCallback((p: Product, rect: SourceRect, allProducts?: Product[]) => {
    setProduct(p);
    setSourceRect(rect);
    setProducts(allProducts || PRODUCTS);
    setIsOpen(true);
  }, []);

  const closeProduct = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setProduct(null);
      setSourceRect(null);
    }, 400);
  }, []);

  return (
    <HeroTransitionContext.Provider
      value={{isOpen, product, products, sourceRect, openProduct, closeProduct}}>
      {children}
    </HeroTransitionContext.Provider>
  );
}

export function useHeroTransition() {
  const context = useContext(HeroTransitionContext);
  if (!context) {
    throw new Error('useHeroTransition must be used within HeroTransitionProvider');
  }
  return context;
}
