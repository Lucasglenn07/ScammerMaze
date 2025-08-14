'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users,
  Target,
  Download,
  Filter,
  Calendar,
  Globe,
  Smartphone,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalSessions: number;
    totalTimeWasted: number;
    averageSessionDuration: number;
    completionRate: number;
    uniqueIPs: number;
    topCountries: Array<{ country: string; sessions: number }>;
  };
  chartData: {
    sessionsOverTime: Array<{ date: string; sessions: number; timeWasted: number }>;
    trialPerformance: Array<{ 
      trialName: string; 
      attempts: number; 
      successRate: number; 
      averageTime: number;
      exitRate: number;
    }>;
    deviceTypes: Array<{ type: string; count: number }>;
    hourlyActivity: Array<{ hour: number; sessions: number }>;
  };
  recentSessions: Array<{
    id: string;
    startedAt: string;
    duration: number;
    country: string;
    device: string;
    completedSteps: number;
    totalSteps: number;
    mazeName: string;
    status: string;
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMaze, setSelectedMaze] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedMaze]);

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        range: dateRange,
        maze: selectedMaze,
      });
      
      const response = await fetch(`/api/analytics?${params}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const formatDuration = (milliseconds: number) => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/analytics/export?range=${dateRange}&maze=${selectedMaze}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timesink-analytics-${dateRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="border-l border-gray-300 h-6"></div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.overview.totalSessions?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Wasted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data ? formatDuration(data.overview.totalTimeWasted) : '0m'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data ? formatDuration(data.overview.averageSessionDuration) : '0m'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.overview.completionRate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sessions Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions Over Time</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-xs">({data?.chartData.sessionsOverTime?.length || 0} data points)</p>
              </div>
            </div>
          </div>

          {/* Trial Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trial Performance</h3>
            <div className="space-y-3">
              {data?.chartData.trialPerformance?.slice(0, 5).map((trial, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{trial.trialName}</p>
                    <p className="text-xs text-gray-600">
                      {trial.attempts} attempts • {trial.successRate.toFixed(1)}% success
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatTime(trial.averageTime)}</p>
                    <p className="text-xs text-red-600">{trial.exitRate.toFixed(1)}% exit</p>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <p>No trial data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Geographic and Device Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Countries */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
            <div className="space-y-3">
              {data?.overview.topCountries?.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium">{country.country}</span>
                  </div>
                  <span className="text-sm text-gray-600">{country.sessions}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </div>

          {/* Device Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
            <div className="space-y-3">
              {data?.chartData.deviceTypes?.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium capitalize">{device.type}</span>
                  </div>
                  <span className="text-sm text-gray-600">{device.count}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </div>

          {/* Activity by Hour */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity by Hour</h3>
            <div className="space-y-2">
              {Array.from({ length: 12 }, (_, i) => {
                const hour = i * 2;
                const activityData = data?.chartData.hourlyActivity?.find(h => h.hour === hour);
                const sessions = activityData?.sessions || 0;
                const maxSessions = Math.max(...(data?.chartData.hourlyActivity?.map(h => h.sessions) || [1]));
                const width = Math.max(5, (sessions / maxSessions) * 100);
                
                return (
                  <div key={hour} className="flex items-center">
                    <span className="text-xs text-gray-500 w-8">{hour}:00</span>
                    <div className="flex-1 mx-2">
                      <div
                        className="bg-blue-200 h-2 rounded"
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-8">{sessions}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Sessions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.recentSessions?.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{session.mazeName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.startedAt).toLocaleDateString()} {new Date(session.startedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(session.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(session.completedSteps / session.totalSteps) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          {session.completedSteps}/{session.totalSteps}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.country}</div>
                      <div className="text-xs text-gray-500">{session.device}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        session.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : session.status === 'abandoned'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4" />
                      <p>No session data available for the selected period</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}