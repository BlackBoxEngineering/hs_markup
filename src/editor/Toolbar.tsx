'use client';

import React, { useCallback, useState } from 'react';
import { applyFormat } from './applyFormat';
import type { Theme } from '../theme';

type ToolbarProps = {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onFormat: () => void;
  currentTheme: Theme;
};

const BUTTONS: { label: string; tag: string; tooltip: string; style?: React.CSSProperties }[] = [
  { label: 'B',   tag: 'b',    tooltip: 'Bold',          style: { fontWeight: 'bold' } },
  { label: 'I',   tag: 'i',    tooltip: 'Italic',        style: { fontStyle: 'italic' } },
  { label: 'U',   tag: 'u',    tooltip: 'Underline',     style: { textDecoration: 'underline' } },
  { label: 'S',   tag: 's',    tooltip: 'Strikethrough', style: { textDecoration: 'line-through' } },
  { label: 'T',   tag: 't',    tooltip: 'Title' },
  { label: 'H1',  tag: 'h1',   tooltip: 'Heading 1' },
  { label: 'H2',  tag: 'h2',   tooltip: 'Heading 2' },
  { label: 'H3',  tag: 'h3',   tooltip: 'Heading 3' },
  { label: 'HL',  tag: 'hl',   tooltip: 'Highlight' },
  { label: 'Q',   tag: 'q',    tooltip: 'Quote' },
  { label: 'Code', tag: 'code', tooltip: 'Code',          style: { fontFamily: 'monospace', fontSize: '0.85em' } },
];

export function Toolbar({ editorRef, onFormat, currentTheme }: ToolbarProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

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
      {BUTTONS.map(({ label, tag, tooltip, style }) => (
        <div
          key={tag}
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={() => setActiveTooltip(tag)}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          {activeTooltip === tag && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '5px',
                padding: '3px 8px',
                background: currentTheme.foreground,
                color: currentTheme.highlight,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '3px',
                fontSize: '0.75em',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              {tooltip}
            </div>
          )}
          <button
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
        </div>
      ))}
    </div>
  );
}
