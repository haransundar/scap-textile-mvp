import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowUpRight, CheckCircle, AlertTriangle } from 'lucide-react';

interface RiskDriver {
  rank: number;
  factor: string;
  weight: number;
  description: string;
  impact: 'low' | 'medium' | 'high';
  action: string;
  action_url: string;
  value?: any;
}

interface RiskDriversProps {
  drivers: RiskDriver[];
  className?: string;
}

export function RiskDrivers({ drivers, className }: RiskDriversProps) {
  if (!drivers || drivers.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow p-6", className)}>
        <h3 className="text-lg font-semibold mb-4">Risk Drivers</h3>
        <p className="text-gray-500 dark:text-gray-400">No risk drivers identified.</p>
      </div>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden", className)}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Risk Drivers</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          These factors are most impacting your risk score. Address them to improve your overall risk profile.
        </p>
        
        <div className="space-y-4">
          {drivers.map((driver) => (
            <div key={driver.rank} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {driver.factor}
                    </span>
                    <span className={cn(
                      "ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex items-center",
                      getImpactColor(driver.impact)
                    )}>
                      {getImpactIcon(driver.impact)}
                      <span className="ml-1">{driver.impact.toUpperCase()}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {driver.description}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {(driver.weight * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className={cn("h-2 rounded-full", {
                      'bg-red-500': driver.impact === 'high',
                      'bg-yellow-500': driver.impact === 'medium',
                      'bg-blue-500': driver.impact === 'low',
                    })}
                    style={{ width: `${driver.weight * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="mt-3 flex items-center">
                <a
                  href={driver.action_url}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {driver.action}
                  <ArrowUpRight className="ml-1 w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">Next steps:</span> Focus on addressing high-impact risks first to 
            improve your overall risk profile. Regular monitoring and proactive management can help reduce 
            your risk exposure over time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RiskDrivers;
