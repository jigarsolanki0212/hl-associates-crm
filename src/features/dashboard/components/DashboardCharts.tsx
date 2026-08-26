'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

// Custom Modern Glassmorphic Tooltip
export const CustomChartTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-lg shadow-xl text-white text-xs space-y-1 z-50">
        <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between gap-4">
          <span>{label}</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-300 font-medium">{entry.name}:</span>
            </div>
            <span className="font-mono font-bold text-white">
              {prefix}
              {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Monthly Revenue & Pipeline Area Chart
export function RevenueTrendChart({ data }: { data: any[] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0040e0" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0040e0" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="proformaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
          />
          <Tooltip
            content={<CustomChartTooltip prefix="₹" />}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Gross Pipeline (INR)"
            stroke="#0040e0"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Interactive Lead Source Donut Chart
export function SourceDonutChart({ data, totalInquiries }: { data: any[]; totalInquiries: number }) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col items-center">
      <div className="h-[210px] w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-lg shadow-xl text-xs space-y-0.5 border border-slate-700">
                      <div className="font-bold">{item.label}</div>
                      <div className="text-slate-300">
                        {item.count} inquiries ({item.percent}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={4}
              cornerRadius={5}
              dataKey="count"
              nameKey="label"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none"
                  style={{
                    filter: activeIndex === index ? 'drop-shadow(0px 4px 8px rgba(0, 64, 224, 0.4))' : 'none',
                    transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: 'center center',
                    transition: 'all 0.2s ease-out',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {totalInquiries}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Inquiries
          </span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 w-full">
        {data.map((item, idx) => (
          <div
            key={item.label}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
            className={`flex items-center justify-between p-2 rounded border transition-all cursor-pointer text-xs ${
              activeIndex === idx
                ? 'bg-blue-50/80 border-[#0040e0]/40 shadow-xs'
                : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-700 font-medium truncate">{item.label}</span>
            </div>
            <span className="font-bold text-slate-900 ml-2 shrink-0">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Interactive Service Demand Bar Chart
export function ServiceDemandBarChart({ data }: { data: any[] }) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0040e0" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700">
                    <div className="font-bold text-slate-100">{item.name}</div>
                    <div className="text-slate-400 text-[11px]">{item.category}</div>
                    <div className="pt-1 border-t border-slate-700/80 flex items-center justify-between gap-4 font-semibold">
                      <span className="text-sky-400">Active Engagements:</span>
                      <span className="font-mono text-white font-bold">{item.count}</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="count"
            name="Clients"
            fill="url(#barGrad)"
            radius={[6, 6, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 4. Comparative Conversion & Pipeline Progression Chart
export function FunnelBarChart({ data }: { data: any[] }) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="stage"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
            width={160}
          />
          <Tooltip
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700">
                    <div className="font-bold text-slate-100">{item.stage}</div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">Volume:</span>
                      <span className="font-mono font-bold text-white">{item.count} items</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">Conversion Rate:</span>
                      <span className="font-mono font-bold text-emerald-400">{item.percent}%</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="percent" name="Conversion %" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {data.map((entry, index) => (
              <Cell key={`funnel-cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
