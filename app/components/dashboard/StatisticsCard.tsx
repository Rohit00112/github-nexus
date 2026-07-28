"use client";

import { FC, useEffect, useRef } from 'react';
import { countUp, addHoverAnimation } from '../../utils/animations';

interface StatisticsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo';
  prefix?: string;
  suffix?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  animationDelay?: number;
}

const StatisticsCard: FC<StatisticsCardProps> = ({
  title,
  value,
  icon,
  color,
  prefix = '',
  suffix = '',
  change,
  animationDelay = 0
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    indigo: 'text-indigo-500',
  };

  useEffect(() => {
    if (cardRef.current && valueRef.current) {
      addHoverAnimation(cardRef.current);
      setTimeout(() => {
        if (valueRef.current) {
          countUp(valueRef.current, value, prefix, suffix);
        }
      }, animationDelay);
    }
  }, [value, prefix, suffix, animationDelay]);

  return (
    <div
      ref={cardRef}
      className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
      data-testid="statistics-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div
            ref={valueRef}
            className="text-3xl font-bold font-mono text-foreground tracking-tight"
            aria-live="polite"
          >
            {prefix}0{suffix}
          </div>

          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium flex items-center ${change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {change.isPositive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v3.586l-4.293-4.293a1 1 0 00-1.414 0L8 10.586 3.707 6.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 10.414 14.586 14H12z" clipRule="evenodd" />
                  </svg>
                )}
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          )}
        </div>

        <div className={`p-2.5 rounded-xl bg-muted ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
