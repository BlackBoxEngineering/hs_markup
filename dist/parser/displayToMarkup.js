import { TAGS, canonicalTag } from '../language/tags';
export function displayToMarkup(el) {
    return nodeToMarkup(el);
}
function nodeToMarkup(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE)
        return '';
    const el = node;
    const raw = el.dataset.tag;
    const children = Array.from(el.childNodes).map(nodeToMarkup).join('');
    if (raw) {
        const tag = canonicalTag(raw);
        if (TAGS[tag]) {
            return `[${tag}]${children}[/${tag}]`;
        }
        return children;
    }
    // br → newline
    if (el.tagName === 'BR')
        return '\n';
    return children;
}
