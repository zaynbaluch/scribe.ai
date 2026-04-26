'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const phrases = [
  "ascent.",
  "edge.",
  "success.",
  "legacy."
];

export const TypewriterEffect = () => {
  const [index, setIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(80);

  useEffect(() => {
    const handleType = () => {
      const fullText = phrases[index];
      
      if (!isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        setSpeed(80);
        
        if (currentText === fullText) {
          setTimeout(() => setIsDeleting(true), 1500);
          setSpeed(60);
        }
      } else {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        setSpeed(40);
        
        if (currentText === "") {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    };

    const timer = setTimeout(handleType, speed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, index, speed]);

  return (
    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-1)] via-[var(--gradient-2)] to-[var(--gradient-3)]">
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
        className="inline-block w-[2px] h-[0.9em] ml-1 bg-[var(--gradient-2)] align-middle"
      />
    </span>
  );
};
