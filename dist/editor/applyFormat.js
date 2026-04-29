import { sanitiseCodeLanguage } from '../language/codeLang';
const PRESERVE_WHITESPACE_TAGS = new Set(['code']);
const BLOCK_BREAK_TAGS = new Set(['DIV', 'P', 'LI']);
export function applyFormat(tag, options) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed)
        return;
    const range = sel.getRangeAt(0);
    // toggle: if entire selection is inside a span with the same tag, unwrap it
    const existing = findWrappingTag(range, tag);
    if (existing && range.toString().length === (existing.textContent?.length ?? 0)) {
        unwrapSpan(existing);
        return;
    }
    // clone first so we never lose content
    const fragment = range.cloneContents();
    const text = PRESERVE_WHITESPACE_TAGS.has(tag)
        ? extractTextPreserving(fragment)
        : range.toString();
    if (!text)
        return;
    // now safe to delete and replace
    range.deleteContents();
    const wrapper = document.createElement('span');
    wrapper.dataset.tag = tag;
    if (tag === 'code') {
        const lg = sanitiseCodeLanguage(options?.codeLanguage);
        if (lg)
            wrapper.dataset.lg = lg;
        wrapper.setAttribute('spellcheck', 'false');
        wrapper.setAttribute('autocorrect', 'off');
        wrapper.setAttribute('autocapitalize', 'off');
        wrapper.setAttribute('autocomplete', 'off');
    }
    wrapper.textContent = text;
    range.insertNode(wrapper);
    cleanEmptySpans(wrapper.parentElement);
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    sel.removeAllRanges();
    sel.addRange(newRange);
}
/** Walk a DOM fragment extracting text, converting line-break elements to \n. */
function extractTextPreserving(node) {
    if (node.nodeType === Node.TEXT_NODE)
        return node.textContent ?? '';
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        return Array.from(node.childNodes).map(extractTextPreserving).join('');
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;
        if (el.tagName === 'BR')
            return '\n';
        const children = Array.from(el.childNodes).map(extractTextPreserving).join('');
        return BLOCK_BREAK_TAGS.has(el.tagName) ? `${children}\n` : children;
    }
    return '';
}
/** Find an ancestor span[data-tag] matching `tag` that contains the entire range. */
function findWrappingTag(range, tag) {
    let node = range.commonAncestorContainer;
    while (node && node.nodeType !== Node.ELEMENT_NODE)
        node = node.parentNode;
    while (node) {
        if (node.nodeType === Node.ELEMENT_NODE &&
            node.dataset?.tag === tag) {
            return node;
        }
        node = node.parentNode;
    }
    return null;
}
/** Replace a data-tag span with its children (unwrap). */
function unwrapSpan(span) {
    const parent = span.parentNode;
    if (!parent)
        return;
    while (span.firstChild)
        parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
    parent.normalize();
}
/** Remove empty data-tag spans left after range deletion. */
function cleanEmptySpans(container) {
    if (!container)
        return;
    const empties = container.querySelectorAll('span[data-tag]');
    empties.forEach(el => {
        if (!el.textContent)
            el.remove();
    });
}
