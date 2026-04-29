import { TAGS, canonicalTag } from '../language/tags';
import { sanitiseCodeLanguage } from '../language/codeLang';
const BLOCK_BREAK_TAGS = new Set(['DIV', 'P', 'LI']);
export function displayToMarkup(el) {
    return nodeToMarkup(el, true);
}
function nodeToMarkup(node, isRoot = false) {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE)
        return '';
    const el = node;
    const raw = el.dataset.tag;
    const children = Array.from(el.childNodes).map(child => nodeToMarkup(child)).join('');
    if (raw) {
        const tag = canonicalTag(raw);
        if (TAGS[tag]) {
            const attrs = serialiseAllowedAttrs(tag, el);
            return `[${tag}${attrs}]${children}[/${tag}]`;
        }
        return children;
    }
    // br -> newline
    if (el.tagName === 'BR')
        return '\n';
    if (!isRoot && BLOCK_BREAK_TAGS.has(el.tagName))
        return `${children}\n`;
    return children;
}
function serialiseAllowedAttrs(tag, el) {
    if (tag !== 'code')
        return '';
    const lg = sanitiseCodeLanguage(el.dataset.lg);
    return lg ? ` lg=${lg}` : '';
}
