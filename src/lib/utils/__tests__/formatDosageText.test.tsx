import { formatDosageText } from '../formatDosageText';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('formatDosageText', () => {
  it('should return empty array for empty input', () => {
    expect(formatDosageText('')).toEqual([]);
  });

  it('should format bold text correctly', () => {
    const text = 'Hello **World**';
    const result = formatDosageText(text);
    
    // Check that we have a bold element
    const hasBold = result.some((node: any) => {
      if (React.isValidElement(node)) {
        return node.type === 'strong' && (node.props as any).children === 'World';
      }
      return false;
    });
    
    expect(hasBold).toBe(true);
  });

  it('should handle newlines', () => {
    const text = 'Line 1\nLine 2';
    const result = formatDosageText(text);
    
    // Check for presence of <br /> or multiple fragments
    // The implementation splits by \n and maps to Fragments with <br />
    let brCount = 0;
    result.forEach((part: any) => {
      if (Array.isArray(part)) {
        part.forEach((subPart: any) => {
          if (React.isValidElement(subPart) && subPart.type === React.Fragment) {
            if (React.Children.toArray((subPart.props as any).children).some((c: any) => React.isValidElement(c) && c.type === 'br')) {
              brCount++;
            }
          }
        });
      }
    });
    
    expect(brCount).toBeGreaterThan(0);
  });
});
