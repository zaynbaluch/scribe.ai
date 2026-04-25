'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import Logo from '@/components/ui/logo';

export default function LandingNavbar() {
  const { scrollY } = useScroll();
  
  const headerHeight = useTransform(scrollY, [0, 100], ['64px', '56px']);
  const headerBg = useTransform(scrollY, [0, 100], ['rgba(10, 10, 15, 0.3)', 'rgba(10, 10, 15, 0.7)']);
  const headerBorder = useTransform(scrollY, [0, 100], ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.15)']);
  const headerBlur = useTransform(scrollY, [0, 100], ['blur(16px)', 'blur(24px)']);

  return (
    <motion.header 
      style={{ 
        height: headerHeight, 
        backgroundColor: headerBg, 
        borderBottomColor: headerBorder, 
        backdropFilter: headerBlur,
        WebkitBackdropFilter: headerBlur 
      }}
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 z-50 border-b transition-all duration-300"
    >
      <Link href="/" className="flex items-center gap-2 group">
        <Logo size={24} className="text-white group-hover:scale-110 transition-transform" />
        <span className="font-display font-bold text-xl tracking-tight text-white">Scribe.ai</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
          Log in
        </Link>
        <Link href="/login" className="hidden md:inline-flex px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
          Get Started
        </Link>
      </div>
    </motion.header>
  );
}
