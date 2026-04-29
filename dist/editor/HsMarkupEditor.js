'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useCallback } from 'react';
import { displayToMarkup } from '../parser/displayToMarkup';
import { sanitisePaste } from './pasteSanitiser';
import { commands } from './commands';
import { markupToEditorHTML } from './markupToEditorHTML';
import { getCursorOffset, setCursorOffset } from './cursor';
import { themeVars, editorCSS } from './editorStyles';
import { Toolbar } from './Toolbar';
let styleInjected = false;
export function HsMarkupEditor({ content, onChange, currentTheme, maxLength, placeholder, className, }) {
    const ref = useRef(null);
    const isInternalChange = useRef(false);
    const lastValue = useRef(content);
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
    }, [onChange, maxLength]);
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
    return (_jsxs("div", { className: className, style: themeVars(currentTheme), children: [_jsx(Toolbar, { editorRef: ref, onFormat: handleInput, currentTheme: currentTheme }), _jsx("div", { ref: ref, contentEditable: true, suppressContentEditableWarning: true, "data-hs-editor": "", "data-placeholder": placeholder, onInput: handleInput, onPaste: handlePaste, onKeyDown: handleKeyDown })] }));
}
