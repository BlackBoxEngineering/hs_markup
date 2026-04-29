import React from 'react';
const JS_KW = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|yield|null|undefined|true|false)\b/;
const TS_KW = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|yield|null|undefined|true|false|type|interface|enum|as|is|keyof|readonly|never|unknown|any|string|number|boolean|bigint|symbol|object)\b/;
const SOL_KW = /\b(pragma|solidity|contract|interface|library|function|modifier|event|struct|enum|mapping|address|uint|uint8|uint16|uint32|uint64|uint128|uint256|int|int256|bool|string|bytes|bytes32|public|private|internal|external|view|pure|payable|returns|return|if|else|for|while|require|emit|memory|storage|calldata|msg|block|tx|this|super|true|false|revert|assert)\b/;
const PY_KW = /\b(def|class|return|if|elif|else|for|while|break|continue|pass|import|from|as|try|except|finally|raise|with|yield|lambda|and|or|not|in|is|None|True|False|self|print|async|await|global|nonlocal)\b/;
const SH_KW = /\b(if|then|else|elif|fi|for|do|done|while|until|case|esac|function|return|in|select|echo|exit|export|source|alias|unset|local|readonly|shift|set|unset|true|false)\b/;
const STRING = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/;
const PY_STRING = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|f"(?:[^"\\]|\\.)*"|f'(?:[^'\\]|\\.)*')/;
const SH_STRING = /("(?:[^"\\]|\\.)*"|'[^']*')/;
const LINE_COMMENT = /(\/\/[^\n]*)/;
const BLOCK_COMMENT = /(\/\*[\s\S]*?\*\/)/;
const HASH_COMMENT = /(#[^\n]*)/;
const SOL_COMMENT = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/;
const NUMBER = /\b(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|\d+\.?\d*(?:e[+-]?\d+)?)\b/;
const FUNC_CALL = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/;
const OPERATOR = /(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~?:])/;
const PUNCTUATION = /([{}()\[\];,.])/;
const JSON_STRING = /("(?:[^"\\]|\\.)*")\s*(?=:)/;
const JSON_VALUE_STRING = /("(?:[^"\\]|\\.)*")/;
const JSON_KW = /\b(true|false|null)\b/;
function buildRules(lang) {
    switch (lang) {
        case 'js':
            return [
                ['cmt', BLOCK_COMMENT], ['cmt', LINE_COMMENT],
                ['str', STRING], ['kw', JS_KW], ['num', NUMBER],
                ['fn', FUNC_CALL], ['op', OPERATOR], ['punc', PUNCTUATION],
            ];
        case 'ts':
            return [
                ['cmt', BLOCK_COMMENT], ['cmt', LINE_COMMENT],
                ['str', STRING], ['kw', TS_KW], ['num', NUMBER],
                ['fn', FUNC_CALL], ['op', OPERATOR], ['punc', PUNCTUATION],
            ];
        case 'sol':
            return [
                ['cmt', SOL_COMMENT],
                ['str', STRING], ['kw', SOL_KW], ['num', NUMBER],
                ['fn', FUNC_CALL], ['op', OPERATOR], ['punc', PUNCTUATION],
            ];
        case 'py':
            return [
                ['cmt', HASH_COMMENT],
                ['str', PY_STRING], ['kw', PY_KW], ['num', NUMBER],
                ['fn', FUNC_CALL], ['op', OPERATOR], ['punc', PUNCTUATION],
            ];
        case 'sh':
            return [
                ['cmt', HASH_COMMENT],
                ['str', SH_STRING], ['kw', SH_KW], ['num', NUMBER],
                ['fn', FUNC_CALL], ['op', OPERATOR], ['punc', PUNCTUATION],
            ];
        case 'json':
            return [
                ['kw', JSON_KW], ['fn', JSON_STRING],
                ['str', JSON_VALUE_STRING], ['num', NUMBER],
                ['punc', PUNCTUATION],
            ];
        default:
            return [];
    }
}
function tokenise(code, lang) {
    const rules = buildRules(lang);
    if (!rules.length)
        return [{ type: 'plain', text: code }];
    // build a combined regex with named-ish groups via alternation order
    const combined = new RegExp(rules.map(([, re]) => re.source).join('|'), 'gm');
    const tokens = [];
    let lastIndex = 0;
    let match;
    while ((match = combined.exec(code)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({ type: 'plain', text: code.slice(lastIndex, match.index) });
        }
        // figure out which rule matched by checking capture groups
        let groupIdx = 1;
        let matchedType = 'kw';
        for (const [type, re] of rules) {
            const groupCount = new RegExp(`${re.source}|`).exec('').length - 1;
            for (let g = 0; g < groupCount; g++) {
                if (match[groupIdx + g] !== undefined) {
                    matchedType = type;
                    break;
                }
            }
            if (match[groupIdx] !== undefined)
                break;
            groupIdx += groupCount;
        }
        tokens.push({ type: matchedType, text: match[0] });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < code.length) {
        tokens.push({ type: 'plain', text: code.slice(lastIndex) });
    }
    return tokens;
}
export function highlightCode(code, lang) {
    const tokens = tokenise(code, lang);
    return tokens.map((tok, i) => {
        if (tok.type === 'plain')
            return tok.text;
        return React.createElement('span', {
            key: i,
            className: `hs-hl-${tok.type}`,
        }, tok.text);
    });
}
/** CSS for syntax highlighting — works in both editor and renderer contexts. */
export const highlightCSS = `
  .hs-hl-kw  { color: #c678dd; }
  .hs-hl-str { color: #98c379; }
  .hs-hl-cmt { color: #7f848e; font-style: italic; }
  .hs-hl-num { color: #d19a66; }
  .hs-hl-fn  { color: #61afef; }
  .hs-hl-op  { color: #56b6c2; }
  .hs-hl-punc { color: #abb2bf; }
`;
