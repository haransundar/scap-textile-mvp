import { useEffect, useMemo, useState, memo } from 'react';
import { cn } from '@/lib/utils';
import { RiskGaugeSkeleton } from './RiskGaugeSkeleton';
import { RiskErrorBoundary } from './RiskErrorBoundary';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high';
type TrendType = 'increasing' | 'decreasing' | 'stable';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  trend?: TrendType;
  lastUpdated?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

interface GaugeArcProps {
  level: RiskLevel;
  size: number;
  strokeWidth: number;
  circumference: number;
  offset: number;
}

const GaugeArc = memo<GaugeArcProps>(({ level, size, strokeWidth, circumference, offset }) => {
  const color = useMemo(() => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  }, [level]);

  return (
    <circle
      cx={size / 2}
      cy={size / 2}
      r={(size - strokeWidth) / 2}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={circumference}
      strokeDashoffset={offset}
      transform={`rotate(-90 ${size / 2} ${size / 2})`}
      className="transition-all duration-1000 ease-in-out"
    />
  );
});

const RiskGaugeComponent = ({
  score,
  level = 'medium',
  trend = 'stable',
  lastUpdated,
  className,
  size = 'md',
  isLoading = false
}: RiskGaugeProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  // Memoize size configuration
  const { size: gaugeSize, strokeWidth, textSize } = useMemo(() => ({
    sm: { size: 120, strokeWidth: 10, textSize: 'text-2xl' },
    md: { size: 200, strokeWidth: 14, textSize: 'text-4xl' },
    lg: { size: 280, strokeWidth: 18, textSize: 'text-5xl' },
  }[size]), [size]);

  // Calculate derived values
  const { radius, circumference, offset } = useMemo(() => {
    const r = (gaugeSize - strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    const o = c - (displayScore / 100) * c;
    return { radius: r, circumference: c, offset: o };
  }, [gaugeSize, strokeWidth, displayScore]);

  // Animate score change
  useEffect(() => {
    setDisplayScore(score);
  }, [score]);

  // Get trend icon
  const trendIcon = useMemo(() => {
    const baseClass = 'w-4 h-4';
    switch (trend) {
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
            offset={offset}
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

// Create memoized version with custom comparison
const MemoizedRiskGauge = memo(RiskGaugeComponent, (prevProps, nextProps) => {
  return (
    prevProps.score === nextProps.score &&
    prevProps.level === nextProps.level &&
    prevProps.trend === nextProps.trend &&
    prevProps.lastUpdated === nextProps.lastUpdated &&
    prevProps.size === nextProps.size &&
    prevProps.isLoading === nextProps.isLoading
  );
});

// Add display name for better dev tools
MemoizedRiskGauge.displayName = 'MemoizedRiskGauge';

// Export the final component wrapped with ErrorBoundary
export const RiskGauge = (props: RiskGaugeProps) => (
  <RiskErrorBoundary>
    <MemoizedRiskGauge {...props} />
  </RiskErrorBoundary>
);

// Add display name for better dev tools
RiskGauge.displayName = 'RiskGauge';

export default RiskGauge;
