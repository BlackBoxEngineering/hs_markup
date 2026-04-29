'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { displayToMarkup } from '../parser/displayToMarkup';
import { sanitisePaste } from './pasteSanitiser';
import { commands } from './commands';
import { markupToEditorHTML } from './markupToEditorHTML';
import { getCursorOffset, setCursorOffset } from './cursor';
import { themeVars, editorCSS } from './editorStyles';
import { Toolbar } from './Toolbar';
import type { Theme } from '../theme';

let styleInjected = false;

type Props = {
  content: string;
  onChange: (markup: string) => void;
  currentTheme: Theme;
  maxLength?: number;
  placeholder?: string;
  className?: string;
};

export function HsMarkupEditor({
  content,
  onChange,
  currentTheme,
  maxLength,
  placeholder,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const lastValue = useRef(content);

  // inject scoped styles once
  useEffect(() => {
    if (styleInjected) return;
    const style = document.createElement('style');
    style.textContent = editorCSS;
    document.head.appendChild(style);
    styleInjected = true;
  }, []);

  // sync external value → DOM
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (content === lastValue.current && el.innerHTML) return;
    lastValue.current = content;

    const offset = getCursorOffset(el);
    el.innerHTML = markupToEditorHTML(content);
    if (offset !== null) setCursorOffset(el, offset);
  }, [content]);

  const handleInput = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const preEditOffset = getCursorOffset(el);
    const markup = displayToMarkup(el);

    if (maxLength !== undefined && markup.length > maxLength) {
      // revert — restore previous state
      el.innerHTML = markupToEditorHTML(lastValue.current);
      if (preEditOffset !== null) setCursorOffset(el, preEditOffset);
      return;
    }

    isInternalChange.current = true;
    lastValue.current = markup;
    onChange(markup);
  }, [onChange, maxLength]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = sanitisePaste(e.nativeEvent);
    document.execCommand('insertText', false, text);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    const map: Record<string, keyof typeof commands> = {
      b: 'bold', i: 'italic', u: 'underline',
    };
    const cmd = map[e.key.toLowerCase()];
    if (cmd) { e.preventDefault(); commands[cmd](); handleInput(); }
  }, [handleInput]);

  return (
    <div className={className} style={themeVars(currentTheme)}>
      <Toolbar editorRef={ref} onFormat={handleInput} currentTheme={currentTheme} />
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-hs-editor=""
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
