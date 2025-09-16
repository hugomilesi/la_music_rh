
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/styles/card-animations.css';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'indigo' | 'pink';
  onClick?: () => void;
}

const colorStyles = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    shadow: 'hover:shadow-blue-500/20'
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    shadow: 'hover:shadow-green-500/20'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    shadow: 'hover:shadow-purple-500/20'
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    shadow: 'hover:shadow-orange-500/20'
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    shadow: 'hover:shadow-red-500/20'
  },
  yellow: {
    gradient: 'from-yellow-400 to-orange-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    shadow: 'hover:shadow-yellow-500/20'
  },
  indigo: {
    gradient: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    shadow: 'hover:shadow-indigo-500/20'
  },
  pink: {
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    shadow: 'hover:shadow-pink-500/20'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  onClick
}) => {
  const colorStyle = colorStyles[color];
  
  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-sm border p-6 group relative overflow-hidden stat-card",
        colorStyle.border,
        colorStyle.shadow,
        onClick ? "cursor-pointer" : ""
      )}
      onClick={onClick}
    >
      {/* Subtle background gradient on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
        colorStyle.bg
      )}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-700 transition-colors">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2 stat-value origin-left">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors leading-relaxed">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-3">
              <span className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200",
                trend.isPositive 
                  ? "bg-green-100 text-green-700 group-hover:bg-green-200" 
                  : "bg-red-100 text-red-700 group-hover:bg-red-200"
              )}>
                {trend.isPositive ? '↗' : '↘'} {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-2 group-hover:text-gray-600 transition-colors">vs mês anterior</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "w-14 h-14 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg stat-icon",
          colorStyle.gradient
        )}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      
      {/* Musical note decoration */}
      <div className="absolute top-2 right-2 text-2xl opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        ♪
      </div>
    </div>
  );
};
