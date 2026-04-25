'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const Blob = ({ color, size, top, left, delay = 0, opacity = [0.1, 0.2, 0.1] }: { 
  color: string, 
  size: string, 
  top: string, 
  left: string, 
  delay?: number,
  opacity?: number[]
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 60, stiffness: 40 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 30;
      const moveY = (clientY - window.innerHeight / 2) / 30;
      mouseX.set(moveX);
      mouseY.set(moveY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        x,
        y,
        zIndex: -10,
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: opacity,
      }}
      transition={{
        opacity: { duration: 30, repeat: Infinity, ease: "linear", delay },
      }}
    >
      <div 
        className="w-full h-full rounded-full blur-[240px] transform-gpu"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
};

export const InteractiveBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0a0a0f]">
      {/* Blending Layer */}
      <div 
        className="absolute inset-0 bg-indigo-500/[0.03] blur-[250px] transform-gpu"
      />
      
      {/* Top Left Blob (Pinkish - Moved higher) */}
      <Blob color="#FF0080" size="65vw" top="-60%" left="-30%" delay={10} opacity={[0.15, 0.3, 0.15]} />
      
      {/* Bottom Right Blob (Purple) */}
      <Blob color="var(--gradient-2)" size="65vw" top="50%" left="60%" delay={15} />
    </div>
  );
};
