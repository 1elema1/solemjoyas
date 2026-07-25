"use client";

import { StoreProvider, Product, HomeContent } from '../context/StoreContext';

export function StoreProviderWrapper({
  children,
  initialProducts,
  initialHome,
}: {
  children: React.ReactNode;
  initialProducts?: Product[];
  initialHome?: HomeContent | null;
}) {
  return (
    <StoreProvider
      initialProducts={initialProducts}
      initialHome={initialHome}
    >
      {children}
    </StoreProvider>
  );
}
