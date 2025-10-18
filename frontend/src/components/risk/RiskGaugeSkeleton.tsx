import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface RiskGaugeSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RiskGaugeSkeleton({ 
  size = 'md', 
  className = '' 
}: RiskGaugeSkeletonProps) {
  // Size configuration
  const sizeConfig = {
    sm: { size: 120, text: 'text-2xl', subtext: 'text-sm' },
    md: { size: 200, text: 'text-4xl', subtext: 'text-base' },
    lg: { size: 280, text: 'text-5xl', subtext: 'text-lg' },
  }[size];

  return (
    <div 
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{ width: `${sizeConfig.size}px`, height: `${sizeConfig.size}px` }}
    >
      {/* Circular background */}
      <Skeleton 
        className="absolute rounded-full" 
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      
      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Score */}
        <Skeleton 
          className={`h-10 w-20 mb-1 ${sizeConfig.text}`}
        />
        
        {/* Risk level */}
        <Skeleton 
          className={`h-4 w-24 mb-1 ${sizeConfig.subtext}`}
        />
        
        {/* Trend indicator */}
        <Skeleton 
          className="h-3 w-16 mt-1"
        />
      </div>
      
      {/* Legend items */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  );
}

export default RiskGaugeSkeleton;
