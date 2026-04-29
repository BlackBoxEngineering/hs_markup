export const TAGS = {
    // canonical short tags
    t: { tag: 't', element: 'span', className: 'hs-title' },
    b: { tag: 'b', element: 'strong' },
    i: { tag: 'i', element: 'em' },
    u: { tag: 'u', element: 'u' },
    s: { tag: 's', element: 's' },
    h: { tag: 'h', element: 'h2' },
    h1: { tag: 'h1', element: 'h1' },
    h2: { tag: 'h2', element: 'h2' },
    h3: { tag: 'h3', element: 'h3' },
    hl: { tag: 'hl', element: 'span', className: 'hs-highlight' },
    code: { tag: 'code', element: 'code' },
    q: { tag: 'q', element: 'blockquote' },
    // legacy tags — read-only, never produced by editor
    title: { tag: 'title', element: 'span', className: 'hs-title', legacy: true, short: 't' },
    header: { tag: 'header', element: 'h2', legacy: true, short: 'h' },
    bold: { tag: 'bold', element: 'strong', legacy: true, short: 'b' },
    italic: { tag: 'italic', element: 'em', legacy: true, short: 'i' },
    underline: { tag: 'underline', element: 'u', legacy: true, short: 'u' },
    quote: { tag: 'quote', element: 'blockquote', legacy: true, short: 'q' },
    highlight: { tag: 'highlight', element: 'span', className: 'hs-highlight', legacy: true, short: 'hl' },
};
/** Resolve a tag name to its canonical short tag. */
export function canonicalTag(tag) {
    const def = TAGS[tag];
    return def?.legacy && def.short ? def.short : tag;
}
