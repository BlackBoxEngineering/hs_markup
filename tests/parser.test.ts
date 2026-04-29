import { describe, it, expect } from 'vitest';
import { parseMarkup } from '../src/parser/markupToDisplay';

describe('parseMarkup', () => {
  it('parses simple tagged text', () => {
    const nodes = parseMarkup('[b]Hello[/b]');
    expect(nodes).toEqual([
      { type: 'element', tag: 'b', children: [{ type: 'text', value: 'Hello' }] },
    ]);
  });

  it('parses nested tags', () => {
    const nodes = parseMarkup('[b][i]Hello[/i][/b]');
    expect(nodes).toEqual([
      {
        type: 'element', tag: 'b', children: [
          { type: 'element', tag: 'i', children: [{ type: 'text', value: 'Hello' }] },
        ],
      },
    ]);
  });

  it('parses mixed text and tags', () => {
    const nodes = parseMarkup('Hello [b]world[/b] foo');
    expect(nodes).toEqual([
      { type: 'text', value: 'Hello ' },
      { type: 'element', tag: 'b', children: [{ type: 'text', value: 'world' }] },
      { type: 'text', value: ' foo' },
    ]);
  });

  it('preserves newlines', () => {
    const nodes = parseMarkup('Line one\nLine two\n\nParagraph');
    expect(nodes).toEqual([
      { type: 'text', value: 'Line one' },
      { type: 'text', value: '\n' },
      { type: 'text', value: 'Line two' },
      { type: 'text', value: '\n' },
      { type: 'text', value: '\n' },
      { type: 'text', value: 'Paragraph' },
    ]);
  });

  it('handles empty tags', () => {
    const nodes = parseMarkup('[b][/b]');
    expect(nodes).toEqual([
      { type: 'element', tag: 'b', children: [] },
    ]);
  });

  it('flushes unclosed tags as plain text', () => {
    const nodes = parseMarkup('[b]Hello');
    expect(nodes).toEqual([
      { type: 'text', value: '[b]' },
      { type: 'text', value: 'Hello' },
    ]);
  });

  it('emits mismatched closing tags as text and flushes unclosed opener', () => {
    const nodes = parseMarkup('[b]x[/i]');
    expect(nodes).toEqual([
      { type: 'text', value: '[b]' },
      { type: 'text', value: 'x' },
      { type: 'text', value: '[/i]' },
    ]);
  });

  it('treats unknown tags as plain text', () => {
    const nodes = parseMarkup('[xyz]Hello[/xyz]');
    expect(nodes).toEqual([
      { type: 'text', value: '[xyz]Hello[/xyz]' },
    ]);
  });

  it('normalises legacy tags to canonical short form', () => {
    const nodes = parseMarkup('[bold]Hello[/bold]');
    expect(nodes).toEqual([
      { type: 'element', tag: 'b', children: [{ type: 'text', value: 'Hello' }] },
    ]);
  });

  it('normalises all legacy tag types', () => {
    const cases: [string, string][] = [
      ['[title]X[/title]', 't'],
      ['[header]X[/header]', 'h'],
      ['[bold]X[/bold]', 'b'],
      ['[italic]X[/italic]', 'i'],
      ['[underline]X[/underline]', 'u'],
      ['[quote]X[/quote]', 'q'],
      ['[highlight]X[/highlight]', 'hl'],
    ];
    for (const [input, expectedTag] of cases) {
      const nodes = parseMarkup(input);
      expect(nodes).toEqual([
        { type: 'element', tag: expectedTag, children: [{ type: 'text', value: 'X' }] },
      ]);
    }
  });

  it('parses adjacent tags with no separator text', () => {
    const nodes = parseMarkup('[b]x[/b][i]y[/i]');
    expect(nodes).toEqual([
      { type: 'element', tag: 'b', children: [{ type: 'text', value: 'x' }] },
      { type: 'element', tag: 'i', children: [{ type: 'text', value: 'y' }] },
    ]);
  });

  it('parses empty adjacent tags', () => {
    const nodes = parseMarkup('[b][/b][i][/i]');
    expect(nodes).toEqual([
      { type: 'element', tag: 'b', children: [] },
      { type: 'element', tag: 'i', children: [] },
    ]);
  });
});
