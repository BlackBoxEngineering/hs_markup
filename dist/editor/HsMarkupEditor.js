'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useCallback, useState } from 'react';
import { displayToMarkup } from '../parser/displayToMarkup';
import { sanitisePaste } from './pasteSanitiser';
import { commands } from './commands';
import { markupToEditorHTML } from './markupToEditorHTML';
import { getCursorOffset, setCursorOffset } from './cursor';
import { themeVars, editorCSS } from './editorStyles';
import { Toolbar } from './Toolbar';
import { CODE_LANGUAGES, sanitiseCodeLanguage } from '../language/codeLang';
let styleInjected = false;
export function HsMarkupEditor({ content, onChange, currentTheme, maxLength, placeholder, className, }) {
    const ref = useRef(null);
    const isInternalChange = useRef(false);
    const lastValue = useRef(content);
    const [activeCodeBlock, setActiveCodeBlock] = useState(null);
    const [codeLanguage, setCodeLanguage] = useState('');
    const [langPosition, setLangPosition] = useState(null);
    // inject scoped styles once
    useEffect(() => {
        if (styleInjected)
            return;
        const style = document.createElement('style');
        style.textContent = editorCSS;
        document.head.appendChild(style);
        styleInjected = true;
    }, []);
    // sync external value → DOM
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }
        if (content === lastValue.current && el.innerHTML)
            return;
        lastValue.current = content;
        const offset = getCursorOffset(el);
        el.innerHTML = markupToEditorHTML(content);
        if (offset !== null)
            setCursorOffset(el, offset);
    }, [content]);
    const syncActiveCode = useCallback(() => {
        const root = ref.current;
        const sel = window.getSelection();
        if (!root || !sel || sel.rangeCount === 0) {
            setActiveCodeBlock(null);
            setCodeLanguage('');
            setLangPosition(null);
            return;
        }
        const node = sel.anchorNode;
        if (!node || !root.contains(node)) {
            setActiveCodeBlock(null);
            setCodeLanguage('');
            setLangPosition(null);
            return;
        }
        let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;
        let found = null;
        while (current && current !== root) {
            if (current.nodeType === Node.ELEMENT_NODE) {
                const el = current;
                if (el.dataset?.tag === 'code') {
                    found = el;
                    break;
                }
            }
            current = current.parentNode;
        }
        if (!found) {
            setActiveCodeBlock(null);
            setCodeLanguage('');
            setLangPosition(null);
            return;
        }
        setActiveCodeBlock(found);
        setCodeLanguage(found.dataset.lg ?? '');
        const editorRect = root.getBoundingClientRect();
        const codeRect = found.getBoundingClientRect();
        const right = Math.max(8, editorRect.right - codeRect.right + 8);
        const top = Math.max(6, codeRect.top - editorRect.top + 6);
        setLangPosition({ top, right });
    }, []);
    useEffect(() => {
        const root = ref.current;
        const onSelectionChange = () => syncActiveCode();
        const onResize = () => syncActiveCode();
        document.addEventListener('selectionchange', onSelectionChange);
        window.addEventListener('resize', onResize);
        root?.addEventListener('scroll', onSelectionChange);
        syncActiveCode();
        return () => {
            document.removeEventListener('selectionchange', onSelectionChange);
            window.removeEventListener('resize', onResize);
            root?.removeEventListener('scroll', onSelectionChange);
        };
    }, [syncActiveCode]);
    const handleInput = useCallback(() => {
        const el = ref.current;
        if (!el)
            return;
        const preEditOffset = getCursorOffset(el);
        const markup = displayToMarkup(el);
        if (maxLength !== undefined && markup.length > maxLength) {
            // revert — restore previous state
            el.innerHTML = markupToEditorHTML(lastValue.current);
            if (preEditOffset !== null)
                setCursorOffset(el, preEditOffset);
            return;
        }
        isInternalChange.current = true;
        lastValue.current = markup;
        el.innerHTML = markupToEditorHTML(markup);
        if (preEditOffset !== null)
            setCursorOffset(el, preEditOffset);
        onChange(markup);
        syncActiveCode();
    }, [onChange, maxLength, syncActiveCode]);
    const handlePaste = useCallback((e) => {
        const text = sanitisePaste(e.nativeEvent);
        document.execCommand('insertText', false, text);
    }, []);
    const handleKeyDown = useCallback((e) => {
        if (!e.ctrlKey && !e.metaKey)
            return;
        const map = {
            b: 'bold', i: 'italic', u: 'underline',
        };
        const cmd = map[e.key.toLowerCase()];
        if (cmd) {
            e.preventDefault();
            commands[cmd]();
            handleInput();
        }
    }, [handleInput]);
    const handleLanguageChange = useCallback((nextLanguage) => {
        const codeEl = activeCodeBlock;
        if (!codeEl)
            return;
        const lg = sanitiseCodeLanguage(nextLanguage);
        if (lg)
            codeEl.dataset.lg = lg;
        else
            delete codeEl.dataset.lg;
        setCodeLanguage(lg ?? '');
        handleInput();
    }, [activeCodeBlock, handleInput]);
    return (_jsxs("div", { className: className, style: { ...themeVars(currentTheme), position: 'relative' }, children: [_jsx(Toolbar, { editorRef: ref, onFormat: handleInput, currentTheme: currentTheme }), _jsx("div", { ref: ref, contentEditable: true, suppressContentEditableWarning: true, "data-hs-editor": "", "data-placeholder": placeholder, onInput: handleInput, onPaste: handlePaste, onKeyDown: handleKeyDown }), activeCodeBlock && langPosition && (_jsxs("label", { style: {
                    position: 'absolute',
                    top: `${langPosition.top}px`,
                    right: `${langPosition.right}px`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 20,
                    color: '#abb2bf',
                    background: '#2d2d2d',
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.75em',
                    fontFamily: 'monospace',
                }, children: ["Lang", _jsxs("select", { value: codeLanguage, onChange: e => handleLanguageChange(e.target.value), onMouseDown: e => e.stopPropagation(), style: {
                            background: '#2d2d2d',
                            color: '#f8f8f2',
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '3px',
                            fontSize: '0.9em',
                            padding: '1px 4px',
                        }, children: [_jsx("option", { value: "", children: "none" }), Array.from(CODE_LANGUAGES).map(lang => (_jsx("option", { value: lang, children: lang }, lang)))] })] }))] }));
}
