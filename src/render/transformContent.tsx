import React from 'react';
import { parseMarkup, MarkupNode } from '../parser/markupToDisplay';
import { TAGS } from '../language/tags';

export type RendererMap = Partial<Record<string, React.ComponentType<{ children?: React.ReactNode }>>>;

export function transformContent(markup: string, renderers?: RendererMap): React.ReactNode {
  return renderNodes(parseMarkup(markup), '', renderers);
}

function renderNodes(nodes: MarkupNode[], keyPrefix = '', renderers?: RendererMap): React.ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}${i}`;
    if (node.type === 'text') {
      return node.value === '\n' ? <br key={key} /> : node.value;
    }
    const def = TAGS[node.tag];
    if (!def) return null;

    const children = renderNodes(node.children, `${key}-`, renderers);

    // use host-provided renderer if supplied
    const Custom = renderers?.[node.tag];
    if (Custom) {
      return <Custom key={key}>{children}</Custom>;
    }

    return React.createElement(
      def.element,
      { key, className: def.className },
      ...children
    );
  });
}
