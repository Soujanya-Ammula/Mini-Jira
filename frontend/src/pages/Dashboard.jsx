import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { dashboardService } from '../services/api';

// Custom modern Tooltip for charts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-xl text-xs space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }}></span>
          {data.name}
        </div>
        <div className="text-slate-500 font-medium">
          Total: <span className="font-extrabold text-slate-900">{data.value}</span> tasks ({data.percentage}%)
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_projects: 0,
    active_tasks: 0,
    team_size: 0,
    todo_tasks: 0,
    in_progress_tasks: 0,
    done_tasks: 0
  });
  const [chartType, setChartType] = useState('both'); // 'donut', 'bar', 'both'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
        setError('Failed to load live statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const totalTasks = stats.todo_tasks + stats.in_progress_tasks + stats.done_tasks;
  const getPercentage = (value) => {
    if (totalTasks === 0) return 0;
    return Math.round((value / totalTasks) * 100);
  };

  const chartData = [
    { name: 'To Do', value: stats.todo_tasks, color: '#94a3b8', percentage: getPercentage(stats.todo_tasks) },
    { name: 'In Progress', value: stats.in_progress_tasks, color: '#3b82f6', percentage: getPercentage(stats.in_progress_tasks) },
    { name: 'Done', value: stats.done_tasks, color: '#10b981', percentage: getPercentage(stats.done_tasks) },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400"></div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>{getGreeting()}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here is a quick overview of your workspace activities today! 🚀</p>
        </div>
      </div>

      {/* About App */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          👋 Welcome to Mini Jira
        </h2>
        <p className="text-slate-500 mt-2 leading-relaxed">
          Project tracking and management environment setup is complete. Navigate using the sidebar to manage projects, assign tasks, and monitor timelines.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">📁 Total Projects</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs shadow-blue-400"></span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {loading ? '...' : stats.total_projects}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">⚡ Active Tasks</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-400"></span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {loading ? '...' : stats.active_tasks}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition hover:-translate-y-0.5 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">👥 Team Size</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-400"></span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {loading ? '...' : stats.team_size}
          </p>
        </div>
      </div>

      {/* Task Status Breakdown Widget */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              📊 Task Status Distribution
            </h3>
            <p className="text-slate-500 text-xs mt-1">Live visual analytics of your workspace task lifecycle</p>
          </div>

          {totalTasks > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                onClick={() => setChartType('both')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  chartType === 'both' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Dual View
              </button>
              <button
                onClick={() => setChartType('donut')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  chartType === 'donut' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                🍩 Donut
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  chartType === 'bar' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                📊 Bar
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-slate-500 text-sm py-8 text-center">Calculating metrics...</div>
        ) : totalTasks === 0 ? (
          <div className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            No tasks added to the workspace yet. Create tasks in the Tasks tab to view distribution charts! 📋
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visual Charts Container */}
            <div className={`grid gap-6 ${chartType === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              
              {/* Donut Chart */}
              {(chartType === 'donut' || chartType === 'both') && (
                <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center relative">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 self-start">
                    🍩 Distribution Breakdown
                  </span>
                  <div className="w-full h-64 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={5}
                          cornerRadius={6}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Center Metric Badge */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-slate-900 leading-none">{totalTasks}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Total Tasks</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bar Chart */}
              {(chartType === 'bar' || chartType === 'both') && (
                <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200/60 flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    📊 Task Volume by Status
                  </span>
                  <div className="w-full h-64 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis 
                          allowDecimals={false} 
                          tick={{ fill: '#94a3b8', fontSize: 11 }} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
                          {chartData.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>

            {/* Summary KPI Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/70 hover:border-slate-300 transition shadow-2xs">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400 inline-block shadow-xs"></span>
                  📋 To Do
                </span>
                <span className="text-sm font-extrabold text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                  {stats.todo_tasks} <span className="text-xs text-slate-400 font-semibold">({getPercentage(stats.todo_tasks)}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-200/70 hover:border-blue-300 transition shadow-2xs">
                <span className="text-sm font-bold text-blue-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-xs shadow-blue-400"></span>
                  ⚡ In Progress
                </span>
                <span className="text-sm font-extrabold text-blue-700 bg-white px-3 py-1 rounded-xl border border-blue-200/80 shadow-2xs">
                  {stats.in_progress_tasks} <span className="text-xs text-blue-400 font-semibold">({getPercentage(stats.in_progress_tasks)}%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/70 hover:border-emerald-300 transition shadow-2xs">
                <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs shadow-emerald-400"></span>
                  ✅ Done
                </span>
                <span className="text-sm font-extrabold text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-200/80 shadow-2xs">
                  {stats.done_tasks} <span className="text-xs text-emerald-400 font-semibold">({getPercentage(stats.done_tasks)}%)</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
