import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface SocialIconButtonProps {
  id?: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export default function SocialIconButton({
  id,
  icon,
  label,
  href,
  onClick,
  theme = 'dark',
  size = '2xl',
  className = '',
}: SocialIconButtonProps) {
  const sizeClasses = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl',
    '2xl': 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-2xl sm:text-3xl md:text-4xl',
  }[size];

  const isDark = theme === 'dark';

  const content = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'group relative inline-flex items-center justify-center rounded-full overflow-hidden border cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isDark
          ? 'border-white/70 border-[1px] focus-visible:ring-white'
          : 'border-[#df0567]/70 border-[1px] focus-visible:ring-[#df0567]',
        sizeClasses,
        className
      )}
      aria-label={label}
    >
      {/* Center-expanding smooth background fill */}
      <span
        className={cn(
          'absolute inset-0 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out origin-center pointer-events-none will-change-transform',
          isDark ? 'bg-white' : 'bg-[#df0567]'
        )}
      />

      {/* Icon with smooth color transition */}
      <span
        className={cn(
          'relative z-10 flex items-center justify-center transition-colors duration-300 ease-out',
          isDark
            ? 'text-white group-hover:text-[#df0567]'
            : 'text-[#df0567] group-hover:text-white'
        )}
      >
        {icon}
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <a
        id={id}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="inline-block"
      >
        {content}
      </a>
    );
  }

  return (
    <button id={id} type="button" onClick={onClick} aria-label={label} className="inline-block">
      {content}
    </button>
  );
}
