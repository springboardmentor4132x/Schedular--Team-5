import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const tooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: '12px',
  padding: '8px 12px',
};

interface AreaChartProps {
  data: any[];
  xKey: string;
  areas: { key: string; name: string; color: string }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function GradientAreaChart({ data, xKey, areas, height = 280, showGrid = true, showLegend = true }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient key={area.key} id={`gradient-${area.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={area.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={area.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />}
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        {showLegend && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />}
        {areas.map((area) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            name={area.name}
            stroke={area.color}
            strokeWidth={2.5}
            fill={`url(#gradient-${area.key})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface LineChartProps {
  data: any[];
  xKey: string;
  lines: { key: string; name: string; color: string }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function MultiLineChart({ data, xKey, lines, height = 280, showGrid = true, showLegend = true }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />}
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        {showLegend && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />}
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface BarChartProps {
  data: any[];
  xKey: string;
  bars: { key: string; name: string; color: string }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  horizontal?: boolean;
}

export function GradientBarChart({ data, xKey, bars, height = 280, showGrid = true, showLegend = true, horizontal = false }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 5, right: 10, left: horizontal ? 50 : -15, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={horizontal} horizontal={!horizontal} />}
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis dataKey={xKey} type="category" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f9fafb' }} />
        {showLegend && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />}
        {bars.map((bar) => (
          <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} radius={[6, 6, 0, 0]} maxBarSize={48} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
}

export function DonutChart({ data, height = 280, showLegend = true, innerRadius = 60 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 30}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        {showLegend && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />}
      </PieChart>
    </ResponsiveContainer>
  );
}
