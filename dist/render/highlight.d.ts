import React from 'react';
type TokenType = 'kw' | 'str' | 'cmt' | 'num' | 'fn' | 'op' | 'punc';
export declare function tokeniseCode(code: string, lang: string): {
    type: TokenType | 'plain';
    text: string;
}[];
export declare function highlightCode(code: string, lang: string): React.ReactNode[];
/** CSS for syntax highlighting — works in both editor and renderer contexts. */
export declare const highlightCSS = "\n  .hs-hl-kw  { color: #c678dd; }\n  .hs-hl-str { color: #98c379; }\n  .hs-hl-cmt { color: #7f848e; font-style: italic; }\n  .hs-hl-num { color: #d19a66; }\n  .hs-hl-fn  { color: #61afef; }\n  .hs-hl-op  { color: #56b6c2; }\n  .hs-hl-punc { color: #abb2bf; }\n";
export {};
