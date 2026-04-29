export function applyFormat(tag) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed)
        return;
    const range = sel.getRangeAt(0);
    const text = range.toString();
    if (!text)
        return;
    // toggle: if entire selection is inside a span with the same tag, unwrap it
    const existing = findWrappingTag(range, tag);
    if (existing && range.toString().length === (existing.textContent?.length ?? 0)) {
        unwrapSpan(existing);
        return;
    }
    // extract as flat text, delete range, insert clean span
    // this safely handles cross-boundary selections
    range.deleteContents();
    const wrapper = document.createElement('span');
    wrapper.dataset.tag = tag;
    wrapper.textContent = text;
    range.insertNode(wrapper);
    // clean up: remove any empty nodes left by deleteContents
    cleanEmptySpans(wrapper.parentElement);
    // restore selection to wrapped content
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    sel.removeAllRanges();
    sel.addRange(newRange);
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
