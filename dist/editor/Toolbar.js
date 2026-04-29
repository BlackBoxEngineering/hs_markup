'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { applyFormat } from './applyFormat';
const BUTTONS = [
    { label: 'B', tag: 'b', title: 'Bold — wrap selected text in bold', style: { fontWeight: 'bold' } },
    { label: 'I', tag: 'i', title: 'Italic — wrap selected text in italic', style: { fontStyle: 'italic' } },
    { label: 'U', tag: 'u', title: 'Underline — wrap selected text with underline', style: { textDecoration: 'underline' } },
    { label: 'S', tag: 's', title: 'Strikethrough — draw a line through selected text', style: { textDecoration: 'line-through' } },
    { label: 'T', tag: 't', title: 'Title — large display heading for the document' },
    { label: 'H1', tag: 'h1', title: 'Heading 1 — largest section heading' },
    { label: 'H2', tag: 'h2', title: 'Heading 2 — medium section heading' },
    { label: 'H3', tag: 'h3', title: 'Heading 3 — small section heading' },
    { label: 'HL', tag: 'hl', title: 'Highlight — mark selected text with a highlight colour' },
    { label: 'Q', tag: 'q', title: 'Quote — indent selected text as a block quote' },
    { label: '</>', tag: 'code', title: 'Code — format selected text as inline code', style: { fontFamily: 'monospace', fontSize: '0.85em' } },
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
        }, children: BUTTONS.map(({ label, tag, title, style }) => (_jsx("button", { type: "button", title: title, onMouseDown: e => e.preventDefault(), onClick: () => handleClick(tag), style: {
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
