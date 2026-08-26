import React from 'react';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  showText?: boolean;
  iconSize?: string;
  textSize?: string;
  theme?: 'light' | 'dark';
}

export function LogoIcon({ className = 'h-10 w-10', ...props }: React.ComponentPropsWithoutRef<'img'>) {
  return (
    <img
      src="/p.png"
      alt="pTracker"
      className={`${className} object-contain`}
      {...props}
    />
  );
}

export function Logo({
  showText = true,
  iconSize = 'h-8 w-8',
  textSize = 'text-[20px]',
  theme = 'light',
  className = '',
  ...props
}: LogoProps) {
  const heightClass = iconSize.split(' ').find(c => c.startsWith('h-18')) || 'h-14';

  if (showText) {
    return (
      <div className={`flex items-center select-none ${className}`} {...props}>
        <img
          src="/logo.png"
          alt="Project Tracker"
          className={`${heightClass} w-auto object-contain`}
        />
      </div>
    );
  }

  return <LogoIcon className={iconSize} />;
}


