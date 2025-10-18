import { useEffect, useState, memo } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskGaugeSkeleton } from './RiskGaugeSkeleton';
import { RiskErrorBoundary } from './RiskErrorBoundary';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

type RiskGaugeProps = {
  score: number;
  level: 'low' | 'medium' | 'high';
  trend?: 'increasing' | 'decreasing' | 'stable';
  lastUpdated?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
};

// Memoized gauge arc component
const GaugeArc = memo(({ 
  level, 
  size, 
  strokeWidth, 
  circumference,
  offset 
}: { 
  level: 'low' | 'medium' | 'high'; 
  size: number; 
  strokeWidth: number; 
  circumference: number; 
  offset: number;
}) => {
  const colors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444'
  };

  return (
    <circle
      cx="50%"
      cy="50%"
      r={size / 2 - strokeWidth / 2}
      fill="none"
      stroke={colors[level]}
      strokeWidth={strokeWidth}
      strokeDasharray={`${circumference} ${circumference}`}
      strokeDashoffset={offset}
      transform="rotate(-90 50 50)"
      className="transition-all duration-500 ease-in-out"
    />
  );
});

const RiskGaugeComponent = ({
  score,
  level = 'medium',
  trend,
  lastUpdated,
  className,
  size = 'md',
  isLoading = false
}: RiskGaugeProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  // Memoize size configuration
  const { size: gaugeSize, strokeWidth, textSize } = {
    sm: { size: 32, strokeWidth: 4, textSize: 'text-xs' },
    md: { size: 40, strokeWidth: 6, textSize: 'text-sm' },
    lg: { size: 48, strokeWidth: 8, textSize: 'text-base' },
  }[size] || { size: 40, strokeWidth: 6, textSize: 'text-sm' };

  // Calculate gauge metrics
  const radius = useMemo(() => (gaugeSize - strokeWidth) / 2, [gaugeSize, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  
  // Animate score change
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayScore(score);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [score]);

  // Calculate dash offset based on score (0-100)
  const dashOffset = useMemo(() => {
    const progress = displayScore / 100;
    return circumference - (progress * circumference);
  }, [displayScore, circumference]);

  // Determine trend icon
  const trendIcon = useMemo(() => {
    if (!trend) return null;
    
    const baseClass = 'w-4 h-4';
    
    switch(trend) {
      case 'increasing':
        return <ArrowUp className={`${baseClass} text-red-500`} />;
      case 'decreasing':
        return <ArrowDown className={`${baseClass} text-green-500`} />;
      case 'stable':
        return <Minus className={`${baseClass} text-yellow-500`} />;
      default:
        return null;
    }
  }, [trend]);

  // Show skeleton if loading
  if (isLoading) {
    return <RiskGaugeSkeleton size={size} className={className} />;
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-full h-full">
        <svg 
          className="w-full h-full transform -rotate-90" 
          viewBox={`0 0 ${gaugeSize} ${gaugeSize}`}
          style={{ maxWidth: '100%', height: 'auto' }}
        >
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            className="dark:opacity-20"
          />
          
          {/* Active arc */}
          <GaugeArc 
            level={level}
            size={gaugeSize}
            strokeWidth={strokeWidth}
            circumference={circumference}
            offset={dashOffset}
          />
          
          {/* Score text */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className={`font-bold ${textSize} fill-current text-gray-900 dark:text-white`}
          >
            {Math.round(displayScore)}
          </text>
        </svg>
        
        {/* Trend indicator */}
        {trendIcon && (
          <div className="absolute top-0 right-0">
            {trendIcon}
          </div>
        )}
      </div>
      
      {/* Level indicator */}
      <div className="mt-2 flex items-center space-x-2 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

// Memoize the component with custom comparison
const areEqual = (prevProps: RiskGaugeProps, nextProps: RiskGaugeProps): boolean => {
  return (
    prevProps.score === nextProps.score &&
    prevProps.level === nextProps.level &&
    prevProps.trend === nextProps.trend &&
    prevProps.lastUpdated === nextProps.lastUpdated &&
    prevProps.size === nextProps.size &&
    prevProps.isLoading === nextProps.isLoading
  );
};

const MemoizedRiskGauge = memo(RiskGaugeComponent, areEqual);

// Add display name for better dev tools
MemoizedRiskGauge.displayName = 'MemoizedRiskGauge';

// Wrap the RiskGauge with ErrorBoundary
export const RiskGauge = (props: RiskGaugeProps) => (
  <RiskErrorBoundary>
    <MemoizedRiskGauge {...props} />
  </RiskErrorBoundary>
);

// Add display name for better dev tools
RiskGauge.displayName = 'RiskGauge';

export default RiskGauge;
