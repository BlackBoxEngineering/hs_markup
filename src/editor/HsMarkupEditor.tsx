'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { displayToMarkup } from '../parser/displayToMarkup';
import { sanitisePaste } from './pasteSanitiser';
import { commands } from './commands';
import { markupToEditorHTML } from './markupToEditorHTML';
import { getCursorOffset, setCursorOffset } from './cursor';
import { themeVars, editorCSS } from './editorStyles';
import { Toolbar } from './Toolbar';
import type { Theme } from '../theme';
import { CODE_LANGUAGES, sanitiseCodeLanguage } from '../language/codeLang';

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
  const [activeCodeBlock, setActiveCodeBlock] = useState<HTMLElement | null>(null);
  const [codeLanguage, setCodeLanguage] = useState<string>('');
  const [langPosition, setLangPosition] = useState<{ top: number; right: number; compact: boolean } | null>(null);

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

    let current: Node | null = node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;
    let found: HTMLElement | null = null;
    while (current && current !== root) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const el = current as HTMLElement;
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
    el.innerHTML = markupToEditorHTML(markup);
    if (preEditOffset !== null) setCursorOffset(el, preEditOffset);
    onChange(markup);
    syncActiveCode();
  }, [onChange, maxLength, syncActiveCode]);

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

  const handleLanguageChange = useCallback((nextLanguage: string) => {
    const codeEl = activeCodeBlock;
    if (!codeEl) return;

    const lg = sanitiseCodeLanguage(nextLanguage);
    if (lg) codeEl.dataset.lg = lg;
    else delete codeEl.dataset.lg;

    setCodeLanguage(lg ?? '');
    handleInput();
  }, [activeCodeBlock, handleInput]);

  return (
    <div className={className} style={{ ...themeVars(currentTheme), position: 'relative' }}>
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
      {activeCodeBlock && langPosition && (
        <label
          style={{
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
          }}
        >
          Lang
          <select
            value={codeLanguage}
            onChange={e => handleLanguageChange(e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            style={{
              background: '#2d2d2d',
              color: '#f8f8f2',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '3px',
              fontSize: langPosition.compact ? '0.82em' : '0.9em',
              padding: langPosition.compact ? '0 3px' : '1px 4px',
            }}
          >
            <option value="">none</option>
            {Array.from(CODE_LANGUAGES).map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
