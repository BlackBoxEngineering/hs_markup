import React from 'react';
import { parseMarkup, MarkupNode } from '../parser/markupToDisplay';
import { TAGS } from '../language/tags';
import { highlightCode } from './highlight';

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

    // use host-provided renderer if supplied
    const Custom = renderers?.[node.tag];
    if (Custom) {
      return <Custom key={key}>{renderNodes(node.children, `${key}-`, renderers)}</Custom>;
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

function extractText(nodes: MarkupNode[]): string {
  return nodes.map(n => {
    if (n.type === 'text') return n.value;
    return extractText(n.children);
  }).join('');
}
