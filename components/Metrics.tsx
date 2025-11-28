import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, isPositive }) => {
  return (
    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-surface-dark p-6 border border-gray-200 dark:border-surface-border shadow-sm">
      <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-normal">{label}</p>
      <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">{value}</p>
      <p className={`text-sm font-medium leading-normal ${isPositive ? 'text-green-600 dark:text-primary' : 'text-red-500'}`}>
        {change}
      </p>
    </div>
  );
};

export const TopAdventureRow: React.FC<{name: string, count: string | number}> = ({name, count}) => (
    <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
        <span className="text-gray-700 dark:text-gray-300">{name}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
    </div>
);