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
    const lastEmitted = useRef(content);
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
    // sync external value → DOM (only when content changes from outside)
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        // skip if this is the value we just emitted
        if (content === lastEmitted.current && el.innerHTML)
            return;
        lastEmitted.current = content;
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
        const parentTopOffset = root.offsetTop;
        const compact = window.innerWidth <= 640;
        const rightOffset = compact ? 4 : 8;
        const topOffset = compact ? 2 : 4;
        const right = Math.max(rightOffset, editorRect.right - codeRect.right + rightOffset);
        const top = Math.max(topOffset, parentTopOffset + (codeRect.top - editorRect.top) + topOffset);
        setLangPosition({ top, right, compact });
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
    // serialise and emit — does NOT replace innerHTML
    const emitMarkup = useCallback(() => {
        const el = ref.current;
        if (!el)
            return;
        const markup = displayToMarkup(el);
        if (maxLength !== undefined && markup.length > maxLength) {
            // revert to last good state
            const offset = getCursorOffset(el);
            el.innerHTML = markupToEditorHTML(lastEmitted.current);
            if (offset !== null)
                setCursorOffset(el, Math.max(0, offset - 1));
            return;
        }
        lastEmitted.current = markup;
        onChange(markup);
        syncActiveCode();
    }, [onChange, maxLength, syncActiveCode]);
    // full re-render: serialise → rebuild DOM → restore cursor
    // only used after toolbar actions that mutate DOM structure
    const rerenderAndEmit = useCallback(() => {
        const el = ref.current;
        if (!el)
            return;
        const offset = getCursorOffset(el);
        const markup = displayToMarkup(el);
        if (maxLength !== undefined && markup.length > maxLength) {
            el.innerHTML = markupToEditorHTML(lastEmitted.current);
            if (offset !== null)
                setCursorOffset(el, Math.max(0, offset - 1));
            return;
        }
        lastEmitted.current = markup;
        el.innerHTML = markupToEditorHTML(markup);
        if (offset !== null)
            setCursorOffset(el, offset);
        onChange(markup);
        syncActiveCode();
    }, [onChange, maxLength, syncActiveCode]);
    const handleInput = useCallback(() => {
        emitMarkup();
    }, [emitMarkup]);
    const handlePaste = useCallback((e) => {
        const text = sanitisePaste(e.nativeEvent);
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0)
            return;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        let node = sel.anchorNode;
        let insideCode = false;
        while (node && node !== ref.current) {
            if (node.nodeType === Node.ELEMENT_NODE && node.dataset?.tag === 'code') {
                insideCode = true;
                break;
            }
            node = node.parentNode;
        }
        if (insideCode) {
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
        }
        else {
            const fragment = document.createDocumentFragment();
            const lines = text.split('\n');
            lines.forEach((line, index) => {
                if (line.length > 0) {
                    fragment.appendChild(document.createTextNode(line));
                }
                if (index < lines.length - 1) {
                    fragment.appendChild(document.createElement('br'));
                }
            });
            const endMarker = document.createTextNode('');
            fragment.appendChild(endMarker);
            range.insertNode(fragment);
            range.setStartBefore(endMarker);
            range.collapse(true);
            endMarker.remove();
        }
        sel.removeAllRanges();
        sel.addRange(range);
        emitMarkup();
    }, [emitMarkup]);
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                let node = sel.anchorNode;
                let insideCode = false;
                let insideQuote = false;
                let quoteSpan = null;
                while (node && node !== ref.current) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const tag = node.dataset?.tag;
                        if (tag === 'code') {
                            insideCode = true;
                            break;
                        }
                        if (tag === 'q' && !e.shiftKey) {
                            insideQuote = true;
                            quoteSpan = node;
                            break;
                        }
                    }
                    node = node.parentNode;
                }
                if (insideCode) {
                    e.preventDefault();
                    range.deleteContents();
                    const newline = document.createTextNode('\n');
                    range.insertNode(newline);
                    range.setStartAfter(newline);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    emitMarkup();
                    return;
                }
                if (insideQuote && quoteSpan) {
                    e.preventDefault();
                    range.deleteContents();
                    // insert a <br> immediately after the quote span, then place cursor after it
                    const br = document.createElement('br');
                    const textNode = document.createTextNode('\u200B'); // zero-width space to anchor cursor
                    quoteSpan.after(br);
                    br.after(textNode);
                    const newRange = document.createRange();
                    newRange.setStartAfter(br);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                    emitMarkup();
                    return;
                }
            }
        }
        if (!e.ctrlKey && !e.metaKey)
            return;
        const map = {
            b: 'bold', i: 'italic', u: 'underline',
        };
        const cmd = map[e.key.toLowerCase()];
        if (cmd) {
            e.preventDefault();
            commands[cmd]();
            rerenderAndEmit();
        }
    }, [emitMarkup, rerenderAndEmit]);
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
        rerenderAndEmit();
    }, [activeCodeBlock, rerenderAndEmit]);
    return (_jsxs("div", { className: className, style: { ...themeVars(currentTheme), position: 'relative' }, children: [_jsx(Toolbar, { editorRef: ref, onFormat: rerenderAndEmit, currentTheme: currentTheme }), _jsx("div", { ref: ref, contentEditable: true, suppressContentEditableWarning: true, "data-hs-editor": "", "data-placeholder": placeholder, onInput: handleInput, onPaste: handlePaste, onKeyDown: handleKeyDown }), activeCodeBlock && langPosition && (_jsxs("label", { style: {
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
                    padding: langPosition.compact ? '1px 4px' : '2px 6px',
                    fontSize: langPosition.compact ? '0.68em' : '0.75em',
                    fontFamily: 'monospace',
                }, children: ["Lang", _jsxs("select", { value: codeLanguage, onChange: e => handleLanguageChange(e.target.value), onMouseDown: e => e.stopPropagation(), style: {
                            background: '#2d2d2d',
                            color: '#f8f8f2',
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '3px',
                            fontSize: langPosition.compact ? '0.82em' : '0.9em',
                            padding: langPosition.compact ? '0 3px' : '1px 4px',
                        }, children: [_jsx("option", { value: "", children: "none" }), Array.from(CODE_LANGUAGES).map(lang => (_jsx("option", { value: lang, children: lang }, lang)))] })] }))] }));
}
