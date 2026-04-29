import { TAGS, canonicalTag } from '../language/tags';
const TAG_NAMES = Object.keys(TAGS).join('|');
const TAG_RE = new RegExp(`\\[(\\/?(${TAG_NAMES}))\\]`, 'g');
export function parseMarkup(input) {
    const tokens = input.split(TAG_RE);
    // split with 2 capture groups produces: [text, fullTag, innerTag, text, fullTag, innerTag, ...]
    // i%3===0 → text, i%3===1 → full tag (e.g. "b" or "/b"), i%3===2 → inner capture (skip)
    const root = [];
    const stack = [];
    const current = () => (stack.length ? stack[stack.length - 1].children : root);
    for (let i = 0; i < tokens.length; i++) {
        const mod = i % 3;
        if (mod === 2)
            continue; // inner capture group artefact — skip
        const token = tokens[i];
        if (!token)
            continue;
        if (mod === 1) {
            // tag token
            if (token.startsWith('/')) {
                const closing = canonicalTag(token.slice(1));
                if (stack.length && stack[stack.length - 1].tag === closing) {
                    const node = stack.pop();
                    current().push({ type: 'element', tag: node.tag, children: node.children });
                }
                else {
                    current().push({ type: 'text', value: `[${token}]` });
                }
            }
            else {
                stack.push({ tag: canonicalTag(token), children: [] });
            }
        }
        else {
            // text token (mod === 0)
            const lines = token.split('\n');
            lines.forEach((line, idx) => {
                if (idx > 0)
                    current().push({ type: 'text', value: '\n' });
                if (line)
                    current().push({ type: 'text', value: line });
            });
        }
    }
    // unclosed tags: flush as plain text
    while (stack.length) {
        const node = stack.pop();
        current().push({ type: 'text', value: `[${node.tag}]` }, ...node.children);
    }
    return root;
}
