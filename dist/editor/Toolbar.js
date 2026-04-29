'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { applyFormat } from './applyFormat';
const BUTTONS = [
    { label: 'B', tag: 'b', style: { fontWeight: 'bold' } },
    { label: 'I', tag: 'i', style: { fontStyle: 'italic' } },
    { label: 'U', tag: 'u', style: { textDecoration: 'underline' } },
    { label: 'T', tag: 't' },
    { label: 'H', tag: 'h' },
    { label: 'Q', tag: 'q' },
    { label: 'HL', tag: 'hl' },
    { label: '</>', tag: 'code', style: { fontFamily: 'monospace', fontSize: '0.85em' } },
];
export function Toolbar({ editorRef, onFormat, currentTheme }) {
    const handleClick = useCallback((tag) => {
        const el = editorRef.current;
        if (!el)
            return;
        el.focus();
        applyFormat(tag);
        onFormat();
    }, [editorRef, onFormat]);
    return (_jsx("div", { style: {
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            padding: '4px 0',
            borderBottom: `1px solid ${currentTheme.border}`,
            marginBottom: '4px',
        }, children: BUTTONS.map(({ label, tag, style }) => (_jsx("button", { type: "button", onMouseDown: e => e.preventDefault(), onClick: () => handleClick(tag), style: {
                padding: '2px 8px',
                cursor: 'pointer',
                background: currentTheme.shade,
                color: currentTheme.text,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '3px',
                fontSize: '0.85em',
                lineHeight: '1.4',
                ...style,
            }, children: label }, tag))) }));
}
