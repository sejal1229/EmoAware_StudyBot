
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { SessionStats } from '../types';

interface EmotionChartProps {
  data: SessionStats[];
}

const EmotionChart: React.FC<EmotionChartProps> = ({ data }) => {
  // Map emotions to numerical values for charting
  const emotionMap: Record<string, number> = {
    'Positive Engagement': 5,
    'Calm/Balanced': 4,
    'Neutral Focus': 3,
    'Confusion': 2,
    'Distraction': 1,
    'Low Motivation': 0,
    'Stress/Frustration': -1
  };

  const chartData = data.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value: emotionMap[item.emotion] ?? 0,
    emotion: item.emotion
  }));

  return (
    <div className="w-full h-64 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Engagement Timeline</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            hide={data.length > 20} 
            tick={{fontSize: 10}}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={[-2, 6]} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#6366f1' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#6366f1" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            name="Engagement Level"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionChart;
