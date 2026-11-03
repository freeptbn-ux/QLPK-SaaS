'use client';

import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  suffix?: string;
}

// Module-level formatter singleton to avoid GC thrashing in animation loop
const viNumberFormatter = new Intl.NumberFormat('vi-VN');

export default function CountUp({ 
  value, 
  duration = 0.5, 
  suffix = ' đ' 
}: CountUpProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const from = prevValueRef.current;
    const to = value;
    prevValueRef.current = value;

    const controls = animate(from, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        if (spanRef.current) {
          spanRef.current.textContent = viNumberFormatter.format(Math.floor(latest)) + suffix;
        }
      },
    });

    return controls.stop;
  }, [value, duration, suffix]);

  return <span ref={spanRef}>{viNumberFormatter.format(Math.floor(value)) + suffix}</span>;
}
