'use client'
import { useState, useEffect } from 'react'

interface StarRatingProps {
  initialRating?: number
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({ 
  initialRating = 0, 
  onChange, 
  readOnly = false,
  size = 'md'
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)

  useEffect(() => {
    setRating(initialRating)
  }, [initialRating])

  const handleClick = (value: number) => {
    if (readOnly) return
    
    setRating(value)
    if (onChange) {
      onChange(value)
    }
  }
  
  const starSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }[size]

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`${starSize} focus:outline-none ${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
          disabled={readOnly}
          aria-label={`Rate ${star} out of 5 stars`}
        >
          {star <= (hover || rating) ? (
            <span className="text-yellow-400">★</span>
          ) : (
            <span className="text-gray-300">☆</span>
          )}
        </button>
      ))}
    </div>
  )
}