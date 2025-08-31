import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, Users, Activity, TrendingUp, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface AnalyticsData {
  messageCount: number;
  participantCount: number;
  activeUsers: number;
  date: string;
}

interface RoomAnalyticsProps {
  roomId: string;
}

export function RoomAnalytics({ roomId }: RoomAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [roomId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/analytics`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        Failed to load analytics.
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Messages',
      value: analytics.messageCount,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Participants',
      value: analytics.participantCount,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Active users',
      value: analytics.activeUsers,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  const chartData = [
    { name: 'Messages', value: analytics.messageCount, color: '#3B82F6' },
    { name: 'Participants', value: analytics.participantCount, color: '#10B981' },
    { name: 'Active users', value: analytics.activeUsers, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Room analytics</h2>
            <p className="text-xs text-muted-foreground">Live snapshot (manual refresh)</p>
          </div>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchAnalytics(); }}
          disabled={refreshing}
          className="inline-flex items-center text-xs font-medium rounded-md border px-3 py-2 hover:bg-muted disabled:opacity-50"
        >
          <RefreshCcw className={`w-3.5 h-3.5 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Key metrics</CardTitle>
            <CardDescription>Relative values</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribution</CardTitle>
            <CardDescription>Share by metric</CardDescription>
          </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-4 space-y-1 text-xs">
                {chartData.map(c => (
                  <li key={c.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name}</span>
                    <span>{c.value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
