import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface RevealTextProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  as?: 'div' | 'span' | 'h1' | 'h2' | 'h3' | 'p';
}

export default function RevealText({
  children,
  delay = 0,
  duration = 0.8,
  className = '',
  direction = 'up',
  as = 'div',
}: RevealTextProps) {
  const getInitial = () => {
    switch (direction) {
      case 'up':
        return { y: '105%', opacity: 0 };
      case 'down':
        return { y: '-105%', opacity: 0 };
      case 'left':
        return { x: '100%', opacity: 0 };
      case 'right':
        return { x: '-100%', opacity: 0 };
    }
  };

  const Component = motion[as] as typeof motion.div;

  return (
    <div className={cn('overflow-hidden inline-block leading-tight', className)}>
      <Component
        initial={getInitial()}
        whileInView={{ y: 0, x: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration,
          delay,
          ease: [0.215, 0.61, 0.355, 1], // cinematic cubic-bezier
        }}
        className="will-change-transform"
      >
        {children}
      </Component>
    </div>
  );
}
