import type { Theme } from '../theme';

/** CSS custom properties derived from the theme, set on the editor root. */
export function themeVars(theme: Theme): React.CSSProperties {
  return {
    '--hs-highlight': theme.highlight,
    '--hs-border':    theme.border,
    '--hs-shade':     theme.shade,
    '--hs-text':      theme.text,
    '--hs-bg':        theme.background,
    '--hs-fg':        theme.foreground,
    '--hs-light':     theme.highlight,
    '--hs-link':      theme.link,
  } as React.CSSProperties;
}

/** Scoped editor styles using data-tag attribute selectors. */
export const editorCSS = `
  [data-hs-editor] {
    color: var(--hs-text);
    font-family: inherit;
    font-weight: normal;
    font-size: 1rem;
    line-height: 1.6;
    outline: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    min-height: 120px;
    padding: 0.75rem;
  }
  [data-hs-editor]:empty::before {
    content: attr(data-placeholder);
    color: var(--hs-border);
    pointer-events: none;
    font-weight: normal;
  }
  [data-hs-editor] [data-tag="t"] {
    font-size: 2rem;
    font-weight: bold;
    color: var(--hs-light);
    display: block;
    line-height: 1.2;
    margin-bottom: 0.25em;
  }
  [data-hs-editor] [data-tag="h"],
  [data-hs-editor] [data-tag="h2"] {
    font-size: 1.45rem;
    font-weight: bold;
    color: var(--hs-highlight);
    display: block;
    line-height: 1.3;
    margin-bottom: 0.2em;
  }
  [data-hs-editor] [data-tag="h1"] {
    font-size: 1.75rem;
    font-weight: bold;
    color: var(--hs-highlight);
    display: block;
    line-height: 1.2;
    margin-bottom: 0.2em;
  }
  [data-hs-editor] [data-tag="h3"] {
    font-size: 1.17rem;
    font-weight: bold;
    color: var(--hs-highlight);
    display: block;
    line-height: 1.3;
    margin-bottom: 0.2em;
  }
  [data-hs-editor] [data-tag="b"] {
    font-weight: bold;
    color: inherit;
  }
  [data-hs-editor] [data-tag="i"] {
    font-style: italic;
    color: inherit;
  }
  [data-hs-editor] [data-tag="u"] {
    text-decoration: underline;
    color: inherit;
  }
  [data-hs-editor] [data-tag="s"] {
    text-decoration: line-through;
    color: inherit;
  }
  [data-hs-editor] [data-tag="hl"] {
    background-color: #dae197;
    color: #2f3025;
    font-weight: bold;
    padding: 1px 4px;
    border-radius: 4px;
  }
  [data-hs-editor] [data-tag="q"] {
    display: block;
    font-style: italic;
    margin-left: 20px;
    border-left: 4px solid var(--hs-border);
    color: var(--hs-highlight);
    padding-left: 10px;
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  }
  [data-hs-editor] [data-tag="code"] {
    display: block;
    font-family: 'Fira Code', 'Courier New', monospace;
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.9em;
    font-weight: normal;
    white-space: pre;
    overflow-x: auto;
    margin: 0.5em 0;
  }
  [data-hs-editor] [data-tag="pre"] {
    display: block;
    font-family: 'Fira Code', 'Courier New', monospace;
    background: var(--hs-shade);
    padding: 0.5em 0.75em;
    border-radius: 4px;
    font-size: 0.9em;
    font-weight: normal;
  }
`;
