import React from 'react';

/**
 * Parses markdown-like text (bold **text** and newlines) into React elements.
 * @param text The string to format
 * @returns JSX.Element or Array of JSX.Elements
 */
export function formatDosageText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Split by double asterisks to find bold segments
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Bold text: remove the asterisks and wrap in <strong>
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-slate-100">
          {boldText}
        </strong>
      );
    }

    // Regular text: split by newlines and add <br />
    const lines = part.split('\n');
    return lines.map((line, lineIndex) => (
      <React.Fragment key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  });
}
