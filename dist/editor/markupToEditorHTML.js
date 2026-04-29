import { TAGS, canonicalTag } from '../language/tags';
import { sanitiseCodeLanguage } from '../language/codeLang';
import { tokeniseCode } from '../render/highlight';
const TAG_RE = /\[(\/?)([a-z0-9]+)(?:\s+([^\]]+))?\]/gi;
const ATTR_RE = /([a-z][a-z0-9_-]*)=([a-z0-9_-]+)/gi;
// Tags that must preserve literal \n instead of converting to <br>
const PRESERVE_WHITESPACE_TAGS = new Set(['code']);
/**
 * Converts markup string -> editor-safe innerHTML.
 * Each tagged span carries data-tag (always the canonical short form)
 * so displayToMarkup can round-trip it.
 * Inside code spans, \n is kept as a literal newline (white-space: pre handles it).
 * Outside code spans, \n is converted to <br>.
 */
export function markupToEditorHTML(markup) {
    let result = '';
    let lastIndex = 0;
    let insidePreserve = false;
    let currentCodeLanguage;
    let match;
    TAG_RE.lastIndex = 0;
    while ((match = TAG_RE.exec(markup)) !== null) {
        const [raw, slash, rawTag, rawAttrs] = match;
        const before = markup.slice(lastIndex, match.index);
        if (insidePreserve && currentCodeLanguage) {
            result += highlightCodeAsHTML(before, currentCodeLanguage);
        }
        else if (insidePreserve) {
            result += escapeHtml(before);
        }
        else {
            result += escapeHtml(before).replace(/\n/g, '<br>');
        }
        const tag = canonicalTag(rawTag.toLowerCase());
        if (!TAGS[tag]) {
            result += escapeHtml(raw);
            lastIndex = match.index + raw.length;
            continue;
        }
        if (slash) {
            if (PRESERVE_WHITESPACE_TAGS.has(tag)) {
                insidePreserve = false;
                currentCodeLanguage = undefined;
            }
            result += '</span>';
        }
        else {
            if (PRESERVE_WHITESPACE_TAGS.has(tag)) {
                insidePreserve = true;
                currentCodeLanguage = parseCodeLg(rawAttrs);
            }
            result += buildOpenSpan(tag, rawAttrs);
        }
        lastIndex = match.index + raw.length;
    }
    const tail = markup.slice(lastIndex);
    if (insidePreserve && currentCodeLanguage) {
        result += highlightCodeAsHTML(tail, currentCodeLanguage);
    }
    else if (insidePreserve) {
        result += escapeHtml(tail);
    }
    else {
        result += escapeHtml(tail).replace(/\n/g, '<br>');
    }
    return result;
}
function buildOpenSpan(tag, rawAttrs) {
    if (tag !== 'code')
        return `<span data-tag="${tag}">`;
    const lg = parseCodeLg(rawAttrs);
    const lgAttr = lg ? ` data-lg="${lg}"` : '';
    return `<span data-tag="code"${lgAttr} spellcheck="false" autocorrect="off" autocapitalize="off" autocomplete="off">`;
}
function parseCodeLg(rawAttrs) {
    if (!rawAttrs)
        return undefined;
    let match;
    ATTR_RE.lastIndex = 0;
    while ((match = ATTR_RE.exec(rawAttrs)) !== null) {
        if (match[1].toLowerCase() === 'lg')
            return sanitiseCodeLanguage(match[2]);
    }
    return undefined;
}
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function highlightCodeAsHTML(code, language) {
    return tokeniseCode(code, language)
        .map((token) => {
        const escaped = escapeHtml(token.text);
        if (token.type === 'plain')
            return escaped;
        return `<span class="hs-hl-${token.type}">${escaped}</span>`;
    })
        .join('');
}
