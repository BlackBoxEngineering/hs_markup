import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { parseMarkup } from '../parser/markupToDisplay';
import { TAGS } from '../language/tags';
import { highlightCode } from './highlight';
export function transformContent(markup, renderers) {
    return renderNodes(parseMarkup(markup), '', renderers);
}
function renderNodes(nodes, keyPrefix = '', renderers) {
    return nodes.map((node, i) => {
        const key = `${keyPrefix}${i}`;
        if (node.type === 'text') {
            return node.value === '\n' ? _jsx("br", {}, key) : node.value;
        }
        const def = TAGS[node.tag];
        if (!def)
            return null;
        // use host-provided renderer if supplied
        const Custom = renderers?.[node.tag];
        if (Custom) {
            return _jsx(Custom, { children: renderNodes(node.children, `${key}-`, renderers) }, key);
        }
        // code blocks with a language get syntax highlighting
        if (node.tag === 'code' && node.attrs?.lg) {
            const raw = extractText(node.children);
            const classNames = [def.className, `code-lg-${node.attrs.lg}`].filter(Boolean).join(' ');
            return React.createElement(def.element, {
                key,
                className: classNames || undefined,
            }, ...highlightCode(raw, node.attrs.lg));
        }
        const children = renderNodes(node.children, `${key}-`, renderers);
        const classNames = [def.className].filter(Boolean);
        return React.createElement(def.element, {
            key,
            className: classNames.length ? classNames.join(' ') : undefined,
        }, ...children);
    });
}
function extractText(nodes) {
    return nodes.map(n => {
        if (n.type === 'text')
            return n.value;
        return extractText(n.children);
    }).join('');
}
