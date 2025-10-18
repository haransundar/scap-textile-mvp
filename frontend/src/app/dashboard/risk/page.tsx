"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { RiskGauge } from "@/components/risk/RiskGauge";
import RiskDrivers from "@/components/risk/RiskDrivers";
import RiskHistory from "@/components/risk/RiskHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api/client";

interface RiskHistoryData {
  date: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
}

interface RiskDriver {
  rank: number;
  factor: string;
  weight: number;
  description: string;
  impact: 'low' | 'medium' | 'high';
  action: string;
  action_url: string;
}

interface RiskDoc {
  _id: string;
  supplier_id: string;
  score: number;
  risk_drivers: RiskDriver[];
  calculated_at: string;
  risk_level: 'low' | 'medium' | 'high';
  trend?: 'increasing' | 'decreasing' | 'stable';
}

export default function RiskAnalysisPage() {
  const [current, setCurrent] = useState<RiskDoc | null>(null);
  const [history, setHistory] = useState<RiskDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const supplierId = user?.supplier_id || user?._id || '';

  // Transform history data for the RiskHistory component
  const historyData: RiskHistoryData[] = useMemo(() => {
    return history.map(item => ({
      date: item.calculated_at,
      risk_score: item.score,
      risk_level: item.risk_level
    }));
  }, [history]);

  // Check and validate token
  const validateToken = async (token: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('auth_token');
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  // Fetch risk data function with enhanced error handling
  const fetchRiskData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Get and validate auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No authentication token found in localStorage');
      setError('Please log in to view this page');
      setLoading(false);
      // Give time for the error to be displayed
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      return;
    }

    // Verify token is still valid
    const isValid = await validateToken(token);
    if (!isValid) {
      console.error('Invalid or expired token');
      localStorage.removeItem('token');
      setError('Your session has expired. Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }
    
    // Prepare headers with auth token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    if (!supplierId) {
      console.error('No supplier ID available');
      setError('No supplier information available. Please log in again.');
      setLoading(false);
      return;
    }
    
    // Check if supplierId is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(supplierId);
    if (!isValidObjectId) {
      const errorMsg = 'Invalid supplier ID format. Please log out and try again.';
      console.error(errorMsg, supplierId);
      setError(errorMsg);
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔍 Fetching risk data for supplier:', supplierId);
      
      // Verify token is still valid with a simple GET request
      try {
        const verifyRes = await fetch('/api/auth/me', { 
          headers,
          credentials: 'include' // Important for cookies if using httpOnly
        });
        
        if (!verifyRes.ok) {
          if (verifyRes.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            setError('Your session has expired. Redirecting to login...');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
            return;
          }
          throw new Error(`HTTP error! status: ${verifyRes.status}`);
        }
      } catch (verifyError) {
        console.error('Session verification failed:', verifyError);
        setError('Unable to verify session. Please log in again.');
        setLoading(false);
        return;
      }
      
      // First, try to get the latest risk score
      let scoreRes: { data: RiskDoc | null } = { data: null };
      try {
        // Try to get existing score with retry logic
        const maxRetries = 2;
        let retryCount = 0;
        let scoreResponse;
        
        while (retryCount <= maxRetries) {
          try {
            scoreResponse = await apiClient.get<RiskDoc>(
              `/api/risk/score/${supplierId}`,
              { 
                headers,
                validateStatus: (status) => status < 500 
              }
            );
            
            if (scoreResponse.status === 200 && scoreResponse.data) {
              console.log('Risk score found:', scoreResponse.data);
              scoreRes = { data: scoreResponse.data };
              break;
            } else if (scoreResponse.status === 404) {
              console.log('No existing score found, will attempt to calculate');
              break;
            } else if (scoreResponse.status === 401) {
              // Token might have expired, try to refresh or redirect
              throw new Error('Authentication required');
            }
            
            // If we get here, there was an unexpected status code
            throw new Error(`Unexpected status: ${scoreResponse.status}`);
            
          } catch (error) {
            retryCount++;
            if (retryCount > maxRetries) throw error;
            console.log(`Retry ${retryCount}/${maxRetries} after error:`, error);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
        
        // If we get here and no score was found, try to calculate it
        if (!scoreRes.data && scoreResponse?.status === 404) {
          console.log('No existing risk score found, calculating...');
          // If no score exists, try to calculate it
          try {
            const calculateRes = await apiClient.post<RiskDoc>(
              `/api/risk/calculate/${supplierId}`,
              {},
              { 
                headers,
                // Don't throw on 405, we'll handle it
                validateStatus: (status) => status < 500 
              }
            ) as { status: number; data: RiskDoc | null };
            
            if (calculateRes.status === 200 && calculateRes.data) {
              console.log('Risk score calculated successfully:', calculateRes.data);
              scoreRes = { data: calculateRes.data };
            } else if (calculateRes.status === 405) {
              console.warn('POST method not allowed for risk calculation');
              // Try GET as fallback if POST is not allowed
              const getCalculateRes = await apiClient.get<RiskDoc>(
                `/api/risk/calculate/${supplierId}`,
                { headers }
              );
              if (getCalculateRes.status === 200) {
                scoreRes = { data: getCalculateRes.data };
              }
            }
          } catch (calcError) {
            console.error('Error during risk calculation:', calcError);
            throw new Error('Failed to calculate risk score');
          }
        }
      } catch (error) {
        console.error('Error fetching risk score:', error);
        throw new Error('Failed to fetch risk data');
      }
      
      // Then fetch the history
      let histRes = { data: { history: [] as RiskDoc[] } };
      try {
        const historyResponse = await apiClient.get<{ history: RiskDoc[] }>(
          `/api/risk/history/${supplierId}?days=180`,
          { headers }
        );
        console.log('Risk history response:', historyResponse.status, historyResponse.data?.history?.length || 0, 'items');
        histRes = historyResponse;
      } catch (historyError) {
        console.error('Error fetching risk history:', historyError);
      }
      
      // Update state with fetched data
      if (scoreRes?.data) {
        console.log('Setting current risk data:', scoreRes.data);
        setCurrent(scoreRes.data);
        
        // If we have a score but no history, try to get history again
        if (!histRes?.data?.history?.length) {
          console.log('No history found, attempting to fetch again...');
          try {
            const retryHistRes = await apiClient.get<{ history: RiskDoc[] }>(
              `/api/risk/history/${supplierId}?days=180`,
              { headers }
            );
            if (retryHistRes?.data?.history?.length) {
              console.log('Retrieved history on second attempt:', retryHistRes.data.history.length, 'items');
              setHistory(retryHistRes.data.history);
            }
          } catch (retryError) {
            console.error('Error retrying history fetch:', retryError);
          }
        } else {
          setHistory(histRes.data.history);
        }
      } else {
        console.warn('No risk score data available for supplier');
        setError('Risk score data not available for this supplier. The system may be calculating the initial score.');
        
        // Try to calculate the score if not available
        try {
          console.log('Attempting to calculate risk score...');
          const calculateRes = await apiClient.post<RiskDoc>(
            `/api/risk/calculate/${supplierId}`,
            {},
            { headers }
          );
          if (calculateRes?.data) {
            console.log('Successfully calculated risk score:', calculateRes.data);
            setCurrent(calculateRes.data);
            setError(null);
          }
        } catch (calcError) {
          console.error('Error during calculation retry:', calcError);
        }
      }
      
    } catch (e: any) {
      setError(e?.message || 'Failed to load risk data');
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  // Fetch data on component mount and when supplierId changes
  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  // Determine risk color based on score
  const riskColor = useMemo(() => {
    const score = current?.score ?? 0;
    if (score < 30) return { ring: "ring-green-400", badge: "bg-green-100 text-green-800" };
    if (score < 60) return { ring: "ring-yellow-400", badge: "bg-yellow-100 text-yellow-800" };
    return { ring: "ring-red-400", badge: "bg-red-100 text-red-800" };
  }, [current]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-64 rounded-full" />
          <div className="w-full space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  // Error state with more detailed information
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
          <h2 className="text-2xl font-bold">Risk Data Unavailable</h2>
          <p className="text-muted-foreground max-w-md">
            {error} This might be because the risk assessment is still being calculated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={fetchRiskData} 
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button 
              onClick={async () => {
                // Force a recalculation
                const token = localStorage.getItem('token');
                if (token) {
                  setLoading(true);
                  try {
                    await apiClient.post(
                      `/api/risk/calculate/${supplierId}`,
                      {},
                      { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    await fetchRiskData();
                  } catch (e) {
                    console.error('Force calculation failed:', e);
                    setError('Failed to start risk calculation. Please try again later.');
                    setLoading(false);
                  }
                }
              }}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recalculate Risk
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            If the issue persists, please contact support with the following details:
            <br />
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
              Supplier ID: {supplierId || 'N/A'}
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Risk Analysis</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor your current risk and recent trend</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRiskData}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-lg border ${riskColor.ring} bg-white dark:bg-gray-800 shadow-sm`}>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Risk Score</h2>
            <div className="flex justify-center">
              <RiskGauge 
                score={current?.score ?? 0} 
                level={current?.risk_level ?? 'medium'}
                lastUpdated={current?.calculated_at}
                trend={current?.trend}
                isLoading={loading}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Risk Drivers</h2>
            {current?.risk_drivers?.length ? (
              <RiskDrivers drivers={current.risk_drivers} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No risk drivers data available
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Risk History</h2>
          <RiskHistory data={historyData} />
        </div>
      </div>
    </div>
  );
}