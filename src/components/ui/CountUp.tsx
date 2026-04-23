'use client';

import React, { useEffect, useState } from 'react';
import { useMotionValue, animate } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  suffix?: string;
}

export default function CountUp({ 
  value, 
  duration = 0.5, 
  suffix = ' đ' 
}: CountUpProps) {
  const [display, setDisplay] = useState('');
  const motionValue = useMotionValue(value); // Start with current value to avoid 0 jump on update

  useEffect(() => {
    // Initial format
    setDisplay(new Intl.NumberFormat('vi-VN').format(Math.floor(value)) + suffix);

    const controls = animate(motionValue, value, {
      duration: duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplay(new Intl.NumberFormat('vi-VN').format(Math.floor(latest)) + suffix);
      },
    });
    return controls.stop;
  }, [value, motionValue, duration, suffix]);

  return <span>{display}</span>;
}
