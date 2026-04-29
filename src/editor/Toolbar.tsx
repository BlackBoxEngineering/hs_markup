'use client';

import React, { useCallback } from 'react';
import { applyFormat } from './applyFormat';
import type { Theme } from '../theme';

type ToolbarProps = {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onFormat: () => void;
  currentTheme: Theme;
};

const BUTTONS: { label: string; tag: string; style?: React.CSSProperties }[] = [
  { label: 'B',    tag: 'b',    style: { fontWeight: 'bold' } },
  { label: 'I',    tag: 'i',    style: { fontStyle: 'italic' } },
  { label: 'U',    tag: 'u',    style: { textDecoration: 'underline' } },
  { label: 'T',    tag: 't' },
  { label: 'H',    tag: 'h' },
  { label: 'Q',    tag: 'q' },
  { label: 'HL',   tag: 'hl' },
  { label: '</>',  tag: 'code', style: { fontFamily: 'monospace', fontSize: '0.85em' } },
];

export function Toolbar({ editorRef, onFormat, currentTheme }: ToolbarProps) {
  const handleClick = useCallback((tag: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    applyFormat(tag);
    onFormat();
  }, [editorRef, onFormat]);

  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
        padding: '4px 0',
        borderBottom: `1px solid ${currentTheme.border}`,
        marginBottom: '4px',
      }}
    >
      {BUTTONS.map(({ label, tag, style }) => (
        <button
          key={tag}
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => handleClick(tag)}
          style={{
            padding: '2px 8px',
            cursor: 'pointer',
            background: currentTheme.shade,
            color: currentTheme.text,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '3px',
            fontSize: '0.85em',
            lineHeight: '1.4',
            ...style,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
