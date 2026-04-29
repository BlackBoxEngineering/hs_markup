/** CSS custom properties derived from the theme, set on the editor root. */
export function themeVars(theme) {
    return {
        '--hs-highlight': theme.highlight,
        '--hs-border': theme.border,
        '--hs-shade': theme.shade,
        '--hs-text': theme.text,
        '--hs-bg': theme.background,
        '--hs-fg': theme.foreground,
    };
}
/** Scoped editor styles using data-tag attribute selectors. */
export const editorCSS = `
  [data-hs-editor] {
    color: var(--hs-text);
    font-family: inherit;
    line-height: 1.5;
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
  }
  [data-hs-editor] [data-tag="t"] {
    font-size: 1.4em;
    font-weight: bold;
    color: var(--hs-highlight);
  }
  [data-hs-editor] [data-tag="h"] {
    font-size: 1.5em;
    font-weight: bold;
    color: var(--hs-highlight);
    display: block;
  }
  [data-hs-editor] [data-tag="h1"] {
    font-size: 2em;
    font-weight: bold;
    color: var(--hs-highlight);
    display: block;
  }
  [data-hs-editor] [data-tag="h2"] {
    font-size: 1.5em;
    font-weight: bold;
    color: var(--hs-highlight);
    display: block;
  }
  [data-hs-editor] [data-tag="h3"] {
    font-size: 1.17em;
    font-weight: bold;
    color: var(--hs-highlight);
    display: block;
  }
  [data-hs-editor] [data-tag="b"] { font-weight: bold; }
  [data-hs-editor] [data-tag="i"] { font-style: italic; }
  [data-hs-editor] [data-tag="u"] { text-decoration: underline; }
  [data-hs-editor] [data-tag="s"] { text-decoration: line-through; }
  [data-hs-editor] [data-tag="hl"] {
    background: color-mix(in srgb, var(--hs-highlight) 20%, transparent);
    border-radius: 2px;
    padding: 0 2px;
  }
  [data-hs-editor] [data-tag="code"] {
    font-family: monospace;
    background: var(--hs-shade);
    padding: 0 0.25em;
    border-radius: 3px;
    font-size: 0.9em;
  }
  [data-hs-editor] [data-tag="pre"] {
    display: block;
    font-family: monospace;
    background: var(--hs-shade);
    padding: 0.5em 0.75em;
    border-radius: 4px;
    font-size: 0.9em;
  }
  [data-hs-editor] [data-tag="q"] {
    display: block;
    border-left: 4px solid var(--hs-border);
    padding-left: 0.75em;
    font-style: italic;
    opacity: 0.85;
  }
`;
