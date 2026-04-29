/**
 * Converts markup string -> editor-safe innerHTML.
 * Each tagged span carries data-tag (always the canonical short form)
 * so displayToMarkup can round-trip it.
 * Inside code spans, \n is kept as a literal newline (white-space: pre handles it).
 * Outside code spans, \n is converted to <br>.
 */
export declare function markupToEditorHTML(markup: string): string;
