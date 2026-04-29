'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { applyFormat } from './applyFormat';
import { CODE_LANGUAGES } from '../language/codeLang';
import { sanitiseCodeLanguage } from '../language/codeLang';
const BUTTONS = [
    { label: 'B', tag: 'b', tooltip: 'Bold', style: { fontWeight: 'bold' } },
    { label: 'I', tag: 'i', tooltip: 'Italic', style: { fontStyle: 'italic' } },
    { label: 'U', tag: 'u', tooltip: 'Underline', style: { textDecoration: 'underline' } },
    { label: 'S', tag: 's', tooltip: 'Strikethrough', style: { textDecoration: 'line-through' } },
    { label: 'T', tag: 't', tooltip: 'Title' },
    { label: 'H1', tag: 'h1', tooltip: 'Heading 1' },
    { label: 'H2', tag: 'h2', tooltip: 'Heading 2' },
    { label: 'H3', tag: 'h3', tooltip: 'Heading 3' },
    { label: 'HL', tag: 'hl', tooltip: 'Highlight' },
    { label: 'Q', tag: 'q', tooltip: 'Quote' },
    { label: 'Code', tag: 'code', tooltip: 'Code', style: { fontFamily: 'monospace', fontSize: '0.85em' } },
];
export function Toolbar({ editorRef, onFormat, currentTheme }) {
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [codeLanguage, setCodeLanguage] = useState('');
    const [activeCodeBlock, setActiveCodeBlock] = useState(null);
    const findActiveCodeBlock = useCallback(() => {
        const root = editorRef.current;
        const sel = window.getSelection();
        if (!root || !sel || sel.rangeCount === 0)
            return null;
        const node = sel.anchorNode;
        if (!node || !root.contains(node))
            return null;
        let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;
        while (current && current !== root) {
            if (current.nodeType === Node.ELEMENT_NODE) {
                const el = current;
                if (el.dataset?.tag === 'code')
                    return el;
            }
            current = current.parentNode;
        }
        return null;
    }, [editorRef]);
    useEffect(() => {
        const syncActiveCode = () => {
            const codeEl = findActiveCodeBlock();
            setActiveCodeBlock(codeEl);
            setCodeLanguage(codeEl?.dataset.lg ?? '');
        };
        document.addEventListener('selectionchange', syncActiveCode);
        syncActiveCode();
        return () => document.removeEventListener('selectionchange', syncActiveCode);
    }, [findActiveCodeBlock]);
    const handleClick = useCallback((tag) => {
        const el = editorRef.current;
        if (!el)
            return;
        el.focus();
        applyFormat(tag, tag === 'code' ? { codeLanguage } : undefined);
        onFormat();
    }, [editorRef, onFormat, codeLanguage]);
    const handleLanguageChange = useCallback((nextLanguage) => {
        const codeEl = activeCodeBlock;
        if (!codeEl)
            return;
        const lg = sanitiseCodeLanguage(nextLanguage);
        if (lg) {
            codeEl.dataset.lg = lg;
        }
        else {
            delete codeEl.dataset.lg;
        }
        setCodeLanguage(lg ?? '');
        onFormat();
    }, [activeCodeBlock, onFormat]);
    return (_jsxs("div", { style: {
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            padding: '4px 0',
            borderBottom: `1px solid ${currentTheme.border}`,
            marginBottom: '4px',
        }, children: [BUTTONS.map(({ label, tag, tooltip, style }) => (_jsxs("div", { style: { position: 'relative', display: 'inline-block' }, onMouseEnter: () => setActiveTooltip(tag), onMouseLeave: () => setActiveTooltip(null), children: [activeTooltip === tag && (_jsx("div", { style: {
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
                        }, children: tooltip })), _jsx("button", { type: "button", onMouseDown: e => e.preventDefault(), onClick: () => handleClick(tag), style: {
                            padding: '2px 8px',
                            cursor: 'pointer',
                            background: currentTheme.shade,
                            color: currentTheme.text,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '3px',
                            fontSize: '0.85em',
                            lineHeight: '1.4',
                            ...style,
                        }, children: label })] }, tag))), activeCodeBlock && (_jsxs("label", { style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: currentTheme.text,
                    fontSize: '0.8em',
                    marginLeft: '4px',
                }, children: ["Lang", _jsxs("select", { value: codeLanguage, onChange: e => handleLanguageChange(e.target.value), onMouseDown: e => e.stopPropagation(), style: {
                            background: currentTheme.shade,
                            color: currentTheme.text,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '3px',
                            fontSize: '0.9em',
                            padding: '1px 4px',
                        }, children: [_jsx("option", { value: "", children: "none" }), Array.from(CODE_LANGUAGES).map(lang => (_jsx("option", { value: lang, children: lang }, lang)))] })] }))] }));
}
