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

  // Color mappings
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-300',
      icon: 'text-blue-500',
      border: 'border-blue-200 dark:border-blue-800'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-300',
      icon: 'text-green-500',
      border: 'border-green-200 dark:border-green-800'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-300',
      icon: 'text-purple-500',
      border: 'border-purple-200 dark:border-purple-800'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      text: 'text-yellow-600 dark:text-yellow-300',
      icon: 'text-yellow-500',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-300',
      icon: 'text-red-500',
      border: 'border-red-200 dark:border-red-800'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-300',
      icon: 'text-indigo-500',
      border: 'border-indigo-200 dark:border-indigo-800'
    }
  };

  useEffect(() => {
    if (cardRef.current && valueRef.current) {
      // Add hover animation to the card
      addHoverAnimation(cardRef.current);
      
      // Animate the value counting up
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
      className={`${colorClasses[color].bg} rounded-lg border ${colorClasses[color].border} p-5 shadow-sm transition-all duration-300`}
      data-testid="statistics-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <div 
            ref={valueRef}
            className={`text-2xl font-bold ${colorClasses[color].text}`}
            aria-live="polite"
          >
            {prefix}0{suffix}
          </div>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center`}>
                {change.isPositive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v3.586l-4.293-4.293a1 1 0 00-1.414 0L8 10.586 3.707 6.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 10.414 14.586 14H12z" clipRule="evenodd" />
                  </svg>
                )}
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`p-2 rounded-full ${colorClasses[color].bg} ${colorClasses[color].icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
