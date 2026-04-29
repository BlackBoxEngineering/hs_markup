import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { parseMarkup } from '../parser/markupToDisplay';
import { TAGS } from '../language/tags';
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
        const children = renderNodes(node.children, `${key}-`, renderers);
        // use host-provided renderer if supplied
        const Custom = renderers?.[node.tag];
        if (Custom) {
            return _jsx(Custom, { children: children }, key);
        }
        return React.createElement(def.element, { key, className: def.className }, ...children);
    });
}
