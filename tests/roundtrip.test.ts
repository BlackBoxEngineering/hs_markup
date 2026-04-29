import { describe, it, expect } from 'vitest';
import { markupToEditorHTML } from '../src/editor/markupToEditorHTML';
import { displayToMarkup } from '../src/parser/displayToMarkup';

/**
 * Round-trip: markup → editorHTML → DOM → displayToMarkup → markup
 * The output must equal the canonical (short-tag) form of the input.
 */
function roundTrip(input: string): string {
  const html = markupToEditorHTML(input);
  const div = document.createElement('div');
  div.innerHTML = html;
  return displayToMarkup(div);
}

describe('round-trip: markup → editor DOM → markup', () => {
  it('simple bold', () => {
    expect(roundTrip('[b]Hello[/b]')).toBe('[b]Hello[/b]');
  });

  it('nested bold + italic', () => {
    expect(roundTrip('[b][i]Hello[/i][/b]')).toBe('[b][i]Hello[/i][/b]');
  });

  it('mixed text and tags', () => {
    expect(roundTrip('Hello [b]world[/b] foo')).toBe('Hello [b]world[/b] foo');
  });

  it('newlines preserved', () => {
    expect(roundTrip('Line one\nLine two\n\nParagraph')).toBe('Line one\nLine two\n\nParagraph');
  });

  it('empty tag', () => {
    expect(roundTrip('[b][/b]')).toBe('[b][/b]');
  });

  it('adjacent tags', () => {
    expect(roundTrip('[b]x[/b][i]y[/i]')).toBe('[b]x[/b][i]y[/i]');
  });

  it('empty adjacent tags', () => {
    expect(roundTrip('[b][/b][i][/i]')).toBe('[b][/b][i][/i]');
  });

  it('legacy bold → canonical short', () => {
    expect(roundTrip('[bold]Hello[/bold]')).toBe('[b]Hello[/b]');
  });

  it('legacy header → canonical short', () => {
    expect(roundTrip('[header]Title[/header]')).toBe('[h]Title[/h]');
  });

  it('legacy italic → canonical short', () => {
    expect(roundTrip('[italic]Hi[/italic]')).toBe('[i]Hi[/i]');
  });

  it('legacy title → canonical short', () => {
    expect(roundTrip('[title]Big[/title]')).toBe('[t]Big[/t]');
  });

  it('legacy quote → canonical short', () => {
    expect(roundTrip('[quote]Words[/quote]')).toBe('[q]Words[/q]');
  });

  it('legacy highlight → canonical short', () => {
    expect(roundTrip('[highlight]Glow[/highlight]')).toBe('[hl]Glow[/hl]');
  });

  it('legacy underline → canonical short', () => {
    expect(roundTrip('[underline]Under[/underline]')).toBe('[u]Under[/u]');
  });

  it('all short tags round-trip cleanly', () => {
    const cases = [
      '[t]Title[/t]',
      '[b]Bold[/b]',
      '[i]Italic[/i]',
      '[u]Under[/u]',
      '[s]Strike[/s]',
      '[h]Head[/h]',
      '[h1]H1[/h1]',
      '[h2]H2[/h2]',
      '[h3]H3[/h3]',
      '[hl]Highlight[/hl]',
      '[code]x = 1[/code]',
      '[pre]block[/pre]',
      '[q]Quote[/q]',
    ];
    for (const input of cases) {
      expect(roundTrip(input)).toBe(input);
    }
  });

  it('HTML entities are safe', () => {
    expect(roundTrip('[b]<script>alert("xss")</script>[/b]'))
      .toBe('[b]<script>alert("xss")</script>[/b]');
  });

  it('plain text with no tags', () => {
    expect(roundTrip('Just plain text')).toBe('Just plain text');
  });

  it('complex nested structure', () => {
    const input = '[h1]Title[/h1]\n\n[b]Bold [i]and italic[/i][/b]\n[q]A quote[/q]';
    expect(roundTrip(input)).toBe(input);
  });

  it('tags inside code parse as tags and still round-trip', () => {
    expect(roundTrip('[code][b]not bold[/b][/code]')).toBe('[code][b]not bold[/b][/code]');
  });
});
