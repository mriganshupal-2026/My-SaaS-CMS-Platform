import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

interface PillButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'brand' | 'white' | 'dark' | 'outline-brand' | 'outline-white';
  size?: 'sm' | 'md' | 'lg';
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark';
}

export default function PillButton({
  children,
  variant = 'brand',
  size = 'md',
  iconRight,
  iconLeft,
  className = '',
  theme,
  ...props
}: PillButtonProps) {
  // If theme is provided, dynamically choose appropriate contrast styling
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase',
    md: 'px-5 py-2 text-sm font-medium tracking-wide uppercase',
    lg: 'px-7 py-3 text-base font-medium tracking-wide uppercase',
  }[size];

  let variantStyles = '';

  if (theme) {
    if (theme === 'dark') {
      // Over dark pink / black section
      variantStyles =
        'border border-white/90 text-white bg-transparent hover:bg-white hover:text-[#df0567] active:scale-95';
    } else {
      // Over light pink / white section
      variantStyles =
        'border border-[#df0567] text-[#df0567] bg-transparent hover:bg-[#df0567] hover:text-white active:scale-95';
    }
  } else {
    switch (variant) {
      case 'white':
        variantStyles =
          'border border-white text-white bg-transparent hover:bg-white hover:text-[#df0567] active:scale-95';
        break;
      case 'dark':
        variantStyles =
          'border border-[#0A0A0A] text-[#0A0A0A] bg-transparent hover:bg-[#0A0A0A] hover:text-white active:scale-95';
        break;
      case 'outline-brand':
        variantStyles =
          'border border-[#df0567] text-[#df0567] bg-transparent hover:bg-[#df0567] hover:text-white active:scale-95';
        break;
      case 'outline-white':
        variantStyles =
          'border border-white/80 text-white bg-transparent hover:bg-white hover:text-[#df0567] active:scale-95';
        break;
      case 'brand':
      default:
        variantStyles =
          'border border-[#df0567] text-[#df0567] bg-transparent hover:bg-[#df0567] hover:text-white active:scale-95';
        break;
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full cursor-pointer transition-all duration-200 select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#df0567]',
        sizeStyles,
        variantStyles,
        className
      )}
      {...props}
    >
      {iconLeft && <span className="inline-flex shrink-0 items-center">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="inline-flex shrink-0 items-center transition-transform group-hover:translate-x-0.5">{iconRight}</span>}
    </motion.button>
  );
}
