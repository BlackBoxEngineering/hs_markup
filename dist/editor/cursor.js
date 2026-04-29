/**
 * Character-offset cursor strategy.
 * Walks text nodes in DOM order to convert between
 * (node, offset) ↔ integer character offset from root.
 * Survives innerHTML replacement because it holds no node references.
 */
export function getCursorOffset(root) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0)
        return null;
    const range = sel.getRangeAt(0);
    if (!root.contains(range.startContainer))
        return null;
    let offset = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
        if (node === range.startContainer) {
            if (node.nodeType === Node.TEXT_NODE) {
                return offset + range.startOffset;
            }
            if (node.nodeType === Node.ELEMENT_NODE) {
                let childOffset = 0;
                const element = node;
                const max = Math.min(range.startOffset, element.childNodes.length);
                for (let i = 0; i < max; i++) {
                    childOffset += nodeTextLength(element.childNodes[i]);
                }
                return offset + childOffset;
            }
            return offset;
        }
        // count <br> as 1 character (maps to \n)
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
            offset += 1;
        }
        else if (node.nodeType === Node.TEXT_NODE) {
            offset += node.textContent?.length ?? 0;
        }
    }
    return offset;
}
export function setCursorOffset(root, offset) {
    const sel = window.getSelection();
    if (!sel)
        return;
    let remaining = Math.max(0, offset);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
            if (remaining <= 0) {
                // place cursor just before this BR
                const range = document.createRange();
                range.setStartBefore(node);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return;
            }
            remaining -= 1;
        }
        else if (node.nodeType === Node.TEXT_NODE) {
            const len = node.textContent?.length ?? 0;
            if (remaining <= len) {
                const range = document.createRange();
                range.setStart(node, remaining);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return;
            }
            remaining -= len;
        }
    }
    // offset beyond content — place at end
    const range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}
function nodeTextLength(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.length ?? 0;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR')
            return 1;
        let total = 0;
        node.childNodes.forEach(child => {
            total += nodeTextLength(child);
        });
        return total;
    }
    return 0;
}
