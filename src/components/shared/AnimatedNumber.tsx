import { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatOptions?: Intl.NumberFormatOptions;
  className?: string;
}

// easeOutExpo easing function
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedNumber({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
  formatOptions = {},
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = endValue;
      }
    };
    
    startTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = new Intl.NumberFormat('en-IN', formatOptions).format(
    Math.round(displayValue)
  );

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
