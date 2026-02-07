
import React from 'react';
import { TAJWEED_RULES } from '../types';

interface TajweedTextProps {
  text: string;
  isActive: boolean;
}

const TajweedText: React.FC<TajweedTextProps> = ({ text, isActive }) => {
  if (!isActive) return <>{text}</>;

  // Simple rule-based highlight logic
  // This wraps certain matched characters with colored spans
  // In a real production app, this would use a more robust Arabic Tajweed parser
  
  let parts: React.ReactNode[] = [text];

  Object.values(TAJWEED_RULES).forEach((rule) => {
    if (!rule.pattern) return;
    
    const newParts: React.ReactNode[] = [];
    parts.forEach((part) => {
      if (typeof part !== 'string') {
        newParts.push(part);
        return;
      }

      const segments = part.split(rule.pattern);
      segments.forEach((seg, i) => {
        if (seg.match(rule.pattern!)) {
          newParts.push(
            <span 
              key={`${rule.id}-${i}`} 
              className={`${rule.textColor} underline decoration-2 underline-offset-8`}
              title={rule.name}
            >
              {seg}
            </span>
          );
        } else if (seg !== "") {
          newParts.push(seg);
        }
      });
    });
    parts = newParts;
  });

  return <>{parts}</>;
};

export default TajweedText;
