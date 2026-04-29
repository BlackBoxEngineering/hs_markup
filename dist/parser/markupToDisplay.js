import { TAGS, canonicalTag } from '../language/tags';
import { sanitiseCodeLanguage } from '../language/codeLang';
const TAG_RE = /\[(\/?)([a-z0-9]+)(?:\s+([^\]]+))?\]/gi;
const ATTR_RE = /([a-z][a-z0-9_-]*)=([a-z0-9_-]+)/gi;
export function parseMarkup(input) {
    const root = [];
    const stack = [];
    const current = () => (stack.length ? stack[stack.length - 1].children : root);
    let lastIndex = 0;
    let match;
    while ((match = TAG_RE.exec(input)) !== null) {
        const [raw, slash, rawTag, rawAttrs] = match;
        const textBefore = input.slice(lastIndex, match.index);
        pushTextWithNewlines(current(), textBefore);
        lastIndex = match.index + raw.length;
        const canonical = canonicalTag(rawTag.toLowerCase());
        if (!TAGS[canonical]) {
            current().push({ type: 'text', value: raw });
            continue;
        }
        if (slash) {
            if (stack.length && stack[stack.length - 1].tag === canonical) {
                const node = stack.pop();
                current().push({ type: 'element', tag: node.tag, attrs: node.attrs, children: node.children });
            }
            else {
                current().push({ type: 'text', value: raw });
            }
            continue;
        }
        stack.push({
            tag: canonical,
            attrs: parseAllowedAttrs(canonical, rawAttrs),
            children: [],
        });
    }
    pushTextWithNewlines(current(), input.slice(lastIndex));
    // unclosed tags: flush as plain text
    while (stack.length) {
        const node = stack.pop();
        const open = buildOpenTag(node.tag, node.attrs);
        current().push({ type: 'text', value: open }, ...node.children);
    }
    return root;
}
function parseAllowedAttrs(tag, rawAttrs) {
    if (!rawAttrs || tag !== 'code')
        return undefined;
    const attrs = {};
    let match;
    ATTR_RE.lastIndex = 0;
    while ((match = ATTR_RE.exec(rawAttrs)) !== null) {
        const key = match[1].toLowerCase();
        const value = match[2];
        if (key === 'lg') {
            const lang = sanitiseCodeLanguage(value);
            if (lang)
                attrs.lg = lang;
        }
    }
    return Object.keys(attrs).length ? attrs : undefined;
}
function buildOpenTag(tag, attrs) {
    if (!attrs || !Object.keys(attrs).length)
        return `[${tag}]`;
    const pairs = Object.entries(attrs).map(([k, v]) => `${k}=${v}`);
    return `[${tag} ${pairs.join(' ')}]`;
}
function pushTextWithNewlines(target, token) {
    if (!token)
        return;
    const lines = token.split('\n');
    lines.forEach((line, idx) => {
        if (idx > 0)
            target.push({ type: 'text', value: '\n' });
        if (line)
            target.push({ type: 'text', value: line });
    });
}
