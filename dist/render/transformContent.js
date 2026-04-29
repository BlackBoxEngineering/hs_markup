import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { parseMarkup } from '../parser/markupToDisplay';
import { TAGS } from '../language/tags';
export function transformContent(markup) {
    return renderNodes(parseMarkup(markup));
}
function renderNodes(nodes, keyPrefix = '') {
    return nodes.map((node, i) => {
        const key = `${keyPrefix}${i}`;
        if (node.type === 'text') {
            return node.value === '\n' ? _jsx("br", {}, key) : node.value;
        }
        const def = TAGS[node.tag];
        if (!def)
            return null;
        return React.createElement(def.element, { key, className: def.className }, ...renderNodes(node.children, `${key}-`));
    });
}
