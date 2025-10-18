import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Label,
  ReferenceArea
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface RiskHistoryData {
  date: string;
  risk_score: number;
}

interface RiskHistoryProps {
  data: RiskHistoryData[];
  className?: string;
  height?: number;
  showAverage?: boolean;
  showRange?: boolean;
}

export function RiskHistory({ 
  data = [], 
  className, 
  height = 300,
  showAverage = true,
  showRange = true
}: RiskHistoryProps) {
  // Process data for the chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate mock data if no data is provided
      const mockData = [];
      const today = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const date = subDays(today, i);
        mockData.push({
          date: date.toISOString(),
          risk_score: Math.floor(Math.random() * 30) + 35, // Random score between 35-65
        });
      }
      return mockData;
    }
    
    return [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);
  
  // Calculate average risk score
  const averageScore = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.risk_score, 0);
    return sum / chartData.length;
  }, [chartData]);
  
  // Get risk level based on score
  const getRiskLevel = (score: number) => {
    if (score < 30) return 'low';
    if (score < 60) return 'medium';
    return 'high';
  };
  
  // Get color based on risk level
  const getColor = (score: number) => {
    const level = getRiskLevel(score);
    switch (level) {
      case 'low': return '#10B981'; // green-500
      case 'medium': return '#F59E0B'; // yellow-500
      case 'high': return '#EF4444'; // red-500
      default: return '#6B7280'; // gray-500
    }
  };
  
  // Format date for X-axis
  const formatXAxis = (date: string) => {
    try {
      return format(parseISO(date), 'MMM d');
    } catch (e) {
      return date;
    }
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const score = data.risk_score;
      const level = getRiskLevel(score);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {format(parseISO(data.date), 'MMMM d, yyyy')}
          </p>
          <div className="mt-1">
            <span className="font-semibold" style={{ color: getColor(score) }}>
              {score.toFixed(1)}
            </span>
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
              {level.toUpperCase()} RISK
            </span>
          </div>
        </div>
      );
    }
    return null;
  };
  
  if (chartData.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center", className)}>
        <p className="text-gray-500 dark:text-gray-400">No historical data available</p>
      </div>
    );
  }
  
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow p-6", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Risk History</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last {chartData.length} days
        </div>
      </div>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke="#E5E7EB"
              strokeOpacity={0.3}
            />
            
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tickFormatter={(value) => `${value}%`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {showAverage && (
              <ReferenceLine 
                y={averageScore} 
                stroke="#6B7280" 
                strokeDasharray="3 3"
                strokeWidth={1.5}
              >
                <Label 
                  value={`Avg: ${averageScore.toFixed(1)}`} 
                  position="right" 
                  fill="#6B7280"
                  fontSize={12}
                />
              </ReferenceLine>
            )}
            
            {showRange && (
              <>
                <ReferenceArea 
                  y1={0} 
                  y2={30} 
                  fill="#10B981" 
                  fillOpacity={0.1} 
                  stroke="none"
                />
                <ReferenceArea 
                  y1={30} 
                  y2={60} 
                  fill="#F59E0B" 
                  fillOpacity={0.1} 
                  stroke="none"
                />
                <ReferenceArea 
                  y1={60} 
                  y2={100} 
                  fill="#EF4444" 
                  fillOpacity={0.1} 
                  stroke="none"
                />
              </>
            )}
            
            <Area
              type="monotone"
              dataKey="risk_score"
              stroke="#8884d8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRisk)"
              activeDot={{
                r: 6,
                fill: '#8884d8',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
            
            <Line
              type="monotone"
              dataKey="risk_score"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 6,
                fill: '#8884d8',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span>Low (0-30)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
          <span>Medium (31-60)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span>High (61-100)</span>
        </div>
      </div>
    </div>
  );
}

export default RiskHistory;
