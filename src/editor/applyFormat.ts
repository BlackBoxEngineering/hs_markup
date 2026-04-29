const PRESERVE_WHITESPACE_TAGS = new Set(['code', 'pre']);

export function applyFormat(tag: string): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

  const range = sel.getRangeAt(0);
  if (range.toString() === '' && !PRESERVE_WHITESPACE_TAGS.has(tag)) return;

  // toggle: if entire selection is inside a span with the same tag, unwrap it
  const existing = findWrappingTag(range, tag);
  if (existing && range.toString().length === (existing.textContent?.length ?? 0)) {
    unwrapSpan(existing);
    return;
  }

  // extract DOM fragment — preserves structure including <br> nodes
  const fragment = range.extractContents();
  const text = PRESERVE_WHITESPACE_TAGS.has(tag)
    ? extractTextPreserving(fragment)
    : fragment.textContent ?? '';

  const wrapper = document.createElement('span');
  wrapper.dataset.tag = tag;
  wrapper.textContent = text;

  range.insertNode(wrapper);

  // clean up empty nodes left behind
  cleanEmptySpans(wrapper.parentElement);

  // restore selection to wrapped content
  const newRange = document.createRange();
  newRange.selectNodeContents(wrapper);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

/** Walk a DOM fragment extracting text, converting <br> to \n. */
function extractTextPreserving(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (node.nodeType === Node.ELEMENT_NODE) {
    if ((node as HTMLElement).tagName === 'BR') return '\n';
    return Array.from(node.childNodes).map(extractTextPreserving).join('');
  }
  return '';
}

/** Find an ancestor span[data-tag] matching `tag` that contains the entire range. */
function findWrappingTag(range: Range, tag: string): HTMLElement | null {
  let node: Node | null = range.commonAncestorContainer;
  while (node && node.nodeType !== Node.ELEMENT_NODE) node = node.parentNode;
  while (node) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node as HTMLElement).dataset?.tag === tag
    ) {
      return node as HTMLElement;
    }
    node = node.parentNode;
  }
  return null;
}

/** Replace a data-tag span with its children (unwrap). */
function unwrapSpan(span: HTMLElement): void {
  const parent = span.parentNode;
  if (!parent) return;
  while (span.firstChild) parent.insertBefore(span.firstChild, span);
  parent.removeChild(span);
  parent.normalize();
}

/** Remove empty data-tag spans left after range deletion. */
function cleanEmptySpans(container: Element | null): void {
  if (!container) return;
  const empties = container.querySelectorAll('span[data-tag]');
  empties.forEach(el => {
    if (!el.textContent) el.remove();
  });
}
