'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export default function StarRating({
  rating,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-8',
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;
  const isInteractive = !readonly && onChange;

  const handleClick = (value: number) => {
    if (isInteractive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (isInteractive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverRating(null);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= displayRating;
        const isPartiallyFilled = !Number.isInteger(displayRating) && 
                                   value === Math.ceil(displayRating) && 
                                   readonly;

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${sizeClasses[size]}
              ${isInteractive ? 'cursor-pointer hover:scale-110 transition-transform active:scale-95' : 'cursor-default'}
              ${readonly ? 'pointer-events-none' : ''}
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded
            `}
            aria-label={`${value} star${value > 1 ? 's' : ''}`}
          >
            {isPartiallyFilled ? (
              <div className="relative">
                <StarOutlineIcon className={`${sizeClasses[size]} text-amber-400`} />
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(displayRating % 1) * 100}%` }}
                >
                  <StarIcon className={`${sizeClasses[size]} text-amber-400`} />
                </div>
              </div>
            ) : isFilled ? (
              <StarIcon className={`${sizeClasses[size]} text-amber-400`} />
            ) : (
              <StarOutlineIcon className={`${sizeClasses[size]} ${isInteractive ? 'text-slate-300' : 'text-slate-200'}`} />
            )}
          </button>
        );
      })}
      
      {showValue && (
        <span className="ml-2 text-sm font-bold text-slate-700">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
