'use client';

import React from 'react';
import { Moon, Sun, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={18} />;
      case 'amoled':
        return <Zap size={18} />;
      default:
        return <Moon size={18} />;
    }
  };

  const getTitle = () => {
    switch (theme) {
      case 'light':
        return 'Light mode (click for AMOLED)';
      case 'amoled':
        return 'AMOLED mode (click for Dark)';
      default:
        return 'Dark mode (click for Light)';
    }
  };

  return (
    <button
      className="btn-control"
      onClick={cycleTheme}
      title={getTitle()}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
