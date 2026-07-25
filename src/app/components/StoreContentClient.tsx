"use client";

import { useStore } from '../context/StoreContext';
import { Hero } from './Hero';
import { ProductGrid } from './ProductGrid';
import { AdminPanel } from './AdminPanel';
import { AdminLogin } from './AdminLogin';

export function StoreContentClient() {
  const { currentView, user } = useStore();

  if (currentView === 'products') {
    return <ProductGrid />;
  }

  if (currentView === 'admin') {
    return user ? <AdminPanel /> : <AdminLogin />;
  }

  return (
    <>
      <Hero />
      <ProductGrid />
    </>
  );
}
