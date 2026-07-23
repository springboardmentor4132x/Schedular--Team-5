import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'violet';
  index?: number;
}

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', gradient: 'from-indigo-500 to-violet-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', gradient: 'from-rose-500 to-pink-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', gradient: 'from-violet-500 to-purple-500' },
};

export function StatCard({ title, value, change, changeLabel, icon, color = 'indigo', index = 0 }: StatCardProps) {
  const colors = colorMap[color];
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl border border-gray-200/80 p-5 card-shadow hover:card-shadow-hover transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br text-white', colors.gradient)}>
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
              isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-500">{changeLabel || 'vs last month'}</span>
        </div>
      )}
    </motion.div>
  );
}

export interface LineChartProps {
  data: any[];
  xKey: string;
  lines: { key: string; name: string; color: string }[];
  height?: number;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, action, children, className }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('bg-white rounded-2xl border border-gray-200/80 p-5 card-shadow', className)}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}
